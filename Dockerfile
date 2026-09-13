# ---- build stage: Vite compiles the React SPA ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve stage: nginx static + SPA fallback + /api proxy to backend ----
FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# BACKEND_URL (e.g. http://backend:3000, or the Cloud Run backend service URL)
ENV BACKEND_URL=http://backend:3000
EXPOSE 80
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
