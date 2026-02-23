# FoodFlow API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base Information](#base-information)
3. [User APIs](#user-apis)
4. [Inventory APIs](#inventory-apis)
5. [Recipe APIs](#recipe-apis)
6. [Meal Plan APIs](#meal-plan-apis)
7. [Receipt Detection API](#receipt-detection-api)
8. [Error Handling](#error-handling)
9. [Data Isolation](#data-isolation)

---

## Overview

FoodFlow API is a RESTful backend service providing user management, inventory management, recipe management, meal plan management, and more. All APIs support data isolation to ensure each user can only access their own data.

### Technology Stack

- **Backend Framework**: Spring Boot
- **Database**: PostgreSQL
- **API Protocol**: HTTP/HTTPS
- **Data Format**: JSON
- **Authentication Method**: Header-based (X-User-Id)

---

## Base Information

### API Base URLs

#### Production Environment
```
https://foodflow-pblclass.onrender.com/api
```

#### Local Development Environment
```
http://localhost:8080/api
```

#### Receipt Detection API
```
https://163.221.152.191:8080/api/inventory/detect
```

#### New Receipt Detection API (for Analyze Files button)
```
https://pbl.florentin.online/api/inventory/detect
```

### Common Request Headers

| Header Name | Type | Required | Description |
|-------------|------|-----------|
| Content-Type | String | Yes | application/json or multipart/form-data |
| X-User-Id | Long | Yes | Current logged-in user ID |

### Common Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": 400
}
```

---

## User APIs

### 1. User Registration

**Endpoint**: `POST /users/register`

**Request Body**:
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

**Request Headers**:
- Content-Type: application/json

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-23T12:00:00"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Username already exists"
}
```

**Error Scenarios**:
- Username is required: Username is empty
- Password is required: Password is empty
- Username already exists: Username already taken
- Registration failed: Registration failed

---

### 2. User Login

**Endpoint**: `POST /users/login`

**Request Body**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Request Headers**:
- Content-Type: application/json

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-23T12:00:00"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "User not found"
}
```

Or
```json
{
  "success": false,
  "message": "Invalid password"
}
```

**Error Scenarios**:
- User not found: User does not exist
- Invalid password: Password is incorrect

---

### 3. Get All Users

**Endpoint**: `GET /users`

**Request Headers**:
- No special requirements

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-02-23T12:00:00"
  },
  {
    "id": 2,
    "username": "user2",
    "email": "user2@example.com",
    "createdAt": "2026-02-23T12:00:00"
  }
]
```

---

### 4. Get User Details

**Endpoint**: `GET /users/{id}`

**Path Parameters**:
- id: User ID

**Success Response** (200 OK):
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "2026-02-23T12:00:00"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Inventory APIs

### 1. Add Ingredient to Inventory

**Endpoint**: `POST /inventory`

**Request Body**:
```json
{
  "name": "Tomatoes",
  "category": "Vegetables",
  "description": "Fresh tomatoes"
}
```

**Request Headers**:
- Content-Type: application/json
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
{
  "id": 123,
  "ingredient": {
    "id": 456,
    "name": "Tomatoes",
    "category": "Vegetables",
    "description": "Fresh tomatoes"
  },
  "userId": 1,
  "lastUpdated": "2026-02-23T14:30:00",
  "createdAt": "2026-02-23T14:30:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

Or
```json
{
  "error": "Ingredient name is required",
  "code": 400
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to add to inventory: ...",
  "code": 500
}
```

**Error Scenarios**:
- X-User-Id header is required: User ID not provided
- Ingredient name is required: Ingredient name is empty
- Failed to add to inventory: Add failed (database error, etc.)

---

### 2. Get Inventory List

**Endpoint**: `GET /inventory`

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
[
  {
    "id": 123,
    "name": "Tomatoes",
    "category": "Vegetables",
    "lastUpdated": "2026-02-23 14:30:00"
  },
  {
    "id": 124,
    "name": "Chicken Breast",
    "category": "Meat",
    "lastUpdated": "2026-02-23 15:00:00"
  }
]
```

**Error Response** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to get inventory: ...",
  "code": 500
}
```

**Notes**:
- Returns only current user's inventory data
- Sorted by ID in ascending order
- lastUpdated format is Tokyo time: yyyy-MM-dd HH:mm:ss

---

### 3. Update Inventory Item

**Endpoint**: `PUT /inventory/{id}`

**Path Parameters**:
- id: Inventory item ID

**Request Body**:
```json
{
  // Currently empty, reserved for future extension
}
```

**Request Headers**:
- Content-Type: application/json
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
{
  "id": 123,
  "ingredient": {
    "id": 456,
    "name": "Tomatoes",
    "category": "Vegetables"
  },
  "userId": 1,
  "lastUpdated": "2026-02-23T16:00:00",
  "createdAt": "2026-02-23T14:30:00"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Inventory not found",
  "code": 404
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to update inventory: ...",
  "code": 500
}
```

**Notes**:
- Can only update current user's inventory items
- Automatically updates lastUpdated timestamp

---

### 4. Delete Inventory Item

**Endpoint**: `DELETE /inventory/{id}`

**Path Parameters**:
- id: Inventory item ID

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (204 No Content):
- No response body

**Error Response** (400 Bad Request):
```json
{
  "error": "X-User-Id header is required",
  "code": 400
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Failed to delete inventory: ...",
  "code": 500
}
```

**Notes**:
- Can only delete current user's inventory items
- Returns 204 even if inventory item doesn't exist (idempotent operation)

---

## Recipe APIs

### 1. Get All Recipes

**Endpoint**: `GET /recipes`

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Tomato Soup",
    "status": "draft",
    "prepTime": 15,
    "cookTime": 30,
    "servings": 4,
    "instructions": "Step 1: ...",
    "userId": 1,
    "isPublic": false,
    "createdAt": "2026-02-23T12:00:00",
    "updatedAt": "2026-02-23T12:00:00",
    "ingredients": [
      {
        "id": 1,
        "name": "Tomatoes",
        "category": "Vegetables"
      }
    ]
  }
]
```

**Error Response** (400 Bad Request):
- No response body

**Notes**:
- Returns only current user's recipes
- Sorted by ID in ascending order

---

### 2. Get Public Recipes

**Endpoint**: `GET /recipes/public`

**Request Headers**:
- No special requirements

**Success Response** (200 OK):
```json
[
  {
    "id": 2,
    "name": "Chicken Curry",
    "status": "published",
    "prepTime": 20,
    "cookTime": 45,
    "servings": 6,
    "instructions": "Step 1: ...",
    "userId": 2,
    "isPublic": true,
    "createdAt": "2026-02-23T12:00:00",
    "updatedAt": "2026-02-23T12:00:00",
    "ingredients": [
      {
        "id": 2,
        "name": "Chicken",
        "category": "Meat"
      }
    ]
  }
]
```

**Notes**:
- Returns all users' public recipes
- Sorted by ID in ascending order

---

### 3. Get Recipes by Status

**Endpoint**: `GET /recipes/status/{status}`

**Path Parameters**:
- status: Recipe status (draft, published, etc.)

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Tomato Soup",
    "status": "draft",
    "userId": 1,
    "isPublic": false
  }
]
```

**Error Response** (400 Bad Request):
- No response body

**Notes**:
- Returns only current user's recipes
- Filtered by status

---

### 4. Create Recipe

**Endpoint**: `POST /recipes`

**Request Body**:
```json
{
  "name": "Tomato Soup",
  "status": "draft",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "instructions": "Step 1: ...",
  "isPublic": false,
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "category": "Vegetables"
    }
  ]
}
```

**Request Headers**:
- Content-Type: application/json
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Tomato Soup",
  "status": "draft",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "instructions": "Step 1: ...",
  "userId": 1,
  "isPublic": false,
  "createdAt": "2026-02-23T12:00:00",
  "updatedAt": "2026-02-23T12:00:00",
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "category": "Vegetables"
    }
  ]
}
```

**Error Response** (400 Bad Request):
- No response body

**Notes**:
- Automatically sets userId to current user
- If isPublic is null, defaults to false
- Automatically processes ingredients (creates or links existing ingredients)

---

### 5. Update Recipe

**Endpoint**: `PUT /recipes/{id}`

**Path Parameters**:
- id: Recipe ID

**Request Body**:
```json
{
  "name": "Tomato Soup Updated",
  "status": "published",
  "prepTime": 20,
  "cookTime": 35,
  "servings": 5,
  "instructions": "Step 1: ...",
  "isPublic": true,
  "ingredients": [
    {
      "id": 1,
      "name": "Tomatoes",
      "category": "Vegetables"
    }
  ]
}
```

**Request Headers**:
- Content-Type: application/json
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Tomato Soup Updated",
  "status": "published",
  "prepTime": 20,
  "cookTime": 35,
  "servings": 5,
  "instructions": "Step 1: ...",
  "userId": 1,
  "isPublic": true,
  "createdAt": "2026-02-23T12:00:00",
  "updatedAt": "2026-02-23T13:00:00",
  "ingredients": [...]
}
```

**Error Response** (404 Not Found):
- No response body

**Notes**:
- Can only update current user's recipes
- Automatically updates updatedAt timestamp

---

### 6. Delete Recipe

**Endpoint**: `DELETE /recipes/{id}`

**Path Parameters**:
- id: Recipe ID

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (204 No Content):
- No response body

**Error Response** (400 Bad Request):
- No response body

**Notes**:
- Can only delete current user's recipes

---

### 7. Generate Random Recipes

**Endpoint**: `POST /recipes/generate`

**Query Parameters**:
- count: Number of recipes to generate (default 10)

**Success Response** (200 OK):
```json
"Generated 10 random recipes"
```

**Notes**:
- Used for testing and development
- Generates random recipe data

---

## Meal Plan APIs

### 1. Get All Meal Plans

**Endpoint**: `GET /meal-plans`

**Request Headers**:
- No special requirements

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-02-23",
    "recipe": {
      "id": 1,
      "name": "Tomato Soup"
    }
  }
]
```

---

### 2. Get Meal Plans by Week

**Endpoint**: `GET /meal-plans/week`

**Query Parameters**:
- startDate: Start date (yyyy-MM-dd)
- endDate: End date (yyyy-MM-dd)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-02-23",
    "recipe": {
      "id": 1,
      "name": "Tomato Soup"
    }
  }
]
```

---

### 3. Get Meal Plans by Date

**Endpoint**: `GET /meal-plans/date/{date}`

**Path Parameters**:
- date: Date (yyyy-MM-dd)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "date": "2026-02-23",
    "recipe": {
      "id": 1,
      "name": "Tomato Soup"
    }
  }
]
```

