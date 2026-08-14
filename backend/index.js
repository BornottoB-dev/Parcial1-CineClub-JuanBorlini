const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware de logging para todas las requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Datos de reseñas en memoria (se reinician al reiniciar el servidor)
let reviews = [];

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
    const err = new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

// --- Endpoints ---

app.get('/', (req, res) => {
  res.send('The Club API is running...');
});

// 1. GET /api/movies/search?q=:query
app.get('/api/movies/search', async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "El parámetro de búsqueda 'q' es requerido" });
  }

  try {
    const data = await fetchFromTMDB('/search/movie', { query, language: 'es-ES' });
    
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: "No se encontraron películas para tu búsqueda" });
    }
    
    // Mapear los resultados agregando el avgScore calculado localmente
    const results = data.results.map(movie => {
      const movieReviews = reviews.filter(r => r.tmdbId === movie.id);
      const avgScore = movieReviews.length > 0
        ? parseFloat((movieReviews.reduce((sum, r) => sum + r.score, 0) / movieReviews.length).toFixed(1))
        : null;

      return {
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        avgScore
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Error al buscar películas en TMDB:", error);
    res.status(500).json({ error: "Error al comunicarse con la API de TMDB" });
  }
});

// 2. GET /api/movies/:tmdbId
app.get('/api/movies/:tmdbId', async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  if (isNaN(tmdbId)) {
    return res.status(400).json({ error: "ID de película inválido" });
  }

  try {
    // Obtener detalles básicos de la película
    const details = await fetchFromTMDB(`/movie/${tmdbId}`, { language: 'es-ES' });
    
    // Intentar obtener el director de los créditos
    let director = 'Desconocido';
    try {
      const credits = await fetchFromTMDB(`/movie/${tmdbId}/credits`);
      const dirObj = credits.crew.find(c => c.job === 'Director');
      if (dirObj) {
        director = dirObj.name;
      }
    } catch (err) {
      console.warn(`No se pudieron obtener créditos de la película ${tmdbId}:`, err);
    }

    // Obtener las reseñas propias y calcular el avgScore
    const movieReviews = reviews.filter(r => r.tmdbId === tmdbId);
    const avgScore = movieReviews.length > 0
      ? parseFloat((movieReviews.reduce((sum, r) => sum + r.score, 0) / movieReviews.length).toFixed(1))
      : null;

    res.json({
      id: details.id,
      title: details.title,
      release_date: details.release_date,
      overview: details.overview,
      runtime: details.runtime,
      director,
      genres: details.genres,
      poster_path: details.poster_path,
      reviews: movieReviews,
      reviewCount: movieReviews.length,
      avgScore
    });
  } catch (error) {
    console.error(`Error al obtener detalles de la película ${tmdbId}:`, error);
    if (error.status === 404) {
      return res.status(404).json({ error: "Película no encontrada en TMDB" });
    }
    res.status(500).json({ error: "Error al comunicarse con la API de TMDB" });
  }
});

// 3. POST /api/movies/:tmdbId/reviews
app.post('/api/movies/:tmdbId/reviews', (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  if (isNaN(tmdbId)) {
    return res.status(400).json({ error: "ID de película inválido" });
  }

  const { author, score, comment } = req.body;

  if (!author || !author.trim() || !comment || !comment.trim() || score === undefined) {
    return res.status(400).json({ error: "Faltan campos obligatorios (author, score, comment)" });
  }

  const parsedScore = parseFloat(score);
  if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
    return res.status(400).json({ error: "El puntaje (score) debe estar entre 1 y 5" });
  }

  const newReview = {
    id: Date.now(),
    tmdbId,
    author: author.trim(),
    score: parsedScore,
    comment: comment.trim(),
    createdAt: new Date().toISOString().split('T')[0]
  };

  reviews.unshift(newReview);
  res.status(201).json(newReview);
});

// 4. DELETE /api/reviews/:reviewId
app.delete('/api/reviews/:reviewId', (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  if (isNaN(reviewId)) {
    return res.status(400).json({ error: "ID de reseña inválido" });
  }

  const initialLength = reviews.length;
  reviews = reviews.filter(r => r.id !== reviewId);

  if (reviews.length === initialLength) {
    return res.status(404).json({ error: "Reseña no encontrada" });
  }

  res.json({ message: "Reseña eliminada con éxito" });
});

app.listen(PORT, () => {
  console.log(`CineClub Backend running on http://localhost:${PORT}`);
});
