from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Simple CORS - allow everything
    CORS(app, supports_credentials=True)
    
    # Register blueprints
    from app.routes import auth, activities, nutrition, goals, ai, community, dashboard
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(activities.bp)
    app.register_blueprint(nutrition.bp)
    app.register_blueprint(goals.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(community.bp)
    app.register_blueprint(dashboard.bp)
    
    @app.route('/')
    def root():
        return {'status': 'ok', 'message': 'AI Fitness Platform API - Use /api/* endpoints'}
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'AI Fitness Platform API is running'}
    
    @app.errorhandler(404)
    def handle_404(e):
        from flask import request
        print(f"404 ERROR: {request.method} {request.path}")
        return {'error': 'Not Found', 'path': request.path}, 404
    
    # Auto-create database tables on startup
    with app.app_context():
        db.create_all()
    
    # Print routes for debugging
    print("\n=== ROUTES ===")
    for rule in app.url_map.iter_rules():
        if 'ai' in rule.rule or 'dashboard' in rule.rule:
            print(f"  {rule.methods} {rule.rule}")
    print("==============\n")
    
    return app
