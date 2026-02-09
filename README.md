# Phase II: Full-Stack Todo Web Application

![Todo App](https://hackathon2fullstacktodoapp.vercel.app/)  

A full-stack, multi-user Todo application built using a spec-driven workflow with **Claude Code** and **Spec-Kit Plus**. The project evolves a console-based todo app into a modern web application with persistent storage, user authentication, and RESTful APIs.  

**Live Frontend URL:** [https://hackathon2fullstacktodoapp.vercel.app](https://hackathon2fullstacktodoapp.vercel.app/)

---

## Badges

![Next.js](https://img.shields.io/badge/Next.js-16+-blue)  
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)  
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)  
![Vercel](https://img.shields.io/badge/Deployment-Vercel-purple)

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Technology Stack](#technology-stack)  
- [API Endpoints](#api-endpoints)  
- [Authentication & Security](#authentication--security)  
- [Monorepo Structure](#monorepo-structure)  
- [Getting Started](#getting-started)  
- [Development Workflow](#development-workflow)  

---

## Project Overview

This project is part of **Phase II** of the hackathon, transforming the basic console Todo app into a full-stack web application with:  

- Multi-user support  
- Persistent task storage in **Neon Serverless PostgreSQL**  
- RESTful API endpoints using **FastAPI**  
- Responsive **Next.js** frontend deployed on **Vercel**  
- JWT-based authentication with **Better Auth**  

---

## Features

- **Task CRUD Operations:** Create, read, update, delete tasks  
- **Mark Tasks Complete:** Toggle task completion status  
- **User Authentication:** Signup, login, and secure access  
- **User Isolation:** Each user only sees their own tasks  
- **Filtering & Sorting:** Tasks can be filtered by status  

---

## Technology Stack

| Layer         | Technology                             |
|---------------|----------------------------------------|
| Frontend      | Next.js 16+ (App Router)               |
| Backend       | Python FastAPI                          |
| ORM           | SQLModel                                |
| Database      | Neon Serverless PostgreSQL              |
| Spec-Driven   | Claude Code + Spec-Kit Plus             |
| Authentication| Better Auth (JWT tokens)                |

---

## API Endpoints

All endpoints are protected and require a **JWT token** in the header:  

 
| Method | Endpoint                               | Description                  |
|--------|----------------------------------------|------------------------------|
| GET    | /api/{user_id}/tasks                   | List all tasks               |
| POST   | /api/{user_id}/tasks                   | Create a new task            |
| GET    | /api/{user_id}/tasks/{id}              | Get task details             |
| PUT    | /api/{user_id}/tasks/{id}              | Update a task                |
| DELETE | /api/{user_id}/tasks/{id}              | Delete a task                |
| PATCH  | /api/{user_id}/tasks/{id}/complete     | Toggle completion            |

---

## Authentication & Security

- **JWT Tokens:** Issued by Better Auth on frontend login  
- **Backend Verification:** FastAPI verifies tokens and ensures users can only access their own tasks  
- **Security Benefits:**  
  - User isolation (tasks are private)  
  - Stateless authentication  
  - Token expiry support (e.g., 7 days)  
  - No shared DB session needed  

**Shared Secret:** Both frontend and backend use the same environment variable `BETTER_AUTH_SECRET` for JWT signing and verification.

---

## Monorepo Structure

