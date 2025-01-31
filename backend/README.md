# Bidify - Backend

## Overview

Bidify is a real-time auction platform that allows users to create, manage, and participate in online auctions. The system includes user authentication, item management, bidding functionality, and real-time notifications through WebSocket (Socket.io) integration.

## Tech Stack

- Node.js with Express
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- Multer for File Upload

## Initial Project Setup Steps

1. **Project Prerequisites**

   - Node version >= 20

2. **Install & Run**

   ```bash
   # Clone and navigate to project
   git clone https://github.com/hhe-wtag/bidify.git
   cd bidify/backend

   # Install dependencies
   yarn install

   # Run Dev Server
   yarn dev
   ```

3. **Environment Setup**
   Create a `.env` file with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=any_name
   CORS_ORIGIN=*
   PORT=8080
   NODE_ENV=development
   JWT_ACCESS_SECRET=your_secret
   JWT_ACCESS_EXPIRY=1d
   ```

   Generate JWT secret using:

   ```bash
   node -e "console.log(require('crypto').randomBytes(128).toString('base64'));"
   ```

4. **Datebase Connection & Seeding**

   To seed the database with initial data, use the `seedDatabase.js` script. You have several options to run it:

   ```bash
   # Using default configuration
   node seedDatabase.js

   # Specify custom MongoDB URI and database name
   node seedDatabase.js --uri mongodb+srv://username:password@cluster.mongodb.net --db db_name

   # Force overwrite existing dummy images
   node seedDatabase.js --force

   # View all available options
   node seedDatabase.js --help
   ```

   The script supports the following options:

   - --uri, -u: MongoDB URI (default: mongodb://localhost:27017)
   - --db, -d: Database name (default: bidify_test)
   - --force, -f: Force overwrite existing dummy images
   - --help, -h: Show help message

   The seeder will:

   - Copy dummy images to the uploads directory
   - Create 5 sample users with password "1234Asdf"
   - Create 8 auction items with images
   - Generate sample bids
   - Create corresponding notifications

## Project Structure

The backend project is organized as follows:

```
backend/
├── README.md
├── eslint.config.js
├── jsconfig.json
├── package-lock.json
├── package.json
├── seedDatabase.js               # Script to populate data base with dummy
├── yarn.lock
├── .env.sample
├── .prettierrc
├── dummy_images/                 # Used in seedDatabase.js for items
└── src/
    ├── app.js                    # Main application file where middleware and routes are configured
    ├── server.js                 # Entry point of the server where the app is initialized and listens to requests
    ├── test.js                   # Test file for the application
    ├── config/                    # Configuration files
    │   ├── database.js           # Database connection setup
    │   └── socket.js             # Socket configuration
    ├── controllers/              # Handles requests and responses
    │   ├── BaseController.js
    │   ├── BidController.js
    │   ├── ItemController.js
    │   ├── NotificationController.js
    │   └── UserController.js
    ├── middleware/               # Middleware for authentication, error handling, etc.
    │   ├── auth.js
    │   ├── globalErrorHandler.js
    │   └── multer.js
    ├── models/                   # Mongoose schemas and models
    │   ├── bid.model.js
    │   ├── item.model.js
    │   ├── notification.model.js
    │   └── user.model.js
    ├── repositories/             # Database interaction logic
    │   ├── BaseRepository.js
    │   ├── BidRepository.js
    │   ├── BidSocketRepository.js
    │   ├── ItemRepository.js
    │   ├── NotificationRepository.js
    │   └── UserRepository.js
    ├── routes/                   # API endpoint routes
    │   ├── auth.route.js
    │   ├── bid.route.js
    │   ├── item.route.js
    │   ├── notification.route.js
    │   ├── push.route.js
    │   └── user.route.js
    ├── socket_handlers/          # Real-time socket communication
    │   ├── BaseSocketHandler.js
    │   ├── BidSocketHandler.js
    │   ├── NotificationSocketHandler.js
    │   └── SocketConnection.js
    └── utils/                    # Utility functions and classes
        ├── ApiError.js
        ├── ApiResponse.js
        ├── asyncHandler.js
        ├── handleValidationError.js
        ├── httpStatus.js
        ├── passwordValidation.js
        ├── pushNotification.js
        └── socketConstants.js
