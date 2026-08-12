# --- Frontend Dockerfile (multi-stage build) ---
# Stage 1: build the static React app with Node.js
# Stage 2: serve the built files with a lightweight Nginx image

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Vite reads VITE_* variables at BUILD time, so the backend URL must be
# supplied as a build argument (see docker-compose.yml build.args).
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: Nginx serves the compiled static files ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
