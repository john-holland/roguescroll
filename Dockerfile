FROM node:18

WORKDIR /app

# Install development dependencies
COPY package*.json ./
RUN npm install

# Copy game files
COPY . .

# Expose ports for:
# - HTTP server (3000)
# - WebSocket server (8080)
# - Debug port (9229)
EXPOSE 3000 8080 9229

# Set environment variables for development
ENV NODE_ENV=development
ENV DEBUG=roguescroll:*

# Start the server with debugging enabled
CMD ["npm", "run", "dev"] 