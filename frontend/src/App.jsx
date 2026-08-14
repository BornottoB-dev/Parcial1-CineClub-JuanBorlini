import { useState } from 'react';
import './App.css';

// Importación de componentes modulares
import SearchBar from './components/SearchBar';
import MovieGrid from './components/MovieGrid';
import MovieDetail from './components/MovieDetail';

// Cargar URL base del backend desde variables de entorno con fallback a localhost:3000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Icono SVG de ticket de cine para usar como fallback y decoraciones
const TicketIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, color: 'var(--accent-gold)' }}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

// Icono SVG de proyector de cine clásico para el Logotipo
const ProjectorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon-svg">
    <circle cx="7" cy="7" r="4" />
    <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    <circle cx="16" cy="6" r="3.5" />
    <circle cx="16" cy="6" r="1.2" fill="currentColor" />
    <rect x="3" y="11" width="14" height="9" rx="2" />
    <path d="m17 13 5-3v8l-5-3Z" fill="currentColor" opacity="0.3" />
    <path d="m17 13 5-3v8l-5-3Z" />
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
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');

  // Función para realizar la búsqueda
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchedTerm(searchQuery);
    try {
      const response = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.status === 404) {
        setMovies([]);
        return;
      }
      if (!response.ok) {
        throw new Error('Error al buscar películas en el servidor.');
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.');
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

    // Limpiar formulario anterior
    setFormName('');
    setFormRating(5);
    setFormContent('');
    setReviewError(null);
    setReviewToDelete(null);

    try {
      const response = await fetch(`${API_BASE}/movies/${movieId}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener los detalles de la película.');
      }
      setSelectedMovie(data);
    } catch (err) {
      console.error(err);
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Función para volver a la página de inicio (resetea todo el estado)
  const handleBackToHome = () => {
    setView('search');
    setSelectedMovie(null);
    setSelectedMovieId(null);
    setSearchQuery('');
    setMovies([]);
    setHasSearched(false);
    setSearchedTerm('');
  };

  // Función para volver a la búsqueda (mantiene los resultados de la última búsqueda)
  const handleBackToSearch = () => {
    setView('search');
    setSelectedMovie(null);
    setSelectedMovieId(null);
  };

  // Función para enviar una reseña
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // Validación básica: no permitir campos vacíos
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
          author: formName.trim(),
          score: formRating,
          comment: formContent
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
          (updatedReviews.reduce((sum, r) => sum + r.score, 0) / newCount).toFixed(1)
        );
        return {
          ...prev,
          reviews: updatedReviews,
          reviewCount: newCount,
          avgScore: newAverage
        };
      });

      // Limpiar campos del formulario
      setFormName('');
      setFormRating(5);
      setFormContent('');
    } catch (err) {
      console.error(err);
      setReviewError(err.message || 'Error al enviar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Función para eliminar una reseña
  const handleReviewDelete = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al eliminar la reseña.');
      }

      // Actualizar localmente los datos de la película para reflejar la eliminación
      setSelectedMovie((prev) => {
        if (!prev) return null;
        const updatedReviews = (prev.reviews || []).filter(r => r.id !== reviewId);
        const newCount = updatedReviews.length;
        const newAverage = newCount > 0
          ? parseFloat((updatedReviews.reduce((sum, r) => sum + r.score, 0) / newCount).toFixed(1))
          : null;
        return {
          ...prev,
          reviews: updatedReviews,
          reviewCount: newCount,
          avgScore: newAverage
        };
      });

      setReviewToDelete(null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'No se pudo eliminar la reseña.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <button className="logo-btn" onClick={handleBackToHome}>
            <ProjectorIcon />
            <span className="logo-gold">THE</span>
            <span className="logo-red">CLUB</span>
          </button>
          <span className="header-subtitle">Reseña y Califica tus Películas Favoritas</span>
        </div>
      </header>

      <main className="main-content">
        {view === 'search' ? (
          /* VISTA 1: BÚSQUEDA */
          <div className="view-search animate-fade-in">
            <section className="search-section">
              <h2 className="section-title">Busca tu Función</h2>
              {/* Barra de Búsqueda */}
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
              />
            </section>

            {/* Estado de carga */}
            {loading ? (
              <div className="loading-container">
                <div className="curtain-loader"></div>
                <p>Buscando en el archivo cinematográfico...</p>
              </div>
            ) : error ? (
              /* Mensaje de error */
              <div className="error-state animate-fade-in">
                <div className="error-card">
                  <h3>Fallo en la Proyección</h3>
                  <p>{error}</p>
                </div>
              </div>
            ) : movies.length > 0 ? (
              /* Grilla de resultados */
              <MovieGrid
                movies={movies}
                handleMovieSelect={handleMovieSelect}
              />
            ) : hasSearched ? (
              /* Sin resultados */
              <div className="welcome-banner animate-fade-in">
                <TicketIcon />
                <h3>No se encontraron resultados</h3>
                <p>No pudimos encontrar ninguna película que coincida con "{searchedTerm}". Intenta con otros términos.</p>
              </div>
            ) : (
              /* Bienvenidos */
              <div className="welcome-banner">
                <TicketIcon />
                <h3>Bienvenidos a The Club</h3>
                <p>Encuentra tus películas favoritas, lee reseñas y comparte tu opinión.</p>
              </div>
            )}
          </div>
        ) : (
          /* VISTA 2: DETALLE */
          <MovieDetail
            movie={selectedMovie}
            detailLoading={detailLoading}
            detailError={detailError}
            handleBackToSearch={handleBackToSearch}
            reviewToDelete={reviewToDelete}
            setReviewToDelete={setReviewToDelete}
            handleReviewDelete={handleReviewDelete}
            formName={formName}
            setFormName={setFormName}
            formRating={formRating}
            setFormRating={setFormRating}
            formContent={formContent}
            setFormContent={setFormContent}
            handleReviewSubmit={handleReviewSubmit}
            submittingReview={submittingReview}
            reviewError={reviewError}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} The Club. Toda opinión es válida.</p>
      </footer>
    </div>
  );
}

export default App;
