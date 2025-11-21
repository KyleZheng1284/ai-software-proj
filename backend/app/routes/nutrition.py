from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models import Nutrition

bp = Blueprint('nutrition', __name__, url_prefix='/api/nutrition')


@bp.route('', methods=['GET'])
@jwt_required()
def get_nutrition_logs():
    user_id = get_jwt_identity()
    
    days = request.args.get('days', 7, type=int)
    meal_type = request.args.get('meal_type')
    
    query = Nutrition.query.filter_by(user_id=user_id)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(Nutrition.date >= start_date)
    
    if meal_type:
        query = query.filter_by(meal_type=meal_type)
    
    nutrition_logs = query.order_by(Nutrition.date.desc()).all()
    
    return jsonify({
        'nutrition_logs': [log.to_dict() for log in nutrition_logs],
        'count': len(nutrition_logs)
    }), 200


@bp.route('', methods=['POST'])
@jwt_required()
def create_nutrition_log():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('meal_type') or not data.get('food_name') or not data.get('calories'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    nutrition = Nutrition(
        user_id=user_id,
        meal_type=data['meal_type'],
        food_name=data['food_name'],
        description=data.get('description'),
        calories=data['calories'],
        protein=data.get('protein'),
        carbohydrates=data.get('carbohydrates'),
        fats=data.get('fats'),
        fiber=data.get('fiber'),
        serving_size=data.get('serving_size'),
        quantity=data.get('quantity', 1.0),
        date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow()
    )
    
    db.session.add(nutrition)
    db.session.commit()
    
    return jsonify({
        'message': 'Nutrition logged successfully',
        'nutrition': nutrition.to_dict()
    }), 201


@bp.route('/<int:nutrition_id>', methods=['PUT'])
@jwt_required()
def update_nutrition_log(nutrition_id):
    user_id = get_jwt_identity()
    nutrition = Nutrition.query.filter_by(id=nutrition_id, user_id=user_id).first()
    
    if not nutrition:
        return jsonify({'error': 'Nutrition log not found'}), 404
    
    data = request.get_json()
    
    if 'meal_type' in data:
        nutrition.meal_type = data['meal_type']
    if 'food_name' in data:
        nutrition.food_name = data['food_name']
    if 'description' in data:
        nutrition.description = data['description']
    if 'calories' in data:
        nutrition.calories = data['calories']
    if 'protein' in data:
        nutrition.protein = data['protein']
    if 'carbohydrates' in data:
        nutrition.carbohydrates = data['carbohydrates']
    if 'fats' in data:
        nutrition.fats = data['fats']
    if 'fiber' in data:
        nutrition.fiber = data['fiber']
    if 'serving_size' in data:
        nutrition.serving_size = data['serving_size']
    if 'quantity' in data:
        nutrition.quantity = data['quantity']
    if 'date' in data:
        nutrition.date = datetime.fromisoformat(data['date'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Nutrition log updated successfully',
        'nutrition': nutrition.to_dict()
    }), 200


@bp.route('/<int:nutrition_id>', methods=['DELETE'])
@jwt_required()
def delete_nutrition_log(nutrition_id):
    user_id = get_jwt_identity()
    nutrition = Nutrition.query.filter_by(id=nutrition_id, user_id=user_id).first()
    
    if not nutrition:
        return jsonify({'error': 'Nutrition log not found'}), 404
    
    db.session.delete(nutrition)
    db.session.commit()
    
    return jsonify({'message': 'Nutrition log deleted successfully'}), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_nutrition_stats():
    user_id = get_jwt_identity()
    days = request.args.get('days', 7, type=int)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    nutrition_logs = Nutrition.query.filter_by(user_id=user_id).filter(Nutrition.date >= start_date).all()
    
    total_calories = sum(log.calories for log in nutrition_logs)
    total_protein = sum(log.protein for log in nutrition_logs if log.protein)
    total_carbs = sum(log.carbohydrates for log in nutrition_logs if log.carbohydrates)
    total_fats = sum(log.fats for log in nutrition_logs if log.fats)
    total_fiber = sum(log.fiber for log in nutrition_logs if log.fiber)
    
    meal_breakdown = {}
    for log in nutrition_logs:
        meal_breakdown[log.meal_type] = meal_breakdown.get(log.meal_type, 0) + log.calories
    
    return jsonify({
        'total_calories': total_calories,
        'total_protein': round(total_protein, 1),
        'total_carbohydrates': round(total_carbs, 1),
        'total_fats': round(total_fats, 1),
        'total_fiber': round(total_fiber, 1),
        'average_daily_calories': round(total_calories / days, 1) if days > 0 else 0,
        'meal_breakdown': meal_breakdown,
        'total_meals': len(nutrition_logs)
    }), 200



