# BUILD GUIDELINES

## Step 1: Check ENV Variables

#### Check and ensure your environment variables are correctly set before running any build commands.

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

## Step 2: Build

### Production Build

To generate a production build and preview it:

```sh
npm run prod-build
```

This will:

1. Generate the production build as `/dist` folder.
2. Start a preview server in production mode.

### Test Build

To generate a test build and preview it:

```sh
npm run test-build
```

This will:

1. Generate the test environment build as `/dist` folder.
2. Start a preview server in test mode.

## Step 3: Create and Manage Build Artifacts (Optional)

After generating the build, follow these steps to organize and store the build files:

To generate the zip file:

```sh
npm run save-zip
```

(or)

Manually create the zip file,

- Create a ZIP Archive.
- Create the `build_zips` Folder (if not exists) and add it in `.gitignore` (if not exists).
- Rename your folder and Move the Build ZIP to `build_zips` Folder.
- Delete the `dist/` Folder.
- Send the new build ZIP File to the Deployment Team.

Following these guidelines will ensure a smooth build process and maintain project consistency.
