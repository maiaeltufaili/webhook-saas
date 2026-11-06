# Webhook Delivery SaaS

A production-grade, highly reliable **Webhook Delivery Engine** built using a containerized microservices architecture. Designed to handle asynchronous event dispatching, automatic retries with exponential backoff, cryptographic HMAC-SHA256 verification, and real-time delivery auditing.

---

## System Architecture

```text
+-------------------------------------------------------------+
|                          Frontend                           |
|                    (Next.js / Port 3001)                    |
+------------------------------+------------------------------+
                               | HTTP / JSON API Calls
                               v
+-------------------------------------------------------------+
|                         Backend API                         |
|                     (Node.js / Port 3000)                   |
+-------+------------------------------+----------------------+
        |                              |
        | Persist Audit Logs           | Enqueue Job
        v                              v
+-------+-------+             +--------+--------+
|  PostgreSQL   |             |  Redis / BullMQ |
|   (Database)  |             |  (Message Queue)|
+---------------+             +--------+--------+
                                       |
                                       | Process Job & Sign (HMAC-SHA256)
                                       v
                              +--------+--------+
                              |  Outbound HTTP  |
                              |   Webhook POST  |
                              +--------+--------+
                                       |
                                       v
                              +--------+--------+
                              |  Target Server  |
                              | (Webhook.site)  |
                              +-----------------+

```

---

## Core Features

* **Asynchronous Queueing**: Offloads outbound HTTP requests to Redis using BullMQ, ensuring high-throughput API endpoints that never block or drop under load.
* **Cryptographic Security**: Automatically signs every outbound payload using HMAC-SHA256, allowing receiving servers to cryptographically verify authenticity via custom headers.
* **Resilient Delivery & Retries**: Automatically retries failed webhook dispatches with exponential backoff to handle destination downtime gracefully.
* **Real-Time Auditing**: Persists all endpoints, event triggers, and delivery attempts (including status codes and response bodies) into PostgreSQL via Prisma ORM.
* **Modern Dashboard**: Clean, responsive Next.js App Router frontend styled with Tailwind CSS for registering endpoints and firing test events.
* **Fully Containerized**: Orchestrated end-to-end using Docker Compose for seamless multi-service local development and deployment.

---

## Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS | User dashboard, endpoint registration, and event triggering UI |
| **Backend API** | Node.js, Express.js, TypeScript | REST API controllers, HMAC signature generation, and orchestration |
| **Message Queue** | Redis, BullMQ | Asynchronous job processing, concurrency control, and retry backoffs |
| **Database & ORM** | PostgreSQL, Prisma ORM | Relational data persistence for endpoints, payloads, and delivery logs |
| **Infrastructure** | Docker, Docker Compose | Multi-container isolation and Alpine Linux multi-stage builds |

---

## Project Structure

```text
webhook-saas/
├── frontend/           # Next.js Dashboard (Port 3001)
├── backend/            # Express API & BullMQ Worker (Port 3000)
├── docker-compose.yml  # Multi-container orchestration
└── README.md

```

---

## Prerequisites

* [Docker](https://www.docker.com/) and Docker Compose installed on your machine.
* Node.js v18+ (if running scripts locally outside containers).

---

## Quick Start Guide

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/webhook-saas.git
cd webhook-saas

```


2. **Build and Run the Containers**:
```bash
docker compose up --build

```


3. **Access the Services**:
* **Frontend Dashboard**: `http://localhost:3001`
* **Backend API**: `http://localhost:3000`



---

## End-to-End Testing

1. Open **Webhook.site** to generate a unique, temporary test receiver URL.
2. Navigate to your local frontend dashboard at `http://localhost:3001`.
3. **Register an Endpoint**: Paste your Webhook.site URL into the target field and assign an HMAC secret (e.g., `whsec_secret123`).
4. **Dispatch an Event**: Trigger a test payload (e.g., event name `user.signup`).
5. **Verify Delivery**: Check Webhook.site to inspect the incoming HTTP POST request, verifying both the JSON payload and the `x-webhook-signature` verification header.
