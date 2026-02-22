# Use OpenJDK 17 as base image
FROM maven:3.8.6-openjdk-17-slim as build

# Set working directory
WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml ./

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/foodflow-backend-1.0.0.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run application
CMD ["java", "-jar", "app.jar"]
