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

3. Create essential config files for prettier, eslint and `jsconfig.json`

## Authentication and Authorization

Run this command to generate `JWT Access Secrets` used in .env

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

**GET Request:**
`http://localhost:8080/api/user/profile`

```bash
Authorization: Bearer <token>
```

### 4. **User Profile Update**

#### Request Header (Example):

**PUT Request:**
`http://localhost:8080/api/user/profile/update`

```bash
Authorization: Bearer <token>
```
```bash
{
  "firstName": "John",
  "lastName": "Doe",
  "contactNumber": "01334567890",
  "address": {
    "street": "134566 Main St",
    "city": "Dhaka",
    "country": "Bangladesh"
  }
}
```