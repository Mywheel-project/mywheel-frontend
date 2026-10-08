import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthHeaders } from './utils/authStorage';


function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState('Tunning Review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // 기존 DB에 저장되어 있던 이미지 URL 목록
  const [existingImages, setExistingImages] = useState([]);
  
  // 새로 추가할 이미지 파일 객체 및 미리보기 URL
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 기존 게시글 정보 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/posts/${id}`);
        if (response.ok) {
          const data = await response.json();

          // 작성자 본인 확인
          if (String(data.user_id) !== String(userId)) {
            alert('본인의 게시글만 수정할 수 있습니다.');
            navigate(`/posts/${id}`);
            return;
          }

          // 제목에서 [카테고리] 추출 및 파싱
          const match = data.title?.match(/^\[(.*?)\]\s*(.*)$/);
          if (match) {
            setCategory(match[1]);
            setTitle(match[2]);
          } else {
            setTitle(data.title || '');
          }

          setContent(data.content || '');
          setExistingImages(data.images || []);
        } else {
          alert('게시글을 찾을 수 없습니다.');
          navigate('/community');
        }
      } catch (error) {
        console.error('게시글 불러오기 오류:', error);
        alert('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/community');
      return;
    }

    fetchPost();
  }, [id, userId, isLoggedIn, navigate]);

  // 기존 이미지 삭제 처리
  const handleRemoveExistingImage = (urlToRemove) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // 새 이미지 파일 추가
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  // 새 이미지 삭제 처리
  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 2. 게시글 수정 저장 (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', `[${category}] ${title.trim()}`);
      formData.append('content', content.trim());
      existingImages.forEach((url) => {
        formData.append('existing_images', url);
      });
      newImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      });

      if (response.ok) {
        alert('게시글이 수정되었습니다!');
        navigate(`/posts/${id}`);
      } else {
        const errorData = await response.json();
        alert(`수정 실패: ${errorData.detail || '오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('백엔드 통신 오류:', error);
      alert('서버와 연결할 수 없습니다. FastAPI 서버를 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>게시글을 불러오는 중입니다... ⏳</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>
          ✏️ 게시글 수정
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
              placeholder="내용을 입력해주세요."
              rows="10"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>사진 관리</label>

            {/* 기존 이미지 목록 */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                  기존 첨부된 사진 (클릭하여 삭제):
                </div>
                <div className={styles.imagePreviewGrid}>
                  {existingImages.map((imgUrl, index) => (
                    <div key={`existing-${index}`} className={styles.previewItem}>
                      <img src={imgUrl} alt={`existing-${index}`} className={styles.previewImg} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imgUrl)}
                        className={styles.removeImgBtn}
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새 이미지 파일 추가 버튼 */}
            <div>
              <label className={styles.fileUploadBox}>
                <span>📁</span> 사진 추가하기
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* 새로 추가된 이미지 미리보기 */}
            {newImagePreviews.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {newImagePreviews.map((previewUrl, index) => (
                  <div key={`new-${index}`} className={styles.previewItem}>
                    <img src={previewUrl} alt={`new-${index}`} className={styles.previewImg} />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
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
              onClick={() => navigate(`/posts/${id}`)}
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
              {isSubmitting ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostEdit;