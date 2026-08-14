import React from 'react';

// Icono SVG de estrella pequeña con soporte para media estrella
const StarIconSmall = ({ filledType }) => {
  if (filledType === 'full') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-gold)" stroke="var(--accent-gold)" strokeWidth="1" className="star-small-svg">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    );
  }
  if (filledType === 'half') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1" className="star-small-svg">
        <defs>
          <linearGradient id="halfGradSmall">
            <stop offset="50%" stopColor="var(--accent-gold)" />
            <stop offset="50%" stopColor="rgba(223, 177, 91, 0.15)" />
          </linearGradient>
        </defs>
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="url(#halfGradSmall)" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(223, 177, 91, 0.15)" stroke="var(--accent-gold)" strokeWidth="1" className="star-small-svg" style={{ opacity: 0.5 }}>
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
    </svg>
  );
};

const ReviewList = ({ reviews, reviewToDelete, setReviewToDelete, handleReviewDelete }) => {
  return (
    <section className="reviews-list-section">
      <h3 className="section-title">Reseñas de la Comunidad</h3>
      {reviews && reviews.length > 0 ? (
        <div className="reviews-container">
          {reviews.map((review) => (
            <div key={review.id} className="review-card animate-fade-in">
              {reviewToDelete === review.id ? (
                <div className="review-delete-confirm">
                  <p>¿Seguro que deseas eliminar esta reseña?</p>
                  <div className="confirm-buttons">
                    <button className="btn-cancel-delete" onClick={() => setReviewToDelete(null)}>
                      Cancelar
                    </button>
                    <button className="btn-confirm-delete" onClick={() => handleReviewDelete(review.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="review-card-header">
                    <div className="review-author">
                      <span className="avatar-letter">
                        {review.author ? review.author.charAt(0).toUpperCase() : '?'}
                      </span>
                      <h4>{review.author}</h4>
                    </div>
                    <div className="review-meta-right">
                      <div className="review-rating" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((num) => {
                          let filledType = 'empty';
                          if (review.score >= num) {
                            filledType = 'full';
                          } else if (review.score === num - 0.5) {
                            filledType = 'half';
                          }
                          return <StarIconSmall key={num} filledType={filledType} />;
                        })}
                        <span className="rating-numeric-small" style={{ marginLeft: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-gold)' }}>
                          ({review.score.toFixed(1)})
                        </span>
                      </div>
                      <button 
                        className="btn-delete-review" 
                        onClick={() => setReviewToDelete(review.id)} 
                        title="Eliminar reseña"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="review-content-text">{review.comment}</p>
                  {review.createdAt && (
                    <span className="review-date">{review.createdAt}</span>
                  )}
                </>
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
  );
};

export default ReviewList;
