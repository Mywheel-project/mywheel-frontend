import { useEffect, useId, useRef, useState } from 'react';
import styles from './EditProfileModal.module.css';

// FastAPI 백엔드 주소. 배포 시에는 .env(VITE_API_BASE_URL)로 분리하는 게 좋다.
const API_BASE_URL = 'http://localhost:8000';

function EditProfileModal({
  isOpen,
  onClose,
  userId,
  initialName = '닉네임(이름)',
  initialEmail = 'example@gmail.com',
  onConfirm,
}) {
  const titleId = useId();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [previewUrl, setPreviewUrl] = useState(null);
  // 제출 중 중복 클릭 방지 + 에러 메시지 표시용 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setName(initialName);
    setEmail(initialEmail);
    setPreviewUrl(null);
    setErrorMessage('');

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
  }, [isOpen, initialName, initialEmail, onClose]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirm = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // 프로필 사진(previewUrl)은 아직 서버에 반영하지 않고, 닉네임/이메일만 수정한다.
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({ email, nickname: name }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = body?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(', ')
          : detail || '회원 정보 수정에 실패했습니다.';
        throw new Error(message);
      }

      // body 는 DB에 반영된 최신 { id, email, nickname, profile_image } - 그대로 상위로 전달한다.
      onConfirm?.(body);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
            회원정보수정
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
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              {previewUrl ? (
                <img src={previewUrl} alt="프로필 미리보기" />
              ) : (
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="32" cy="32" r="30" stroke="#111" strokeWidth="2" fill="#fff" />
                  <circle cx="32" cy="24" r="10" fill="#111" />
                  <path
                    d="M12 54c2.5-11 10.5-17 20-17s17.5 6 20 17"
                    fill="#111"
                  />
                </svg>
              )}
            </div>
            <button type="button" className={styles.addPhotoBtn} onClick={handleAddPhoto}>
              프로필 사진 추가
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </div>

          <div className={styles.fields}>
            <label className={styles.fieldRow}>
              <span className={styles.label}>이름 :</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className={styles.fieldRow}>
              <span className={styles.label}>이메일 :</span>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </div>

          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
