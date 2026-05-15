from . import db
from datetime import datetime

class Cart(db.Model):
    __tablename__ = 'cart'

    cart_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Cart {self.cart_id} for customer {self.customer_id}>'

    @property
    def items(self):
        """Property to access cart items"""
        return CartProduct.query.filter_by(cart_id=self.cart_id).all()

    def get_items(self):
        return CartProduct.query.filter_by(cart_id=self.cart_id).all()

    def calculate_total(self):
        items = self.get_items()
        total = sum(item.product.unit_price * item.quantity for item in items)
        return round(total, 2)

    def to_dict(self):
        items = self.get_items()
        return {
            'cart_id': self.cart_id,
            'customer_id': self.customer_id,
            'items': [{
                'product_id': item.product_id,
                'product_title': item.product.product_title,
                'product_photo': item.product.photo,
                'product_description': item.product.description,
                'unit_price': item.product.unit_price,
                'quantity': item.quantity,
                'subtotal': round(item.product.unit_price * item.quantity, 2)
            } for item in items],
            'total': self.calculate_total()
        }


class CartProduct(db.Model):
    __tablename__ = 'cart_product'

    cart_id = db.Column(db.Integer, db.ForeignKey('cart.cart_id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    # Relationships
    cart = db.relationship('Cart', backref='cart_products')
    product = db.relationship('Product', backref=db.backref('cart_products', cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<CartProduct cart={self.cart_id} product={self.product_id} qty={self.quantity}>'