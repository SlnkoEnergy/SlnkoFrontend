# Stage 1: Build the frontend
FROM node:16-alpine AS build

WORKDIR /protrac/frontend

# Copy env and package info first (for caching)
COPY .env.testing .env
COPY package.json ./

RUN npm install

# Copy the rest of the code
COPY . .

# Build with environment variables
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

COPY --from=build /protrac/frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
