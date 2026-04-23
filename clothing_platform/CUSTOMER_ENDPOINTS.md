# Customer Endpoints Documentation

## Base URL
All customer endpoints use the prefix: `/api/customer`

---

## 1. Get All Approved Products
**Endpoint:** `GET /api/customer/products`  
**Authentication:** Required (Customer role)  
**Description:** Get all approved products available for purchase

### Response (200 OK)
```json
{
  "message": "Products retrieved successfully",
  "count": 5,
  "products": [
    {
      "product_id": 1,
      "supplier_id": 2,
      "product_title": "T-Shirt Red",
      "photo": "https://example.com/tshirt.jpg",
      "description": "Cotton T-Shirt",
      "unit_price": 15.99,
      "stock_qty": 100,
      "stock_status": "IN_STOCK",
      "product_status": "APPROVED"
    }
  ]
}
```

---

## 2. Add Product to Cart
**Endpoint:** `POST /api/customer/cart`  
**Authentication:** Required (Customer role)  
**Description:** Add product to customer's cart

### Request Body
```json
{
  "product_id": 1,
  "quantity": 2
}
```

### Response (201 Created)
```json
{
  "message": "Product added to cart successfully",
  "product_id": 1,
  "quantity": 2,
  "cart_total": 31.98
}
```

### Error Cases
- **400:** Insufficient stock or invalid quantity
- **404:** Product not found or not approved

---

## 3. View Cart
**Endpoint:** `GET /api/customer/cart`  
**Authentication:** Required (Customer role)  
**Description:** Get customer's cart with all items

### Response (200 OK)
```json
{
  "message": "Cart retrieved successfully",
  "cart": {
    "cart_id": 1,
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "product_title": "T-Shirt Red",
        "unit_price": 15.99,
        "quantity": 2,
        "subtotal": 31.98
      }
    ],
    "total": 31.98
  }
}
```

---

## 4. Update Cart Item Quantity
**Endpoint:** `PUT /api/customer/cart/{product_id}`  
**Authentication:** Required (Customer role)  
**Description:** Update the quantity of a product in cart

### Request Body
```json
{
  "quantity": 5
}
```

### Response (200 OK)
```json
{
  "message": "Cart quantity updated successfully",
  "product_id": 1,
  "new_quantity": 5,
  "cart_total": 79.95
}
```

---

## 5. Remove Product from Cart
**Endpoint:** `DELETE /api/customer/cart/{product_id}`  
**Authentication:** Required (Customer role)  
**Description:** Remove a specific product from cart

### Response (200 OK)
```json
{
  "message": "Product removed from cart successfully",
  "product_id": 1,
  "cart_total": 0
}
```

---

## 6. Clear Entire Cart
**Endpoint:** `DELETE /api/customer/cart`  
**Authentication:** Required (Customer role)  
**Description:** Remove all items from cart

### Response (200 OK)
```json
{
  "message": "Cart cleared successfully"
}
```

---

## 7. Checkout (Place Order)
**Endpoint:** `POST /api/customer/checkout`  
**Authentication:** Required (Customer role)  
**Description:** Place order from cart with delivery information

### Request Body
```json
{
  "delivery_address": "123 Main Street, Apt 4B",
  "delivery_city": "Cairo",
  "receiver_name": "John Doe",
  "receiver_phone": "+20123456789",
  "email": "john@example.com"
}
```

### Response (201 Created)
```json
{
  "message": "Order placed successfully",
  "order_id": 5,
  "customer_id": 1,
  "delivery_address": "123 Main Street, Apt 4B",
  "delivery_city": "Cairo",
  "receiver_name": "John Doe",
  "receiver_phone": "+20123456789",
  "email": "john@example.com",
  "total_price": 79.95,
  "items_count": 2,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 15.99,
      "subtotal": 31.98
    }
  ],
  "creation_date": "2026-04-23T10:30:00",
  "supplier_emails": ["supplier@example.com"]
}
```

### Error Cases
- **400:** Missing required fields or empty cart
- **404:** Customer not found

---

## 8. Get Order History
**Endpoint:** `GET /api/customer/orders`  
**Authentication:** Required (Customer role)  
**Description:** Get all orders placed by customer

### Response (200 OK)
```json
{
  "message": "Orders retrieved successfully",
  "count": 2,
  "orders": [
    {
      "order_id": 5,
      "customer_id": 1,
      "delivery_city": "Cairo",
      "delivery_address": "123 Main Street, Apt 4B",
      "receiver_name": "John Doe",
      "receiver_phone": "+20123456789",
      "total_price": 79.95,
      "creation_date": "2026-04-23T10:30:00",
      "items": [
        {
          "product_id": 1,
          "product_title": "T-Shirt Red",
          "quantity": 2,
          "unit_price": 15.99,
          "subtotal": 31.98
        }
      ]
    }
  ]
}
```

---

## 9. Get Order Details
**Endpoint:** `GET /api/customer/orders/{order_id}`  
**Authentication:** Required (Customer role)  
**Description:** Get details of a specific order

### Response (200 OK)
```json
{
  "message": "Order retrieved successfully",
  "order": {
    "order_id": 5,
    "customer_id": 1,
    "delivery_city": "Cairo",
    "delivery_address": "123 Main Street, Apt 4B",
    "receiver_name": "John Doe",
    "receiver_phone": "+20123456789",
    "total_price": 79.95,
    "creation_date": "2026-04-23T10:30:00",
    "items": [...]
  }
}
```

### Error Cases
- **404:** Order not found or doesn't belong to customer

---

## Customer Workflow Example

### Step 1: View Available Products
```bash
curl -X GET http://localhost:5000/api/customer/products \
  -H "Authorization: Bearer {token}"
```

### Step 2: Add Products to Cart
```bash
curl -X POST http://localhost:5000/api/customer/cart \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Step 3: View Cart
```bash
curl -X GET http://localhost:5000/api/customer/cart \
  -H "Authorization: Bearer {token}"
```

### Step 4: Update Cart Quantity
```bash
curl -X PUT http://localhost:5000/api/customer/cart/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

### Step 5: Checkout
```bash
curl -X POST http://localhost:5000/api/customer/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_address": "123 Main Street",
    "delivery_city": "Cairo",
    "receiver_name": "John Doe",
    "receiver_phone": "+20123456789",
    "email": "john@example.com"
  }'
```

### Step 6: View Order History
```bash
curl -X GET http://localhost:5000/api/customer/orders \
  -H "Authorization: Bearer {token}"
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common Status Codes
- **200:** Success
- **201:** Created (for POST/checkout)
- **400:** Bad Request (validation error)
- **401:** Unauthorized (not logged in)
- **403:** Forbidden (wrong role)
- **404:** Not Found
- **500:** Server Error
