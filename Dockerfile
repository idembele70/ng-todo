# Step 1: Build the Angular application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# Build the application for production
RUN npm run build

# Step 2: Nginx server for the built application
FROM nginx:alpine

# Copy built files from previous step
COPY --from=build /app/dist/browser /usr/share/nginx/html/ng-todo

# Custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
