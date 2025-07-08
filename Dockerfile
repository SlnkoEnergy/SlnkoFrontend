# Stage 1: Build the frontend
FROM node:16-alpine AS build
WORKDIR /protrac/frontend

ARG BRANCH=dev

COPY .env.prod .env.prod
COPY .env.dev .env.dev
COPY .env.stag .env.stag

# Pick correct .env file based on branch
RUN if [ "$BRANCH" = "prod" ]; then \
      cp .env.prod .env; \
    elif [ "$BRANCH" = "staging" ]; then \
      cp .env.stag .env; \
    else \
      cp .env.dev .env; \
    fi

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

ARG BRANCH=dev

# Determine domain based on branch
ENV DOMAIN_NAME=slnkoprotrac.com
RUN if [ "$BRANCH" = "staging" ]; then \
      export DOMAIN_NAME=staging.slnkoprotrac.com; \
    elif [ "$BRANCH" != "production" ]; then \
      export DOMAIN_NAME=dev.slnkoprotrac.com; \
    fi

# Copy build files
COPY --from=build /protrac/frontend/build /usr/share/nginx/html

# Copy the nginx config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Install envsubst to replace variables in nginx config
RUN apk add --no-cache gettext

# Generate final nginx config with correct domain
RUN envsubst '$DOMAIN_NAME' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
