
  # FoodFlow - Food Inventory Dashboard

This is a Food Inventory Dashboard application built with React and Spring Boot. The original design is available at https://www.figma.com/design/oPTxNH4BbwucxIFPSajSYk/Food-Inventory-Dashboard-Design.

## Technology Stack

### Frontend
- React 18.3.1
- Vite 6.3.5
- Tailwind CSS 4.1.12
- React Router 7.13.0
- Material UI 7.3.5

### Backend
- Spring Boot 3.2.0
- Java 17
- PostgreSQL
- Spring Security
- Spring Data JPA

## Running the Application

### Frontend
1. Navigate to the project root directory:
   ```bash
   cd FoodFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the frontend at:
   ```
   http://localhost:5173/FoodFlow/
   ```

### Backend
1. Navigate to the backend directory:
   ```bash
   cd FoodFlow/backend
   ```

2. Ensure PostgreSQL is running and create a database named `foodflow`

3. Start the backend server:
   ```bash
   mvn spring-boot:run
   ```

4. Access the backend API at:
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
```

## API Endpoints

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add new inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item

### Ingredient Recognition
- `POST /api/ingredients/recognition` - Recognize ingredients from image

## Project Structure

```
FoodFlow/
├── backend/            # Spring Boot backend
│   ├── src/            # Backend source code
│   └── pom.xml         # Maven configuration
├── src/                # React frontend
│   ├── app/            # Frontend application code
│   ├── styles/         # CSS styles
│   └── main.tsx        # Frontend entry point
├── package.json        # Frontend dependencies
├── vite.config.ts      # Vite configuration
└── README.md           # Project documentation
```
  