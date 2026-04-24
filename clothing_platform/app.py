import os

from flask import Flask, jsonify
from flask_migrate import Migrate
from config import config
from models import db
from routes.auth_routes import auth_bp
from routes.customer_routes import customer_bp
from routes.admin_routes import admin_bp
from routes.supplier_routes import supplier_bp


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


    @app.get('/api')
    def index():
        return jsonify({
            'message': 'Clothing Portal API',
            'endpoints': {
                'auth': [
                    'GET /api/auth/register-page',
                    'GET /api/auth/login-page',
                    'POST /api/auth/register',
                    'POST /api/auth/login',
                    'POST /api/auth/logout',
                    'GET /api/auth/me',
                ],
                
                'admin': [
                    'GET  /api/admin/customers',
                    'GET  /api/admin/suppliers',
                    'POST /api/admin/users',
                    'DELETE /api/admin/users/<id>',
                    'GET  /api/admin/products?status=',
                    'GET  /api/admin/products/search?keyword=',
                    'POST /api/admin/products',
                    'PATCH /api/admin/products/<id>/approve',
                    'PATCH /api/admin/products/<id>/reject',
                    'DELETE /api/admin/products/<id>',
                    'GET  /api/admin/orders',
                ],
                'supplier': [
                    'GET  /api/supplier/products?status=',
                    'GET  /api/supplier/products/search?keyword=',
                    'POST /api/supplier/products',
                    'DELETE /api/supplier/products/<id>',
                    'GET  /api/supplier/orders',
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