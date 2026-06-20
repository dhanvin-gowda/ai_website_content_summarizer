import 'dotenv/config';
import connectDB from './database.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
