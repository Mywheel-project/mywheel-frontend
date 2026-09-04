import { useEffect, useId, useRef, useState } from 'react';
import styles from './EditProfileModal.module.css';

function EditProfileModal({
  isOpen,
  onClose,
  initialName = '닉네임(이름)',
  initialEmail = 'example@gmail.com',
  onConfirm,
}) {
  const titleId = useId();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setName(initialName);
    setEmail(initialEmail);
    setPreviewUrl(null);

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

  const handleConfirm = () => {
    onConfirm?.({ name, email, previewUrl });
    onClose();
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

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
