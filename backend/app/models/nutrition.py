from datetime import datetime
from app import db


class Nutrition(db.Model):
    __tablename__ = 'nutrition'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    meal_type = db.Column(db.String(50), nullable=False)
    food_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Float)
    carbohydrates = db.Column(db.Float)
    fats = db.Column(db.Float)
    fiber = db.Column(db.Float)
    
    serving_size = db.Column(db.String(50))
    quantity = db.Column(db.Float, default=1.0)
    
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'meal_type': self.meal_type,
            'food_name': self.food_name,
            'description': self.description,
            'calories': self.calories,
            'protein': self.protein,
            'carbohydrates': self.carbohydrates,
            'fats': self.fats,
            'fiber': self.fiber,
            'serving_size': self.serving_size,
            'quantity': self.quantity,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }



