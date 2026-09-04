import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function PostList() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('All');
  const { user, isLoggedIn } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 1. 백엔드 FastAPI로부터 실제 DB에 저장된 게시글 목록 가져오기
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/posts');
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

  useEffect(() => {
    fetchPosts();
    fetchHotPosts();
  }, []);
    const [hotPosts, setHotPosts] = useState([]);

  const fetchHotPosts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/posts/hot');
      if (response.ok) {
        const data = await response.json();
        setHotPosts(data);
      }
    } catch (error) {
      console.error('핫게시물 불러오기 실패:', error);
    }
  }; 


  // 탭 필터링 로직 (제목 앞 [카테고리] 문자열 매칭)
  const filteredPosts = currentTab === 'All'
  ? posts
  : currentTab === 'My Posts'
    ? (isLoggedIn ? posts.filter((post) => post.user_id === user?.id) : [])
    : posts.filter((post) => post.title && post.title.startsWith(`[${currentTab}]`));

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, paddingBottom: '40px' }}>
      
      {/* 메인 컨텐츠 영역 */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        
        {/* 상단 카테고리 탭 & 검색바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['All', 'Tunning Review', 'Q&A', 'My Posts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: currentTab === tab ? '#e74c3c' : '#eaeaea',
                  color: currentTab === tab ? '#fff' : '#555',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#eaeaea', borderRadius: '20px', padding: '5px 15px', width: '250px' }}>
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="SEARCH" 
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', padding: '5px', width: '100%', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* 본문 영역 */}
        <div style={{ display: 'flex', gap: '30px' }}>
          
          {/* 좌측 게시글 목록 */}
          <div style={{ flex: 2.5 }}>
                        {loading ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>게시글을 불러오는 중입니다... ⏳</p>
            ) : currentTab === 'My Posts' && !isLoggedIn ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>로그인 후 내가 쓴 글을 확인할 수 있습니다.</p>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/posts/${post.id}`)} // 클릭 시 상세 페이지로 이동
                  style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginBottom: '15px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                >
                  <div>
                    <h3 style={{ margin: '8px 0', fontSize: '16px', color: '#222' }}>{post.title}</h3>
                    <span style={{ fontSize: '13px', color: '#888' }}>
                      작성자: <strong style={{ color: '#555' }}>{post.author || '익명'}</strong> · {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#777' }}>
                    <span>👁️ {post.view_count ?? 0}</span>
                    <span>❤️ {post.likes_count ?? 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>등록된 게시글이 없습니다. 첫 글을 작성해 보세요!</p>
            )}

            {/* 🔥 2. 글쓰기 버튼 클릭 시 PostCreate 페이지(/community/create)로 이동 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => navigate('/community/create')}
                style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
              >
                ✏️ 글쓰기
              </button>
            </div>
          </div>

          {/* 우측 HOT 게시물 영역 */}
          <div style={{ flex: 1, backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #e74c3c', paddingBottom: '8px', fontSize: '15px' }}>🔥 HOT 게시물</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hotPosts.map((hot, index) => (
                <div 
                  key={hot.id} 
                  onClick={() => navigate(`/posts/${hot.id}`)}
                  style={{ padding: '10px', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#fff', border: '1px solid #eee' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                >
                  <div style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 'bold' }}>{index + 1}. {hot.title}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>조회수 {hot.view_count} · 좋아요 {hot.likes_count}</div>                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}