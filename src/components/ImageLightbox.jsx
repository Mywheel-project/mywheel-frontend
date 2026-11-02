import { useEffect } from 'react';
import styles from './ImageLightbox.module.css';

function ImageLightbox({ isOpen, imageUrl, onClose }) {
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

  if (!isOpen || !imageUrl) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
        ×
      </button>
      <img src={imageUrl} alt="원본 크기 이미지" className={styles.image} />
    </div>
  );
}

export default ImageLightbox;
