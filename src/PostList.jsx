import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Community.module.css'; 
import { getStoredUserId, getAuthHeaders } from './utils/authStorage';


export default function PostList() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('All');
  const POSTS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const userId = getStoredUserId();
  const isLoggedIn = !!userId;
  const [posts, setPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 백엔드 FastAPI로부터 실제 DB에 저장된 게시글 목록 가져오기
  const fetchPosts = async (keyword = '') => {
    try {
      setLoading(true);
      const url = keyword
        ? `http://localhost:8000/api/posts?search=${encodeURIComponent(keyword)}`
        : 'http://localhost:8000/api/posts';
      const response = await fetch(url, { headers: { ...getAuthHeaders() } });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error('게시글 목록 불러오기 실패');
      }
    } catch (error) {
      console.error('서버 통신 에러:', error);
    } finally {
      setLoading(false);
    }
  };
 const fetchHotPosts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/posts/hot', {
        headers: { ...getAuthHeaders() },
      });
      if (response.ok) {
        const data = await response.json();
        setHotPosts(data);
      }
    } catch (error) {
      console.error('핫게시물 불러오기 실패:', error);
    }
  }; 

  // const fetchHotPosts = async () => {
  //   try {
  //     const response = await fetch('http://localhost:8000/api/posts/hot');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setHotPosts(data);
  //     }
  //   } catch (error) {
  //     console.error('핫게시물 불러오기 실패:', error);
  //   }
  // };

  useEffect(() => {
    fetchPosts();
    fetchHotPosts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchPosts(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

    // const [hotPosts, setHotPosts] = useState([]);

 


  // 탭 필터링 로직 (제목 앞 [카테고리] 문자열 매칭)
  const filteredPosts = currentTab === 'All'
    ? posts
    : currentTab === 'My Posts'
      ? (isLoggedIn ? posts.filter((post) => post.user_id === userId) : [])
      : posts.filter((post) => post.title && post.title.startsWith(`[${currentTab}]`));

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const pagedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // 카테고리 텍스트 및 제목 분리 유틸
  const parseCategoryAndTitle = (fullTitle) => {
    const match = fullTitle?.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { category: match[1], cleanTitle: match[2] };
    }
    return { category: null, cleanTitle: fullTitle || '' };
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainWrapper}>
        
        {/* 상단 배너 */}
        <div className={styles.headerBanner}>
          <div className={styles.headerBadge}>COMMUNITY</div>
          <h1 className={styles.headerTitle}>My Wheel 커뮤니티</h1>
          <p className={styles.headerSubtitle}>
            휠/타이어 튜닝 후기, 장착 팁, 질의응답을 자유롭게 공유하고 소통해보세요.
          </p>
        </div>

        {/* 컨트롤 바 (카테고리 탭 & 검색) */}
        <div className={styles.controlBar}>
          <div className={styles.tabList}>
            {['All', 'Tunning Review', 'Q&A', 'My Posts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`${styles.tabButton} ${currentTab === tab ? styles.tabButtonActive : ''}`}
              >
                {tab === 'All' ? '전체' : tab === 'My Posts' ? '내가 쓴 글' : tab}
              </button>
            ))}
          </div>

          <div className={styles.searchWrapper}>
            <svg 
              className={styles.searchIcon} 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="게시글 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* 메인 2열 레이아웃 */}
        <div className={styles.contentGrid}>
          
          {/* 좌측 게시글 목록 영역 */}
          <div className={styles.postListSection}>
            <div className={styles.postListHeader}>
              <span className={styles.postCount}>
                총 <strong>{filteredPosts.length}</strong>개의 이야기
              </span>
              <button
                onClick={() => navigate('/community/create')}
                className={styles.writeBtn}
              >
                + 글쓰기
              </button>
            </div>

            {loading ? (
              <div className={styles.emptyState}>게시글을 불러오는 중입니다... ⏳</div>
            ) : currentTab === 'My Posts' && !isLoggedIn ? (
              <div className={styles.emptyState}>로그인 후 내가 쓴 글을 확인할 수 있습니다.</div>
            ) : filteredPosts.length > 0 ? (
              pagedPosts.map((post) => {
                const { category, cleanTitle } = parseCategoryAndTitle(post.title);
                return (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/posts/${post.id}`)}
                    className={styles.postCard}
                  >
                    <div className={styles.postMainInfo}>
                      {post.images && post.images.length > 0 && (
                        <img
                          src={post.images[0]}
                          alt="thumbnail"
                          className={styles.postThumbnail}
                        />
                      )}
                      <div className={styles.postTextContent}>
                        {category && (
                          <span className={`${styles.categoryBadge} ${category === 'Tunning Review' ? styles.categoryReview : category === 'Q&A' ? styles.categoryQA : ''}`}>
                            {category}
                          </span>
                        )}
                        <h3 className={styles.postTitle}>{cleanTitle || post.title}</h3>
                        <div className={styles.postMeta}>
                          <span className={styles.postAuthor}>{post.author || '익명'}</span>
                          <span>·</span>
                          <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.postStats}>
                      <span className={styles.statItem}>👁️ {post.view_count ?? 0}</span>
                      <span className={`${styles.statItem} ${styles.statItemHeart}`}>
                        ❤️ {post.likes_count ?? 0}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                등록된 게시글이 없습니다. 첫 글을 작성해 보세요!
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 우측 HOT 게시물 사이드바 */}
          <aside className={styles.hotSection}>
            <h4 className={styles.hotHeader}>
              <span className={styles.hotHeaderIcon}></span> 인기 게시물 (HOT)
            </h4>

            <div className={styles.hotList}>
              {hotPosts.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
                  인기 게시물이 아직 없습니다.
                </div>
              ) : (
                hotPosts.map((hot, index) => {
                  const { cleanTitle } = parseCategoryAndTitle(hot.title);
                  return (
                    <div
                      key={hot.id}
                      onClick={() => navigate(`/posts/${hot.id}`)}
                      className={styles.hotCard}
                    >
                      <div className={styles.hotCardTitle}>
                        <span className={`${styles.hotRank} ${index < 3 ? styles.hotRankTop : ''}`}>
                          {index + 1}
                        </span>
                        <span className={styles.hotCardTitleText}>
                          {cleanTitle || hot.title}
                        </span>
                      </div>
                      <div className={styles.hotCardMeta}>
                        조회수 {hot.view_count} · 좋아요 {hot.likes_count}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}