# FoodFlow Backend Implementation Guide

## 1. Project Overview

FoodFlow is a food management system that helps users track inventory, manage recipes, plan meals, and generate shopping lists. This backend implementation uses Java Spring Boot with PostgreSQL and integrates with Large Language Models (LLMs) for ingredient recognition.

## 2. Technology Stack

- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Data JPA** - ORM for database access
- **Spring Security** - Authentication and authorization
- **PostgreSQL** - Relational database
- **OpenAI GPT-4** - LLM for ingredient recognition
- **Maven** - Build tool

## 3. Architecture Design

### 3.1 Directory Structure

```
backend/
├── src/main/java/com/foodflow/
│   ├── controller/        # HTTP request handlers
│   ├── model/             # Database entities
│   ├── repository/        # Data access layer
│   ├── service/           # Business logic
│   ├── config/            # Application configuration
│   ├── security/          # Security configuration
│   ├── utils/             # Utility classes
│   ├── dto/               # Data transfer objects
│   └── FoodFlowApplication.java  # Main application class
├── src/main/resources/
│   └── application.properties     # Application properties
├── pom.xml               # Maven configuration
└── IMPLEMENTATION_GUIDE.md  # This guide
```

### 3.2 Core Components

#### 3.2.1 Controllers

- **AuthController** - Handles user authentication
- **IngredientController** - Manages ingredients
- **InventoryController** - Manages inventory items
- **RecipeController** - Manages recipes
- **MealPlanController** - Manages meal plans
- **ShoppingListController** - Manages shopping lists
- **IngredientRecognitionController** - Handles ingredient recognition using LLM

#### 3.2.2 Services

- **AuthService** - Authentication logic
- **IngredientService** - Ingredient management
- **InventoryService** - Inventory operations
- **RecipeService** - Recipe management
- **MealPlanService** - Meal plan generation and management
- **ShoppingListService** - Shopping list generation and management
- **IngredientRecognitionService** - LLM-based ingredient recognition

#### 3.2.3 Repositories

- **UserRepository** - User data access
- **IngredientRepository** - Ingredient data access
- **InventoryRepository** - Inventory data access
- **RecipeRepository** - Recipe data access
- **MealPlanRepository** - Meal plan data access
- **ShoppingListRepository** - Shopping list data access

## 4. Database Design

### 4.1 Tables

#### Users Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | User ID |
| username    | VARCHAR(50) | UNIQUE NOT NULL | Username |
| email       | VARCHAR(100) | UNIQUE NOT NULL | Email |
| password    | VARCHAR(255) | NOT NULL | Hashed password |
| role        | VARCHAR(20) | NOT NULL | User role |
| created_at  | TIMESTAMP | NOT NULL | Creation time |
| updated_at  | TIMESTAMP | NOT NULL | Last update time |

#### Ingredients Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | Ingredient ID |
| name        | VARCHAR(100) | NOT NULL | Ingredient name |
| category    | VARCHAR(50) | NOT NULL | Ingredient category |
| description | TEXT      |             | Ingredient description |
| created_at  | TIMESTAMP | NOT NULL | Creation time |
| updated_at  | TIMESTAMP | NOT NULL | Last update time |

#### Inventory Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | Inventory ID |
| ingredient_id | BIGINT   | FOREIGN KEY | Ingredient ID |
| quantity    | DOUBLE    | NOT NULL | Quantity |
| unit        | VARCHAR(20) | NOT NULL | Unit of measurement |
| last_updated | TIMESTAMP | NOT NULL | Last update time |
| created_at  | TIMESTAMP | NOT NULL | Creation time |

#### Recipes Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | Recipe ID |
| name        | VARCHAR(100) | NOT NULL | Recipe name |
| description | TEXT      |             | Recipe description |
| instructions | TEXT     | NOT NULL | Cooking instructions |
| prep_time   | INTEGER   |             | Preparation time (minutes) |
| cook_time   | INTEGER   |             | Cooking time (minutes) |
| servings    | INTEGER   |             | Number of servings |
| status      | VARCHAR(20) | NOT NULL | Recipe status (draft, private, public) |
| user_id     | BIGINT    | FOREIGN KEY | Owner user ID |
| created_at  | TIMESTAMP | NOT NULL | Creation time |
| updated_at  | TIMESTAMP | NOT NULL | Last update time |

#### RecipeIngredients Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | ID |
| recipe_id   | BIGINT    | FOREIGN KEY | Recipe ID |
| ingredient_id | BIGINT   | FOREIGN KEY | Ingredient ID |
| quantity    | DOUBLE    | NOT NULL | Quantity |
| unit        | VARCHAR(20) | NOT NULL | Unit of measurement |

