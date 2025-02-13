# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /src

# Copy package.json and package-lock.json (for faster builds)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Expose the port the app runs on
EXPOSE 3333

# Start the app
CMD ["node", "start"]
