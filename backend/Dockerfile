# Stage 1: Set up Node.js backend
FROM node:22

WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port the Node.js app will run on
EXPOSE 5000

# Run the backend server
CMD ["npm", "start"]
