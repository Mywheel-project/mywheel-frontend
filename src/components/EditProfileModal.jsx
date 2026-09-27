import { useEffect, useId, useRef, useState } from 'react';
import styles from './EditProfileModal.module.css';

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
            회원정보 수정
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.profileRow}>
            <div className={styles.avatar}>
              {previewUrl ? (
                <img src={previewUrl} alt="프로필 미리보기" />
              ) : (
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="32" cy="32" r="32" fill="#E2E4E8" />
                  <circle cx="32" cy="24" r="11" fill="#888899" />
                  <path
                    d="M12 56c0-11 9-20 20-20s20 9 20 20"
                    fill="#888899"
                  />
                </svg>
              )}
            </div>
            <div className={styles.photoActions}>
              <button type="button" className={styles.addPhotoBtn} onClick={handleAddPhoto}>
                프로필 사진 변경
              </button>
              <p className={styles.photoHint}>JPG, PNG 이미지 권장</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleFileChange}
            />
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <label className={styles.label}>닉네임</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="닉네임을 입력하세요"
              />
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.label}>이메일</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </div>
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
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
