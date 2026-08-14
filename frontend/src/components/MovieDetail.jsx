import React from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

const TicketIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, color: 'var(--accent-gold)' }}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const StarIconDetail = ({ filledType }) => {
  if (filledType === 'full') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-gold)" stroke="var(--accent-gold)" strokeWidth="1" className="star-detail-svg">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    );
  }
  if (filledType === 'half') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1" className="star-detail-svg">
        <defs>
          <linearGradient id="halfGradDetail">
            <stop offset="50%" stopColor="var(--accent-gold)" />
            <stop offset="50%" stopColor="rgba(223, 177, 91, 0.15)" />
          </linearGradient>
        </defs>
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="url(#halfGradDetail)" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(223, 177, 91, 0.15)" stroke="var(--accent-gold)" strokeWidth="1" className="star-detail-svg" style={{ opacity: 0.5 }}>
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
    </svg>
  );
};

const MovieDetail = ({
  movie,
  detailLoading,
  detailError,
  handleBackToSearch,
  onDirectorClick,
  reviewToDelete,
  setReviewToDelete,
  handleReviewDelete,
  formName,
  setFormName,
  formRating,
  setFormRating,
  formContent,
  setFormContent,
  handleReviewSubmit,
  submittingReview,
  reviewError
}) => {
  const getYear = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('-')[0];
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined) {
      return <span className="no-rating">Sin calificaciones</span>;
    }
    
    // Redondear al 0.5 más cercano
    const roundedRating = Math.round(rating * 2) / 2;

    return (
      <div className="stars-container" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((num) => {
          let filledType = 'empty';
          if (roundedRating >= num) {
            filledType = 'full';
          } else if (roundedRating === num - 0.5) {
            filledType = 'half';
          }
          return <StarIconDetail key={num} filledType={filledType} />;
        })}
        <span className="rating-numeric">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (detailLoading) {
    return (
      <div className="loading-container">
        <div className="curtain-loader"></div>
        <p>Cargando detalles de la función...</p>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="error-message">
        <p>{detailError}</p>
        <button className="btn-retry" onClick={handleBackToSearch}>
          Volver a Búsqueda
        </button>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="view-detail animate-fade-in">
      <div className="navigation-bar">
        <button className="btn-back" onClick={handleBackToSearch}>
          ← Volver a Búsqueda
        </button>
      </div>

      <div className="detail-layout">
        <section className="detail-movie-info">
          <div className="detail-poster-column">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="detail-poster"
              />
            ) : (
              <div className="detail-poster-fallback">
                <TicketIcon />
              </div>
            )}
          </div>

          <div className="detail-meta-column">
            <h2 className="detail-title">{movie.title}</h2>
            <div className="detail-badges">
              <span className="badge year">{getYear(movie.release_date)}</span>
              {movie.runtime && (
                <span className="badge runtime">{movie.runtime} min</span>
              )}
              {movie.director && (
                <span 
                  className="badge director clickable-director" 
                  onClick={() => onDirectorClick && onDirectorClick(movie.director)}
                  title={`Buscar más películas de ${movie.director}`}
                >
                  Director: {movie.director}
                </span>
              )}
            </div>

            <div className="detail-rating-score">
              {renderStars(movie.avgScore)}
              <span className="review-count-badge">
                ({movie.reviewCount || 0} {movie.reviewCount === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>

            <h3 className="detail-section-title">Sinopsis</h3>
            <p className="detail-overview">
              {movie.overview || 'Sin sinopsis disponible.'}
            </p>

            {movie.genres && movie.genres.length > 0 && (
              <div className="detail-genres">
                <strong>Géneros:</strong>{' '}
                {movie.genres.map((g) => g.name).join(', ')}
              </div>
            )}
          </div>
        </section>

        <div className="reviews-split-grid">
          {/* Lista de Reseñas */}
          <ReviewList
            reviews={movie.reviews}
            reviewToDelete={reviewToDelete}
            setReviewToDelete={setReviewToDelete}
            handleReviewDelete={handleReviewDelete}
          />

          {/* Formulario de Reseña */}
          <ReviewForm
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
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
