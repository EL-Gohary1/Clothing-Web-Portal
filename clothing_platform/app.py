import os

from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate

from config import config
from models import db
from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp
from routes.customer_routes import customer_bp
from routes.admin_routes import admin_bp


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
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(admin_bp)

    # Serve static files for iframes
    @app.route('/Css/<path:filename>')
    def serve_css(filename):
        return send_from_directory('templates/Css', filename)

    @app.route('/NavBar.html')
    def serve_navbar():
        return send_from_directory('templates', 'NavBar.html')

    @app.route('/Footer.html')
    def serve_footer():
        return send_from_directory('templates', 'Footer.html')

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
                'dashboards': [
                    'GET / (Customer home)',
                    'GET /supplier-dashboard',
                    'GET /admin-dashboard',
                ],
                'admin': [
                    'GET  /api/admin/customers',
                    'GET  /api/admin/suppliers',
                    'GET  /api/admin/users/<id>',
                    'POST /api/admin/users',
                    'DELETE /api/admin/users/<id>',
                    'GET  /api/admin/products?status=',
                    'GET  /api/admin/products/search?keyword=',
                    'POST /api/admin/products',
                    'PATCH /api/admin/products/<id>/approve',
                    'PATCH /api/admin/products/<id>/reject',
                    'DELETE /api/admin/products/<id>',
                    'GET  /api/admin/orders',
                    'GET  /api/admin/orders/<id>',
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