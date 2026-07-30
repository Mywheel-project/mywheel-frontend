import { useEffect, useId } from 'react';
import styles from './WheelDetailModal.module.css';

function WheelDetailModal({ isOpen, onClose, wheel }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !wheel) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            휠 상세정보
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.topSection}>
            <div className={styles.visual}>
              <div className={styles.imageFrame}>
                <img src={wheel.image} alt={wheel.name} />
              </div>
              <p className={styles.wheelName}>{wheel.name}</p>
            </div>

            <div className={styles.specBox}>
              <h3 className={styles.boxTitle}>휠 제원</h3>
              <ul className={styles.specList}>
                {wheel.specs.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.guideBox}>
            <h3 className={styles.boxTitle}>휠 튜닝 시 알아야 할 점 (Fitment 가이드)</h3>
            {wheel.fitmentGuide.map((section) => (
              <div key={section.title} className={styles.guideSection}>
                <h4 className={styles.guideTitle}>{section.title}</h4>
                {section.paragraphs?.map((text) => (
                  <p key={text} className={styles.guideText}>
                    {text}
                  </p>
                ))}
                {section.bullets?.length > 0 && (
                  <ul className={styles.guideBullets}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WheelDetailModal;