#### MealPlans Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | Meal plan ID |
| name        | VARCHAR(100) | NOT NULL | Meal plan name |
| start_date  | DATE      | NOT NULL | Start date |
| end_date    | DATE      | NOT NULL | End date |
| user_id     | BIGINT    | FOREIGN KEY | Owner user ID |
| created_at  | TIMESTAMP | NOT NULL | Creation time |
| updated_at  | TIMESTAMP | NOT NULL | Last update time |

#### MealPlanRecipes Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | ID |
| meal_plan_id | BIGINT   | FOREIGN KEY | Meal plan ID |
| recipe_id   | BIGINT    | FOREIGN KEY | Recipe ID |
| day         | DATE      | NOT NULL | Date |
| meal_type   | VARCHAR(20) | NOT NULL | Meal type (breakfast, lunch, dinner) |

#### ShoppingLists Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | Shopping list ID |
| name        | VARCHAR(100) | NOT NULL | Shopping list name |
| user_id     | BIGINT    | FOREIGN KEY | Owner user ID |
| created_at  | TIMESTAMP | NOT NULL | Creation time |
| updated_at  | TIMESTAMP | NOT NULL | Last update time |

#### ShoppingListItems Table
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id          | BIGINT    | PRIMARY KEY | ID |
| shopping_list_id | BIGINT | FOREIGN KEY | Shopping list ID |
| ingredient_id | BIGINT   | FOREIGN KEY | Ingredient ID |
| quantity    | DOUBLE    | NOT NULL | Quantity |
| unit        | VARCHAR(20) | NOT NULL | Unit of measurement |
| checked     | BOOLEAN   | NOT NULL | Checked status |

## 5. API Design

### 5.1 Authentication APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth/register | POST | Register a new user |
| /auth/login | POST | Login and get JWT token |
| /auth/me | GET | Get current user information |

### 5.2 Ingredient APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /ingredients | GET | Get all ingredients |
| /ingredients/{id} | GET | Get ingredient by ID |
| /ingredients | POST | Create a new ingredient |
| /ingredients/{id} | PUT | Update ingredient |
| /ingredients/{id} | DELETE | Delete ingredient |
| /ingredients/categories | GET | Get all ingredient categories |

### 5.3 Inventory APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /inventory | GET | Get all inventory items |
| /inventory/{id} | GET | Get inventory item by ID |
| /inventory | POST | Add inventory item |
| /inventory/{id} | PUT | Update inventory item |
| /inventory/{id} | DELETE | Delete inventory item |
| /inventory/bulk | POST | Bulk update inventory |
| /inventory/low-stock | GET | Get low stock items |

### 5.4 Recipe APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /recipes | GET | Get all recipes |
| /recipes/{id} | GET | Get recipe by ID |
| /recipes | POST | Create a new recipe |
| /recipes/{id} | PUT | Update recipe |
| /recipes/{id} | DELETE | Delete recipe |
| /recipes/my | GET | Get user's recipes |
| /recipes/public | GET | Get public recipes |

### 5.5 Smart Filter APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /recipes/filter | POST | Filter recipes by criteria |
| /recipes/missing-ingredients | POST | Get missing ingredients for recipes |
| /recipes/can-cook | GET | Get recipes that can be cooked with current inventory |

### 5.6 Meal Plan APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /meal-plans | GET | Get all meal plans |
| /meal-plans/{id} | GET | Get meal plan by ID |
| /meal-plans | POST | Create a new meal plan |
| /meal-plans/{id} | PUT | Update meal plan |
| /meal-plans/{id} | DELETE | Delete meal plan |
| /meal-plans/generate | POST | Auto-generate meal plan |
| /meal-plans/{id}/recipes | GET | Get recipes in meal plan |

### 5.7 Shopping List APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /shopping-lists | GET | Get all shopping lists |
| /shopping-lists/{id} | GET | Get shopping list by ID |
| /shopping-lists | POST | Create a new shopping list |
| /shopping-lists/{id} | PUT | Update shopping list |
| /shopping-lists/{id} | DELETE | Delete shopping list |
| /shopping-lists/generate | POST | Generate shopping list from meal plan |
| /shopping-lists/{id}/items | GET | Get items in shopping list |

### 5.8 Ingredient Recognition APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /ingredients/recognize/text | POST | Recognize ingredients from text |
| /ingredients/recognize/image | POST | Recognize ingredients from image |
| /ingredients/recognize/image-description | POST | Recognize ingredients from image description |

## 6. Core Service Implementation

### 6.1 Ingredient Recognition Service

