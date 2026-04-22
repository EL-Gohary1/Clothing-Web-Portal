from flask import Blueprint, g, render_template

from middleware.auth_middleware import role_required


dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.get('/')
@role_required('CUSTOMER')
def home():
    """Customer home page"""
    return render_template('customer_home.html', user=g.current_user)


@dashboard_bp.get('/supplier-dashboard')
@role_required('SUPPLIER')
def supplier_dashboard():
    """Supplier dashboard page"""
    return render_template('supplier_dashboard.html', user=g.current_user)


@dashboard_bp.get('/admin-dashboard')
@role_required('ADMIN')
def admin_dashboard():
    """Admin dashboard page"""
    return render_template('admin_dashboard.html', user=g.current_user)
