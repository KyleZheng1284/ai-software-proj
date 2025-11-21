from datetime import datetime
from app import db


class Activity(db.Model):
    __tablename__ = 'activities'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    activity_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    duration_minutes = db.Column(db.Integer)
    distance = db.Column(db.Float)
    calories_burned = db.Column(db.Integer)
    
    intensity = db.Column(db.String(20))
    
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'title': self.title,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'distance': self.distance,
            'calories_burned': self.calories_burned,
            'intensity': self.intensity,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }



