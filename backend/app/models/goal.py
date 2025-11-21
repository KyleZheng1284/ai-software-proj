from datetime import datetime
from app import db


class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    goal_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    target_value = db.Column(db.Float, nullable=False)
    current_value = db.Column(db.Float, default=0)
    unit = db.Column(db.String(50))
    
    status = db.Column(db.String(20), default='active')
    
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    target_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        progress_percentage = 0
        if self.target_value > 0:
            progress_percentage = min((self.current_value / self.target_value) * 100, 100)
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'goal_type': self.goal_type,
            'title': self.title,
            'description': self.description,
            'target_value': self.target_value,
            'current_value': self.current_value,
            'unit': self.unit,
            'status': self.status,
            'progress_percentage': round(progress_percentage, 1),
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }



