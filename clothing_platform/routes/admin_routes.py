from flask import Blueprint, jsonify, request, g

from middleware.auth_middleware import role_required
from services.admin_service import (
    get_all_customers,
    get_all_suppliers,
    add_user,
    remove_user,
    get_products,
    add_product,
    approve_product,
    reject_product,
    remove_product,
    search_products,
    get_all_orders,
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.before_request
@role_required('ADMIN')
def require_admin():
        pass



@admin_bp.get('/customers')
def view_all_customers():
    # GET /api/admin/customers - list customers
    body, status = get_all_customers()
    return jsonify(body), status


@admin_bp.get('/suppliers')
def view_all_suppliers():
    # GET /api/admin/suppliers - list suppliers
    body, status = get_all_suppliers()
    return jsonify(body), status


@admin_bp.post('/users')
def create_user():
    # POST /api/admin/users - creates a user (customer or supplier)
    # Body:
    #     name     
    #     email    
    #     password 
    #     role
    payload = request.get_json(silent=True) or {}
    body, status = add_user(payload)
    return jsonify(body), status


@admin_bp.delete('/users/<int:user_id>')
def delete_user(user_id):
    # DELETE /api/admin/users/<id> - remove a user
    body, status = remove_user(user_id)
    return jsonify(body), status


@admin_bp.get('/products')
def view_products():
    # GET /api/admin/products?status=PENDING|APPROVED|REJECTED - list products
    # filter: (PENDING / APPROVED / REJECTED)
    
    status_filter = request.args.get('status')
    body, status = get_products(status_filter)
    return jsonify(body), status


@admin_bp.get('/products/search')
def search():
    #GET /api/admin/products/search?keyword=<kw> - search products
    keyword = request.args.get('keyword', '')
    body, status = search_products(keyword)
    return jsonify(body), status


@admin_bp.post('/products')
def create_product():
    # POST /api/admin/products - adds a product
    # Body :
    #     supplier_id    
    #     product_title  
    #     unit_price     
    #     description    
    #     photo          
    #     stock_qty      
    #     product_status 
    payload = request.get_json(silent=True) or {}
    body, status = add_product(payload)
    return jsonify(body), status


@admin_bp.patch('/products/<int:product_id>/approve')
def approve(product_id):
    #PATCH /api/admin/products/<id>/approve - approve a product
    body, status = approve_product(product_id)
    return jsonify(body), status


@admin_bp.patch('/products/<int:product_id>/reject')
def reject(product_id):
    #PATCH /api/admin/products/<id>/reject - reject a product
    body, status = reject_product(product_id)
    return jsonify(body), status


@admin_bp.delete('/products/<int:product_id>')
def delete_product(product_id):
    #DELETE /api/admin/products/<id> - remove a product
    body, status = remove_product(product_id)
    return jsonify(body), status


@admin_bp.get('/orders')
def view_all_orders():
    #GET /api/admin/orders - list orders
    body, status = get_all_orders()
    return jsonify(body), status

