import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// AuthContext/useAuth 대신 main 프로젝트의 로그인 방식을 그대로 사용.
// Header.jsx, pages/MyPage.jsx와 동일하게 localStorage에 저장된 로그인 유저 정보를 직접 읽는다.
const USER_STORAGE_KEY = 'mywheel_user';

function getStoredUserId() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved)?.id ?? null : null;
  } catch {
    return null;
  }
}

function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = getStoredUserId();

  const [category, setCategory] = useState('Tunning Review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/posts/${id}`);
        if (response.ok) {
          const post = await response.json();

          const match = post.title.match(/^\[(.+?)\]\s*(.*)$/);
          if (match) {
            setCategory(match[1]);
            setTitle(match[2]);
          } else {
            setTitle(post.title);
          }
          setContent(post.content);
        } else {
          alert('게시글을 불러올 수 없습니다.');
          navigate('/community');
        }
      } catch (error) {
        console.error('게시글 불러오기 오류:', error);
        alert('서버와 연결할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          title: `[${category}] ${title}`,
          content: content,
        }),
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
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#666' }}>
        게시글을 불러오는 중입니다... ⏳
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: '20px 0' }}>
      <div style={{ maxWidth: '900px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '30px', color: '#333' }}>
          ✏️ 게시글 수정
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

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>내용</label>
            <textarea
              placeholder="내용을 입력해주세요."
              rows="10"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button
              type="button"
              onClick={() => navigate(`/posts/${id}`)}
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
              {isSubmitting ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostEdit;