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

  const handleActionClick = () => {
    const destination = toast.targetUrl || '/mypage';
    dismissToast();
    navigate(destination);
  };

  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toastCard} ${styles[toast.type] || ''}`}>
        <div className={styles.toastHeader}>
          <div className={styles.toastTitleGroup}>
            {toast.type === 'pending' && <span className={styles.spinner} />}
            <h4 className={styles.toastTitle}>
              {toast.title ||
                (toast.type === 'pending'
                  ? '진행 중'
                  : toast.type === 'success'
                  ? '완료'
                  : '안내')}
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
            onClick={handleActionClick}
          >
            {toast.buttonText || '결과 보러가기'}
          </button>
        )}
      </div>
    </div>
  );
}

export default SynthesisToast;
