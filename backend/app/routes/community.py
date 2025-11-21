from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import CommunityPost, Challenge, Comment

bp = Blueprint('community', __name__, url_prefix='/api/community')


@bp.route('/posts', methods=['GET'])
def get_posts():
    post_type = request.args.get('type')
    limit = request.args.get('limit', 50, type=int)
    
    query = CommunityPost.query
    
    if post_type:
        query = query.filter_by(post_type=post_type)
    
    posts = query.order_by(CommunityPost.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'posts': [post.to_dict(include_comments=True) for post in posts],
        'count': len(posts)
    }), 200


@bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    post = CommunityPost(
        user_id=user_id,
        title=data['title'],
        content=data['content'],
        post_type=data.get('post_type', 'tip')
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'message': 'Post created successfully',
        'post': post.to_dict()
    }), 201


@bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    post = CommunityPost.query.get(post_id)
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    post.likes_count += 1
    db.session.commit()
    
    return jsonify({
        'message': 'Post liked',
        'likes_count': post.likes_count
    }), 200


@bp.route('/posts/<int:post_id>/comment', methods=['POST'])
@jwt_required()
def comment_on_post(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    
    post = CommunityPost.query.get(post_id)
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # Create the actual comment
    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=data['content']
    )
    
    # Increment comments count
    post.comments_count += 1
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'message': 'Comment added successfully',
        'comment': comment.to_dict(),
        'comments_count': post.comments_count
    }), 201


@bp.route('/challenges', methods=['GET'])
def get_challenges():
    active_only = request.args.get('active', 'true').lower() == 'true'
    
    query = Challenge.query
    
    if active_only:
        query = query.filter_by(is_active=True)
        query = query.filter(Challenge.end_date >= datetime.utcnow())
    
    challenges = query.order_by(Challenge.start_date.desc()).all()
    
    return jsonify({
        'challenges': [challenge.to_dict() for challenge in challenges],
        'count': len(challenges)
    }), 200


@bp.route('/challenges', methods=['POST'])
@jwt_required()
def create_challenge():
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('challenge_type') or not data.get('target_value'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    challenge = Challenge(
        title=data['title'],
        description=data['description'],
        challenge_type=data['challenge_type'],
        target_value=data['target_value'],
        unit=data.get('unit'),
        start_date=datetime.fromisoformat(data['start_date']) if data.get('start_date') else datetime.utcnow(),
        end_date=datetime.fromisoformat(data['end_date'])
    )
    
    db.session.add(challenge)
    db.session.commit()
    
    return jsonify({
        'message': 'Challenge created successfully',
        'challenge': challenge.to_dict()
    }), 201


@bp.route('/challenges/<int:challenge_id>/join', methods=['POST'])
@jwt_required()
def join_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404
    
    challenge.participants_count += 1
    db.session.commit()
    
    return jsonify({
        'message': 'Joined challenge successfully',
        'challenge': challenge.to_dict()
    }), 200



