import { useEffect, useId, useRef, useState } from 'react';
import styles from './EditVehicleModal.module.css';

const API_BASE_URL = 'http://localhost:8000';

const EMPTY_VEHICLE = {
  name: '',
  pcd: '',
  hole_count: '',
  hub_bore: '',
  bolt_spec: '',
};

function EditVehicleModal({ isOpen, onClose, userId, vehicle, onConfirm }) {
  const titleId = useId();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_VEHICLE);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: vehicle?.name ?? '',
      pcd: vehicle?.pcd ?? '',
      hole_count: vehicle?.hole_count ?? '',
      hub_bore: vehicle?.hub_bore ?? '',
      bolt_spec: vehicle?.bolt_spec ?? '',
    });
    setImageFile(null);
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
  }, [isOpen, vehicle, onClose]);

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
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleConfirm = async () => {
    if (!form.name.trim()) {
      setErrorMessage('차종명을 입력해 주세요.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('pcd', form.pcd);
      formData.append('hole_count', form.hole_count);
      formData.append('hub_bore', form.hub_bore);
      formData.append('bolt_spec', form.bolt_spec);
      if (imageFile) formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/vehicles/me`, {
        method: 'PUT',
        headers: { 'X-User-Id': String(userId) },
        body: formData,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = body?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(', ')
          : detail || '차량 정보 저장에 실패했습니다.';
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

  const displayImage = previewUrl ?? vehicle?.image_url ?? null;

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
            {vehicle ? '내 차량 정보 수정' : '내 차량 등록'}
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
          <div className={styles.photoRow}>
            <div className={styles.photo}>
              {displayImage ? (
                <img src={displayImage} alt="차량 사진 미리보기" />
              ) : (
                <span className={styles.photoPlaceholder}>등록된 사진 없음</span>
              )}
            </div>
            <div className={styles.photoActions}>
              <button type="button" className={styles.addPhotoBtn} onClick={handleAddPhoto}>
                차량 사진 등록 / 변경
              </button>
              <p className={styles.photoHint}>측면 또는 휠이 잘 보이는 차량 사진</p>
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
              <label className={styles.label}>차종 및 모델명 *</label>
              <input
                type="text"
                className={styles.input}
                value={form.name}
                onChange={handleFieldChange('name')}
                placeholder="예: 현대 아반떼 N, 제네시스 G80"
              />
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.fieldRow}>
                <label className={styles.label}>PCD</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.pcd}
                  onChange={handleFieldChange('pcd')}
                  placeholder="예: 114.3"
                />
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>홀 수 (Hole)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.hole_count}
                  onChange={handleFieldChange('hole_count')}
                  placeholder="예: 5"
                />
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.fieldRow}>
                <label className={styles.label}>허브 보어 (Hub Bore)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.hub_bore}
                  onChange={handleFieldChange('hub_bore')}
                  placeholder="예: 67.1 mm"
                />
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label}>볼트 / 너트 규격</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.bolt_spec}
                  onChange={handleFieldChange('bolt_spec')}
                  placeholder="예: M12 x 1.5"
                />
              </div>
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

export default EditVehicleModal;
