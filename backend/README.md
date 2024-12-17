## Initial Project Setup Steps:

1. Project init

   ```bash
     yarn init
   ```

2. Install required packages for initial setup

   ```bash
     yarn add express mongoose

     yarn add -D eslint prettier
     yarn add -D eslint-config-prettier eslint-plugin-prettier eslint-plugin-import
   ```

3. Create essential config files for prettier, eslint and `jsconfig.json`:

   ```js
   // eslint.config.js (create this at root)

   import eslint from '@eslint/js';
   import importPlugin from 'eslint-plugin-import';
   import prettier from 'eslint-plugin-prettier';

   export default [
     eslint.configs.recommended,
     {
       plugins: {
         prettier,
         import: importPlugin,
       },
       languageOptions: {
         globals: {
           console: 'readonly',
           process: 'readonly',
         },
         parserOptions: {
           ecmaVersion: 'latest',
           sourceType: 'module',
           ecmaFeatures: {
             node: true,
           },
         },
       },
       rules: {
         // Formatting
         'prettier/prettier': [
           'error',
           {
             prettierPath: './prettierrc',
           },
         ],
         // Basic Error Handling
         'no-unused-vars': 'warn',
         'no-console': [
           'warn',
           {
             allow: ['error', 'warn', 'info'],
           },
         ],

         // Import Best Practices
         'import/order': [
           'error',
           {
             groups: [
               ['builtin', 'external'],
               ['internal', 'parent', 'sibling', 'index'],
             ],
             'newlines-between': 'always',
             alphabetize: {
               order: 'asc',
               caseInsensitive: true,
             },
           },
         ],
         'import/newline-after-import': 'error',
         'import/no-duplicates': 'error',

         // Basic Error Prevention
         eqeqeq: ['error', 'smart'],
         'no-return-await': 'error',
       },
     },
   ];
   ```

   ```json
   // .prettierrc (create this at root)

   {
     "singleQuote": true,
     "trailingComma": "es5",
     "semi": true,
     "tabWidth": 2,
     "printWidth": 120,
     "arrowParens": "always",
     "bracketSpacing": true,
     "endOfLine": "auto"
   }
   ```

   and

   ```json
   //jsconfig.json

   {
     "compilerOptions": {
       "module": "ESNext",
       "moduleResolution": "node",
       "target": "ES2022",
       "checkJs": true,
       "allowSyntheticDefaultImports": true,
       "esModuleInterop": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

## Authentication and Authorization

Run this command to generate `JWT Secrets` used in .env

```node
node -e "console.log(require('crypto').randomBytes(128).toString('base64'));"
```

## API Endpoints

### 1. **User Registration**

**POST Request:**  
`http://localhost:8080/api/auth/register`

#### Request Body (Example):

```json
{
  "firstName": "afnan",
  "lastName": "mumu",
  "email": "abc@gmail.com",
  "contactNumber": "01773046092",
  "password": "Abc123sd"
}
```

### 2. **User Login**

**POST Request:**  
`http://localhost:8080/api/auth/login`

#### Request Body (Example):

```json
{
  "email": "abc@gmail.com",
  "password": "Abc123sd"
}
```

### 3. **User Profile**

#### Request Header (Example):

```bash
AUTH BEARER <TOKEN>
```
