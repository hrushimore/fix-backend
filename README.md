# Welcome to your Lovable project

## Spring Boot Backend Integration

This project now includes a Spring Boot backend for data persistence and API services.

### Backend Setup

1. **Prerequisites:**
   - Java 17 or higher
   - Maven 3.6+
   - MySQL 8.0+

2. **Database Setup:**
   ```sql
   CREATE DATABASE salon_management;
   CREATE USER 'Saloon@001'@'localhost' IDENTIFIED BY 'Saloon@001';
   GRANT ALL PRIVILEGES ON salon_management.* TO 'Saloon@001'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Run Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

4. **Run Frontend:**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

### API Endpoints

- **Customers:** `/api/customers`
- **Employees:** `/api/employees`
- **Services:** `/api/services`
- **Appointments:** `/api/appointments`
- **Tally Records:** `/api/tally`

### Features

- **Automatic Fallback:** If the backend is not available, the app falls back to browser storage
- **Real-time Data:** All CRUD operations are synchronized with the MySQL database
- **RESTful API:** Clean REST endpoints for all entities
- **Data Validation:** Server-side validation using Bean Validation
- **CORS Support:** Configured for frontend-backend communication

## Project info

**URL**: https://lovable.dev/projects/42164a50-a27e-4bef-ad78-581bebd4b634

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/42164a50-a27e-4bef-ad78-581bebd4b634) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/42164a50-a27e-4bef-ad78-581bebd4b634) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
