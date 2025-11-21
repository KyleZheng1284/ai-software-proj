from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Convert empty strings to None for numeric fields
    age = data.get('age')
    age = int(age) if age and age != '' else None
    
    height_feet = data.get('height_feet')
    height_feet = int(height_feet) if height_feet and height_feet != '' else None
    
    height_inches = data.get('height_inches')
    height_inches = int(height_inches) if height_inches and height_inches != '' else None
    
    weight_lbs = data.get('weight_lbs')
    weight_lbs = int(weight_lbs) if weight_lbs and weight_lbs != '' else None
    
    target_weight_lbs = data.get('target_weight_lbs')
    target_weight_lbs = int(target_weight_lbs) if target_weight_lbs and target_weight_lbs != '' else None
    
    daily_calorie_goal = data.get('daily_calorie_goal')
    daily_calorie_goal = int(daily_calorie_goal) if daily_calorie_goal and daily_calorie_goal != '' else None
    
    weight_goal_rate = data.get('weight_goal_rate')
    weight_goal_rate = float(weight_goal_rate) if weight_goal_rate and weight_goal_rate != '' else None
    
    user = User(
        email=data['email'],
        username=data['username'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        age=age,
        gender=data.get('gender'),
        height_feet=height_feet,
        height_inches=height_inches,
        weight_lbs=weight_lbs,
        fitness_level=data.get('fitness_level'),
        activity_level=data.get('activity_level'),
        target_weight_lbs=target_weight_lbs,
        weight_goal_rate=weight_goal_rate,
        daily_calorie_goal=daily_calorie_goal
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email/username or password'}), 400
    
    # Check if input is email or username
    login_input = data['email']
    
    # Try to find user by email or username
    if '@' in login_input:
        user = User.query.filter_by(email=login_input).first()
    else:
        user = User.query.filter_by(username=login_input).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email/username or password'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200


@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'age' in data:
        val = data['age']
        user.age = int(val) if val and val != '' else None
    if 'gender' in data:
        user.gender = data['gender']
    if 'height_feet' in data:
        val = data['height_feet']
        user.height_feet = int(val) if val and val != '' else None
    if 'height_inches' in data:
        val = data['height_inches']
        user.height_inches = int(val) if val and val != '' else None
    if 'weight_lbs' in data:
        val = data['weight_lbs']
        user.weight_lbs = int(val) if val and val != '' else None
    if 'fitness_level' in data:
        user.fitness_level = data['fitness_level']
    if 'activity_level' in data:
        user.activity_level = data['activity_level']
    if 'target_weight_lbs' in data:
        val = data['target_weight_lbs']
        user.target_weight_lbs = int(val) if val and val != '' else None
    if 'weight_goal_rate' in data:
        val = data['weight_goal_rate']
        user.weight_goal_rate = float(val) if val and val != '' else None
    if 'daily_calorie_goal' in data:
        val = data['daily_calorie_goal']
        user.daily_calorie_goal = int(val) if val and val != '' else None
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200



