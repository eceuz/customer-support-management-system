# Support Call Management System

A web-based support call management system developed to record, manage, and track customer support calls.

## Features

- Customer management
- Branch management
- Support call recording and tracking
- Maintenance agreement information
- Issue type management
- User management
- Call status tracking
- Search and filtering
- Edit and delete call records
- Dashboard with recent support calls
- Excel and PDF export

## Technologies

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

### Frontend

- React
- Vite
- Material UI

### Database & Development Tools

- PostgreSQL
- Docker
- DBeaver
- Git
- GitHub

## Project Structure

```text
destek_sistemi/
│
├── backend/
│   └── app/
│       ├── crud.py
│       ├── database.py
│       ├── main.py
│       ├── models.py
│       └── schemas.py
│
├── frontend/
│   └── src/
│
├── docker-compose.yml
├── .gitignore
└── README.md
System Overview

The system provides a centralized platform for managing customer support calls. Support personnel can record customer information, branch details, issue types, contact information, performed actions, and the result of each support call.

The dashboard provides quick access to recent support calls, while search and filtering features make it easier to find specific records. Existing records can also be updated or deleted when necessary.

Main Modules
Customer Management

Customer records can be added and listed within the system. Each customer can have multiple branches associated with their account.

Branch Management

Branch information is stored separately and linked to the related customer. The system also keeps track of whether a branch has an active maintenance agreement.

Support Call Management

Support personnel can create call records containing:

Customer
Branch
Support personnel
Issue type
Phone number
Contact person
Actions performed
Call result
Date and time

Call records can be viewed, searched, updated, and deleted.

Dashboard

The dashboard provides an overview of support activities and displays recent call records for quick access.

Database

The application uses PostgreSQL as the relational database management system.

SQLAlchemy is used as the Object-Relational Mapping (ORM) layer to communicate with the database and manage database models.

Docker is used to provide a consistent database development environment.

API

The backend is developed using FastAPI and provides RESTful API endpoints for communication between the frontend and database.

The API handles operations such as:

Creating records
Retrieving records
Updating records
Deleting records
Filtering and searching records
Frontend

The frontend is developed with React and Vite.

Material UI is used for interface components such as tables, buttons, dialogs, forms, chips, and input fields.

The interface is designed to provide a simple and efficient workflow for support personnel.

Data Export

Support call records can be exported to Excel and PDF formats for reporting and external use.

Purpose

The purpose of this project is to provide a centralized system for recording and managing customer support calls, reducing manual record keeping and making support history easier to access and manage.

Project Status

Completed as an internship project.
