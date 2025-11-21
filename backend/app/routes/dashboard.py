from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Activity, Nutrition
from app.services.calorie_calculator import CalorieCalculator
from datetime import datetime, timedelta
from sqlalchemy import func

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@bp.route('/calorie-balance', methods=['GET'])
@jwt_required()
def get_calorie_balance():
    """
    Get comprehensive calorie balance information for today.
    Includes TDEE, target calories, consumed calories, burned calories, and remaining calories.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate user's calorie profile (BMR, TDEE, target calories)
    calorie_profile = CalorieCalculator.calculate_full_profile(user)
    
    # Get today's date range
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # Get today's nutrition (calories consumed)
    nutrition_logs = Nutrition.query.filter(
        Nutrition.user_id == user_id,
        Nutrition.date >= start_of_day,
        Nutrition.date <= end_of_day
    ).all()
    
    calories_consumed = sum(log.calories or 0 for log in nutrition_logs)
    
    # Get today's activities (calories burned from exercise)
    activities = Activity.query.filter(
        Activity.user_id == user_id,
        Activity.date >= start_of_day,
        Activity.date <= end_of_day
    ).all()
    
    calories_burned_exercise = sum(activity.calories_burned or 0 for activity in activities)
    
    # Calculate net calories and remaining
    # Net calories = calories consumed - calories burned from exercise
    net_calories = calories_consumed - calories_burned_exercise
    
    # Remaining calories = target - net calories
    target_calories = calorie_profile.get('target_calories')
    remaining_calories = None
    percentage_consumed = None
    
    if target_calories:
        remaining_calories = target_calories - net_calories
        if target_calories > 0:
            percentage_consumed = round((net_calories / target_calories) * 100, 1)
    
    # Build response
    response = {
        'calorie_profile': calorie_profile,
        'today': {
            'date': today.isoformat(),
            'calories_consumed': calories_consumed,
            'calories_burned_exercise': calories_burned_exercise,
            'net_calories': net_calories,
            'target_calories': target_calories,
            'remaining_calories': remaining_calories,
            'percentage_consumed': percentage_consumed,
            'meal_count': len(nutrition_logs),
            'workout_count': len(activities)
        },
        'user_goals': {
            'current_weight': user.weight_lbs,
            'target_weight': user.target_weight_lbs,
            'weight_to_goal': (user.target_weight_lbs - user.weight_lbs) if user.target_weight_lbs and user.weight_lbs else None,
            'weekly_rate': user.weight_goal_rate
        },
        'tips': []
    }
    
    # Add helpful tips
    if remaining_calories:
        if remaining_calories > 0:
            response['tips'].append(f'You have {remaining_calories} calories remaining for today')
        elif remaining_calories < -200:
            response['tips'].append(f'You\'re {abs(remaining_calories)} calories over your target. Consider adjusting tomorrow or adding exercise')
        else:
            response['tips'].append('You\'re right on target! Great job!')
    
    if user.weight_goal_rate and user.weight_goal_rate < 0:
        weeks_to_goal = None
        if user.weight_lbs and user.target_weight_lbs and user.weight_goal_rate:
            weight_diff = user.weight_lbs - user.target_weight_lbs
            if weight_diff > 0:
                weeks_to_goal = round(weight_diff / abs(user.weight_goal_rate), 1)
                response['tips'].append(f'At your current rate, you\'ll reach your goal in about {weeks_to_goal} weeks')
    
    return jsonify(response), 200


@bp.route('/weekly-summary', methods=['GET'])
@jwt_required()
def get_weekly_summary():
    """
    Get calorie balance summary for the past 7 days.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate target calories
    calorie_profile = CalorieCalculator.calculate_full_profile(user)
    target_calories = calorie_profile.get('target_calories')
    
    # Get data for the past 7 days
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=7)
    start_date = datetime.combine(seven_days_ago, datetime.min.time())
    
    # Get nutrition data
    nutrition_by_day = db.session.query(
        func.date(Nutrition.date).label('day'),
        func.sum(Nutrition.calories).label('total_calories')
    ).filter(
        Nutrition.user_id == user_id,
        Nutrition.date >= start_date
    ).group_by(func.date(Nutrition.date)).all()
    
    # Get activity data
    activity_by_day = db.session.query(
        func.date(Activity.date).label('day'),
        func.sum(Activity.calories_burned).label('total_burned')
    ).filter(
        Activity.user_id == user_id,
        Activity.date >= start_date
    ).group_by(func.date(Activity.date)).all()
    
    # Build daily summaries
    nutrition_dict = {str(day): calories for day, calories in nutrition_by_day}
    activity_dict = {str(day): burned for day, burned in activity_by_day}
    
    daily_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_str = str(day)
        
        consumed = nutrition_dict.get(day_str, 0)
        burned = activity_dict.get(day_str, 0)
        net = consumed - burned
        remaining = (target_calories - net) if target_calories else None
        
        daily_data.append({
            'date': day.isoformat(),
            'calories_consumed': consumed,
            'calories_burned': burned,
            'net_calories': net,
            'target_calories': target_calories,
            'remaining_calories': remaining
        })
    
    # Calculate weekly averages
    total_consumed = sum(d['calories_consumed'] for d in daily_data)
    total_burned = sum(d['calories_burned'] for d in daily_data)
    avg_net = round((total_consumed - total_burned) / 7)
    
    response = {
        'period': {
            'start': seven_days_ago.isoformat(),
            'end': today.isoformat(),
            'days': 7
        },
        'daily_data': list(reversed(daily_data)),  # Oldest to newest
        'weekly_averages': {
            'avg_consumed': round(total_consumed / 7),
            'avg_burned': round(total_burned / 7),
            'avg_net_calories': avg_net,
            'target_calories': target_calories
        },
        'calorie_profile': calorie_profile
    }
    
    return jsonify(response), 200

