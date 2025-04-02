# TheraStack AI-Powered Therapy App

## Overview
TheraStack is an AI-powered therapy application that helps patients connect with therapists, manage appointments, and receive AI-assisted therapy support.

## Features
- Calendar system with support for three roles: Admin, Patient, and Doctor
- Appointment scheduling and management
- Patient document storage and management
- AI-powered therapy assistance
- Billing and payment processing
- Model Context Protocol for AI call assistance
- Role-based access control

## Quick Start

### Using Docker (Recommended)
```
# Start the application in development mode
docker-compose up

# Or with the convenience script
./start-local.sh dev
```

### Manual Setup

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the backend server:
   ```
   python main.py
   ```
   The server will start on http://localhost:8000

#### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:3000

## Testing
```
# Run all tests
./start-local.sh test

# Run backend tests only
cd backend
python -m pytest

# Run frontend tests only
cd frontend
npm run test
```

The application also includes a user switcher to test different roles:
- Patient
- Doctor (Therapist)
- Admin

## Deployment

### Local Deployment with Docker
```
docker-compose up -d
```

### AWS Deployment
1. Configure AWS credentials:
   ```
   aws configure
   ```

2. Create Terraform variables file:
   ```
   cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
   # Edit terraform.tfvars with your configuration
   ```

3. Run the deployment script:
   ```
   ./infra/scripts/deploy.sh
   ```

## Project Structure
- `/backend` - Python FastAPI backend
  - `/api` - API endpoints
  - `/models` - Data models
  - `/services` - Business logic and external services
    - `/calendar_dynamodb` - Calendar functionality with DynamoDB
    - `/company_docs_s3` - Company document storage
    - `/patient_docs_s3` - Patient document storage
    - `/billing` - Billing functionality
    - `/payments` - Payment processing
    - `/ai_assistant` - AI assistant integration
    - `/call_manager` - Model Context Protocol implementation
  - `/utils` - Utility functions

- `/frontend` - React/Next.js frontend
  - `/components` - Reusable React components
    - `/auth` - Authentication components
    - `/calendar` - Calendar components
    - `/documents` - Document management
    - `/sessions` - Therapy session components
  - `/pages` - Next.js pages
    - `/admin` - Admin features including call manager
  - `/services` - API client services
  - `/styles` - CSS and styling

- `/tests` - Test suite
  - `/unit` - Unit tests
    - `/backend` - Backend unit tests
    - `/frontend` - Frontend unit tests
  - `/integration` - Integration tests

- `/infra` - Infrastructure code
  - `/terraform` - Terraform configuration for AWS deployment
  - `/scripts` - Deployment scripts

## Development Notes
- For local development, a mock in-memory database is used instead of DynamoDB
- The application uses context for user authentication and role management
- All features respect role-based access control
- The Model Context Protocol allows AI to access patient data during calls with proper verification