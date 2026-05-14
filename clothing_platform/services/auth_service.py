from models import User, UserRole, db


def _normalize_email(email):
    return (email or "").strip().lower()


def register_user(payload):
    name = (payload.get("name") or "").strip()
    email = _normalize_email(payload.get("email"))
    password = payload.get("password") or ""
    role_raw = (payload.get("role") or "CUSTOMER").strip().upper()

    if not name or not email or not password:
        return {"error": "name, email and password are required"}, 400

    if len(password) < 6:
        return {"error": "password must be at least 6 characters"}, 400

    if role_raw not in UserRole.__members__:
        allowed = [role.value for role in UserRole]
        return {"error": f"invalid role. allowed roles: {allowed}"}, 400

    if User.query.filter_by(email=email).first():
        return {"error": "email already exists"}, 409

    user = User(
        name=name,
        email=email,
        password=password,
        role=UserRole[role_raw],
    )

    db.session.add(user)
    db.session.commit()

    return {
        "message": "registration successful",
        "user": user.to_dict(),
    }, 201


def login_user(payload, flask_session):
    email = _normalize_email(payload.get("email"))
    password = payload.get("password") or ""

    if not email:
        return {"error": "Email is Required"}, 400

    if not password:
        return {"error": "Password is Required"}, 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.password == password:
        return {"error": "Invalid email or password"}, 401

    flask_session["user_id"] = user.user_id
    flask_session["user_role"] = user.role.value

    return {
        "message": "login successful",
        "user": user.to_dict(),
        "role": user.role.value,
    }, 200


def logout_user(flask_session):
    flask_session.clear()
    return {"message": "logout successful"}, 200
