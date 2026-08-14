import { useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3000/api';

// Icono SVG de ticket de cine para usar como fallback y decoraciones
const TicketIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, color: 'var(--accent-gold)' }}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

function App() {
  const [view, setView] = useState('search'); // 'search' o 'detail'
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de detalle
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Estados del formulario de reseñas
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Función para realizar la búsqueda
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/movies?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Error al buscar películas en el servidor.');
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 3000.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los detalles de una película
  const handleMovieSelect = async (movieId) => {
    setSelectedMovieId(movieId);
    setView('detail');
    setDetailLoading(true);
    setDetailError(null);

    try {
      const response = await fetch(`${API_BASE}/movies/${movieId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los detalles de la película.');
      }
      const data = await response.json();
      setSelectedMovie(data);
    } catch (err) {
      console.error(err);
      setDetailError('Error al cargar la información detallada.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Función para volver a la búsqueda
  const handleBackToSearch = () => {
    setView('search');
    setSelectedMovie(null);
    setSelectedMovieId(null);
  };

  // Función para enviar una reseña
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formContent.trim()) {
      setReviewError('Todos los campos son obligatorios.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const response = await fetch(`${API_BASE}/movies/${selectedMovieId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formName,
          content: formContent,
          rating: formRating
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar la reseña.');
      }

      const newReview = await response.json();

      // Actualizar localmente los datos de la película para reflejar la nueva reseña de inmediato
      setSelectedMovie((prev) => {
        if (!prev) return null;
        const updatedReviews = [newReview, ...(prev.reviews || [])];
        const newCount = updatedReviews.length;
        const newAverage = parseFloat(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1)
        );
        return {
          ...prev,
          reviews: updatedReviews,
          reviewCount: newCount,
          averageRating: newAverage
        };
      });

      // Limpiar formulario
      setFormName('');
      setFormContent('');
      setFormRating(5);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper para obtener el año a partir de la fecha de lanzamiento
  const getYear = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('-')[0];
  };

  // Helper para renderizar estrellas de puntuación
  const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return <span className="no-rating">Sin calificaciones</span>;
    }
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= roundedRating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return (
      <div className="stars-wrapper">
        <div className="stars">{stars}</div>
        <span className="rating-num">{rating} / 5</span>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <button className="logo-btn" onClick={handleBackToSearch}>
            <span className="logo-gold">THE</span>
            <span className="logo-red">CLUB</span>
          </button>
          <span className="header-subtitle">Salón de Cine Elegante</span>
        </div>
      </header>

      <main className="main-content">
        {view === 'search' ? (
          /* VISTA 1: BÚSQUEDA */
          <div className="view-search animate-fade-in">
            <section className="search-section">
              <h2 className="section-title">Busca tu Función</h2>
              <form onSubmit={handleSearch} className="search-box">
                <input
                  type="text"
                  placeholder="Introduce el título de la película o director..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
                <button type="submit" className="search-btn">
                  Buscar
                </button>
              </form>
            </section>

            {loading ? (
              <div className="loading-container">
                <div className="curtain-loader"></div>
                <p>Abriendo cortinas...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : movies.length > 0 ? (
              <section className="results-section">
                <h3 className="results-title">Resultados de la Búsqueda</h3>
                <div className="movie-grid">
                  {movies.map((movie) => (
                    <div key={movie.id} className="movie-card" onClick={() => handleMovieSelect(movie.id)}>
                      <div className="card-poster-wrapper">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="card-poster"
                          />
                        ) : (
                          <div className="card-poster-fallback">
                            <TicketIcon />
                          </div>
                        )}
                        <div className="card-overlay">
                          <span className="btn-details">Ver Detalle</span>
                        </div>
                      </div>
                      <div className="card-info">
                        <h4 className="card-title">{movie.title}</h4>
                        <div className="card-meta">
                          <span className="card-year">{getYear(movie.release_date)}</span>
                          <span className="card-score">
                            ★ {movie.averageRating !== null && movie.averageRating !== undefined ? movie.averageRating : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="welcome-banner">
                <TicketIcon />
                <h3>Bienvenidos a The Club</h3>
                <p>Encuentra tus películas favoritas, lee reseñas y comparte tu opinión.</p>
              </div>
            )}
          </div>
        ) : (
          /* VISTA 2: DETALLE */
          <div className="view-detail animate-fade-in">
            <div className="navigation-bar">
              <button className="btn-back" onClick={handleBackToSearch}>
                ← Volver a Búsqueda
              </button>
            </div>

            {detailLoading ? (
              <div className="loading-container">
                <div className="curtain-loader"></div>
                <p>Cargando detalles de la función...</p>
              </div>
            ) : detailError ? (
              <div className="error-message">
                <p>{detailError}</p>
                <button className="btn-retry" onClick={() => handleMovieSelect(selectedMovieId)}>
                  Reintentar
                </button>
              </div>
            ) : selectedMovie ? (
              <div className="detail-layout">
                {/* Cabecera del detalle */}
                <section className="detail-movie-info">
                  <div className="detail-poster-column">
                    {selectedMovie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                        alt={selectedMovie.title}
                        className="detail-poster"
                      />
                    ) : (
                      <div className="detail-poster-fallback">
                        <TicketIcon />
                      </div>
                    )}
                  </div>

                  <div className="detail-meta-column">
                    <h2 className="detail-title">{selectedMovie.title}</h2>
                    <div className="detail-badges">
                      <span className="badge year">{getYear(selectedMovie.release_date)}</span>
                      {selectedMovie.runtime && (
                        <span className="badge runtime">{selectedMovie.runtime} min</span>
                      )}
                      {selectedMovie.director && (
                        <span className="badge director">Director: {selectedMovie.director}</span>
                      )}
                    </div>

                    <div className="detail-rating-score">
                      {renderStars(selectedMovie.averageRating)}
                      <span className="review-count-badge">
                        ({selectedMovie.reviewCount || 0} {selectedMovie.reviewCount === 1 ? 'reseña' : 'reseñas'})
                      </span>
                    </div>

                    <h3 className="detail-section-title">Sinopsis</h3>
                    <p className="detail-overview">
                      {selectedMovie.overview || 'Sin sinopsis disponible.'}
                    </p>

                    {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                      <div className="detail-genres">
                        <strong>Géneros:</strong>{' '}
                        {selectedMovie.genres.map((g) => g.name).join(', ')}
                      </div>
                    )}
                  </div>
                </section>

                <div className="reviews-split-grid">
                  {/* Lista de Reseñas */}
                  <section className="reviews-list-section">
                    <h3 className="section-title">Reseñas de la Comunidad</h3>
                    {selectedMovie.reviews && selectedMovie.reviews.length > 0 ? (
                      <div className="reviews-container">
                        {selectedMovie.reviews.map((review) => (
                          <div key={review.id} className="review-card">
                            <div className="review-card-header">
                              <div className="review-author">
                                <span className="avatar-letter">
                                  {review.name ? review.name.charAt(0).toUpperCase() : '?'}
                                </span>
                                <h4>{review.name}</h4>
                              </div>
                              <div className="review-rating">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`star-small ${idx < review.rating ? 'filled' : ''}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="review-content-text">{review.content}</p>
                            {review.createdAt && (
                              <span className="review-date">{review.createdAt}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-reviews-box">
                        <p>Nadie ha escrito una reseña para esta película. ¡Sé el primero!</p>
                      </div>
                    )}
                  </section>

                  {/* Formulario de Reseña */}
                  <section className="add-review-section">
                    <h3 className="section-title">Dejar tu Calificación</h3>
                    <form onSubmit={handleReviewSubmit} className="review-form">
                      {reviewError && <div className="form-error">{reviewError}</div>}

                      <div className="form-group">
                        <label htmlFor="reviewer-name">Tu Nombre</label>
                        <input
                          id="reviewer-name"
                          type="text"
                          className="form-input"
                          placeholder="Ej. Sofía Martínez"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Puntuación</label>
                        <div className="star-selector">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={`selector-star-btn ${num <= formRating ? 'active' : ''}`}
                              onClick={() => setFormRating(num)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="reviewer-content">Tu Reseña / Comentario</label>
                        <textarea
                          id="reviewer-content"
                          className="form-input textarea"
                          placeholder="¿Qué te pareció la película? Escribe tu reseña..."
                          value={formContent}
                          onChange={(e) => setFormContent(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-submit-review"
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
                      </button>
                    </form>
                  </section>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} The Club. Todos los derechos reservados.</p>
        <p className="footer-gold">Una experiencia cinematográfica inigualable</p>
      </footer>
    </div>
  );
}

export default App;
