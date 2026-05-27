# ORBIT CLOUD MISSION CONTROL

## Project Overview

Orbit Cloud Mission Control is a DevOps-based cloud computing final project which is able to demonstrate a complete Continuous Integration and Continuous Deployment(CI/CD) pipeline using modern cloud services and automation tools.

The system uses a Reach based frontend dashboard, a Node.js backend API, and multiple AWS services (DynamoDB, IAM, S3 Bucket) to simulate and visualize real-world DevOps workflows including the building, testing and deployment stages.

This project was designed to meet the requirements of cloud computing and DevOps principles, focusing on automation, scalibility, observalibility, and Cloud Integration.

---

## System Architecture

The system follows a distributed cloud architecture:
////////////////////////////////////////////////////
User Browser (Frontend - React)
        |
        v
AWS S3 Static Website Hosting
        |
        v
Node.js / Express Backend (Hosted on Render)
        |
        v
AWS DynamoDB (Data Storage: logs, deployments, security data)
        |
        v
GitHub Actions (CI/CD Automation Pipeline)
/////////////////////////////////////////////////

This architecture separates frontend, backend, CI/CD pipeline, and database services to reflect a real-world cloud-native application design.

---

## CI/CD Pipeline Design

The CI/CD pipeline is implemented using GitHub Actions and consists of three main stages:

### 1. Build Pipeline
- Installs project dependencies using npm install.
- Compiles and builds the React application.
- Generates production-ready build artifacts.

### 2. Test Pipeline
- Executes automated workflow checks using GitHub Actions.
- Performs linting and build validation.
- Detects failures in code integration before deployment.

### 3. Deployment Pipeline
- Deploys frontend build artifacts to AWS S3.
- Updates static website hosting automaticlly.
- Supports versioned deployments based on commit history.
- Optional CloudFront cache invalidation for production updates.

---

## Features

### CI/CD Automation
- Fully automated pipeline using GitHub Actions.
- Commit-triggered build and deployment workflow.
- Pipeline history tracking via GitHub API integration.

### Cloud Infrastructure
- AWS S3 for frontend static hosting.
- AWS DynamoDB for backend data storage.
- Render for backend API hosting.
- Multi-environment support (development and production).

### Monitoring and Observability
- Real-time pipeline monitoring dashboard.
- Deployment history tracking.
- System logs visualization.
- Security status monitoring.
- CPU and memory useage simulation.

---

## Technologies Used

Frontend:
- React (Vite)
- Tailwind CSS

Backend:
- Node.js
- Express.js

Cloud Services:
- Amazon Web Services (S3, DynamoDB)
- Render (Backend Hosting)

DevOps Tools:
- GitHub Actions (CI/CD Pipeline)
- GitHub API Integration

---

## Environment Variables

The backend needed the following environment variables in order to work:

//AWS
AWS_ACCESS_KEY_ID=.....
AWS_SECRET_ACCESS_KEY=........
AWS_REGION=ap-southeast-1

//Github
GITHUB_TOKEN=..............
GITHUB_REPO=NorFarisya/orbit-cloud-mission-control

These variables was configutred in the deployment environment (Render)

---

## Branching Strategy

The project follows a structured Git workflow:

- main: Production-ready stable version
- dev: Active development branch
- stable-backup: Backup branch for recovery purposes

All development work is performed in the dev branch before being merged into production.

---

## Deployment Process

### Frontend Deployment (AWS S3)
- React application is built using npm run build.
- Build output is deployed to AWS S3 bucket.
- Static hosting is enabled for public access.

### Backend Deployment (Render)
- Node.js server is deployed via Render.
- API endpoints handle CI/CD data, logs and monitoring.
- Connected to AWS DynamoDB for persistent storage.

---

## API Endpoints

The backend exposes the following endpoints:

GET /status
- Returns system health and deployment summary

GET /deployments
- Returns deployment history

GET /pipeline
- Returns CI/CD pipeline stage data

GET /pipeline/github
- Returns real GitHub Actions workflow runs

GET /logs
- Returns system logs

GET /monitoring/cpu
- Returns CPU usage data

GET /monitoring/memory
- Returns memory usage data

GET /security
- Returns security status data

POST /deploy
- Triggers a new deployment simulation

POST /security/update
- Updates security-related data in DynamoDB

---

## Team Contributions

This project was developed collaboratively.

- Frontend Development: React dashboard, UI/UX, API integration.
- Backend Development: Express API, pipeline logic, AWS integration.
- DevOps Implementation: GitHub Actions workflows, CI/CD pipeline setup.
- Cloud Infrastructure: AWS S3, DynamoDB, Render deployment.
- Testing and Documentation: System validation and report preparation.

---

## Conclusion

This project was successfully completed, demonstrating a full DevOps lifecycle implementation including CI/CD, cloud infrastructure integration, and real-time monitoring.

It fulfils the requirements for build, test, and deployment pipelines, as well as showcasing the practical application of cloud computing and DevOps principles in a real-world architecture.