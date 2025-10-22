# Étape 1 : Build de l'application Angular
FROM node:22-alpine AS build

WORKDIR /app

# Copier les fichiers package
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier tout le code source
COPY . .

# Build de l'application en production
RUN npm run build

# Étape 2 : Serveur Nginx pour l'application buildée
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape précédente
COPY --from=build /app/dist/browser /usr/share/nginx/html/ng-todo

# Config Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
