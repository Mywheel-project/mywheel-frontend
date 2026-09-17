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

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = getStoredUserId();
  const isLoggedIn = !!userId;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/posts/${id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('댓글 불러오기 실패:', error);
      }
    };

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/posts/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
          fetchComments();
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [id]);

    const handleLikeClick = async () => {
    if (isLiking) return;

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`좋아요 처리 실패: ${errorData.detail || '오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('좋아요 오류:', error);
      alert('서버와 연결할 수 없습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
        },
        body: JSON.stringify({
          content: commentText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [...prev, newComment]);
        setCommentText('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`댓글 등록 실패: ${errorData.detail || '오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('댓글 등록 오류:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': String(userId),
        },
      });

      if (response.ok) {
        alert('게시글이 삭제되었습니다.');
        navigate('/community');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`삭제 실패: ${errorData.detail || '오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#666' }}>
        게시글을 불러오는 중입니다... ⏳
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ color: '#555' }}>존재하지 않거나 삭제된 게시글입니다.</h2>
        <button
          onClick={() => navigate('/community')}
          style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          커뮤니티 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 로그인한 유저의 id와 게시글 작성자의 user_id가 같으면 본인 글
  const isOwner = isLoggedIn && post.user_id === userId;

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px 0' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #ccc' }}>
        
        <h1 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#222', lineHeight: '1.4' }}>
          {post.title}
        </h1>

        <div style={{ fontSize: '13px', color: '#666', marginBottom: '25px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>작성자 <strong style={{ color: '#222', marginLeft: '5px' }}>{post.author || '익명'}</strong></span>
            <span>{post.created_at ? new Date(post.created_at).toLocaleString() : '날짜 없음'}</span>
            <span>👁️ 조회 {post.view_count}</span>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate(`/community/edit/${id}`)}
                style={{ backgroundColor: '#eaeaea', color: '#333', border: 'none', padding: '6px 14px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                style={{ backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', padding: '6px 14px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '25px' }} />

        <div style={{ minHeight: '150px', lineHeight: '1.8', color: '#333', fontSize: '15px', whiteSpace: 'pre-line', marginBottom: '30px' }}>
          {post.content}
        </div>

                <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={handleLikeClick}
            disabled={isLiking}
            style={{ 
              backgroundColor: post.liked_by_me ? '#e74c3c' : '#eaeaea', 
              color: post.liked_by_me ? '#fff' : '#333', 
              border: 'none', 
              padding: '8px 18px', 
              borderRadius: '5px', 
              cursor: isLiking ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold', 
              fontSize: '14px', 
              transition: '0.2s',
              opacity: isLiking ? 0.6 : 1,
            }}
          >
            {post.liked_by_me ? '❤️' : '🤍'} 좋아요 {post.likes_count}
          </button>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '20px' }} />

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', color: '#222', marginBottom: '15px' }}>댓글 ({comments.length})</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {comments.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#888' }}>첫 번째 댓글을 남겨보세요!</p>
            ) : (
              comments.map((item) => (
                <div key={item.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '4px' }}>
                    {item.author}
                  </div>
                  <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                    {item.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isLoggedIn}
              style={{ flex: 1, padding: '12px 15px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }}
            />
            <button 
              type="submit"
              disabled={!isLoggedIn}
              style={{ backgroundColor: isLoggedIn ? '#e74c3c' : '#ccc', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', cursor: isLoggedIn ? 'pointer' : 'not-allowed', fontSize: '14px' }}
            >
              등록하기
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => navigate('/community')}
            style={{ backgroundColor: '#7f8c8d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            목록으로
          </button>
        </div>

      </div>
    </div>
  );
}