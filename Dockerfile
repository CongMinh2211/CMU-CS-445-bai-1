FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY app/ ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
