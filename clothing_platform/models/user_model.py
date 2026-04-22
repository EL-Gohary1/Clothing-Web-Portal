from enum import Enum as PyEnum
from . import db


# Enums based on class diagram
class UserRole(PyEnum):
    CUSTOMER = "CUSTOMER"
    SUPPLIER = "SUPPLIER"
    ADMIN = "ADMIN"
    
    
# User model
class User(db.Model):
    __tablename__ = 'user'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)  # Store hashed password
    role = db.Column(db.Enum(UserRole), nullable=False)
    
    # Relationships
    # One-to-one: User -> Cart (only for customers)
    cart = db.relationship('Cart', backref='owner', uselist=False, lazy=True, cascade='all, delete-orphan')
    
    # One-to-many: User -> Orders (only for customers)
    orders = db.relationship('Order', backref='customer', lazy=True, cascade='all, delete-orphan')
    
    # One-to-many: User (Supplier) -> Products
    products = db.relationship('Product', backref='supplier', lazy=True, 
                              foreign_keys='Product.supplier_id',
                              cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email} - {self.role.value}>'
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'role': self.role.value
        }
