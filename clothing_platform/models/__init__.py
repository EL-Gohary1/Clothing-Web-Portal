from flask_sqlalchemy import SQLAlchemy
from extensions import db


# Import models so SQLAlchemy can discover them.
from .user_model import User, UserRole
from .product_model import Product, ProductStatus, StockStatus
from .cart_model import Cart, CartProduct
from .order_model import Order, OrderProduct

__all__ = [
    'db',
    'User',
    'UserRole',
    'Product',
    'ProductStatus',
    'StockStatus',
    'Cart',
    'CartProduct',
    'Order',
    'OrderProduct',
]