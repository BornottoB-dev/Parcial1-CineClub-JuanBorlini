const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('CineClub API is running...');
});

app.listen(PORT, () => {
  console.log(`CineClub Backend running on http://localhost:${PORT}`);
});
