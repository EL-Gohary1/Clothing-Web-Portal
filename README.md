# Clothing Web Portal & QA Automation Project

This repository hosts a full-stack e-commerce web portal built using Flask (Python) with a SQL backend, alongside the comprehensive project documentation and a complete E2E test automation framework built with Playwright (TypeScript).

---

## 👥 What We Accomplished (Requirements & Documentation)

Throughout this project, we followed strict software quality assurance (SQA) and configuration management processes to deliver a reliable product. Here is a breakdown of what we did:

### 1. Requirements Engineering & Client Collaboration
*   **Conducted SIQ Sessions**: We ran Software Improvement & Quality (SIQ) sessions directly with the client. These sessions were crucial in gathering, validating, and refining business requirements and translating them into technical needs.
*   **Customer Requirements Specification (CRS)**: Drafted the initial CRS outlining the high-level business goals and user expectations.

### 2. Software Requirements Specification (SRS) & System Design
*   **Developed a Complete SRS Document**: Created a detailed Software Requirements Specification covering **40+ functional and non-functional requirements**.
*   **System Diagrams & Visual Modeling**: We designed all critical architectural diagrams to visualize the platform's blueprints:
    *   **Entity-Relationship Diagram (ERD)**: Defined database schemas, user entities (Admin, Supplier, Customer), and their relationships.
    *   **Class Diagram**: Modeled the object-oriented structure of the code, classes, and helper systems.
    *   **Flowcharts & Sequence Diagrams**: Documented user paths, transaction flows, and backend processing steps.

### 3. Project & Configuration Management
*   **Configuration Management Plan (CMP)**: Developed a formal CMP to govern, organize, and version control all software artifacts, requirements sheets, database migrations, and testing scripts.
*   **Project Management Plan (PMP) & Status Reports**: Maintained a project tracking plan along with weekly team status reports to ensure milestones were met.
*   **Risk Management Sheet**: Created a risk sheet identifying potential project risks, impact factors, and mitigation steps.

### 4. Full Quality Traceability
*   **Requirements Traceability Matrix (RTM)**: Formulated an exhaustive RTM spreadsheet mapping every single requirement from the SRS directly to its corresponding manual test case (in `TestCases_Docs/`) and active bugs (in `Bug Report.xlsx`), ensuring 100% test coverage and validation.

---

## ⚡ Playwright Automation Framework

The complete end-to-end (E2E) automated testing framework from scratch using **Playwright (TypeScript)**. It is engineered for maximum speed, isolation, and robustness.

### Key Architecture Features:
1.  **Page Object Model (POM)**:
    Structured all web page interactions inside modular classes under [`playwright_framework/pages/`] (e.g., `adminCustomersPage.ts`, `customerCartPage.ts`, etc.) to keep test scripts clean, dry (DRY), and easy to maintain.

2.  **State Storage & Quick Login**:
    Implemented global setup cookies/sessions in [`tests/auth.setup.ts`] This logs in three test roles (**Customer**, **Vendor**, and **Admin**) once and saves their browser states into `.storage-state/`, letting subsequent tests bypass the UI login steps entirely.
    
3.  **Advanced Custom Fixtures (`tests/test-base.ts`)**:
    *   **`isolatedCustomerContext`**: Dynamically creates a new user via API, logs them in, spawns a fresh browser page, and automatically deletes the user via Admin API call during teardown.
    *   **`adminAddProductAPI`**: Adds randomly generated products (using factories) via API calls and handles database cleanup after tests.
    *   **`customerCartPageWithItemsAPI`**: Sets up items in the cart using direct API requests to avoid redundant UI clicks, saving valuable test execution time.

---

## 📁 Repository Structure

```tree
Clothing-Web-Portal/
├── clothing_platform/          # Flask Backend Application (Presentation & Logic)
│   ├── app.py                  # Entrypoint to run the Flask application
│   ├── config.py               # Database and configuration keys
│   ├── models/                 # SQLAlchemy database models (User, Product, Cart, Order)
│   ├── routes/                 # Blueprint routers (Auth, Admin, Customer, Supplier)
│   └── templates/              # HTML layout templates (Frontend)
│
├── playwright_framework/          # E2E Test Automation Framework (TypeScript)
│   ├── pages/                     # Page Object Model (POM) representations
│   ├── tests/                     # Playwright spec files and setups
│   │   ├── auth.setup.ts          # Global login and state generation
│   │   ├── test-base.ts           # Custom fixtures and API teardown hooks
│   │   ├── landing.spec.ts        # Landing page UI & navigation tests
│   │   ├── login.spec.ts          # Security, validation, & login flow tests
│   │   ├── productDisplay.spec.ts # Catalog display, stock status, & search tests
│   │   ├── shoppingCart.spec.ts   # Cart operations, quantity updates, & checkout tests
│   │   ├── profile.spec.ts        # Customer profile editing validation tests
│   │   └── customerOrders.spec.ts # Customer order history validation tests
│   ├── utils/                     # Mock factories (User/Product generators)
│   └── playwright.config.ts       # Playwright configurations (Base URL, browsers, etc.)
│
├── Develop_Docs/               # Architectural Diagrams (ERD, Class, Sequences, Flowcharts)
├── Process_Docs/               # SQA Documents (CMP, CRS, PMP, RTM, Risk, SRS, SIQ)
└── TestCases_Docs/             # Excel sheets containing manual test cases and bug reports
```

---

## 🚀 Setup & Execution Guide

### 1. Running the Flask Backend (`clothing_platform`)

1.  Navigate to the project root and create a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
2.  Install python dependencies:
    ```bash
    pip install -r clothing_platform/requirements.txt
    ```
3.  Add a `.env` file inside `clothing_platform/` with your database URL:
    ```env
    FLASK_ENV=development
    DATABASE_URL=sqlite:///clothing.db
    SECRET_KEY=dev-secret-key
    ```
4.  Run the application:
    ```bash
    python clothing_platform/app.py
    ```
    *Backend server runs on **http://localhost:5000**.*

### 2. Running Playwright Tests (`playwright_framework`)

1.  Navigate to the framework folder:
    ```bash
    cd playwright_framework
    ```
2.  Install dependencies & Playwright browsers:
    ```bash
    npm install
    npx playwright install chromium
    ```
3.  Execute tests:
    *   **Run All Tests**:
        ```bash
        npx playwright test
        ```
    *   **Run Setup only (Generate login states)**:
        ```bash
        npx playwright test --project=setup
        ```
    *   **Run in UI Interactive Mode**:
        ```bash
        npx playwright test --ui
        ```
    *   **Show Test Results Report**:
        ```bash
        npx playwright show-report
        ```
