# Salon Management System - Backend

Spring Boot backend for the Salon Management System.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Database Setup

1. Install MySQL and create the database:
```sql
CREATE DATABASE salon_management;
CREATE USER 'Saloon@001'@'localhost' IDENTIFIED BY 'Saloon@001';
GRANT ALL PRIVILEGES ON salon_management.* TO 'Saloon@001'@'localhost';
FLUSH PRIVILEGES;
```

2. The application will automatically create the required tables on startup.

## Running the Application

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### Customers
- `GET /customers` - Get all customers (supports search, gender filter, sorting)
- `GET /customers/{id}` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer
- `GET /customers/phone/{phone}` - Get customer by phone

#### Employees
- `GET /employees` - Get all employees (supports available filter)
- `GET /employees/{id}` - Get employee by ID
- `POST /employees` - Create new employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee
- `PATCH /employees/{id}/availability` - Update availability status

#### Services
- `GET /services` - Get all services (supports category, search, sorting)
- `GET /services/{id}` - Get service by ID
- `POST /services` - Create new service
- `PUT /services/{id}` - Update service
- `DELETE /services/{id}` - Delete service

#### Appointments
- `GET /appointments` - Get all appointments (supports date, employee, status filters)
- `GET /appointments/{id}` - Get appointment by ID
- `POST /appointments` - Create new appointment
- `PUT /appointments/{id}` - Update appointment
- `DELETE /appointments/{id}` - Delete appointment
- `PATCH /appointments/{id}/status` - Update appointment status
- `GET /appointments/availability` - Check time slot availability

#### Tally Records
- `GET /tally` - Get all tally records (supports date, status, payment method filters)
- `GET /tally/{id}` - Get tally record by ID
- `POST /tally` - Create new tally record
- `PUT /tally/{id}` - Update tally record
- `DELETE /tally/{id}` - Delete tally record
- `PATCH /tally/{id}/payment-status` - Update payment status
- `GET /tally/revenue` - Get total revenue by date

## Configuration

The application can be configured via `application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/salon_management?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=Saloon@001
spring.datasource.password=Saloon@001

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server Configuration
server.port=8080
server.servlet.context-path=/api
```

## Development

### Project Structure
```
src/main/java/com/salon/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── model/          # Entity classes
├── repository/     # JPA repositories
├── service/        # Business logic
└── SalonManagementApplication.java
```

### Building
```bash
mvn clean package
```

### Running Tests
```bash
mvn test
```

## Deployment

1. Build the JAR file:
```bash
mvn clean package
```

2. Run the JAR:
```bash
java -jar target/salon-management-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

1. **Database Connection Issues:**
   - Ensure MySQL is running
   - Verify database credentials
   - Check if the database exists

2. **Port Conflicts:**
   - Change the port in `application.properties`
   - Kill any process using port 8080

3. **CORS Issues:**
   - Verify the frontend URL in `WebConfig.java`
   - Check browser console for CORS errors