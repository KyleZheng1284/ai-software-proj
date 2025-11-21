from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models import Activity

bp = Blueprint('activities', __name__, url_prefix='/api/activities')


@bp.route('', methods=['GET'])
@jwt_required()
def get_activities():
    user_id = get_jwt_identity()
    
    days = request.args.get('days', 30, type=int)
    activity_type = request.args.get('type')
    
    query = Activity.query.filter_by(user_id=user_id)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(Activity.date >= start_date)
    
    if activity_type:
        query = query.filter_by(activity_type=activity_type)
    
    activities = query.order_by(Activity.date.desc()).all()
    
    return jsonify({
        'activities': [activity.to_dict() for activity in activities],
        'count': len(activities)
    }), 200


@bp.route('', methods=['POST'])
@jwt_required()
def create_activity():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('calories_burned'):
        return jsonify({'error': 'Title and calories burned are required'}), 400
    
    # Convert empty strings to None for numeric fields
    duration_minutes = data.get('duration_minutes')
    duration_minutes = int(duration_minutes) if duration_minutes and duration_minutes != '' else None
    
    distance = data.get('distance')
    distance = float(distance) if distance and distance != '' else None
    
    calories_burned = data.get('calories_burned')
    calories_burned = int(calories_burned) if calories_burned and calories_burned != '' else None
    
    activity = Activity(
        user_id=user_id,
        activity_type=data.get('activity_type', 'other'),
        title=data['title'],
        description=data.get('description'),
        duration_minutes=duration_minutes,
        distance=distance,
        calories_burned=calories_burned,
        intensity=data.get('intensity', 'moderate'),
        date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow()
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'message': 'Activity logged successfully',
        'activity': activity.to_dict()
    }), 201


@bp.route('/<int:activity_id>', methods=['GET'])
@jwt_required()
def get_activity(activity_id):
    user_id = get_jwt_identity()
    activity = Activity.query.filter_by(id=activity_id, user_id=user_id).first()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    return jsonify(activity.to_dict()), 200


@bp.route('/<int:activity_id>', methods=['PUT'])
@jwt_required()
def update_activity(activity_id):
    user_id = get_jwt_identity()
    activity = Activity.query.filter_by(id=activity_id, user_id=user_id).first()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    data = request.get_json()
    
    if 'activity_type' in data:
        activity.activity_type = data['activity_type']
    if 'title' in data:
        activity.title = data['title']
    if 'description' in data:
        activity.description = data['description']
    if 'duration_minutes' in data:
        val = data['duration_minutes']
        activity.duration_minutes = int(val) if val and val != '' else None
    if 'distance' in data:
        val = data['distance']
        activity.distance = float(val) if val and val != '' else None
    if 'calories_burned' in data:
        val = data['calories_burned']
        activity.calories_burned = int(val) if val and val != '' else None
    if 'intensity' in data:
        activity.intensity = data['intensity']
    if 'date' in data:
        activity.date = datetime.fromisoformat(data['date'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Activity updated successfully',
        'activity': activity.to_dict()
    }), 200


@bp.route('/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    user_id = get_jwt_identity()
    activity = Activity.query.filter_by(id=activity_id, user_id=user_id).first()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    db.session.delete(activity)
    db.session.commit()
    
    return jsonify({'message': 'Activity deleted successfully'}), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_activity_stats():
    user_id = get_jwt_identity()
    days = request.args.get('days', 30, type=int)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    activities = Activity.query.filter_by(user_id=user_id).filter(Activity.date >= start_date).all()
    
    total_activities = len(activities)
    total_duration = sum(a.duration_minutes for a in activities if a.duration_minutes)
    total_calories = sum(a.calories_burned for a in activities if a.calories_burned)
    total_distance = sum(a.distance for a in activities if a.distance)
    
    activity_types = {}
    for activity in activities:
        activity_types[activity.activity_type] = activity_types.get(activity.activity_type, 0) + 1
    
    return jsonify({
        'total_activities': total_activities,
        'total_duration_minutes': total_duration,
        'total_calories_burned': total_calories,
        'total_distance': total_distance,
        'activity_types': activity_types,
        'average_duration': total_duration / total_activities if total_activities > 0 else 0
    }), 200



