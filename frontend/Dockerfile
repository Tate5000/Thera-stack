FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]