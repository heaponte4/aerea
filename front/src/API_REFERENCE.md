# API Reference

Quick reference for all API endpoints used in the Real Estate Media app.

## Base URL
```
http://localhost:8000/api
```

---

## Authentication

### POST /auth/login/
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "broker",
    "company": "Luxury Realty",
    "phone": "(305) 555-0100",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### POST /auth/signup/
Create a new user account.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "broker",  // or "photographer"
  "company": "Premium Properties",
  "phone": "(305) 555-0200"
}
```

**Response:** Same as login

### POST /auth/logout/
Logout and blacklist refresh token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** 205 No Content

### GET /auth/me/
Get current authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "broker"
}
```

### POST /auth/refresh/
Refresh access token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Properties

### GET /properties/
List all properties.

**Response:**
```json
[
  {
    "id": "p1",
    "address": "123 Ocean Drive",
    "city": "Miami Beach",
    "state": "FL",
    "zipCode": "33139",
    "propertyType": "house",
    "squareFeet": 3200,
    "bedrooms": 4,
    "bathrooms": 3.0,
    "yearBuilt": 2020,
    "lotSize": 8500,
    "price": 2450000,
    "description": "Stunning oceanfront property...",
    "features": ["Ocean Views", "Private Beach Access"],
    "status": "completed",
    "landingPageTemplate": "modern",
    "createdAt": "2025-10-01T00:00:00Z"
  }
]
```

### GET /properties/{id}/
Get a specific property.

### POST /properties/
Create a new property.

**Request:**
```json
{
  "address": "456 Sunset Blvd",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90028",
  "propertyType": "condo",
  "squareFeet": 2500,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "status": "draft"
}
```

### PATCH /properties/{id}/
Update a property.

**Request:**
```json
{
  "status": "completed",
  "price": 1950000
}
```

### DELETE /properties/{id}/
Delete a property.

### GET /properties/{id}/services/
Get all services for a property.

### GET /properties/{id}/media/
Get all media for a property.

---

## Services

### GET /services/
List all available services.

**Response:**
```json
[
  {
    "id": "photo",
    "name": "Photography",
    "description": "Professional property photography",
    "price": 250,
    "icon": "Camera"
  }
]
```

### GET /services/addons/
List all addon services.

**Response:**
```json
[
  {
    "id": "addon-virtual-staging",
    "name": "Virtual Staging",
    "description": "Digitally furnish empty rooms",
    "price": 125,
    "applicableServices": ["photo"]
  }
]
```

---

## Property Services

### GET /property-services/
List all property services.

### POST /property-services/
Assign a service to a property.

**Request:**
```json
{
  "propertyId": "p1",
  "serviceId": "photo",
  "photographerId": "ph1",
  "scheduledDate": "2025-10-15",
  "scheduledTime": "10:00 AM",
  "status": "scheduled",
  "notes": "Please focus on the ocean views",
  "addonIds": ["addon-virtual-staging"]
}
```

### PATCH /property-services/{id}/
Update a property service.

---

## Orders

### GET /orders/
List all orders/invoices.

**Response:**
```json
[
  {
    "id": "o1",
    "propertyId": "p1",
    "customerId": "c1",
    "services": [...],
    "totalAmount": 1050,
    "travelFees": [
      {
        "photographerId": "ph1",
        "fee": 50
      }
    ],
    "status": "paid",
    "createdAt": "2025-10-01T00:00:00Z",
    "dueDate": "2025-10-15"
  }
]
```

### GET /orders/{id}/
Get a specific order.

### POST /orders/
Create a new order.

**Request:**
```json
{
  "propertyId": "p1",
  "customerId": "c1",
  "services": [...],
  "totalAmount": 1050,
  "travelFees": [{"photographerId": "ph1", "fee": 50}],
  "status": "pending",
  "dueDate": "2025-10-15"
}
```

### PATCH /orders/{id}/
Update an order.

---

## Customers

### GET /customers/
List all customers.

**Response:**
```json
[
  {
    "id": "c1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(305) 555-0100",
    "company": "Luxury Realty",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-09-01T00:00:00Z"
  }
]
```

### GET /customers/{id}/
Get a specific customer.

### POST /customers/
Create a new customer.

### PATCH /customers/{id}/
Update a customer.

### DELETE /customers/{id}/
Delete a customer.

---

## Photographers

### GET /photographers/
List all photographers.

**Response:**
```json
[
  {
    "id": "ph1",
    "name": "Sarah Mitchell",
    "email": "sarah@example.com",
    "phone": "(305) 555-0123",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Professional real estate photographer...",
    "specialties": ["Photography", "Video Tour", "Drone Photography"],
    "rating": 4.9,
    "completedJobs": 127,
    "availableDates": ["2025-10-20", "2025-10-21"],
    "travelFee": 50
  }
]
```

### GET /photographers/{id}/
Get a specific photographer.

### GET /photographers/jobs/
Get all jobs for the authenticated photographer.

### GET /photographers/payments/
Get all payments for the authenticated photographer.

---

## Jobs

### GET /jobs/
List all jobs.

**Response:**
```json
[
  {
    "id": "job_1",
    "propertyAddress": "123 Ocean Drive",
    "propertyCity": "Miami Beach",
    "propertyState": "FL",
    "serviceType": "Photography",
    "scheduledDate": "2025-10-15",
    "scheduledTime": "10:00 AM",
    "status": "upcoming",
    "clientName": "John Doe",
    "clientEmail": "john@example.com",
    "clientPhone": "(305) 555-0100",
    "servicePrice": 250,
    "addons": [
      {"name": "Virtual Staging", "price": 125}
    ],
    "notes": "Focus on ocean views"
  }
]
```

### GET /jobs/{id}/
Get a specific job.

### POST /jobs/
Create a new job.

### PATCH /jobs/{id}/
Update a job.

### POST /jobs/{id}/upload/
Upload files for a job.

**Request:** multipart/form-data
```
file: [File]
```

---

## Media

### GET /media/
List all media.

### POST /media/upload/
Upload a media file.

**Request:** multipart/form-data
```
file: [File]
propertyId: "p1"
serviceId: "photo"
type: "photo"  // "photo", "video", or "3d-scan"
```

**Response:**
```json
{
  "id": "media_1",
  "propertyId": "p1",
  "serviceId": "photo",
  "type": "photo",
  "url": "https://example.com/media/photo.jpg",
  "thumbnailUrl": "https://example.com/thumbnails/photo.jpg",
  "fileName": "photo.jpg",
  "fileSize": 2048576,
  "uploadedAt": "2025-10-15T10:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Request Headers

All authenticated requests must include:

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

For file uploads:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

---

## Date Formats

All dates should be in ISO 8601 format:
- Full datetime: `2025-10-15T10:30:00Z`
- Date only: `2025-10-15`

---

## Pagination (Optional)

If you implement pagination on the Django side, responses will include:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/properties/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Rate Limiting (Recommended)

Implement rate limiting on your Django backend:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
