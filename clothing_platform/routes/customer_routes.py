from flask import Blueprint, g, jsonify, render_template, request
from middleware.auth_middleware import login_required, role_required
from services.customer_service import (
    get_approved_products,
    add_to_cart,
    get_customer_cart,
    update_cart_quantity,
    remove_from_cart,
    checkout,
)

customer_bp = Blueprint("customer", __name__, url_prefix="/api/customer")


@customer_bp.get("/")
@role_required("CUSTOMER")
def products_page():
    body, status_code = get_approved_products()
    if status_code == 200:
        return render_template(
            "customer_home.html", products=body["products"], user=g.current_user
        )
    else:
        return render_template("error.html", message=body["message"])


@customer_bp.post("/cart")
@role_required("CUSTOMER")
def add_product_to_cart():
    payload = request.get_json(silent=True) or {}
    body, status_code = add_to_cart(
        g.current_user.user_id, payload
    )  # Payload: {"product_id": 1, "quantity": 2}
    return jsonify(body), status_code


@customer_bp.get("/cart")
@role_required("CUSTOMER")
def view_cart():
    """Get customer's cart and render cart page"""
    body, status_code = get_customer_cart(g.current_user.user_id)
    if status_code == 200:
        cart_data = body.get("cart")
        if cart_data:
            return render_template(
                "cart-page.html", cart=cart_data, user=g.current_user
            )
        else:
            return render_template("cart-page.html", cart=None, user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])


@customer_bp.put("/cart/<int:product_id>")
@role_required("CUSTOMER")
def update_cart_item(product_id):
    payload = request.get_json(silent=True) or {}
    body, status_code = update_cart_quantity(
        g.current_user.user_id, product_id, payload
    )
    return jsonify(body), status_code


@customer_bp.delete("/cart/<int:product_id>")
@role_required("CUSTOMER")
def remove_cart_item(product_id):
    body, status_code = remove_from_cart(g.current_user.user_id, product_id)
    return jsonify(body), status_code


@customer_bp.delete("/cart")
@role_required("CUSTOMER")
def clear_cart():
    body, status_code = remove_from_cart(g.current_user.user_id, None, clear_all=True)
    return jsonify(body), status_code


@customer_bp.get("/checkout")
@role_required("CUSTOMER")
def checkout_page():
    body, status_code = get_customer_cart(g.current_user.user_id)
    if status_code == 200:
        cart_data = body.get("cart")
        if cart_data:
            return render_template("checkout.html", cart=cart_data, user=g.current_user)
        else:
            return render_template("checkout.html", cart=None, user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])


@customer_bp.post("/checkout")
@role_required("CUSTOMER")
def place_order():
    """Process checkout form submission"""
    # Get form data (not JSON)
    payload = {
        "delivery_address": request.form.get("delivery_address"),
        "delivery_city": request.form.get("delivery_city"),
        "receiver_name": request.form.get("receiver_name"),
        "receiver_phone": request.form.get("receiver_phone"),
        "email": request.form.get("email"),
        "payment_method": request.form.get("payment_method"),
        "postal_code": request.form.get("postal_code"),
        "delivery_notes": request.form.get("delivery_notes"),
    }

    body, status_code = checkout(g.current_user.user_id, payload)

    if status_code == 201:  # Order created successfully
        return render_template(
            "OrderConfirmation.html", order=body["order"], user=g.current_user
        )
    else:
        return render_template("error.html", message=body["message"])


@customer_bp.get("/orders")
@role_required("CUSTOMER")
def get_customer_orders():
    from services.customer_service import get_customer_order_history

    body, status_code = get_customer_order_history(g.current_user.user_id)
    return jsonify(body), status_code


@customer_bp.get("/orders/<int:order_id>")
@role_required("CUSTOMER")
def get_order_details(order_id):
    """Get specific order details"""
    from services.customer_service import get_order_details as service_get_order_details

    body, status_code = service_get_order_details(g.current_user.user_id, order_id)
    return jsonify(body), status_code
