from flask import Blueprint, jsonify, request, g

from middleware.auth_middleware import role_required
from services.supplier_service import (
    get_own_products,
    search_own_products,
    submit_product,
    remove_own_product,
    get_orders_with_own_products,
)

supplier_bp = Blueprint('supplier', __name__, url_prefix='/api/supplier')


@supplier_bp.before_request
@role_required('SUPPLIER')
def require_supplier():
    pass


@supplier_bp.get('/products')
def view_own_products():
    # GET /api/supplier/products?status=PENDING|APPROVED|REJECTED
    # List supplier's own products.
    status_filter = request.args.get('status')
    body, status = get_own_products(g.current_user.user_id, status_filter)
    return jsonify(body), status


@supplier_bp.get('/products/search')
def search_products():
    # GET /api/supplier/products/search?keyword=<kw>
    # Search products
    keyword = request.args.get('keyword', '')
    body, status = search_own_products(g.current_user.user_id, keyword)
    return jsonify(body), status


@supplier_bp.post('/products')
def submit_product_route():
    # POST /api/supplier/products — add a new product
    # Body:
    #     product_title 
    #     unit_price    
    #     description   
    #     photo         
    #     stock_qty     
    
    payload = request.get_json(silent=True) or {}
    body, status = submit_product(g.current_user.user_id, payload)
    return jsonify(body), status



@supplier_bp.delete('/products/<int:product_id>')
def remove_product(product_id):
    #DELETE /api/supplier/products/<id> — remove product
    body, status = remove_own_product(g.current_user.user_id, product_id)
    return jsonify(body), status


@supplier_bp.get('/orders')
def view_orders():
    #GET /api/supplier/orders   - list orders
    body, status = get_orders_with_own_products(g.current_user.user_id)
    return jsonify(body), status
