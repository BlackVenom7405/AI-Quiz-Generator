import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify
from database.db_manager import query_db

SECRET_KEY = os.environ.get("SECRET_KEY", "quiz_genius_default_secret_key_123")

def generate_token(user_id, email, is_admin):
    """
    Generate a JWT token that expires in 24 hours.
    """
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id,
            'email': email,
            'is_admin': is_admin
        }
        return jwt.encode(
            payload,
            SECRET_KEY,
            algorithm='HS256'
        )
    except Exception as e:
        return str(e)

def decode_token(token):
    """
    Decode a JWT token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return {
            'success': True,
            'user_id': payload['sub'],
            'email': payload['email'],
            'is_admin': payload['is_admin']
        }
    except jwt.ExpiredSignatureError:
        return {'success': False, 'message': 'Token has expired. Please log in again.'}
    except jwt.InvalidTokenError:
        return {'success': False, 'message': 'Invalid token. Please log in again.'}

def token_required(f):
    """
    Decorator to protect API routes, verifying the JWT token.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Expecting format: Bearer <token>
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Authorization header format must be Bearer <token>'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        data = decode_token(token)
        if not data['success']:
            return jsonify({'message': data['message']}), 401

        # Check if user still exists in database
        current_user = query_db("SELECT id, name, email, is_admin FROM users WHERE id = ?", (data['user_id'],), one=True)
        if not current_user:
            return jsonify({'message': 'User no longer exists!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def admin_required(f):
    """
    Decorator to restrict API routes to admin users only.
    """
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user['is_admin']:
            return jsonify({'message': 'Admin privileges required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated
