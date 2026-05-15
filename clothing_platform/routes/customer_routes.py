from flask import Blueprint, flash, g, jsonify, redirect, render_template, request
from middleware.auth_middleware import login_required, role_required
from services.customer_service import (
    get_approved_products,
    add_to_cart,
    get_customer_cart,
    update_cart_quantity,
    remove_from_cart,
    checkout,
)

customer_bp = Blueprint("customer", __name__, url_prefix="/customer")


@customer_bp.get("/")
@role_required("CUSTOMER")
def products_page():
    body, status_code = get_approved_products()
    if status_code == 200:
        return render_template(
            "index.html", products=body["products"], user=g.current_user
        )
    else:
        return render_template("error.html", message=body["message"])


@customer_bp.post("/cart")
@role_required("CUSTOMER")
def add_product_to_cart():
    payload = request.get_json(silent=True) or {}
    body, status_code = add_to_cart(
        g.current_user.user_id, payload
    ) 
    return jsonify(body), status_code


@customer_bp.get("/cart")
@role_required("CUSTOMER")
def view_cart():
    body, status_code = get_customer_cart(g.current_user.user_id)
    if status_code == 200:
        cart_data = body.get("cart")
        if cart_data:
            return render_template(
                "cart-page.html", cart=cart_data, user=g.current_user
            )
        else:
            return render_template("cart-page.html", cart=[], user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])


@customer_bp.put("/cart/<int:product_id>")
@role_required("CUSTOMER")
def update_cart_item(product_id):
    payload = request.get_json(silent=True) or {}
    body, status_code = update_cart_quantity( g.current_user.user_id, product_id, payload)
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
    payload = request.get_json(silent=True)
    if payload is None:
        payload = request.form.to_dict(flat=True)
    body, status_code = checkout(g.current_user.user_id, payload)

    if status_code == 201:  # Order created successfully
        flash("Order is placed successfully!", "success")
        return jsonify({"message": "Order placed successfully"}), 201
    else:
        return jsonify({"status": "error", "message": body.get("message"), "details": body.get("error")}), status_code


@customer_bp.get("/orders")
@role_required("CUSTOMER")
def get_customer_orders():
    from services.customer_service import get_customer_order_history

    body, status_code = get_customer_order_history(g.current_user.user_id)
    if status_code == 200: 
        return render_template("order-page.html", orders=body.get("orders", []), user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])

