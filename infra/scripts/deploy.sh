#!/bin/bash
set -e

# Configuration
PROJECT_NAME="therastack"
AWS_REGION="us-east-1"
ECR_BACKEND_REPO="${PROJECT_NAME}-backend"
ECR_FRONTEND_REPO="${PROJECT_NAME}-frontend"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in to AWS
echo "Checking AWS credentials..."
aws sts get-caller-identity &> /dev/null || {
    echo "Not logged in to AWS. Please run 'aws configure' first."
    exit 1
}

# Function to build and push Docker images
build_and_push() {
    local directory=$1
    local repo_name=$2
    local dockerfile_path="$directory/Dockerfile"

    echo "Building Docker image for $directory..."
    docker build -t "$repo_name:latest" "$directory"

    echo "Logging in to ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com"

    echo "Tagging Docker image..."
    docker tag "$repo_name:latest" "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:latest"

    echo "Pushing Docker image to ECR..."
    docker push "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$repo_name:latest"
}

# Create ECR repositories if they don't exist
create_ecr_repo() {
    local repo_name=$1
    
    echo "Checking if ECR repository $repo_name exists..."
    if ! aws ecr describe-repositories --repository-names "$repo_name" --region "$AWS_REGION" &> /dev/null; then
        echo "Creating ECR repository $repo_name..."
        aws ecr create-repository --repository-name "$repo_name" --region "$AWS_REGION"
    else
        echo "ECR repository $repo_name already exists."
    fi
}

# Function to apply Terraform
apply_terraform() {
    echo "Applying Terraform configuration..."
    cd "$(dirname "$0")/../terraform"
    
    # Check if terraform.tfvars exists
    if [ ! -f terraform.tfvars ]; then
        echo "terraform.tfvars not found. Please create it first (see terraform.tfvars.example)."
        exit 1
    fi
    
    # Initialize Terraform
    terraform init
    
    # Apply Terraform
    terraform apply -auto-approve
}

# Main deployment process
echo "Starting deployment process..."

# Create ECR repositories
create_ecr_repo "$ECR_BACKEND_REPO"
create_ecr_repo "$ECR_FRONTEND_REPO"

# Build and push Docker images
cd "$(dirname "$0")/../.."
build_and_push "./backend" "$ECR_BACKEND_REPO"
build_and_push "./frontend" "$ECR_FRONTEND_REPO"

# Apply Terraform
apply_terraform

echo "Deployment complete!"