import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSynthesis } from '../context/SynthesisContext';
import styles from './SynthesisToast.module.css';

function SynthesisToast() {
  const { toast, dismissToast } = useSynthesis();
  const navigate = useNavigate();

  // 성공 알림일 경우 15초 후 자동 닫힘
  useEffect(() => {
    if (toast?.type === 'success') {
      const timer = setTimeout(() => {
        dismissToast();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [toast, dismissToast]);

  if (!toast || !toast.show) return null;

  const handleGoToMyPage = () => {
    dismissToast();
    navigate('/mypage');
  };

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toastCard} ${styles[toast.type] || ''}`}>
        <div className={styles.toastHeader}>
          <div className={styles.toastTitleGroup}>
            {toast.type === 'pending' && <span className={styles.spinner} />}
            <h4 className={styles.toastTitle}>
              {toast.type === 'pending'
                ? '휠 튜닝 진행 중'
                : toast.type === 'success'
                ? '휠 튜닝 완료'
                : '휠 튜닝 안내'}
            </h4>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={dismissToast}
            title="닫기"
          >
            ✕
          </button>
        </div>

        <div className={styles.toastBody}>
          {toast.resultImageUrl && (
            <div className={styles.thumbWrapper}>
              <img
                src={toast.resultImageUrl}
                alt="완성된 휠 튜닝"
                className={styles.thumbImg}
              />
            </div>
          )}
          <p className={styles.toastMessage}>{toast.message}</p>
        </div>

        {toast.type === 'success' && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={handleGoToMyPage}
          >
            마이페이지 갤러리에서 보기
          </button>
        )}
      </div>
    </div>
  );
}

export default SynthesisToast;