The `IngredientRecognitionService` uses OpenAI's GPT-4 to recognize ingredients from text or image descriptions. It sends a structured prompt to the LLM and parses the response into a list of recognized ingredients.

### 6.2 Inventory Management Service

The `InventoryService` handles inventory operations including adding, updating, and deleting items. It also provides functionality for bulk updates and low stock alerts.

### 6.3 Recipe Service

The `RecipeService` manages recipe creation, update, and deletion. It also provides functionality for filtering recipes based on ingredients and generating recipe recommendations.

### 6.4 Meal Plan Service

The `MealPlanService` handles meal plan creation and management. It includes functionality for auto-generating meal plans based on user preferences and dietary restrictions.

### 6.5 Shopping List Service

The `ShoppingListService` manages shopping list creation and management. It can generate shopping lists from meal plans, considering current inventory levels.

## 7. Security Implementation

### 7.1 Authentication

- Uses JWT for authentication
- Passwords are hashed using BCrypt
- Supports role-based access control

### 7.2 Authorization

- Public endpoints are accessible without authentication
- Protected endpoints require valid JWT token
- Role-based permissions for administrative operations

### 7.3 Input Validation

- All user inputs are validated
- SQL injection prevention using JPA
- Cross-site scripting (XSS) prevention

### 7.4 Rate Limiting

- API rate limiting to prevent abuse
- Different limits for authenticated and unauthenticated users

## 8. LLM Integration

### 8.1 OpenAI Integration

- Uses OpenAI Java client library
- Configurable model and parameters
- Error handling for API failures

### 8.2 Prompt Engineering

- Structured prompts for consistent responses
- JSON formatting for easy parsing
- Contextual prompts for better results

### 8.3 Fallback Mechanisms

- Local ingredient database for common ingredients
- Manual override for recognized ingredients
- Cache for frequent queries

## 9. Deployment

### 9.1 Local Development

- Spring Boot DevTools for hot reloading
- PostgreSQL running in Docker
- Maven for building and running

### 9.2 Production Deployment

- Docker containerization
- Kubernetes orchestration
- Environment-specific configuration

### 9.3 CI/CD Pipeline

- GitHub Actions for CI/CD
- Automated testing
- Deployment to cloud provider

## 10. Monitoring and Logging

### 10.1 Logging

- Structured logging using SLF4J
- Different log levels for different environments
- Log rotation and retention

### 10.2 Monitoring

- Spring Boot Actuator for health checks
- Prometheus for metrics collection
- Grafana for dashboard visualization

### 10.3 Error Handling

- Global exception handler
- Error response standardization
- Alerting for critical errors

## 11. Performance Optimization

### 11.1 Database Optimization

- Indexing for frequently queried fields
- Query optimization
- Connection pooling

### 11.2 API Optimization

- Caching for frequent requests
- Pagination for large result sets
- Asynchronous processing for heavy operations

### 11.3 LLM Optimization

- Request batching
- Response caching
- Model selection based on task complexity

## 12. Integration with Frontend

### 12.1 API Documentation

- OpenAPI/Swagger documentation
- Postman collection for testing
- Example requests and responses

### 12.2 Frontend Integration

- Base URL configuration
- Authentication token management
- Error handling and user feedback

### 12.3 Data Synchronization

- WebSocket for real-time updates
- Polling for less critical updates
- Offline support with local storage

## 13. Future Enhancements

### 13.1 Features

- Nutrition analysis
- Recipe sharing and collaboration
- Integration with grocery delivery services
- Voice recognition for hands-free operation

### 13.2 Technology

- Microservices architecture
- Machine learning for personalized recommendations
- Blockchain for supply chain transparency
- Edge computing for faster processing

## 14. Conclusion

This implementation guide provides a comprehensive overview of the FoodFlow backend system. By following this guide, you can build a robust, secure, and scalable backend that meets the needs of the FoodFlow application. The integration with LLMs for ingredient recognition adds a powerful feature that enhances the user experience.

## 15. Getting Started

### 15.1 Prerequisites

- Java 17 or later
- Maven 3.8 or later
- PostgreSQL 13 or later
- OpenAI API key

### 15.2 Setup

1. Clone the repository
2. Configure database connection in `application.properties`
3. Set up OpenAI API key in `application.properties`
4. Build the project with `mvn clean install`
5. Run the application with `mvn spring-boot:run`

### 15.3 Testing

- Run unit tests with `mvn test`
- Use Postman or curl to test APIs
- Access Swagger UI at `http://localhost:8080/api/swagger-ui.html`

---

*This implementation guide is designed to help you build a complete backend for the FoodFlow application. For more detailed information on specific components, refer to the code documentation.*
