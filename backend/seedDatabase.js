import bcrypt from 'bcrypt';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyDummyImages(forceOverwrite = false) {
  const sourceDir = path.join(__dirname, 'dummy_images');
  const targetDir = path.join(__dirname, 'public', 'uploads');
  let copied = 0,
    skipped = 0;

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      if (fs.existsSync(targetPath) && !forceOverwrite) {
        console.log(`⚠️  Skipping ${file} (already exists)`);
        skipped++;
        continue;
      }

      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Copied ${file}`);
      copied++;
    }

    console.log(`\n📁 Summary: ${copied} copied, ${skipped} skipped`);
  } catch (error) {
    console.error('✗ Error copying dummy images:', error);
    process.exit(1);
  }
}

// MongoDB connection string
const MONGODB_URI = 'your_secret_uri';
const DB_NAME = 'bidify_test';

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    contactNumber: String,
    password: String,
    address: Object,
    balance: Number,
    registrationDate: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    sellerId: mongoose.Schema.Types.ObjectId,
    startingBid: Number,
    status: String,
    endTime: Date,
    minimumBidIncrement: Number,
    latestBid: Number,
    lastBidId: mongoose.Schema.Types.ObjectId,
    slug: String,
    images: Object,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

const bidSchema = new mongoose.Schema(
  {
    itemId: mongoose.Schema.Types.ObjectId,
    bidderId: mongoose.Schema.Types.ObjectId,
    incrementBidAmount: Number,
    lastBidAmount: Number,
    latestBidAmount: Number,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    itemId: mongoose.Schema.Types.ObjectId,
    type: String,
    message: String,
    preview: String,
    read: Boolean,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);
const Bid = mongoose.model('Bid', bidSchema);
const Notification = mongoose.model('Notification', notificationSchema);

async function seedDatabase() {
  try {
    await copyDummyImages();
    console.log(MONGODB_URI, DB_NAME);
    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Bid.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // Create users
    const hashedPassword = await bcrypt.hash('1234Asdf', 10);
    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@email.com',
        contactNumber: '01919530898',
        password: hashedPassword,
        address: { street: '123 Main St', city: 'New York' },
        balance: 1000,
        registrationDate: new Date(),
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@email.com',
        contactNumber: '01919530899',
        password: hashedPassword,
        address: { street: '456 Oak St', city: 'Los Angeles' },
        balance: 2000,
        registrationDate: new Date(),
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@email.com',
        contactNumber: '01919530897',
        password: hashedPassword,
        address: { street: '789 Pine St', city: 'Chicago' },
        balance: 1500,
        registrationDate: new Date(),
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@email.com',
        contactNumber: '01919530896',
        password: hashedPassword,
        address: { street: '321 Maple Ave', city: 'Boston' },
        balance: 2500,
        registrationDate: new Date(),
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael@email.com',
        contactNumber: '01919530895',
        password: hashedPassword,
        address: { street: '654 Elm St', city: 'Seattle' },
        balance: 1800,
        registrationDate: new Date(),
      },
    ]);

    // Create items
    const items = await Item.insertMany([
      {
        title: 'Retro Game',
        description: 'A beautiful game is up for sell!',
        sellerId: users[0]._id,
        startingBid: 500,
        status: 'active',
        endTime: new Date('2025-01-19T17:59:59.000Z'),
        minimumBidIncrement: 50,
        latestBid: 650,
        slug: 'retro-game',
        images: {
          filename: `retro_game.jpeg`,
          filepath: `http://localhost:8080/uploads/retro_game.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Vintage Vase',
        description: 'Antique vase from the 18th century',
        sellerId: users[1]._id,
        startingBid: 700,
        status: 'active',
        endTime: new Date('2025-01-20T17:59:59.000Z'),
        minimumBidIncrement: 100,
        latestBid: 800,
        slug: 'vintage-vase',
        images: {
          filename: `vintage_vase.jpeg`,
          filepath: `http://localhost:8080/uploads/vintage_vase.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Classic Watch',
        description: 'Luxury timepiece from the 1960s',
        sellerId: users[2]._id,
        startingBid: 1000,
        status: 'active',
        endTime: new Date('2025-01-21T17:59:59.000Z'),
        minimumBidIncrement: 100,
        latestBid: 1200,
        slug: 'classic-watch',
        images: {
          filename: `classic_watch.jpeg`,
          filepath: `http://localhost:8080/uploads/classic_watch.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Art Deco Lamp',
        description: 'Beautiful vintage lamp from the 1920s',
        sellerId: users[3]._id,
        startingBid: 300,
        status: 'active',
        endTime: new Date('2025-01-22T17:59:59.000Z'),
        minimumBidIncrement: 25,
        latestBid: 400,
        slug: 'art-deco-lamp',
        images: {
          filename: `art_deco_lamp.jpeg`,
          filepath: `http://localhost:8080/uploads/art_deco_lamp.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Vintage Camera',
        description: 'Rare film camera from the 1950s',
        sellerId: users[4]._id,
        startingBid: 800,
        status: 'active',
        endTime: new Date('2025-01-23T17:59:59.000Z'),
        minimumBidIncrement: 75,
        latestBid: 950,
        slug: 'vintage-camera',
        images: {
          filename: `vintage_camera.jpeg`,
          filepath: `http://localhost:8080/uploads/vintage_camera.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Antique Clock',
        description: 'Grandfather clock from the Victorian era',
        sellerId: users[0]._id,
        startingBid: 1500,
        status: 'active',
        endTime: new Date('2025-01-24T17:59:59.000Z'),
        minimumBidIncrement: 150,
        latestBid: 1800,
        slug: 'antique-clock',
        images: {
          filename: `antique_clock.jpeg`,
          filepath: `http://localhost:8080/uploads/antique_clock.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Vinyl Record Collection',
        description: 'Rare collection of jazz vinyl records',
        sellerId: users[1]._id,
        startingBid: 400,
        status: 'active',
        endTime: new Date('2025-01-25T17:59:59.000Z'),
        minimumBidIncrement: 40,
        latestBid: 520,
        slug: 'vinyl-record-collection',
        images: {
          filename: `vinyl_record.jpeg`,
          filepath: `http://localhost:8080/uploads/vinyl_record.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
      {
        title: 'Vintage Typewriter',
        description: 'Working condition typewriter from the 1940s',
        sellerId: users[2]._id,
        startingBid: 600,
        status: 'active',
        endTime: new Date('2025-01-26T17:59:59.000Z'),
        minimumBidIncrement: 50,
        latestBid: 750,
        slug: 'vintage-typewriter',
        images: {
          filename: `vintage_typewriter.jpeg`,
          filepath: `http://localhost:8080/uploads/vintage_typewriter.jpeg`,
          mimetype: 'image/jpeg',
        },
      },
    ]);

    // Create bids
    const bids = await Bid.insertMany([
      {
        itemId: items[0]._id,
        bidderId: users[1]._id,
        incrementBidAmount: 50,
        lastBidAmount: 600,
        latestBidAmount: 650,
      },
      {
        itemId: items[1]._id,
        bidderId: users[2]._id,
        incrementBidAmount: 100,
        lastBidAmount: 700,
        latestBidAmount: 800,
      },
      {
        itemId: items[2]._id,
        bidderId: users[3]._id,
        incrementBidAmount: 100,
        lastBidAmount: 1100,
        latestBidAmount: 1200,
      },
      {
        itemId: items[3]._id,
        bidderId: users[4]._id,
        incrementBidAmount: 25,
        lastBidAmount: 375,
        latestBidAmount: 400,
      },
      {
        itemId: items[4]._id,
        bidderId: users[0]._id,
        incrementBidAmount: 75,
        lastBidAmount: 875,
        latestBidAmount: 950,
      },
      {
        itemId: items[5]._id,
        bidderId: users[1]._id,
        incrementBidAmount: 150,
        lastBidAmount: 1650,
        latestBidAmount: 1800,
      },
      {
        itemId: items[6]._id,
        bidderId: users[2]._id,
        incrementBidAmount: 40,
        lastBidAmount: 480,
        latestBidAmount: 520,
      },
      {
        itemId: items[7]._id,
        bidderId: users[3]._id,
        incrementBidAmount: 50,
        lastBidAmount: 700,
        latestBidAmount: 750,
      },
    ]);

    // Update items with last bid IDs
    await Promise.all(
      items.map((item, index) =>
        Item.findByIdAndUpdate(item._id, { lastBidId: bids[index]._id })
      )
    );

    // Create notifications for all bids
    const notifications = [];
    bids.forEach((bid, index) => {
      // Notification for bidder
      notifications.push({
        userId: bid.bidderId,
        itemId: bid.itemId,
        type: 'BID_PLACED',
        message: `You have placed a bid of $${bid.latestBidAmount} on ${items[index].title}`,
        preview: 'Bid Placed',
        read: false,
      });

      // Notification for seller
      notifications.push({
        userId: items[index].sellerId,
        itemId: bid.itemId,
        type: 'NEW_BID',
        message: `Your item ${items[index].title} received a new bid of $${bid.latestBidAmount}`,
        preview: 'New Bid',
        read: false,
      });
    });

    await Notification.insertMany(notifications);

    console.log('Database seeded successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${items.length} items`);
    console.log(`Created ${bids.length} bids`);
    console.log(`Created ${await Notification.countDocuments()} notifications`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();
