import React, { useState } from 'react';

function PostCreate({ onBack }) {
  const [category, setCategory] = useState('Tunning Review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // 업로드한 이미지 미리보기 URL 배열

  // 이미지 파일 선택 시 미리보기 생성 함수
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // 선택한 파일들을 브라우저에서 볼 수 있는 임시 URL로 변환
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImageUrls]); // 기존 이미지에 추가
  };

  // 등록 완료 버튼 클릭 시
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }
    alert('게시글이 성공적으로 등록되었습니다! (임시)');
    onBack(); // 작성 완료 후 목록 화면으로 돌아가기
  };

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
      {/* 상단 네비게이션 바 (공통) */}
      <div style={{ backgroundColor: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px', borderRadius: '50%', fontWeight: 'bold' }}>🚗</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic' }}>MY wheel</span>
        </div>
        <div style={{ display: 'flex', gap: '30px', fontSize: '15px', fontWeight: 'bold' }}>
          <span>MAP</span>
          <span>CUSTOM</span>
          <span style={{ color: '#e74c3c', borderBottom: '2px solid #e74c3c', paddingBottom: '3px' }}>COMMUNITY</span>
          <span>MY PAGE</span>
          <span>로그인/회원가입</span>
        </div>
      </div>

      {/* 메인 글쓰기 폼 영역 */}
      <div style={{ maxWidth: '900px', margin: '40px auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        
        <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '30px', color: '#333' }}>
          ✏️ 커뮤니티 글쓰기
        </h2>

        <form onSubmit={handleSubmit}>
          
          {/* 카테고리 선택 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>카테고리</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
            >
              <option value="Tunning Review">Tunning Review</option>
              <option value="Q&A">Q&A</option>
              <option value="Community posts">Community posts</option>
            </select>
          </div>

          {/* 제목 입력 */}
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

          {/* 내용 입력 */}
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

          {/* 사진 첨부 및 미리보기 영역 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#444' }}>사진 첨부</label>
            
            {/* 파일 선택 버튼 숨기고 커스텀 레이블 사용 */}
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

            {/* 선택한 이미지 미리보기 썸네일 리스트 */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {images.map((imgSrc, index) => (
                <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd' }}>
                  <img src={imgSrc} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* 하단 버튼 그룹 (취소 / 등록) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button 
              type="button" 
              onClick={onBack}
              style={{ backgroundColor: '#ccc', color: '#333', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              취소
            </button>
            <button 
              type="submit" 
              style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              등록하기
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default PostCreate;