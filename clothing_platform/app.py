import os

from flask import Flask, jsonify
from flask_migrate import Migrate

from config import config
from models import db
from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp


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