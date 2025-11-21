from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Goal

bp = Blueprint('goals', __name__, url_prefix='/api/goals')


@bp.route('', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    status = request.args.get('status')
    
    query = Goal.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    goals = query.order_by(Goal.created_at.desc()).all()
    
    return jsonify({
        'goals': [goal.to_dict() for goal in goals],
        'count': len(goals)
    }), 200


@bp.route('', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('goal_type') or not data.get('title') or not data.get('target_value'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    goal = Goal(
        user_id=user_id,
        goal_type=data['goal_type'],
        title=data['title'],
        description=data.get('description'),
        target_value=data['target_value'],
        current_value=data.get('current_value', 0),
        unit=data.get('unit'),
        start_date=datetime.fromisoformat(data['start_date']) if data.get('start_date') else datetime.utcnow(),
        target_date=datetime.fromisoformat(data['target_date']) if data.get('target_date') else None
    )
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify({
        'message': 'Goal created successfully',
        'goal': goal.to_dict()
    }), 201


@bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    return jsonify(goal.to_dict()), 200


@bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    if 'goal_type' in data:
        goal.goal_type = data['goal_type']
    if 'title' in data:
        goal.title = data['title']
    if 'description' in data:
        goal.description = data['description']
    if 'target_value' in data:
        goal.target_value = data['target_value']
    if 'current_value' in data:
        goal.current_value = data['current_value']
        
        if goal.current_value >= goal.target_value and goal.status == 'active':
            goal.status = 'completed'
            goal.completed_at = datetime.utcnow()
    
    if 'unit' in data:
        goal.unit = data['unit']
    if 'status' in data:
        goal.status = data['status']
        if data['status'] == 'completed' and not goal.completed_at:
            goal.completed_at = datetime.utcnow()
    if 'target_date' in data:
        goal.target_date = datetime.fromisoformat(data['target_date'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Goal updated successfully',
        'goal': goal.to_dict()
    }), 200


@bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted successfully'}), 200


@bp.route('/<int:goal_id>/progress', methods=['POST'])
@jwt_required()
def update_goal_progress(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    if 'increment' in data:
        goal.current_value += data['increment']
    elif 'current_value' in data:
        goal.current_value = data['current_value']
    else:
        return jsonify({'error': 'Must provide increment or current_value'}), 400
    
    if goal.current_value >= goal.target_value and goal.status == 'active':
        goal.status = 'completed'
        goal.completed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Goal progress updated successfully',
        'goal': goal.to_dict()
    }), 200



