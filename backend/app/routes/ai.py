from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User

bp = Blueprint('ai', __name__, url_prefix='/api/ai')

def get_ai_service():
    """Lazy load AI service to avoid module-level instantiation issues"""
    from app.services.ai_service import AIService
    return AIService()


@bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        response = get_ai_service().chat_with_coach(
            user=user,
            user_message=data['message'],
            conversation_history=data.get('history', [])
        )
        
        return jsonify({
            'response': response,
            'message': 'Chat response generated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate response',
            'details': str(e)
        }), 500


@bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        recommendations = get_ai_service().generate_recommendations(user)
        
        return jsonify({
            'recommendations': recommendations,
            'message': 'Recommendations generated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate recommendations',
            'details': str(e)
        }), 500


@bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        insights = get_ai_service().analyze_patterns(user)
        
        return jsonify({
            'insights': insights,
            'message': 'Insights generated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate insights',
            'details': str(e)
        }), 500


@bp.route('/meal-plan', methods=['GET'])
@jwt_required()
def get_meal_plan():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    days = request.args.get('days', 7, type=int)
    
    try:
        meal_plan = get_ai_service().generate_meal_plan(user, days)
        
        return jsonify({
            'meal_plan': meal_plan,
            'message': 'Meal plan generated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate meal plan',
            'details': str(e)
        }), 500


@bp.route('/workout-plan', methods=['GET'])
@jwt_required()
def get_workout_plan():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    days = request.args.get('days', 7, type=int)
    
    try:
        workout_plan = get_ai_service().generate_workout_plan(user, days)
        
        return jsonify({
            'workout_plan': workout_plan,
            'message': 'Workout plan generated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate workout plan',
            'details': str(e)
        }), 500


@bp.route('/motivational-message', methods=['GET'])
@jwt_required()
def get_motivational_message():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        message = get_ai_service().generate_motivational_message(user)
        
        return jsonify({
            'message': message
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate motivational message',
            'details': str(e)
        }), 500



