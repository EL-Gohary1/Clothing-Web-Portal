from . import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'order'

    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    delivery_city = db.Column(db.String(100))
    delivery_address = db.Column(db.String(255))
    receiver_name = db.Column(db.String(100))
    receiver_phone = db.Column(db.String(50))
    total_price = db.Column(db.Float, nullable=False)
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Order {self.order_id} - ${self.total_price}>'

    def get_items(self):
        return OrderProduct.query.filter_by(order_id=self.order_id).all()

    def to_dict(self):
        items = self.get_items()
        return {
            'order_id': self.order_id,
            'customer_id': self.customer_id,
            'delivery_city': self.delivery_city,
            'delivery_address': self.delivery_address,
            'receiver_name': self.receiver_name,
            'receiver_phone': self.receiver_phone,
            'total_price': self.total_price,
            'creation_date': self.creation_date.isoformat(),
            'items': [{
                'product_id': item.product_id,
                'product_title': item.product.product_title,
                'quantity': item.quantity,
                'unit_price': item.unit_price,
                'subtotal': item.subtotal
            } for item in items]
        }


class OrderProduct(db.Model):
    __tablename__ = 'order_product'

    order_id = db.Column(db.Integer, db.ForeignKey('order.order_id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    supplier_email_at_purchase = db.Column(db.String(120))
    customer_email = db.Column(db.String(120))

    order = db.relationship('Order', backref='order_products')
    product = db.relationship('Product', backref='order_products')

    def __repr__(self):
        return f'<OrderProduct order={self.order_id} product={self.product_id}>'