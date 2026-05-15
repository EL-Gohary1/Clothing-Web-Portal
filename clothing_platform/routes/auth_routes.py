from flask import Blueprint, g, jsonify, redirect, request, session, render_template
from middleware.auth_middleware import login_required, role_required
from models import db
from services.auth_service import login_user, logout_user, register_user


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.get("/register")
def register_page():
    return render_template("register.html")


@auth_bp.get("/login")
def login_page():
    return render_template("login.html")


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    body, status_code = register_user(payload)
    return jsonify(body), status_code


@auth_bp.post("/login")
def login():
    if request.is_json:
        payload = request.get_json(silent=True) or {}
        body, status_code = login_user(payload, session)
        return jsonify(body), status_code

    payload = request.form.to_dict(flat=True) or {}
    body, status_code = login_user(payload, session)

    if status_code == 200:
        role = body.get("role") or (body.get("user") or {}).get("role")

        if role == "CUSTOMER":
            return redirect("/customer/")
        if role == "ADMIN":
            return redirect("/admin-dashboard/customers")
        if role == "SUPPLIER":
            return redirect("/supplier-dashboard/products")

        return redirect("/api")

    return render_template("login.html", server_error=body.get("error")), status_code


@auth_bp.post("/logout")
@login_required
def logout():
    body, status_code = logout_user(session)
    return jsonify(body), status_code


@auth_bp.get("/profile")
@login_required
def profile():
    if g.current_user:
       return render_template("profile.html", user=g.current_user)

@auth_bp.put("/profile")
@login_required
def update_profile():
    data = request.get_json()
    print("DATA:", data)
    user = g.current_user
    user.name = data.get("name")
    db.session.add(user)
    db.session.commit()

    return {"message": "Profile updated"}, 200
