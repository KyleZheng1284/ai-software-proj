from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import requests
from app import db
from app.models import Nutrition

import os

# USDA FoodData Central API - Free, no API key needed for basic access
USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1"
# Get a free API key from: https://fdc.nal.usda.gov/api-key-signup.html
USDA_API_KEY = os.environ.get('USDA_API_KEY', 'DEMO_KEY')  # DEMO_KEY has rate limits

bp = Blueprint('nutrition', __name__, url_prefix='/api/nutrition')


@bp.route('/food-search', methods=['GET'])
@jwt_required()
def search_foods():
    query = request.args.get('q', '').strip()
    
    if not query or len(query) < 2:
        return jsonify([]), 200
    
    try:
        # Search USDA FoodData Central database
        url = f"{USDA_API_BASE}/foods/search"
        params = {
            'api_key': USDA_API_KEY,
            'query': query,
            'pageSize': 10,  # Limit to 10 results
            'dataType': ['Survey (FNDDS)', 'Foundation', 'SR Legacy']  # Most common foods
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        # Format the results for our frontend
        formatted_foods = []
        for food in data.get('foods', []):
            # Extract nutrition info
            nutrients = {}
            for nutrient in food.get('foodNutrients', []):
                nutrient_name = nutrient.get('nutrientName', '').lower()
                value = nutrient.get('value', 0)
                
                if 'energy' in nutrient_name or 'calori' in nutrient_name:
                    nutrients['calories'] = round(value)
                elif 'protein' in nutrient_name:
                    nutrients['protein'] = round(value, 1)
                elif 'carbohydrate' in nutrient_name:
                    nutrients['carbs'] = round(value, 1)
                elif 'total lipid' in nutrient_name or 'fat' in nutrient_name:
                    nutrients['fats'] = round(value, 1)
                elif 'fiber' in nutrient_name:
                    nutrients['fiber'] = round(value, 1)
            
            formatted_food = {
                'name': food.get('description', 'Unknown Food'),
                'calories': nutrients.get('calories', 0),
                'protein': nutrients.get('protein', 0),
                'carbs': nutrients.get('carbs', 0),
                'fats': nutrients.get('fats', 0),
                'fiber': nutrients.get('fiber', 0),
                'serving': '100g'
            }
            formatted_foods.append(formatted_food)
        
        return jsonify(formatted_foods), 200
        
    except requests.RequestException as e:
        print(f"USDA API error: {e}")
        # Return empty list on error
        return jsonify([]), 200


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
    
    # Convert empty strings to None for numeric fields
    protein = data.get('protein')
    protein = float(protein) if protein and protein != '' else None
    
    carbohydrates = data.get('carbohydrates')
    carbohydrates = float(carbohydrates) if carbohydrates and carbohydrates != '' else None
    
    fats = data.get('fats')
    fats = float(fats) if fats and fats != '' else None
    
    fiber = data.get('fiber')
    fiber = float(fiber) if fiber and fiber != '' else None
    
    quantity = data.get('quantity', 1.0)
    quantity = float(quantity) if quantity and quantity != '' else 1.0
    
    nutrition = Nutrition(
        user_id=user_id,
        meal_type=data['meal_type'],
        food_name=data['food_name'],
        description=data.get('description'),
        calories=int(data['calories']),
        protein=protein,
        carbohydrates=carbohydrates,
        fats=fats,
        fiber=fiber,
        serving_size=data.get('serving_size'),
        quantity=quantity,
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



