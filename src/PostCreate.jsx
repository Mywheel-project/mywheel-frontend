import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function PostCreate() {
  const navigate = useNavigate();
  const { token, isLoggedIn } = useAuth();

  const [category, setCategory] = useState('Tunning Review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 선택 시 미리보기
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImageUrls]);
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
      const response = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `[${category}] ${title}`,
          content: content,
        }),
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
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: '20px 0' }}>
      <div style={{ maxWidth: '900px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '30px', color: '#333' }}>
          ✏️ 커뮤니티 글쓰기
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
            >
              <option value="Tunning Review">Tunning Review</option>
              <option value="Q&A">Q&A</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>제목</label>
            <input
              type="text"
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>내용</label>
            <textarea
              placeholder="내용을 입력해주세요."
              rows="10"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>사진 첨부</label>
            <label style={{ display: 'inline-block', backgroundColor: '#eaeaea', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#555', marginBottom: '15px' }}>
              📁 이미지 파일 선택 (여러 장 가능)
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {images.map((imgSrc, index) => (
                <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                  <img src={imgSrc} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button
              type="button"
              onClick={() => navigate('/community')}
              disabled={isSubmitting}
              style={{ backgroundColor: '#ccc', color: '#333', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: isSubmitting ? '#999' : '#e74c3c', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
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