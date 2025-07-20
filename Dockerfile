FROM node:20.11-alpine3.19

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Set environment variables (optional)
ENV NODE_ENV production

# Expose the port (default for Next.js)
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
