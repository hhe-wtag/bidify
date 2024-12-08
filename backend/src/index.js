import express from 'express';

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to your Express app!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
