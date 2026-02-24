
  # FoodFlow - Food Inventory Dashboard

This is a Food Inventory Dashboard application built with React and Spring Boot. The original design is available at https://www.figma.com/design/oPTxNH4BbwucxIFPSajSYk/Food-Inventory-Dashboard-Design.

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

### Ingredient Recognition
- `POST /api/ingredients/recognition/text` - Recognize ingredients from text
- `POST /api/ingredients/recognition/image-description` - Recognize ingredients from image description
- `POST /api/ingredients/recognition/image` - Recognize ingredients from image
- `POST https://pbl.florentin.online/api/inventory/detect` - Recognize ingredients from receipt image (external API)

### Meal Plans
- `GET /api/meal-plans` - Get all meal plans
- `POST /api/meal-plans` - Add new meal plan

### Shopping List
- `GET /api/shopping-list` - Get shopping list
- `POST /api/shopping-list` - Add item to shopping list

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
└── DOCKER.md           # Docker instructions
```
  