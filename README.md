# Event Ticket Platform

A full-stack web application for creating, managing, and selling tickets for events, featuring QR code generation and validation for attendees. Built with Spring Boot (Java) for the backend and React (TypeScript) for the frontend, using Keycloak for authentication.

## Overview

This platform allows event organizers to set up events and define ticket types. Attendees can browse published events, purchase tickets, and view their purchased tickets along with a unique QR code. Staff members can then use a dedicated interface to validate these QR codes for event entry.

## Features ✨

* **For Organizers:**
    * Create, Read, Update, Delete (CRUD) events.
    * Define multiple ticket types per event (name, price, description, quantity).
    * Set event status (Draft, Published).
    * Dashboard to view managed events.
* **For Attendees:**
    * Browse and search published events.
    * View event details and available ticket types.
    * Purchase tickets (requires login).
    * View purchased tickets in a personal dashboard.
    * View ticket details including a unique QR code.
* **For Staff:**
    * Validate attendee tickets using a QR code scanner or manual ID entry.
    * Receive immediate visual feedback (Valid/Invalid).
    * QR codes are marked as used after successful validation.
* **Authentication:** Secure login and role-based access control handled by Keycloak (OAuth 2.0 / OpenID Connect).
* **User Provisioning:** Users from Keycloak are automatically added to the application database on first login.

## Tech Stack 🛠️

* **Backend:**
    * Java 17+
    * Spring Boot 3.2+
    * Spring Data JPA (Hibernate)
    * Spring Security (OAuth2 Resource Server)
    * MapStruct
    * ZXing (for QR Codes)
    * Springdoc OpenAPI (Swagger UI)
    * Maven
* **Frontend:**
    * React 19
    * TypeScript
    * Vite
    * Tailwind CSS
    * shadcn/ui component library
    * react-router
    * react-oidc-context (Keycloak integration)
    * Lucide Icons
    * `@yudiel/react-qr-scanner`
* **Database:**
    * MySQL 8
* **Authentication:**
    * Keycloak
* **Development Environment:**
    * Docker & Docker Compose
    * Adminer (DB Management)

## Getting Started (Local Development) 🚀

### Prerequisites

* Java JDK (Version specified in `pom.xml`, likely 17+)
* Maven (`mvnw` wrapper included)
* Node.js and npm/yarn
* Docker and Docker Compose

### Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/shivam-616/Event-Ticket-platform.git
    ```

2.  **Start Infrastructure (Database & Keycloak):**
    ```bash
    docker-compose up -d
    ```
    Wait a minute for services to initialize.

3.  **Configure Keycloak:**
    * Access Keycloak Admin Console: `http://localhost:9090` (Login with `admin`/`admin`).
    * Ensure the realm `event-ticket-platform` exists (or create it).
    * Ensure the client `event-ticket-platform` exists within the realm (or create it).
        * **Client ID:** `event-ticket-platform`
        * **Client Protocol:** `openid-connect`
        * **Access Type:** `public` (Client authentication OFF)
        * **Valid redirect URIs:**
            * `http://localhost:5173/callback` (for frontend app)
            * `http://localhost:8080/swagger-ui/oauth2-redirect.html` (for Swagger UI)
            * (Add others as needed)
        * **Web origins:**
            * `http://localhost:5173` (for frontend app)
            * `http://localhost:8080` (for Swagger UI)
            * (Add others as needed)
    * Enable User Registration: Go to `Realm Settings` -> `Login` tab -> Toggle `User registration` ON -> Save.
    * Create Roles: Go to `Realm Roles` -> Add roles: `ROLE_ORGANISER`, `ROLE_ATTENDEE`, `ROLE_STAFF`.
    * Create Users: Go to `Users` -> Create test users (e.g., `organizer`, `attendee`, `staff`). Assign appropriate credentials and map the corresponding Realm Role under the `Role Mappings` tab for each user.

4.  **Run Backend (Spring Boot):**
    * Open the project in your IDE.
    * Ensure `src/main/resources/application.properties` points to `localhost:3306` for the database and `localhost:9090` for Keycloak.
    * Run the `TicketsApplication.java` main class.
    * *(Alternatively, run from root directory: `./mvnw spring-boot:run`)*

5.  **Run Frontend (React):**
    * Navigate to the `frontend` directory: `cd frontend`
    * Install dependencies: `npm install` (or `yarn`)
    * Ensure `src/main.tsx` has the correct Keycloak `authority` (`http://localhost:9090/...`) and `client_id` (`event-ticket-platform`).
    * Ensure `vite.config.ts` proxies `/api` to `http://localhost:8080`.
    * Start the development server: `npm run dev` (or `yarn dev`).

6.  **Access Application:**
    * Frontend: `http://localhost:5173`
    * Swagger UI (API Docs): `http://localhost:8080/swagger-ui.html`

## API Documentation

API documentation is available via Swagger UI when the backend application is running:
[`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)

You can authorize using the Keycloak OIDC flow directly from Swagger UI to test protected endpoints.

## License

This project includes code under the MIT License (see `frontend/LICENSE` file for details). Backend code license may vary based on dependencies.

