Webhook Delivery SaaS
A production-grade, highly reliable Webhook Delivery Engine built using a containerized microservices architecture. Designed to handle asynchronous event dispatching, automatic retries with exponential backoff, cryptographic HMAC-SHA256 verification, and real-time delivery auditing.
System Architecture Diagram
Plaintext
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
Features
Asynchronous Queueing: Offloads outbound HTTP requests to Redis using BullMQ, ensuring high-throughput API endpoints that never block or drop under load.
Cryptographic Security: Automatically signs every outbound payload using HMAC-SHA256, allowing receiving servers to cryptographically verify authenticity via custom headers.
Resilient Delivery & Retries: Automatically retries failed webhook dispatches with exponential backoff to handle destination downtime gracefully.
Real-Time Auditing: Persists all endpoints, event triggers, and delivery attempts (including status codes and response bodies) into PostgreSQL via Prisma ORM.
Modern Dashboard: Clean, responsive Next.js App Router frontend styled with Tailwind CSS for registering endpoints and firing test events.
Fully Containerized: Orchestrated end-to-end using Docker Compose for seamless multi-service local development and deployment.
Tech Stack
Frontend: Next.js 14 (App Router), Tailwind CSS
Backend: Node.js, Express.js, TypeScript
Database & ORM: PostgreSQL, Prisma ORM
Message Broker & Queue: Redis, BullMQ
Containerization: Docker, Docker Compose (Alpine Linux multi-stage builds)
Project Structure
Plaintext
webhook-saas/
├── frontend/           # Next.js Dashboard (Port 3001)
├── backend/            # Express API & BullMQ Worker (Port 3000)
├── docker-compose.yml  # Multi-container orchestration
└── README.md
Prerequisites
Docker and Docker Compose installed on your machine.
Node.js v18+ (if running scripts locally outside containers).
Quick Start (Docker Compose)
Clone the repository:
Bash
git clone https://github.com/your-username/webhook-saas.git
cd webhook-saas
Configure Environment Variables:
Create a .env file in your backend directory or root as needed for local overrides (defaults are handled via Docker Compose).
Build and Run the Containers:
Bash
docker compose up --build
Access the Services:
Frontend Dashboard: http://localhost:3001
Backend API: http://localhost:3000
Testing the Engine End-to-End
Open Webhook.site to grab a free, temporary test receiver URL.
Navigate to your frontend dashboard at http://localhost:3001.
Register an Endpoint: Paste your Webhook.site URL as the target and enter a secret (e.g., whsec_secret123).
Dispatch an Event: Trigger a test event (e.g., user.signup).
Verify Delivery: Check Webhook.site to see the incoming HTTP POST request complete with the JSON payload and the x-webhook-signature header for HMAC verification.
