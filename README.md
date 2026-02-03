# Document Management System (DMS) Frontend

## Project Description
This is the frontend interface for the Document Management System, built with **React** and **Vite**. It provides a modern, responsive UI for users to interact with the DMS backend, managing documents, departments, and their profiles.

## Technologies
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v6+
- **HTTP Client**: Axios

## Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

## Installation and Setup

1.  **Navigate to the project directory**
    ```bash
    cd DMS-FRONTEND
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Ensure the backend API is running (default: `http://localhost:8000`).
    You may need to configure the API base URL in your axios setup or `.env` file if applicable.

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code quality issues |

## Project Structure
- `src/`
    - `components/`: Reusable UI components
    - `pages/`: Page views (Login, Dashboard, Documents, etc.)
    - `App.jsx`: Main application component and routing
    - `main.jsx`: Entry point
