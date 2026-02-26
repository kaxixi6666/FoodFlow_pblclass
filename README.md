
# FoodFlow - Recipe Management Application

FoodFlow is a feature-rich recipe management application designed to help users more effectively manage ingredients, recipes, and meal plans, achieving healthy and efficient dietary lifestyles.

## Product Overview

FoodFlow is not just a recipe management tool, but also an intelligent assistant that helps users achieve healthy and efficient dietary lifestyles. Through its intuitive interface and powerful features, users can easily manage ingredients, plan meals, discover new recipes, and ultimately enhance their overall dining experience.

## Core Features

### 1. Recipe Management
- **Personal Recipes**: Create, edit, view, and categorize personal recipes
- **Public Recipes**: Browse and like public recipes published by other users
- **Recipe Details**: View detailed recipe information, including ingredients, cooking steps, prep time, and cook time
- **Recipe Status**: Supports two statuses: draft (visible only to the creator) and public (visible to all users)

### 2. Inventory Management
- **Manual Addition**: Directly input ingredient names to add to inventory
- **AI Recognition**: Automatically identify ingredients from receipt or fridge images and add to inventory
- **Bulk Operations**: Support for bulk adding ingredients to inventory

### 3. Meal Plan Management
- **Weekly View**: View and manage meal plans by week
- **Meal Type Classification**: Supports three meal types: breakfast, lunch, and dinner
- **Recipe Addition**: Add recipes from personal or public recipes to meal plans
- **Week Switching**: Support for switching between different weeks' meal plans

### 4. Social Interaction
- **Recipe Liking**: Like recipes with support for unliking
- **Author Notifications**: Send notifications to recipe authors when their recipe is first liked
- **Notification Center**: View and manage unread notifications

### 5. User Authentication
- **Registration**: Create new user accounts
- **Login**: User authentication
- **User Information**: Manage personal profiles

## Technology Stack

### Frontend
- React 18.3.1
- Vite 6.3.5
- Tailwind CSS 4.1.12
- React Router 7.13.0
- Material UI 7.3.5
- Sonner (Toast notifications)

### Backend
- Spring Boot 3.2.0
- Java 17
- PostgreSQL
- Spring Security
- Spring Data JPA
- JWT Authentication
- OpenAI GPT-4 (for ingredient recognition)

## Running the Application

### Option 1: Docker (Recommended)

#### Quick Start with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/kaxixi6666/FoodFlow_pblclass.git
   cd FoodFlow_pblclass
   ```

2. Configure environment variables:
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env and add your OpenAI API key
   ```

3. Start all services:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8080/api
   - **PostgreSQL**: localhost:5432

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

### Option 2: Local Development

#### Frontend
1. Navigate to frontend directory:
   ```bash
   cd FoodFlow_pblclass/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Access frontend at:
   ```
   http://localhost:5173
   ```

#### Backend
1. Navigate to backend directory:
   ```bash
   cd FoodFlow_pblclass/backend
   ```

2. Ensure PostgreSQL is running and create a database named `foodflow`

3. Start backend server:
   ```bash
   mvn spring-boot:run
   ```

4. Access backend API at:
   ```
   http://localhost:8080/api
   ```

## Database Configuration

The application uses PostgreSQL database with the following configuration:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/foodflow
spring.datasource.username=kaxixi
spring.datasource.password=
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token

### Inventory
- `GET /api/inventory` - Get all inventory items (user-specific)
- `POST /api/inventory` - Add new inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item
- `POST /api/inventory/detect` - Detect and translate text from image (uses GLM-4V)

**Request Parameters:**
- `image` (MultipartFile): Image file to process (JPG/PNG/WebP, ≤ 10MB)

**Response:**
- `result` (string): Translated English text from the image
- `userId` (number): User ID from request header

**Description:**
This endpoint uses the GLM-4V multimodal model to detect text in images (like receipts) and translate it to English. It returns only the translated text without any additional explanations.

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Add new ingredient

### Recipes
- `GET /api/recipes` - Get all recipes (user-specific)
- `GET /api/recipes/public` - Get all public recipes
- `POST /api/recipes` - Add new recipe
- `PUT /api/recipes/{id}` - Update recipe
- `DELETE /api/recipes/{id}` - Delete recipe
- `POST /api/recipes/{id}/like` - Like or unlike a recipe

### Ingredient Recognition
- `POST /api/ingredients/recognition/text` - Recognize ingredients from text
- `POST /api/ingredients/recognition/image-description` - Recognize ingredients from image description
- `POST /api/ingredients/recognition/image` - Recognize ingredients from image
- `POST https://pbl.florentin.online/api/inventory/detect` - Recognize ingredients from receipt image (external API)

### Meal Plans
- `GET /api/meal-plans` - Get all meal plans (supports userId, startDate, endDate parameters)
- `POST /api/meal-plans` - Add new meal plan
- `PUT /api/meal-plans/{id}` - Update meal plan
- `DELETE /api/meal-plans/{id}` - Delete meal plan

### Shopping List
- `GET /api/shopping-list` - Get shopping list
- `POST /api/shopping-list` - Add item to shopping list
- `PUT /api/shopping-list/{id}` - Update shopping list item
- `DELETE /api/shopping-list/{id}` - Delete shopping list item
- `DELETE /api/shopping-list` - Clear shopping list

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/{id}/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read

## Project Structure

```
FoodFlow_pblclass/
├── backend/            # Spring Boot backend
│   ├── src/            # Backend source code
│   │   ├── main/java/com/foodflow/
│   │   │   ├── config/       # Configuration classes
│   │   │   ├── controller/   # REST controllers
│   │   │   ├── model/        # JPA entities
│   │   │   ├── service/       # Business logic
│   │   │   └── FoodFlowApplication.java  # Main application class
│   │   └── resources/         # Application properties
│   └── pom.xml         # Maven configuration
├── frontend/           # React frontend
│   ├── src/            # Frontend source code
│   │   ├── app/        # Frontend application code
│   │   │   ├── components/    # React components
│   │   │   ├── config/        # API configuration
│   │   │   ├── pages/         # React pages
│   │   │   ├── App.tsx        # Main App component
│   │   │   └── routes.tsx      # React Router configuration
│   │   ├── styles/     # CSS styles
│   │   └── main.tsx    # Frontend entry point
│   ├── package.json    # Frontend dependencies
│   ├── vite.config.ts  # Vite configuration
│   └── Dockerfile      # Frontend Dockerfile
├── docker-compose.yml  # Docker Compose configuration
├── README.md           # Project documentation
├── DOCKER.md           # Docker instructions
└── PRODUCT_SUMMARY.md  # Product summary documentation
```
  