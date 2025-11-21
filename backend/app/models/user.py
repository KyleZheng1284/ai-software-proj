from datetime import datetime
from app import db
import bcrypt


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    height_feet = db.Column(db.Integer)
    height_inches = db.Column(db.Integer)
    weight_lbs = db.Column(db.Integer)
    
    fitness_level = db.Column(db.String(20))
    activity_level = db.Column(db.String(30))  # sedentary, lightly_active, moderately_active, very_active, extra_active
    target_weight_lbs = db.Column(db.Integer)
    weight_goal_rate = db.Column(db.Float)  # lbs per week (positive for gain, negative for loss)
    daily_calorie_goal = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    activities = db.relationship('Activity', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    nutrition_logs = db.relationship('Nutrition', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    community_posts = db.relationship('CommunityPost', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'age': self.age,
            'gender': self.gender,
            'height_feet': self.height_feet,
            'height_inches': self.height_inches,
            'weight_lbs': self.weight_lbs,
            'fitness_level': self.fitness_level,
            'activity_level': self.activity_level,
            'target_weight_lbs': self.target_weight_lbs,
            'weight_goal_rate': self.weight_goal_rate,
            'daily_calorie_goal': self.daily_calorie_goal,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }



