FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy game files
COPY . .

# Expose ports for game server and WebSocket
EXPOSE 3000 8080

# Start the server
CMD ["npm", "start"] 