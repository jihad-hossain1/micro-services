# api-getway/Dockerfile
FROM node:20


# Set the working directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of your application code.
COPY . .

# Expose the port your app runs on (adjust if necessary).
EXPOSE 4006

# Command to run your app.
CMD ["node", "src/index.js"]

