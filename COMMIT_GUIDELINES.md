# Commit Rules

## 1. Pre-Commit Checklist

Before committing any changes, ensure you follow these steps:

#### 1.1 Check `.gitignore` File

- Verify that the `.gitignore` file includes the following:
    - `.env`
    - `dist/`
    - `build/`
    - `build_zips/`
- If any of these are missing, add them before proceeding.

#### 1.2 Ensure there are no console logs (`console.log`) in production code.

### 2. Format Code [ Important ]

- Run the following command to format the code before committing:
    ```sh
    npm run format
    ```

## 3. Commit Guidelines

- Follow proper commit message conventions:
    - Use meaningful and descriptive messages.
    - Follow the format: `<type>: <message>`
        - Example: `add: Implement JWT authentication`
        - Example: `update: Fix button alignment issue`
    - Common types: `add`, `update`, `remove`, `fix`, `refactor`, `docs`, `style`, `test`.

## 4. Push Code to GitHub

Push code to GitHub using Terminal or GitHub Desktop.

Following these rules will ensure a clean and maintainable codebase.
