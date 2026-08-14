const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Función helper para consultar la API de TMDB (soporta API Key normal y Token de acceso de lectura Bearer)
async function fetchFromTMDB(endpoint, params = {}) {
  if (!TMDB_API_KEY || TMDB_API_KEY.trim() === '') {
    throw new Error("No TMDB API Key configured");
  }
  
  const isBearer = TMDB_API_KEY.startsWith('eyJ');
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  
  const headers = {};
  if (isBearer) {
    headers['Authorization'] = `Bearer ${TMDB_API_KEY}`;
  } else {
    url.searchParams.append('api_key', TMDB_API_KEY);
  }
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }
  
  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

app.get('/', (req, res) => {
  res.send('CineClub API is running...');
});

app.listen(PORT, () => {
  console.log(`CineClub Backend running on http://localhost:${PORT}`);
});
