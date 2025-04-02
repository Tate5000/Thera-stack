# TheraStack AI Automation App Style Guide

## Build Commands
* Backend: No formal build process identified yet
* Frontend: No formal build process identified yet
* Tests: No test runner configuration identified yet

## Code Style Guidelines

### Python (Backend)
* Indentation: 4 spaces
* Naming: snake_case for variables/functions, PascalCase for classes
* Imports: Standard library first, third-party second, local modules last
* Types: Use type hints with Pydantic models for data schemas
* Error handling: Specific exception types with contextual re-raising

### TypeScript/React (Frontend)
* Indentation: 2 spaces
* Naming: camelCase for variables/functions, PascalCase for components
* File naming: PascalCase for components, camelCase for services
* Types: TypeScript interfaces for props and data structures
* React patterns: Functional components with hooks

### General
* Comments: Descriptive and focused on "why" not "what"
* DRY code: Avoid duplication, extract common functionality
* Code organization: Group related functionality in dedicated modules/components