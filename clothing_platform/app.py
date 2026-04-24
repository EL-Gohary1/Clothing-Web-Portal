import os

from flask import Flask, jsonify, render_template
from flask_migrate import Migrate
from config import config
from models import db
from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp
from routes.admin_routes import admin_bp
from routes.supplier_routes import supplier_bp
from services.customer_service import get_approved_products


migrate = Migrate()


def create_app(config_name=None):
    config_name = config_name or os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))

    db.init_app(app)
    migrate.init_app(app, db)

    if app.config.get('DEBUG') or os.environ.get('AUTO_CREATE_TABLES') == '1':
        with app.app_context():
            db.create_all()

    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(supplier_bp)


    @app.get("/")
    def home():
        body, status_code = get_approved_products()
        if status_code == 200:
            return render_template(
                "index.html", products=body["products"]
            )
        else:
            return render_template("error.html", message=body["message"])

    @app.get('/api')
    def index():
        return jsonify({
            'message': 'Clothing Portal API',
            'endpoints': {
                'auth': [
                    'GET /auth/register-page',
                    'GET /auth/login-page',
                    'POST /auth/register',
                    'POST /auth/login',
                    'POST /auth/logout',
                    'GET /auth/me',
                ],
                
                'admin-dashboard': [
                    'GET  /admin-dashboard/customers',
                    'GET  /admin-dashboard/suppliers',
                    'POST /admin-dashboard/users',
                    'DELETE /admin-dashboard/users/<id>',
                    'GET  /admin-dashboard/products?status=',
                    'GET  /admin-dashboard/products/search?keyword=',
                    'POST /admin-dashboard/products',
                    'PATCH /admin-dashboard/products/<id>/approve',
                    'PATCH /admin-dashboard/products/<id>/reject',
                    'DELETE /admin-dashboard/products/<id>',
                    'GET  /admin-dashboard/orders',
                ],
                'supplier-dashboard': [
                    'GET  /supplier-dashboard/products?status=',
                    'GET  /supplier-dashboard/products/search?keyword=',
                    'POST /supplier-dashboard/products',
                    'DELETE /supplier-dashboard/products/<id>',
                    'GET  /supplier-dashboard/orders',
                ],
            },
        })

    @app.get('/health')
    def health():
        try:
            db.session.execute(db.text('SELECT 1'))
            return jsonify({'status': 'healthy'}), 200
        except Exception as exc:
            return jsonify({'status': 'unhealthy', 'error': str(exc)}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    host = os.environ.get('FLASK_RUN_HOST', 'localhost')
    port = int(os.environ.get('FLASK_RUN_PORT', '5000'))
    debug = os.environ.get('FLASK_DEBUG', '1') == '1'
    app.run(host=host, port=port, debug=debug)