---

### 4. Create Meal Plan

**Endpoint**: `POST /meal-plans`

**Request Body**:
```json
{
  "date": "2026-02-23",
  "recipeId": 1
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "date": "2026-02-23",
  "recipe": {
    "id": 1,
    "name": "Tomato Soup"
  }
}
```

---

### 5. Update Meal Plan

**Endpoint**: `PUT /meal-plans/{id}`

**Path Parameters**:
- id: Meal plan ID

**Request Body**:
```json
{
  "date": "2026-02-24",
  "recipeId": 2
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "date": "2026-02-24",
  "recipe": {
    "id": 2,
    "name": "Chicken Curry"
  }
}
```

---

### 6. Delete Meal Plan

**Endpoint**: `DELETE /meal-plans/{id}`

**Path Parameters**:
- id: Meal plan ID

**Success Response** (204 No Content):
- No response body

---

## Receipt Detection API

### 1. Upload Receipt Image to Detect Ingredients (Legacy)

**Endpoint**: `POST /api/inventory/detect`

**Full URL**: `https://163.221.152.191:8080/api/inventory/detect`

**Request Format**: multipart/form-data

**Request Parameters**:
- image: Receipt image file (Required, type: File)

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
{
  "detectedItems": [
    {
      "id": 1,
      "name": "Tomatoes"
    },
    {
      "id": 2,
      "name": "Chicken Breast"
    },
    {
      "id": 3,
      "name": "Olive Oil"
    }
  ]
}
```

**Error Response** (400 Bad Request):
```json
{
  "detectedItems": [],
  "message": "Image file is empty"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Receipt detection failed: ...",
  "code": 500
}
```

**Supported File Formats**:
- image/jpeg (JPG)
- image/png (PNG)

**File Size Limit**:
- Maximum 10MB

**Notes**:
- Uses AI/OCR technology to recognize ingredients from receipts
- Returns list of detected ingredients
- Frontend can batch add to inventory

---

### 2. Upload Receipt Image to Detect Ingredients (New - for Analyze Files button)

**Endpoint**: `POST /api/inventory/detect`

**Full URL**: `https://pbl.florentin.online/api/inventory/detect`

