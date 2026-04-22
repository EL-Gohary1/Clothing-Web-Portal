from datetime import datetime
from enum import Enum as PyEnum
from . import db

class ProductStatus(PyEnum):
    APPROVED = "APPROVED"
    PENDING = "PENDING"
    REJECTED = "REJECTED"


class StockStatus(PyEnum):
    IN_STOCK = "IN_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    LOW_STOCK = "LOW_STOCK"


# Product model
class Product(db.Model):
    __tablename__ = 'product'
    
    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    product_title = db.Column(db.String(200), nullable=False)
    photo = db.Column(db.String(255))  # URL or path to image
    description = db.Column(db.Text)
    unit_price = db.Column(db.Float, nullable=False)
    stock_qty = db.Column(db.Integer, default=0)
    stock_status = db.Column(db.Enum(StockStatus), default=StockStatus.IN_STOCK)
    product_status = db.Column(db.Enum(ProductStatus), default=ProductStatus.PENDING)
    
    def __repr__(self):
        return f'<Product {self.product_title} - ${self.unit_price}>'
    
    def to_dict(self):
        """Convert product to dictionary"""
        return {
            'product_id': self.product_id,
            'supplier_id': self.supplier_id,
            'product_title': self.product_title,
            'photo': self.photo,
            'description': self.description,
            'unit_price': self.unit_price,
            'stock_qty': self.stock_qty,
            'stock_status': self.stock_status.value,
            'product_status': self.product_status.value
        }
    
    def update_stock_status(self):
        """Automatically update stock status based on quantity"""
        if self.stock_qty == 0:
            self.stock_status = StockStatus.OUT_OF_STOCK
        elif self.stock_qty < 10:  # Threshold for low stock
            self.stock_status = StockStatus.LOW_STOCK
        else:
            self.stock_status = StockStatus.IN_STOCK

