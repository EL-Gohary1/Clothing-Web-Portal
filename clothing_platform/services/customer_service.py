from models import db
from models.product_model import Product, ProductStatus, StockStatus
from models.cart_model import Cart, CartProduct
from models.order_model import Order, OrderProduct
from models.user_model import User


def get_approved_products():
    try:
        products = Product.query.filter_by(product_status=ProductStatus.APPROVED).all()

        if not products:
            return {"message": "No products available", "products": []}, 200

        return {"message": "Products retrieved successfully", 
                "products": [product.to_dict() for product in products],
                }, 200

    except Exception as exc:
        return {"message": "Error retrieving products", "error": str(exc)}, 500


def add_to_cart(customer_id, payload):
    try:
        product_id = payload.get("product_id")
        quantity = payload.get("quantity", 1)

        if not product_id or quantity <= 0: #backend validation
            return {
                "message": "Invalid product_id or quantity",
                "error": "product_id and quantity (positive) are required",
            }, 400

        #backend Validation
        product = Product.query.filter_by(
            product_id=product_id, product_status=ProductStatus.APPROVED
        ).first()


        if not product:
            return {
                "message": "Product not found or not approved",
                "error": f"Product {product_id} is not available",
            }, 404

        # Check stock
        if product.stock_qty < quantity:
            return {
                "message": "Insufficient stock",
                "error": f"Only {product.stock_qty} items available",
            }, 400

        # Get or create customer cart
        cart = Cart.query.filter_by(customer_id=customer_id).first()

        if not cart:
            cart = Cart(customer_id=customer_id)
            db.session.add(cart)
            db.session.flush()  # Get cart_id without committing

        # Check if product already in cart
        cart_product = CartProduct.query.filter_by(
            cart_id=cart.cart_id, product_id=product_id
        ).first()

        if cart_product:
            # Update quantity
            new_quantity = cart_product.quantity + quantity
            if product.stock_qty < new_quantity:
                return {
                    "message": "Insufficient stock",
                    "error": f"Only {product.stock_qty} items available",
                }, 400
            cart_product.quantity = new_quantity
        else:
            # Add new product to cart
            cart_product = CartProduct(
                cart_id=cart.cart_id, product_id=product_id, quantity=quantity
            )
            db.session.add(cart_product)

        db.session.commit()

        return {
            "message": "Product added to cart successfully",
            "product_id": product_id,
            "quantity": quantity,
            "cart_total": cart.calculate_total(),
        }, 201

    except Exception as exc:
        db.session.rollback()
        return {"message": "Error adding to cart", "error": str(exc)}, 500


def get_customer_cart(customer_id):
    try:
        cart = Cart.query.filter_by(customer_id=customer_id).first()

        if not cart:
            return {"message": "Cart is empty", "cart": None}, 200

        return {"message": "Cart retrieved successfully", "cart": cart.to_dict()}, 200

    except Exception as exc:
        return {"message": "Error retrieving cart", "error": str(exc)}, 500


def update_cart_quantity(customer_id, product_id, payload):
        quantity = payload.get("quantity")

        if not quantity or quantity <= 0:
            return {"message": "Invalid quantity"}, 400

        cart = Cart.query.filter_by(customer_id=customer_id).first()
        if not cart:
            return {"message": "Cart not found"}, 404

        cart_product = CartProduct.query.filter_by(
            cart_id=cart.cart_id,
            product_id=product_id
        ).first()

        if not cart_product:
            return {"message": "Product not in cart"}, 404

        product = Product.query.get(product_id)

        if product.stock_qty < quantity:
            return {"message": "Insufficient stock"}, 400

        cart_product.quantity = quantity

        db.session.commit()

        return {
            "message": "Updated successfully",
            "new_quantity": quantity
        }, 200

    
    
def remove_from_cart(customer_id, product_id, clear_all=False):
    """Remove product from cart or clear entire cart"""
    try:
        # Get cart
        cart = Cart.query.filter_by(customer_id=customer_id).first()

        if not cart:
            return {"message": "Cart not found", "error": "Customer has no cart"}, 404

        if clear_all:
            # Remove all items from cart
            CartProduct.query.filter_by(cart_id=cart.cart_id).delete()
            db.session.commit()
            return {"message": "Cart cleared successfully"}, 200

        # Remove specific product
        cart_product = CartProduct.query.filter_by(
            cart_id=cart.cart_id, product_id=product_id
        ).first()

        if not cart_product:
            return {
                "message": "Product not found in cart",
                "error": f"Product {product_id} is not in cart",
            }, 404

        db.session.delete(cart_product)
        db.session.commit()

        return {
            "message": "Product removed from cart successfully",
            "product_id": product_id,
            "cart_total": cart.calculate_total(),
        }, 200

    except Exception as exc:
        db.session.rollback()
        return {"message": "Error removing from cart", "error": str(exc)}, 500