**API Documentation**: `https://pbl.florentin.online/swagger-ui/index.html#/detect-food-controller`

**Request Format**: multipart/form-data

**Request Parameters**:
- image: Receipt image file (Required, type: Binary file)

**Request Headers**:
- X-User-Id: 1 (Required)

**Success Response** (200 OK):
```json
{
  "detectedItems": [
    {
      "id": 1,
      "name": "Tomatoes"
    },
    {
      "id": 2,
      "name": "Chicken Breast"
    },
    {
      "id": 3,
      "name": "Olive Oil"
    }
  ]
}
```

**Error Response** (400 Bad Request):
```json
{
  "detectedItems": [],
  "message": "Image file is empty"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Receipt detection failed: ...",
  "code": 500
}
```

**Supported File Formats**:
- image/jpeg (JPG)
- image/png (PNG)

**File Size Limit**:
- Maximum 10MB

**Notes**:
- This API is exclusively used by the "Analyze Files" button on the Home page
- Uses AI/OCR technology to recognize ingredients from receipts
- Returns list of detected ingredients with id (number) and name (string)
- Frontend can batch add to inventory using the original inventory API
- All other API calls (add to inventory, get inventory, etc.) use the original endpoints

---

## Error Handling

### HTTP Status Codes

| Status Code | Description | Example Scenario |
|-------------|---------------|------------------|
| 200 | Success | Operation completed successfully |
| 204 | Success (No Content) | Delete operation successful |
| 400 | Bad Request | Missing or invalid parameters |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Internal processing error |

