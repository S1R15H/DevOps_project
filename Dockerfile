FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Expose port
EXPOSE 7000

# Start the application
CMD ["node", "src/index.js"]