```

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
"firstName": "John",
"lastName": "Doe",
"email": "john@example.com",
"contactNumber": "1234567890",
"password": "StrongPass123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

### User Management Endpoints

#### Get Profile

```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/user/profile/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "contactNumber": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "country": "Country"
  }
}
```

### Item Management Endpoints

#### Create Item

```http
POST /api/item/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Vintage Item",
  "description": "Description here",
  "startingBid": 100,
  "minimumBidIncrement": 10,
  "endTime": "2025-12-31T23:59:59Z",
  "images": [File]
}
```

#### Get Items

- Get All Items: `GET /api/item/all`
- Get by Slug: `GET /api/item/:slug`
- Get User's Listed Items: `GET /api/item/user-enlisted-items`
- Get User's Winning Items: `GET /api/item/user-winning-items`

#### Update Item

```http
PATCH /api/item/update/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Item

```http
DELETE /api/item/delete/:id
Authorization: Bearer <token>
```

### Bidding Endpoints

#### Place Bid

```http
POST /api/bid/place-bid
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "item_id_here",
  "incrementBidAmount": 20
}
```

#### Get Latest Bids

```http
GET /api/bid/latest-10-bids?itemId=item_id_here
Authorization: Bearer <token>
```

### Notification Endpoints

#### Get Notifications

```http
GET /api/notification
Authorization: Bearer <token>
```

#### Mark Notification as Read

```http
PUT /api/notification/:notificationId/mark-read
Authorization: Bearer <token>
```

## WebSocket Integration

### WebSocket Connection

### 1. Architecture

```mermaid
graph TD
    A[server.js] --> B[socket.js]
    B --> C[SocketConnection.js]
    C --> D[Feature Handlers]
    D --> E[BaseHandler.js]

    subgraph "Feature Handlers"
        D1[BidSocketHandler.js]
        D2[NotificationHandler.js]
    end

    D1 & D2 --> E

    subgraph "Main Namespace '/'"
        N1[Socket Connection Manager]
    end

    C --> N1

    subgraph "Room"
        R1[Item Room]
    end

    N1 --> R1

    subgraph "Events"
        E1[Connection Events]
        E2[Bid Events]
        E3[Room Events]
        E4[User Events]
        E5[Notification Events<br>Broadcast to All Users]
    end

    R1 --> E1 & E2 & E3 & E4
    N1 --> E5
```

### 2. Implementation Steps

1. **Create Feature Handler**

```javascript
// filepath: /socketHandlers/YourFeatureHandler.js
import BaseSocketHandler from './BaseHandler.js';

class YourFeatureHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
  }

  handleSomeEvent = (socket, data) => {
    // Handle event
    this.emitToRoom(`room-${data.id}`, 'event-name', data);
  };
}
```

### 3. Register in SocketConnection

```js
// In SocketConnection.js
import YourFeatureHandler from './YourFeatureHandler.js';

class SocketConnection {
  constructor(io) {
    this.featureHandler = new YourFeatureHandler(io);
  }

  initialize() {
    this.io.on('connection', (socket) => {
      socket.on('your-event', (data) => {
        this.featureHandler.handleSomeEvent(socket, data);
      });
    });
  }
}
```

#### 4. Available Methods

- emitToRoom(room, event, data): Emit to all in room
- broadcastToRoom(socket, room, event, data): Emit to all except sender
- emitToUser(socketId, event, data): Emit to specific user

#### 5. Event Flow Example

```js
// Client -> Server
socket.emit('join-room', roomId);

// Server -> Room
this.emitToRoom(`room-${roomId}`, 'user-joined', userData);

// Server -> Individual
this.emitToUser(socketId, 'private-message', message);
```

```javascript
// Client-side connection
const socket = io('http://localhost:8080', {
  auth: {
    token: 'your_jwt_token',
  },
});

// Listen for events
socket.on('bid-placed', (data) => {
  console.log('New bid:', data);
});

// Join auction room
socket.emit('join-auction', { auctionId: 'auction_id_here' });
```

### Event Types

#### Connection Events

- `connection`: Socket connection established
- `disconnect`: Socket disconnection
- `error`: Error event

#### Bid Events

