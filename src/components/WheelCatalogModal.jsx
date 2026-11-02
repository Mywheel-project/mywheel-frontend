import React, { useState, useEffect } from 'react';
import { WHEEL_ASSETS, BRANDS } from '../data/wheels';
import styles from './WheelCatalogModal.module.css';

function WheelCatalogModal({
  isOpen,
  onClose,
  selectedWheelId,
  onSelectWheel,
  favoriteWheelIds = [],
  onToggleFavorite,
}) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredWheels = WHEEL_ASSETS
    .filter((w) => {
      if (selectedBrand === 'ALL') return true;
      if (selectedBrand === '즐겨찾기') return favoriteWheelIds.includes(w.id);
      return w.brand === selectedBrand;
    })
    .sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.modelName.localeCompare(b.modelName);
    });

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3>휠 에셋 카탈로그</h3>
            <p>브랜드별 휠 모델을 둘러보고 즐겨찾기(★)를 등록하세요</p>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 브랜드 탭 필터 */}
        <div className={styles.brandTabsWrapper}>
          {BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              className={`${styles.brandTab} ${selectedBrand === brand ? styles.activeBrandTab : ''}`}
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* 모달 휠 그리드 */}
        <div className={styles.modalWheelGrid}>
          {filteredWheels.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: '#888' }}>
              해당 조건의 휠 에셋이 없습니다.
            </div>
          ) : (
            filteredWheels.map((wheel) => (
              <div
                key={wheel.id}
                className={`${styles.modalWheelCard} ${
                  selectedWheelId === wheel.id ? styles.selectedModalWheel : ''
                }`}
                onClick={() => onSelectWheel && onSelectWheel(wheel.id)}
              >
                {/* 즐겨찾기 별 토글 버튼 */}
                {onToggleFavorite && (
                  <button
                    type="button"
                    className={`${styles.starBtn} ${
                      favoriteWheelIds.includes(wheel.id) ? styles.starActive : ''
                    }`}
                    onClick={(e) => onToggleFavorite(e, wheel.id)}
                    title={favoriteWheelIds.includes(wheel.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    ★
                  </button>
                )}

                <div className={styles.wheelImageFrame}>
                  <img
                    src={wheel.image}
                    alt={wheel.modelName}
                    className={styles.wheelAssetImg}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className={styles.wheelDiscFallback} style={{ display: 'none' }}>
                    <div className={styles.wheelSpokeCross} />
                    <div className={styles.wheelCenterCap} />
                  </div>
                </div>

                <div className={styles.wheelMeta}>
                  <span className={styles.wheelBrandTag}>{wheel.brand}</span>
                  <strong className={styles.wheelModelTitle}>{wheel.modelName}</strong>
                </div>

                {selectedWheelId === wheel.id && <div className={styles.checkBadge}>✓</div>}
              </div>
            ))
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.modalConfirmBtn}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default WheelCatalogModal;
