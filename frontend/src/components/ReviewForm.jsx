import React, { useState } from 'react';

// Icono SVG de estrella con soporte para relleno completo, medio o vacío
const StarIcon = ({ filledType }) => {
  if (filledType === 'full') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent-gold)" stroke="var(--accent-gold)" strokeWidth="1" className="selector-star">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    );
  }
  if (filledType === 'half') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="1" className="selector-star">
        <defs>
          <linearGradient id="halfGrad">
            <stop offset="50%" stopColor="var(--accent-gold)" />
            <stop offset="50%" stopColor="rgba(223, 177, 91, 0.15)" />
          </linearGradient>
        </defs>
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="url(#halfGrad)" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(223, 177, 91, 0.15)" stroke="var(--accent-gold)" strokeWidth="1" className="selector-star" style={{ opacity: 0.5 }}>
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
    </svg>
  );
};

const ReviewForm = ({
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
  const [hoverRating, setHoverRating] = useState(null);

  const handleMouseMove = (e, num) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const val = isHalf ? num - 0.5 : num;
    // Evitar que se elija 0.5 (mínimo de 1.0)
    setHoverRating(val < 1 ? 1 : val);
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const handleClick = (e, num) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const val = isHalf ? num - 0.5 : num;
    // Evitar que se elija 0.5 (mínimo de 1.0)
    const finalVal = val < 1 ? 1 : val;
    setFormRating(finalVal);
  };

  const displayRating = hoverRating !== null ? hoverRating : formRating;

  return (
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
          <label>Puntuación: <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{displayRating.toFixed(1)} ★</span></label>
          <div className="star-selector" onMouseLeave={handleMouseLeave} style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((num) => {
              let filledType = 'empty';
              if (displayRating >= num) {
                filledType = 'full';
              } else if (displayRating === num - 0.5) {
                filledType = 'half';
              }

              return (
                <button
                  key={num}
                  type="button"
                  className="selector-star-btn"
                  onMouseMove={(e) => handleMouseMove(e, num)}
                  onClick={(e) => handleClick(e, num)}
                  style={{ background: 'none', border: 'none', padding: '0 2px', cursor: 'pointer', outline: 'none' }}
                >
                  <StarIcon filledType={filledType} />
                </button>
              );
            })}
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
  );
};

export default ReviewForm;
