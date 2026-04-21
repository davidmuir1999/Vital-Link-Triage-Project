# 🏥 Vital Link: Enterprise Electronic Health Record & Bed Management

[](https://www.google.com/search?q=%23) [](https://www.google.com/search?q=%23) [](https://www.google.com/search?q=%23)

**Vital Link** is a responsive, full-stack Electronic Health Record (EHR) and hospital bed management application. Built in direct collaboration with practicing NHS doctors and nurses, it is engineered to solve real-world clinical bottlenecks in the patient admission-to-discharge workflow.

> **Note to Recruiters & Reviewers:** This repository is intended as a live portfolio demonstration of enterprise architecture, complex state management, and modern clinical UI/UX.

-----

## 🚀 Live Demo & Access

Experience the full hospital workflow by interacting with the application through different user roles.

**🔗 [Link to Live Application]** *(https://vitallinkapp.com)*

### Demo Credentials

Use the following credentials to explore the Role-Based Access Control (RBAC) and role-specific dashboards. All accounts use the same password.

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Triage Nurse** | `triagenurse@nhs.net` | `password` | Admits patients, logs initial vitals, calculates NEWS2 score. |
| **Ward Doctor** | `doctor@nhs.net` | `password` | Reviews clinical notes, updates vitals, processes discharges. |
| **Site Manager** | `manager@nhs.net` | `password` | Oversees hospital capacity, manages SLA priority queues. |
| **Cleaning Staff**| `cleaner@nhs.net` | `password` | Receives bed cleaning flags, marks beds as available. |

-----

## ⚡ Core Capabilities & Engineering Features

Vital Link is built to handle the complexities of a live hospital environment, moving beyond simple CRUD operations to incorporate business logic, real-time states, and clinical algorithms.

  * **Full Patient Hospital Flow:** End-to-end state tracking of a patient's lifecycle: Triage Arrival $\rightarrow$ Ward Admission $\rightarrow$ Treatment $\rightarrow$ Discharge $\rightarrow$ Bed Cleaning $\rightarrow$ Bed Available.
  * **Automated Clinical Scoring (NEWS2):** An integrated algorithmic engine that processes raw patient vitals (SpO2, HR, BP, Temp, Consciousness) to calculate real-time National Early Warning Scores, automatically flagging deteriorating patients.
  * **SLA & Risk Priority Engine:** A background sorting algorithm that prioritises the patient queue based on clinical risk factors and hospital business rules to prevent SLA breaches and hospital fines.
  * **"God Mode" Patient Simulator:** A built-in simulation tool designed for testing and demonstrations. It allows users to artificially trigger patient deterioration or treatment success to observe how the UI, priority queues, and clinical scores react in real-time.
  * **Responsive, High-Density Clinical UI:** Built for the reality of medical staff. While optimised for desktop workstations on the ward, the interface uses advanced CSS grid/flex boundary enforcement to remain fully functional and readable on mobile devices.
  * **Intuitive Drag-and-Drop Workflow:** Frictionless bed management and patient transfer systems utilising modern drag-and-drop mechanics.
  * **Concurrency & Race Condition Mitigation:** Built with robust asynchronous state handling to prevent UI tearing or data corruption when multiple ward staff update patient records simultaneously.
  * **Role-Based Access Control (RBAC):** Strict view and action isolation ensuring staff only see the data and actions legally relevant to their clinical role.

-----

## 🏗️ Architecture & Tech Stack

This project was engineered using a modern, scalable JavaScript/TypeScript ecosystem:

### Frontend

  * **React & Next.js (App Router):** Server Components and Server Actions for optimal performance and secure data fetching.
  * **Tailwind CSS & Shadcn UI:** For a highly cohesive, accessible, and responsive clinical interface.

### Backend & Data

* **PostgreSQL:** The core relational database engine handling robust clinical data storage and complex querying.
* **Supabase:** Providing real-time WebSocket subscriptions and authentication on top of the Postgres layer.
* **Prisma ORM:** Type-safe database queries and seamless schema migrations.
* **Zod:** Strict runtime type validation and schema declaration to guarantee clinical data integrity before it ever reaches the database.

### Quality Assurance & DevOps

  * **Playwright:** Comprehensive End-to-End (E2E) testing simulating full patient lifecycles and complex browser interactions.
  * **Jest:** Unit testing for isolated clinical algorithms (like the NEWS2 calculator).
  * **GitHub Actions:** Automated CI/CD pipelines enforcing test passing before deployment.

-----