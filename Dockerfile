# Étape 1 : build avec Vite
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : servir avec NGINX
FROM nginx:alpine

# Supprimer les fichiers NGINX par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers compilés de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]