### Error Response Formats

#### Standard Error Response
```json
{
  "error": "Error description",
  "code": 400
}
```

#### User-related Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Scenarios

| Error Message | Status Code | Solution |
|--------------|-------------|-----------|
| X-User-Id header is required | 400 | Ensure user is logged in and X-User-Id header is passed |
| Username is required | 400 | Provide username |
| Password is required | 400 | Provide password |
| Username already exists | 400 | Use a different username |
| User not found | 400 | Check if username is correct |
| Invalid password | 400 | Check if password is correct |
| Ingredient name is required | 400 | Provide ingredient name |
| Inventory not found | 404 | Check if inventory item ID is correct |
| Failed to add to inventory | 500 | Check database connection |
| Failed to get inventory | 500 | Check database connection |
| Receipt detection failed | 500 | Check receipt image format and size |

---

## Data Isolation

### User ID Transmission

All APIs requiring user authentication pass the user ID via `X-User-Id` header:

```javascript
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
const userId = user?.id;

const headers = {
  'Content-Type': 'application/json',
  'X-User-Id': userId.toString()
};
```

### Data Isolation Rules

| Endpoint | Isolation Rule |
|----------|----------------|
| GET /inventory | Returns only current user's inventory |
| POST /inventory | Adds only to current user's inventory |
| PUT /inventory/{id} | Can only update current user's inventory |
| DELETE /inventory/{id} | Can only delete current user's inventory |
| GET /recipes | Returns only current user's recipes |
| POST /recipes | Creates only for current user |
| PUT /recipes/{id} | Can only update current user's recipes |
| DELETE /recipes/{id} | Can only delete current user's recipes |

