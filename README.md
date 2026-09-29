# Higher Education Grading System API

A secure backend web application designed to manage academic data and institutional grading rules. Built with a focus on strict data validation, session state authentication, and role-based access control.

## Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Architecture:** REST API

## Core Features
* **Role-Based Access Control (RBAC):** Isolates administrator and classification officer privileges for secure academic data management.
* **Relational Database Design:** Engineered a MySQL schema utilizing junction tables to efficiently map many-to-many relationships between faculty users and degree programs.
* **Institutional Compliance:** Implemented robust server-side data validation to ensure strict compliance with institutional grading rules, including rigid weighting calculations.

## Local Setup
To run this application locally on your machine, follow these steps:

1. **Database Setup:** Open MySQL (e.g., via XAMPP and phpMyAdmin) and create a new empty database named `40343604`.
2. **Seed the Database:** Import the `src/seeder/data.sql` file into your newly created database to populate the tables with test data.
3. **Install Dependencies:** Open your terminal in the project root and run `npm install`.
4. **Start the Server:** Run `node src/web/app.js` in your terminal. 
5. **Access the App:** The application will be running and accessible at `http://localhost:3000`.

## Test Accounts
Use the following credentials to test the RBAC features:

* **Registry Administrator:** `registry_admin` / `password123`
* **Classification Officer:** `John_Smith` / `welcome123`