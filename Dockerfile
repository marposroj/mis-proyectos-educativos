FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node","server.js"]
