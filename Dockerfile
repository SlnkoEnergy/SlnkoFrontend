FROM node:16-alpine AS build
WORKDIR /protrac/frontend

ARG BRANCH=dev

COPY .env.prod .env.prod
COPY .env.dev .env.dev
RUN if [ "$BRANCH" = "prod" ] || [ "$BRANCH" = "staging" ]; then \
      cp .env.prod .env; \
    else \
      cp .env.dev .env; \
    fi

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Set default domain
ARG BRANCH=dev
ENV DOMAIN_NAME=slnkoprotrac.com

RUN if [ "$BRANCH" = "staging" ]; then \
      export DOMAIN_NAME=staging.slnkoprotrac.com; \
    elif [ "$BRANCH" != "prod" ]; then \
      export DOMAIN_NAME=dev.slnkoprotrac.com; \
    fi

COPY --from=build /protrac/frontend/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Install envsubst to inject DOMAIN_NAME
RUN apk add --no-cache gettext

# Inject the domain into the final nginx.conf
RUN envsubst '$DOMAIN_NAME' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
