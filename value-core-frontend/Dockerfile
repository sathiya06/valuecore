# value-core-frontend/Dockerfile
FROM node:22.13.0-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source & build
COPY . .
RUN npm run build

# Expose and serve the production build
EXPOSE 3000
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