### Data Isolation Implementation

Backend implements data isolation through the `userId` field:

```java
// Inventory query
List<Inventory> inventories = entityManager.createQuery(
    "SELECT i FROM Inventory i WHERE i.userId = :userId ORDER BY i.id", 
    Inventory.class
).setParameter("userId", userId)
.getResultList();

// Recipe query
List<Recipe> recipes = entityManager.createQuery(
    "SELECT r FROM Recipe r WHERE r.userId = :userId ORDER BY r.id", 
    Recipe.class
).setParameter("userId", userId)
.getResultList();
```

---

## Frontend API Call Examples

### Using fetchAPI

```typescript
import { API_ENDPOINTS, fetchAPI } from "../config/api";

// Get inventory
const inventory = await fetchAPI(API_ENDPOINTS.INVENTORY);

// Add to inventory
const result = await fetchAPI(API_ENDPOINTS.INVENTORY, {
  method: 'POST',
  body: JSON.stringify({
    name: "Tomatoes",
    category: "Vegetables"
  })
});
```

### Using uploadReceiptImage

```typescript
import { uploadReceiptImage } from "../config/api";

// Upload receipt image
const file = fileInput.files[0];
const result = await uploadReceiptImage(file);

console.log('Detected ingredients:', result.detectedItems);
```

---

## Testing Tools

### Curl Testing

#### Test User Login
```bash
curl -X POST https://foodflow-pblclass.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

#### Test Get Inventory
```bash
curl -X GET https://foodflow-pblclass.onrender.com/api/inventory \
  -H "X-User-Id: 1"
```

#### Test Add to Inventory
```bash
curl -X POST https://foodflow-pblclass.onrender.com/api/inventory \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{"name":"Tomatoes","category":"Vegetables"}'
```

#### Test Receipt Detection
```bash
curl -X POST http://163.221.152.191:8080/api/inventory/detect \
  -H "X-User-Id: 1" \
  -F "image=@receipt.jpg"
```

### Postman Testing

#### Import Environment Variables

```
API_BASE_URL = https://foodflow-pblclass.onrender.com/api
DETECT_API_BASE_URL = http://163.221.152.191:8080
USER_ID = 1
```

#### Test User Login

```
Method: POST
URL: {{API_BASE_URL}}/users/login
Headers:
  Content-Type: application/json
Body (raw):
{
  "username": "testuser",
  "password": "password123"
}
```

#### Test Get Inventory

```
Method: GET
URL: {{API_BASE_URL}}/inventory
Headers:
  X-User-Id: {{USER_ID}}
```

#### Test Receipt Detection

```
Method: POST
URL: {{DETECT_API_BASE_URL}}/api/inventory/detect
Headers:
  X-User-Id: {{USER_ID}}
Body (form-data):
  image: [Select receipt image file]
```

---

## Version History

### v1.0.0 (2026-02-23)
- Initial version
- User management APIs
- Inventory management APIs
- Recipe management APIs
- Meal plan management APIs
- Receipt detection APIs

### v1.1.0 (2026-02-23)
- Added data isolation functionality
- Added X-User-Id header authentication
- Optimized error response format

### v1.2.0 (2026-02-23)
- Fixed Mixed Content error
- Added HTTPS fallback mechanism
- Optimized receipt detection functionality

---

## Contact

For questions or suggestions, please contact:

- **Project URL**: https://github.com/kaxixi6666/FoodFlow_pblclass
- **Documentation Updated**: 2026-02-23

---

**Documentation Version**: v1.2.0  
**Last Updated**: 2026-02-23
