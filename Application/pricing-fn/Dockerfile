FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY app.js ./
# Switch to non-root user for better security
USER node
EXPOSE 3001
CMD ["npm", "start"]