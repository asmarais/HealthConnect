# Stage 1: Build the Angular app
FROM node:18-alpine3.18 AS angular

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port Angular will run on
EXPOSE 4200

# Run the Angular app and allow access from all network interfaces
CMD ["ng", "serve", "--host", "0.0.0.0"]
