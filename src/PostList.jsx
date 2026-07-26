import React, { useState } from 'react';

function PostList() {
  const [currentTab, setCurrentTab] = useState('All');
  
  // 모달 팝업 열림/닫힘 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 글쓰기 폼 내부 입력 상태
  const [category, setCategory] = useState('Tunning Review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // 이미지 미리보기 배열

  const dummyPosts = [
    { id: 1, category: 'Tunning Review', title: '[Tunning Review] 드디어 드림 휠 올렸습니다!', nickname: 'rudtnsiasia', view_count: 206, likes: 63 },
    { id: 2, category: 'Community posts', title: '아반떼 N에 어울리는 경량 휠 추천 해줘요!!', nickname: 'writer1', view_count: 150, likes: 42 },
    { id: 3, category: 'Q&A', title: '옵셋 계산기 돌려봤는데, 이 수치면 돌출 검사 통과할까요?', nickname: 'writer3', view_count: 88, likes: 12 },
  ];

  const filteredPosts = currentTab === 'All' 
    ? dummyPosts 
    : dummyPosts.filter(post => post.category === currentTab);

  // 이미지 선택 시 미리보기 처리
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls]);
  };

  // 등록하기 버튼 클릭 시
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }
    alert('게시글이 성공적으로 등록되었습니다!');
    setIsModalOpen(false); // 팝업 닫기
    setTitle('');
    setContent('');
    setImages([]);
  };

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0, position: 'relative' }}>
      
      

      {/* 2. 메인 컨텐츠 영역 */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        
        {/* 상단 카테고리 탭 & 검색바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['All', 'Tunning Review', 'Q&A', 'Community posts', 'My Posts'].map((tab) => (
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
                  transition: '0.2s'
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
          
          <div style={{ flex: 2.5 }}>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', marginBottom: '15px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 'bold' }}>[{post.category}]</span>
                    <h3 style={{ margin: '8px 0', fontSize: '16px', color: '#222' }}>{post.title}</h3>
                    <span style={{ fontSize: '13px', color: '#888' }}>writer: <strong style={{ color: '#555' }}>{post.nickname}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#777' }}>
                    <span>👁️ {post.view_count}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>해당 카테고리에 작성된 글이 없습니다.</p>
            )}

            {/* 글쓰기 버튼 클릭 시 모달 열기 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(231,76,60,0.3)' }}
              >
                글쓰기 +
              </button>
            </div>
          </div>

          {/* 우측 HOT 게시물 영역 */}
          <div style={{ flex: 1, backgroundColor: '#fcfcfc', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #e74c3c', paddingBottom: '8px', fontSize: '15px' }}>🔥 HOT 게시물</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 101, title: '국산차 전용 휠 옵셋 완벽 가이드', view_count: 512, likes: 120 },
                { id: 102, title: '순정 휠인 줄 알았는데...', view_count: 430, likes: 98 },
                { id: 103, title: '300만 원 태운 결과물 공유', view_count: 380, likes: 85 },
                { id: 104, title: '국내 1호 매물? 직구로 겨우...', view_count: 290, likes: 64 },
                { id: 105, title: '인치다운 vs 인치업', view_count: 215, likes: 45 },
              ].map((hot, index) => (
                <div 
                  key={hot.id} 
                  onClick={() => alert(`HOT 게시글 "${hot.title}" 상세 내용 보기!`)}
                  style={{ 
                    padding: '10px', 
                    borderRadius: '5px', 
                    cursor: 'pointer', 
                    backgroundColor: '#fff', 
                    border: '1px solid #eee',
                    transition: '0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <div style={{ fontSize: '12px', color: '#e74c3c', fontWeight: 'bold' }}>{index + 1}. {hot.title}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>조회수 {hot.view_count} · 좋아요 {hot.likes}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. 새 글 쓰기 모달 팝업 */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            width: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #333', paddingBottom: '10px', fontSize: '20px' }}>
              새 글 쓰기
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>카테고리 선택</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                  <option value="Tunning Review">Tunning Review</option>
                  <option value="Q&A">Q&A</option>
                  <option value="Community posts">Community posts</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>제목</label>
                <input 
                  type="text" 
                  placeholder="제목을 입력해주세요(최대 50자)" 
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>내용</label>
                <textarea 
                  placeholder="내용을 입력해주세요(최소 10자 이상)" 
                  rows="6"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>사진 첨부 (최대 5장)</label>
                <label style={{ display: 'inline-block', backgroundColor: '#eaeaea', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
                  📁 이미지 업로드
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ display: 'none' }} 
                  />
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {images.map((imgSrc, index) => (
                    <div key={index} style={{ width: '70px', height: '70px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #ddd' }}>
                      <img src={imgSrc} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: '#bbb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  등록하기
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default PostList;