def checkout(customer_id, payload):
    """Place order from cart (checkout)"""
    try:
        required_fields = [
            "delivery_address",
            "delivery_city",
            "receiver_name",
            "receiver_phone",
            "email",
        ]
        for field in required_fields:
            if not payload.get(field):
                return {
                    "message": f"Missing required field: {field}",
                    "error": f"{field} is required",
                }, 400

        # Get customer
        customer = User.query.get(customer_id)
        if not customer:
            return {"message": "Customer not found", "error": "Invalid customer"}, 404

        # Get cart
        cart = Cart.query.filter_by(customer_id=customer_id).first()

        if not cart or not cart.get_items():
            return {
                "message": "Cart is empty",
                "error": "Cannot checkout with empty cart",
            }, 400

        # Calculate total and verify stock
        cart_items = cart.get_items()
        total_price = 0
        order_details = []

        for item in cart_items:
            product = item.product

            # Verify stock before creating order
            if product.stock_qty < item.quantity:
                db.session.rollback()
                return {
                    "message": f"Insufficient stock for {product.product_title}",
                    "error": f"Only {product.stock_qty} available, {item.quantity} requested",
                }, 400

            subtotal = product.unit_price * item.quantity
            total_price += subtotal

            order_details.append(
                {
                    "product_id": product.product_id,
                    "quantity": item.quantity,
                    "unit_price": product.unit_price,
                    "subtotal": subtotal,
                }
            )

        # Create order
        order = Order(
            customer_id=customer_id,
            delivery_address=payload.get("delivery_address"),
            delivery_city=payload.get("delivery_city"),
            receiver_name=payload.get("receiver_name"),
            receiver_phone=payload.get("receiver_phone"),
            total_price=round(total_price, 2),
        )

        db.session.add(order)
        db.session.flush()  # Get order_id

        # Add order products and update stock
        supplier_emails = set()

        for item in cart_items:
            product = item.product
            supplier_emails.add(product.supplier.email)

            # Create order product
            order_product = OrderProduct(
                order_id=order.order_id,
                product_id=product.product_id,
                quantity=item.quantity,
                unit_price=product.unit_price,
                subtotal=round(product.unit_price * item.quantity, 2),
                supplier_email_at_purchase=product.supplier.email,
                customer_email=payload.get("email"),
            )
            db.session.add(order_product)

            # Update product stock
            product.stock_qty -= item.quantity
            product.update_stock_status()

        # Clear cart
        CartProduct.query.filter_by(cart_id=cart.cart_id).delete()

        db.session.commit()

        return {
            "message": "Order placed successfully",
            "order_id": order.order_id,
            "customer_id": customer_id,
            "delivery_address": order.delivery_address,
            "delivery_city": order.delivery_city,
            "receiver_name": order.receiver_name,
            "receiver_phone": order.receiver_phone,
            "email": payload.get("email"),
            "total_price": order.total_price,
            "items_count": len(order_details),
            "items": order_details,
            "creation_date": order.creation_date.isoformat(),
            "supplier_emails": list(supplier_emails),  # For notification
        }, 201

    except Exception as exc:
        db.session.rollback()
        return {"message": "Error placing order", "error": str(exc)}, 500


def get_customer_order_history(customer_id):
    """Get customer's order history"""
    try:
        orders = (
            Order.query.filter_by(customer_id=customer_id)
            .order_by(Order.creation_date.desc())
            .all()
        )

        if not orders:
            return {"message": "No orders found", "orders": []}, 200

        return {
            "message": "Orders retrieved successfully",
            "count": len(orders),
            "orders": [order.to_dict() for order in orders],
        }, 200

    except Exception as exc:
        return {"message": "Error retrieving orders", "error": str(exc)}, 500


def get_order_details(customer_id, order_id):
    """Get specific order details (verify customer owns the order)"""
    try:
        order = Order.query.filter_by(
            order_id=order_id, customer_id=customer_id
        ).first()

        if not order:
            return {
                "message": "Order not found",
                "error": f"Order {order_id} does not exist or does not belong to you",
            }, 404

        return {
            "message": "Order retrieved successfully",
            "order": order.to_dict(),
        }, 200

    except Exception as exc:
        return {"message": "Error retrieving order", "error": str(exc)}, 500