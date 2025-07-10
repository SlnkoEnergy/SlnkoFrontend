# Stage 1: Build the frontend
FROM node:16-alpine AS build

WORKDIR /protrac/frontend

ARG ENV=dev
COPY .env.${ENV} .env
COPY package.json ./

RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

ARG ENV=dev
ENV SERVER_NAME=dev.slnkoprotrac.com

WORKDIR /app
COPY --from=build /protrac/frontend/build /usr/share/nginx/html
COPY nginx.template.conf .

# Use envsubst to generate nginx.conf
RUN apk add --no-cache gettext && \
    envsubst '${SERVER_NAME}' < nginx.template.conf > /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
