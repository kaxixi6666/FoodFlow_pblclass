
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

### Option 1: Docker (Recommended)

#### Quick Start with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/kaxixi6666/FoodFlow_pblclass.git
   cd FoodFlow_pblclass
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
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
1. Navigate to project root directory:
   ```bash
   cd FoodFlow
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
   http://localhost:5173/FoodFlow/
   ```

#### Backend
1. Navigate to backend directory:
   ```bash
   cd FoodFlow/backend
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
  