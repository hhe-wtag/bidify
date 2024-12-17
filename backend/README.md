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
