import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Community.module.css';

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
        const data = await response.json();
        setPost((prev) => ({
          ...prev,
          liked_by_me: data.liked,
          likes_count: data.likes_count,
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`좋아요 실패: ${errorData.detail || '오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('좋아요 요청 오류:', error);
      alert('서버와 연결할 수 없습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
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
          content: commentText.trim(),
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

  const parseCategoryAndTitle = (fullTitle) => {
    const match = fullTitle?.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { category: match[1], cleanTitle: match[2] };
    }
    return { category: null, cleanTitle: fullTitle || '' };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>게시글을 불러오는 중입니다... ⏳</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h3>존재하지 않거나 삭제된 게시글입니다.</h3>
          <button
            onClick={() => navigate('/community')}
            className={styles.btnSubmit}
            style={{ marginTop: '16px' }}
          >
            커뮤니티 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isOwner = isLoggedIn && post.user_id === userId;
  const { category, cleanTitle } = parseCategoryAndTitle(post.title);

  return (
    <div className={styles.container}>
      <div className={styles.detailContainer}>
        
        {/* 상단 헤더 영역 */}
        <div className={styles.detailHeader}>
          {category && (
            <span className={`${styles.categoryBadge} ${category === 'Tunning Review' ? styles.categoryReview : category === 'Q&A' ? styles.categoryQA : ''}`}>
              {category}
            </span>
          )}
          <h1 className={styles.detailTitle}>{cleanTitle || post.title}</h1>

          <div className={styles.detailMetaBar}>
            <div className={styles.detailMetaLeft}>
              <span>작성자 <strong>{post.author || '익명'}</strong></span>
              <span>·</span>
              <span>{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</span>
              <span>·</span>
              <span>👁️ 조회 {post.view_count ?? 0}</span>
            </div>

            {isOwner && (
              <div className={styles.detailOwnerActions}>
                <button
                  onClick={() => navigate(`/community/edit/${id}`)}
                  className={styles.btnEdit}
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.btnDelete}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 본문 영역 */}
        <div className={styles.detailContent}>
          {post.content}
        </div>

        {/* 첨부 이미지 갤러리 */}
        {post.images && post.images.length > 0 && (
          <div className={styles.detailGallery}>
            {post.images.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`post-image-${index}`}
                className={styles.detailImage}
              />
            ))}
          </div>
        )}

        {/* 좋아요 버튼 섹션 */}
        <div className={styles.likeSection}>
          <button 
            onClick={handleLikeClick}
            disabled={isLiking}
            className={`${styles.likeBtn} ${post.liked_by_me ? styles.likeBtnActive : ''}`}
          >
            {post.liked_by_me ? '❤️' : '🤍'} <span>좋아요</span> <strong>{post.likes_count ?? 0}</strong>
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className={styles.commentSection}>
          <h3 className={styles.commentTitle}>
            댓글 <span className={styles.commentCountBadge}>{comments.length}</span>
          </h3>
          
          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <div className={styles.emptyState} style={{ padding: '30px', borderStyle: 'solid' }}>
                첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              comments.map((item) => (
                <div key={item.id} className={styles.commentItem}>
                  <div className={styles.commentAuthor}>
                    {item.author || '익명'}
                  </div>
                  <div className={styles.commentBody}>
                    {item.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <input 
              type="text"
              placeholder={isLoggedIn ? "댓글을 작성해 보세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isLoggedIn}
              className={styles.commentInput}
            />
            <button 
              type="submit"
              disabled={!isLoggedIn}
              className={styles.commentSubmitBtn}
            >
              등록
            </button>
          </form>
        </div>

        <div className={styles.bottomNav}>
          <button 
            onClick={() => navigate('/community')}
            className={styles.btnBack}
          >
            ← 목록으로
          </button>
        </div>

      </div>
    </div>
  );
}