- `join-item-room`: Join an item's auction room
- `leave-item-room`: Leave an item's auction room
- `place-bid`: Submit a new bid
- `place-bid-result`: Result of bid placement
- `new-bid-placed`: Broadcast when new bid is placed
- `auction-ended`: Auction time has expired
- `item-sold`: Item has been sold

#### Room Events

- `user-joined-room`: User entered a room
- `user-left-room`: User left a room

#### User Events

- `user-connected`: User connected to socket
- `user-disconnected`: User disconnected from socket

#### Notification Events

- `mark-all-read`: Mark all notifications as read
- `mark-as-read`: Mark specific notification as read
- `place-bid-notification`: New bid placed notification
- `outbid-notification`: User has been outbid
- `auction-winner`: Auction winner notification
- `auction-end`: Auction ended notification
- `auction-canceled`: Auction canceled notification

#### Admin Events

- `get-active-users`: Request active users list
- `active-users-list`: Response with active users
- `get-room-users`: Request users in a room
- `room-users-list`: Response with room users

### Response Types

```javascript
const RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
};
```

### WebSocket Connection Examples

#### Basic Connection

```javascript
// Client-side connection
const socket = io('http://localhost:8080', {
  auth: {
    token: 'your_jwt_token',
  },
});
```

#### Joining Auction Room

```javascript
// Join an auction room
socket.emit('join-item-room', { itemId: 'item_id_here' });

// Listen for new bids
socket.on('new-bid-placed', (data) => {
  console.log('New bid:', data);
});

// Listen for auction end
socket.on('auction-ended', (data) => {
  console.log('Auction ended:', data);
});
```

#### Placing Bids

```javascript
// Place a bid
socket.emit('place-bid', {
  itemId: 'item_id_here',
  amount: 100,
});

// Listen for bid result
socket.on('place-bid-result', (result) => {
  if (result.type === RESPONSE_TYPES.SUCCESS) {
    console.log('Bid placed successfully');
  } else {
    console.log('Bid failed:', result.message);
  }
});
```

#### Handling Notifications

```javascript
// Connect to notification namespace
const notificationSocket = io('/notification', {
  auth: { token: 'your_jwt_token' },
});

// Listen for various notification types
notificationSocket.on('place-bid-notification', (data) => {
  console.log('New bid placed:', data);
});

notificationSocket.on('outbid-notification', (data) => {
  console.log('You have been outbid:', data);
});

notificationSocket.on('auction-winner', (data) => {
  console.log('Auction won:', data);
});

// Mark notifications as read
notificationSocket.emit('mark-as-read', {
  notificationId: 'notification_id_here',
});
```

#### Admin Monitoring

We have created a basic setup for monitoring all the events in our server using the `https://admin.socket.io/` site.

Steps to follow:

1. Visit the site `https://admin.socket.io/`.
2. Use this credentials to login
   ![https://admin.socket.io](/backend/docs/admin_socket_io.png)

## Push Notification Service

#### 1. Generate Vapid Keys

To enable Web Push Notifications, you need to generate VAPID keys and configure them in both the backend and frontend.

## Steps to Generate VAPID Keys:

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Generate VAPID keys using the web-push library:**:

   ```bash
   .\node_modules\.bin\web-push generate-vapid-keys
   ```

3. **Save the keys in the respective .env files:**:

- Copy the generated Public Key and Private Key.
- In the backend's .env file, add the following:
  ```bash
  VAPID_PUBLIC_KEY=<your_generated_public_key>
  VAPID_PRIVATE_KEY=<your_generated_private_key>
  ```
- In the frontend's .env file, add the public key:
  ```bash
  VITE_VAPID_PUBLIC_KEY=<your_generated_public_key>
  ```

## Security Considerations

1. **Authentication**

   - All tokens are JWT-based
   - Tokens expire after 24 hours
   - Passwords are hashed using bcrypt

2. **Authorization**

   - Item modifications restricted to sellers
   - Bid placement requires authentication
   - Profile updates restricted to own profile

3. **Input Validation**
   - All inputs are validated before processing
   - File uploads restricted to images
   - Bid amounts validated against minimum increment

## Error Handling

The API uses standard HTTP status codes and `gloabalErrorHander.js` middleware to return errors in the following format:

```json
{
  "statusCode": 400 - 500,
  "data": [],
  "message": "Error Message",
  "success": false,
  "error": "Additional error details"
  }
}
```
