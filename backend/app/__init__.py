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
    
    # CORS configuration - allow all origins for simplicity
    # In production, you may want to restrict this to specific domains
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Import and register blueprints with error handling
    try:
        from app.routes import auth
        app.register_blueprint(auth.bp)
        print("Registered: auth")
    except Exception as e:
        print(f"Failed to register auth: {e}")
    
    try:
        from app.routes import activities
        app.register_blueprint(activities.bp)
        print("Registered: activities")
    except Exception as e:
        print(f"Failed to register activities: {e}")
    
    try:
        from app.routes import nutrition
        app.register_blueprint(nutrition.bp)
        print("Registered: nutrition")
    except Exception as e:
        print(f"Failed to register nutrition: {e}")
    
    try:
        from app.routes import goals
        app.register_blueprint(goals.bp)
        print("Registered: goals")
    except Exception as e:
        print(f"Failed to register goals: {e}")
    
    try:
        from app.routes import ai
        app.register_blueprint(ai.bp)
        print("Registered: ai")
    except Exception as e:
        print(f"Failed to register ai: {e}")
    
    try:
        from app.routes import community
        app.register_blueprint(community.bp)
        print("Registered: community")
    except Exception as e:
        print(f"Failed to register community: {e}")
    
    try:
        from app.routes import dashboard
        app.register_blueprint(dashboard.bp)
        print("Registered: dashboard")
    except Exception as e:
        print(f"Failed to register dashboard: {e}")
    
    @app.route('/')
    def root():
        return {'status': 'ok', 'message': 'AI Fitness Platform API - Use /api/* endpoints'}
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'AI Fitness Platform API is running'}
    
    # Auto-create database tables on startup
    with app.app_context():
        db.create_all()
    
    return app



