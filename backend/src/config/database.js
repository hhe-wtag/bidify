import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('⛔  MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  try {
    const connectionInstance = await mongoose.connect(
      `${MONGODB_URI}/${DB_NAME}`
    );
    console.info(`🌱  MongoDB connected successfully.`);
    console.info(`    ⊢ 🌐  Host: ${connectionInstance.connection.host}`);
    console.info(
      `    ∟ 🗂️  Database: ${connectionInstance.connection.db.databaseName}`
    );
  } catch (error) {
    console.error('⛔  Error connecting to the database:', error);
    process.exit(1);
  }
};

const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.info('🍃  MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('⛔  Error during graceful shutdown:', error);
    process.exit(1);
  }
};

export { connectDB, closeConnection };
