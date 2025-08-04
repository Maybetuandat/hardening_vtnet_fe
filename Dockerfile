# Use official Nginx image
FROM nginx:alpine

# Copy Vite build output (from `dist/`) to Nginx html directory
COPY dist /usr/share/nginx/html

# Replace default nginx config with custom one (optional)
COPY nginx/web.conf /etc/nginx/conf.d/default.conf

# Expose default HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
