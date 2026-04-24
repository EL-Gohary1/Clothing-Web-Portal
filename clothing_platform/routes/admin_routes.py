from flask import Blueprint, jsonify, render_template, request, g

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

admin_bp = Blueprint('admin', __name__, url_prefix='/admin-dashboard')


@admin_bp.before_request
@role_required('ADMIN')
def require_admin():
        pass



@admin_bp.get('/customers')
def view_all_customers():
    # GET /api/admin/customers - list customers
    body, status_code = get_all_customers()
    if status_code == 200:
        return render_template("admin-customers-tab.html", customers=body["customers"], user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])


@admin_bp.get('/suppliers')
def view_all_suppliers():
    # GET /api/admin/suppliers - list suppliers
    body, status_code = get_all_suppliers()
    if status_code == 200:
        return render_template("admin-suppliers-tab.html", suppliers=body["suppliers"], user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])

@admin_bp.get('/add-user')
def get_add_user_form():
    # GET /api/admin/add-user - display form to add a user
    return render_template("admin-add-user.html", user=g.current_user)

@admin_bp.get('/add-product')
def get_add_product_form():
    # GET /api/admin/add-product - display form to add a product
    return render_template("add-product.html", user=g.current_user)


@admin_bp.post('/users')
def create_user():
    # POST /api/admin/users - creates a user (customer or supplier)
    # Body:
    #     name     
    #     email    
    #     password 
    #     role
    payload = request.get_json(silent=True) or {}
    body, status_code = add_user(payload)
    return jsonify(body), status_code


@admin_bp.delete('/users/<int:user_id>')
def delete_user(user_id):
    # DELETE /api/admin/users/<id> - remove a user
    body, status_code = remove_user(user_id)
    return jsonify(body), status_code


@admin_bp.get('/products')
def view_products():
    # GET /api/admin/products?status=PENDING|APPROVED|REJECTED - list products
    # filter: (PENDING / APPROVED / REJECTED)
    
    body, status_code = get_products(None)
    if status_code == 200:
        return render_template("admin-products-tab.html", products=body["products"], user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])


@admin_bp.get('/products/search')
def search():
    #GET /api/admin/products/search?keyword=<kw> - search products
    keyword = request.args.get('keyword', '')
    body, status = search_products(keyword)
    return jsonify(body), status


@admin_bp.post('/products')
def create_product():
    # POST /api/admin/add-products - adds a product
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
    if status == 200:
            return render_template("admin-orders-tab.html", orders=body["orders"], user=g.current_user)
    else:
        return render_template("error.html", message=body["message"])

