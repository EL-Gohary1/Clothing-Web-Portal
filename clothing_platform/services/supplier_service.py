from models import db, User, UserRole
from models.product_model import Product, ProductStatus, StockStatus
from models.order_model import Order, OrderProduct

def get_own_products(supplier_id, status_filter=None):
    query = Product.query.filter_by(supplier_id=supplier_id)

    if status_filter:
        status_upper = status_filter.strip().upper()
        if status_upper not in ProductStatus.__members__:
            valid = [s.value for s in ProductStatus]
            return {'error': f'invalid status filter. allowed: {valid}'}, 400
        query = query.filter_by(product_status=ProductStatus[status_upper])

    products = query.all()
    return {'products': [p.to_dict() for p in products], 'count': len(products)}, 200

def search_own_products(supplier_id, keyword):
    if not keyword or not keyword.strip():
        return {'error': 'keyword is required'}, 400

    term = f'%{keyword.strip()}%'
    products = Product.query.filter(
        Product.supplier_id == supplier_id,
        Product.product_title.ilike(term) | Product.description.ilike(term)
    ).all()
    return {'products': [p.to_dict() for p in products], 'count': len(products)}, 200

def submit_product(supplier_id, payload):
    product_title = (payload.get('product_title') or '').strip()
    unit_price = payload.get('unit_price')
    description = (payload.get('description') or '').strip()
    photo = (payload.get('photo') or '').strip()
    stock_qty = payload.get('stock_qty', 0)

    if not product_title or unit_price is None:
        return {'error': 'product_title and unit_price are required'}, 400

    try:
        unit_price = float(unit_price)
        stock_qty = int(stock_qty)
    except (ValueError, TypeError):
        return {'error': 'unit_price must be a number and stock_qty must be an integer'}, 400

    if unit_price < 0:
        return {'error': 'unit_price cannot be negative'}, 400

    if stock_qty < 0:
        return {'error': 'stock_qty cannot be negative'}, 400

    product = Product(
        supplier_id=supplier_id,
        product_title=product_title,
        unit_price=unit_price,
        description=description,
        photo=photo,
        stock_qty=stock_qty,
        product_status=ProductStatus.PENDING,
    )
    product.update_stock_status()
    db.session.add(product)
    db.session.commit()
    return {'message': 'product submitted for review', 'product': product.to_dict()}, 201

def remove_own_product(supplier_id, product_id):
    product = Product.query.get(product_id)
    if not product:
        return {'error': 'product not found'}, 404

    if product.supplier_id != supplier_id:
        return {'error': 'you do not own this product'}, 403

    db.session.delete(product)
    db.session.commit()
    return {'message': f'product {product_id} removed successfully'}, 200

def get_orders_with_own_products(supplier_id):
    supplier_product_ids = [
        p.product_id for p in Product.query.filter_by(supplier_id=supplier_id).all()
    ]

    if not supplier_product_ids:
        return {'orders': [], 'count': 0}, 200

    order_ids = (
        db.session.query(OrderProduct.order_id)
        .filter(OrderProduct.product_id.in_(supplier_product_ids))
        .distinct()
        .all()
    )
    order_ids = [row[0] for row in order_ids]

    orders = Order.query.filter(Order.order_id.in_(order_ids))\
                        .order_by(Order.creation_date.desc()).all()

    result = []
    for order in orders:
        own_items = [
            op for op in order.order_products
            if op.product_id in supplier_product_ids
        ]
        result.append({
            'order_id': order.order_id,
            'creation_date': order.creation_date.isoformat(),
            'delivery_city': order.delivery_city,
            'receiver_name': order.receiver_name,
            'receiver_phone': order.receiver_phone,
            'my_items': [
                {
                    'product_id': item.product_id,
                    'product_title': item.product.product_title,
                    'quantity': item.quantity,
                    'unit_price': item.unit_price,
                    'subtotal': item.subtotal,
                }
                for item in own_items
            ],
            'my_items_total': round(sum(i.subtotal for i in own_items), 2),
        })

    return {'orders': result, 'count': len(result)}, 200