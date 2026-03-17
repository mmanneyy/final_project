# Realtime Collaboration Backend

## Overview

This project is a production-style backend system designed to simulate a real-time collaboration platform similar to a lightweight messaging or team communication service.

The system focuses on correct backend architecture, authentication & authorization, structured error handling, logging, Redis integration, MongoDB persistence, Swagger documentation, and WebSocket communication.

No frontend is included. The API is intended to be tested via HTTP and WebSocket clients.

---

## Core Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Access / Refresh token mechanism
- Refresh token storage & invalidation via Redis
- MongoDB persistence with Mongoose
- Real-time communication via WebSockets
- Centralized error handling
- Structured logging with Winston
- Swagger API documentation

---

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis
- JWT (jsonwebtoken)
- bcrypt
- Winston (logging)
- Swagger (API docs)
- WebSockets (ws / socket.io)

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
