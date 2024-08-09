FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json if exists
COPY package.json .

# Install dependencies
RUN npm install


# Copy the rest of the application code
COPY . .

# Start the application
CMD ["npm", "start"]
