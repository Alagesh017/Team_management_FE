# Project Setup

This guide provides step-by-step instructions to set up a React project efficiently. It covers repository creation, dependency installation, environment configuration, and loading environment variables in a Vite-based React application.

## Step 1: Fork and Create a New Repository

1. Fork this repository on GitHub to your own account.

2. Create a new repository using the React template as the base.

## Step 2: Clone the Repository

3. Clone the repository to your local machine using either the terminal or GitHub Desktop.

    **Using Terminal:**

    ```sh
    git clone <repo-url>
    cd <repo-name>
    ```

## Step 3: Install Dependencies

Run the following command to install the required dependencies:

```sh
npm i
```

## Step 4: Create Environment Files

Creating separate environment files helps manage different configurations for development, testing, and production environments. This approach ensures that developers do not accidentally use production credentials during development and allows seamless switching between environments without modifying the code.

Create three `.env` files for different environments:

- `.env.development`
- `.env.test`
- `.env.production`

## Step 5: Add Environment Variables

Add the following environment variables in each file:

### `.env.development`

```env
VITE_API_URL=http://localhost:5000/
```

### `.env.test`

```env
VITE_API_URL=https://test-api.example.com
```

### `.env.production`

```env
VITE_API_URL=https://api.example.com
```

These environment files will help in configuring different environments for your project. To use these variables in a React application with Vite, ensure that they are prefixed with `VITE_`. You can access them in your code using `import.meta.env.VITE_API_URL`. For example:

```js
const apiUrl = import.meta.env.VITE_API_URL
console.log('API URL:', apiUrl)
```

This ensures that the correct environment variables are loaded based on the selected environment.

## Step 6: Change Project Name

Change the project name in `package.json` and `package-lock.json`

## Step 7: Run Development Server

To run the project in development mode:

```sh
npm run dev
```

This will start the local development server.
