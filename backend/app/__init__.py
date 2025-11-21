import os
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
    
    # CORS configuration - allows local development and production
    if os.environ.get('FLASK_ENV') == 'production':
        # Production: Restrict to your frontend domain
        CORS(app, resources={
            r"/api/*": {
                "origins": [
                    "https://*.netlify.app",
                    "https://*.vercel.app",
                    "http://localhost:3000"
                ]
            }
        })
    else:
        # Development: Allow all origins
        CORS(app)
    
    from app.routes import auth, activities, nutrition, goals, ai, community
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(activities.bp)
    app.register_blueprint(nutrition.bp)
    app.register_blueprint(goals.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(community.bp)
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'AI Fitness Platform API is running'}
    
    return app



