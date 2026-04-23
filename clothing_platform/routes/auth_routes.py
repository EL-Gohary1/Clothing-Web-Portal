from flask import Blueprint, g, jsonify, request, session, render_template

from middleware.auth_middleware import login_required, role_required
from services.auth_service import login_user, logout_user, register_user


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.get('/register')
def register_page():
    return render_template('register.html')


@auth_bp.get('/login')
def login_page():
    return render_template('login.html')


@auth_bp.post('/register')
def register():
    payload = request.get_json(silent=True) or {}
    body, status_code = register_user(payload)
    return jsonify(body), status_code


@auth_bp.post('/login')
def login():
    payload = request.get_json(silent=True) or {}
    body, status_code = login_user(payload, session)
    return jsonify(body), status_code


@auth_bp.post('/logout')
@login_required
def logout():
    body, status_code = logout_user(session)
    return jsonify(body), status_code


@auth_bp.get('/profile')
@login_required
def profile():
    if status_code := 200:
        render_template('profile.html', user=g.current_user)
    else:
        return render_template('error.html', message=body['message'])


@auth_bp.get('/customer-area')
@role_required('CUSTOMER')
def customer_area():
    return jsonify({'message': f'Welcome customer {g.current_user.name}'}), 200


@auth_bp.get('/supplier-area')
@role_required('SUPPLIER')
def supplier_area():
    return jsonify({'message': f'Welcome supplier {g.current_user.name}'}), 200


@auth_bp.get('/admin-area')
@role_required('ADMIN')
def admin_area():
    return jsonify({'message': f'Welcome admin {g.current_user.name}'}), 200
