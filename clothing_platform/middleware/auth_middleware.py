from functools import wraps

from flask import g, jsonify, session

from models import User


def login_required(view_function):
    @wraps(view_function)
    def wrapper(*args, **kwargs):
        user_id = session.get('user_id')
        if user_id is None:
            return jsonify({'error': 'authentication required'}), 401

        user = User.query.get(user_id)
        if user is None:
            session.clear()
            return jsonify({'error': 'session is invalid, please login again'}), 401

        g.current_user = user
        return view_function(*args, **kwargs)

    return wrapper


def role_required(*roles):
    allowed_roles = {role.upper() for role in roles}

    def decorator(view_function):
        @login_required
        @wraps(view_function)
        def wrapper(*args, **kwargs):
            if g.current_user.role.value not in allowed_roles:
                return jsonify({'error': 'you are not allowed to access this endpoint'}), 403

            return view_function(*args, **kwargs)

        return wrapper

    return decorator
