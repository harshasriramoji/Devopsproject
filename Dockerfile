FROM node:20-alpine

WORKDIR /usr/src/app

# Install backend dependencies only
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend and frontend sources
COPY backend ./backend
COPY frontend ./frontend

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /usr/src/app/backend
CMD ["npm", "start"]
