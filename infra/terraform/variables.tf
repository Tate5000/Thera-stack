variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "The name of the project/application"
  type        = string
  default     = "therastack"
}

variable "database_url" {
  description = "The URL to the database"
  type        = string
  sensitive   = true
}

variable "hosted_zone_id" {
  description = "The Route53 hosted zone ID"
  type        = string
}

variable "backend_domain" {
  description = "The domain for the backend service"
  type        = string
  default     = "api.therastack.com"
}

variable "frontend_domain" {
  description = "The domain for the frontend service"
  type        = string
  default     = "app.therastack.com"
}