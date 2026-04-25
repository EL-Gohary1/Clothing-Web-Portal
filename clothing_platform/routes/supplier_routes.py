from flask import Blueprint, jsonify, request, g, render_template
from middleware.auth_middleware import role_required
from services.supplier_service import (
    get_own_products,
    search_own_products,
    submit_product,
    remove_own_product,
    get_orders_with_own_products,
)

supplier_bp = Blueprint('supplier', __name__, url_prefix='/supplier-dhashboard')

@supplier_bp.before_request
@role_required('SUPPLIER')
def require_supplier():
    pass

@supplier_bp.get('/view-products')
def render_products_page():
    return render_template('ViewProducts_supplier.html')

@supplier_bp.get('/products')
def view_own_products():
    status_filter = request.args.get('status')
    body, status = get_own_products(g.current_user.user_id, status_filter)
    return jsonify(body), status

@supplier_bp.get('/products/search')
def search_products():
    keyword = request.args.get('keyword', '')
    body, status = search_own_products(g.current_user.user_id, keyword)
    return jsonify(body), status

@supplier_bp.post('/products')
def submit_product_route():
    payload = request.get_json(silent=True) or {}
    body, status = submit_product(g.current_user.user_id, payload)
    return jsonify(body), status

@supplier_bp.delete('/products/<int:product_id>')
def remove_product(product_id):
    body, status = remove_own_product(g.current_user.user_id, product_id)
    return jsonify(body), status

@supplier_bp.get('/orders')
def view_orders():
    body, status = get_orders_with_own_products(g.current_user.user_id)
    return jsonify(body), status

@supplier_bp.get('/view-orders')
def render_orders_page():
    return render_template('ViewOrders_supplier.html')

@supplier_bp.get('/add-product')
def render_add_product_page():
    return render_template('Add-product_supplier.html')