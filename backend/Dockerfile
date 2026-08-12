# --- Backend Dockerfile ---
# A single-stage build is enough here: TypeScript is compiled to JS and
# only the compiled output + production dependencies run in the container.

FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this layer when only
# source code (not package.json) changes.
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source and compile TypeScript -> dist/
COPY . .
RUN npm run build

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
