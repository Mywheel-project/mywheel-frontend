import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUserId, getAuthHeaders } from './utils/authStorage';
import styles from './Community.module.css'; 



function PostCreate() {
  const navigate = useNavigate();
  const userId = getStoredUserId();
  const isLoggedIn = !!userId;

  const [category, setCategory] = useState('Tunning Review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 선택 시 미리보기
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImageUrls]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 백엔드 DB로 게시글 저장
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    setIsSubmitting(true);

    try {
              const formData = new FormData();
        formData.append('title', `[${category}] ${title}`);
        formData.append('content', content);
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        const response = await fetch('http://localhost:8000/api/posts', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
          },
          body: formData,
        });


      if (response.ok) {
        alert('게시글이 성공적으로 등록되었습니다!');
        navigate('/community');
      } else {
        const errorData = await response.json();
        alert(`등록 실패: ${errorData.detail || '오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('백엔드 통신 오류:', error);
      alert('서버와 연결할 수 없습니다. FastAPI 서버를 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>
          ✏️ 커뮤니티 글쓰기
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.formSelect}
            >
              <option value="Tunning Review">Tunning Review (튜닝 후기)</option>
              <option value="Q&A">Q&A (질문 & 답변)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목</label>
            <input
              type="text"
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내용</label>
            <textarea
              placeholder="자유롭게 내용을 작성해주세요..."
              rows="10"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>사진 첨부</label>
            <div>
              <label className={styles.fileUploadBox}>
                <span>📁</span> 이미지 파일 선택 (다중 선택 가능)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {images.map((imgSrc, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img src={imgSrc} alt={`preview-${index}`} className={styles.previewImg} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeImgBtn}
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate('/community')}
              disabled={isSubmitting}
              className={styles.btnCancel}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.btnSubmit}
            >
              {isSubmitting ? '저장 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostCreate;