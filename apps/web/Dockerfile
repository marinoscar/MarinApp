FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3021
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3021"]
