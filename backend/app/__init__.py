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
    
    return app



