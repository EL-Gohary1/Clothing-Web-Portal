
from models import db, User, UserRole
from models.product_model import Product, ProductStatus
from models.order_model import Order



def get_all_customers():
    customers = User.query.filter_by(role=UserRole.CUSTOMER).all()
    return {'customers': [u.to_dict() for u in customers], 'count': len(customers)}, 200


def get_all_suppliers():
    suppliers = User.query.filter_by(role=UserRole.SUPPLIER).all()
    return {'suppliers': [u.to_dict() for u in suppliers], 'count': len(suppliers)}, 200



def add_user(payload):
    name = (payload.get('name') or '').strip()
    email = (payload.get('email') or '').strip().lower()
    password = payload.get('password') or ''
    role_raw = (payload.get('role') or '').strip().upper()

    if not name or not email or not password or not role_raw:
        return {'error': 'name, email, password and role are required'}, 400

    if len(password) < 6:
        return {'error': 'password must be at least 6 characters'}, 400

    if role_raw not in UserRole.__members__:
        return {'error': f'invalid role. allowed: {[r.value for r in UserRole]}'}, 400

    if User.query.filter_by(email=email).first():
        return {'error': 'email already registered'}, 409

    user = User(
        name=name,
        email=email,
        password=password,
        role=UserRole[role_raw],
    )
    
    db.session.add(user)
    db.session.commit()
    return {'message': 'user created successfully', 'user': user.to_dict()}, 201


def remove_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {'error': 'user not found'}, 404
    if user.role == UserRole.ADMIN:
        admin_count = User.query.filter_by(role=UserRole.ADMIN).count()
        if admin_count <= 1:
            return {'error': 'cannot delete the last admin account'}, 400

    db.session.delete(user)
    db.session.commit()
    return {'message': f'user {user_id} deleted successfully'}, 200



def get_products(status_filter=None):
    query = Product.query

    if status_filter:
        status_upper = status_filter.strip().upper()
        if status_upper not in ProductStatus.__members__:
            valid = [s.value for s in ProductStatus]
            return {'error': f'invalid status filter. allowed: {valid}'}, 400
        query = query.filter_by(product_status=ProductStatus[status_upper])

    products = query.all()
    return {'products': [p.to_dict() for p in products], 'count': len(products)}, 200


def add_product(payload):
    supplier_id = payload.get('supplier_id')
    product_title = (payload.get('product_title') or '').strip()
    unit_price = payload.get('unit_price')
    description = (payload.get('description') or '').strip()
    photo = (payload.get('photo') or '').strip()
    stock_qty = payload.get('stock_qty', 0)
    status_raw = (payload.get('product_status') or 'PENDING').strip().upper()

    if not product_title or unit_price is None or not supplier_id:
        return {'error': 'product_title, unit_price and supplier_id are required'}, 400

    try:
        unit_price = float(unit_price)
        stock_qty = int(stock_qty)
    except (ValueError, TypeError):
        return {'error': 'unit_price must be a number and stock_qty must be an integer'}, 400

    if unit_price < 0 or stock_qty < 0:
        return {'error': 'unit_price and stock_qty cannot be negative'}, 400

    supplier = User.query.get(supplier_id)
    if not supplier or supplier.role != UserRole.SUPPLIER:
        return {'error': 'supplier_id must reference a valid supplier'}, 400

    if status_raw not in ProductStatus.__members__:
        return {'error': f'invalid product_status. allowed: {[s.value for s in ProductStatus]}'}, 400

    product = Product(
        supplier_id=supplier_id,
        product_title=product_title,
        unit_price=unit_price,
        description=description,
        photo=photo,
        stock_qty=stock_qty,
        product_status=ProductStatus[status_raw],
    )
    product.update_stock_status()
    db.session.add(product)
    db.session.commit()
    return {'message': 'product added successfully', 'product': product.to_dict()}, 201


def approve_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return {'error': 'product not found'}, 404
    if product.product_status == ProductStatus.APPROVED:
        return {'message': 'product is already approved', 'product': product.to_dict()}, 200

    product.product_status = ProductStatus.APPROVED
    db.session.commit()
    return {'message': f'product {product_id} approved successfully', 'product': product.to_dict()}, 200


def remove_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return {'error': 'product not found'}, 404

    db.session.delete(product)
    db.session.commit()
    return {'message': f'product {product_id} deleted successfully'}, 200


def search_products(keyword):
    if not keyword or not keyword.strip():
        return {'error': 'keyword is required'}, 400

    term = f'%{keyword.strip()}%'
    products = Product.query.filter(
        Product.product_title.ilike(term) | Product.description.ilike(term)
    ).all()
    return {'products': [p.to_dict() for p in products], 'count': len(products)}, 200


def get_all_orders():
    orders = Order.query.order_by(Order.creation_date.desc()).all()
    return {'orders': [o.to_dict() for o in orders], 'count': len(orders)}, 200


