import app from './app.js';
import { connectDB, closeConnection } from './config/database.js';

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.info(`\n🚀 Server running on port ${PORT}`);
      console.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error) => {
      console.error('Server Error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('🚨 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', closeConnection);

export default app;
