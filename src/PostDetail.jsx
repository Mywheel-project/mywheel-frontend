import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 좋아요 상태 관리 (개수 및 클릭 여부)
  const [likesCount, setLikesCount] = useState(63);
  const [isLiked, setIsLiked] = useState(false);

  // 댓글 입력 상태 및 댓글 목록 상태
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    { id: 1, nickname: 'nickname4', text: '순정 쇼바 기준으로는 방지턱 넘을 때 크게 문제없는데, 나중에 다운스프링이나 일체형 서스펜션 하시면 뒤 타이어가 휀다 끝부분(림 라인)에 살짝 닿을 수도 있으니 참고하세요!' },
    { id: 2, nickname: 'nickname5', text: '정기 검사(튜닝 검사) 때 휀다 일레븐(돌출) 규정이 엄해져서, +45 정도면 림 폭 8.5J 기준 간당간당하거나 조금 걸릴 수 있습니다.' }
  ]);

  // 임시 게시글 상세 데이터
  const postData = {
    id: id,
    category: 'Q&A',
    title: '순정 19인치 리버설 휠(8.0J +55)에서 이번에 큰맘 먹고 19인치 8.5J +45 정도로 가보려고 합니다!',
    nickname: 'nickname3',
    date: '2026-07-08 14:30',
    view_count: 206,
    content: `안녕하세요! 늘 눈팅만 하다가 드디어 용기 내서 질문 하나 남깁니다.\n\n현재 차는 순정 19인치 리버설 휠(제원: 8.0J +55) 장착 중인데, 자세(옵셋)가 안쪽으로 너무 쏙 들어가 있어서 좀 아쉽더라고요. 그래서 이번에 큰맘 먹고 19인치 8.5J +45 정도로 휠을 교체하거나 허브 스페이스를 고민하고 있습니다.\n\n제원상으로 계산해 보면 기존보다 림 폭이 0.5인치 넓어지고, 옵셋이 +55에서 +45로 줄어드는 거라 대략 약 20mm 정도 바깥쪽으로 돌출될 것 같은데요. 혹시 이 정도 스펙으로 가면 검사(튜닝 검사/정기 검사) 때 휀다 밖으로 돌출되거나 간섭(타이어가 휀다 안쪽을 긁는 현상)이 생기지 않을까요? 특히 방지턱 넘을 때나 뒤에 사람 태웠을 때 간섭이 심할지 걱정입니다.\n\n실제로 이 제원 써보신 고수분들 계시면 조언 좀 부탁드립니다!`
  };

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
      setIsLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setIsLiked(true);
    }
  };

  // 댓글 등록 핸들러
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      nickname: '현재사용자',
      text: commentText
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px 0' }}>
      
      {/* 상세 내용 박스 */}
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #ccc' }}>
        
        {/* 제목 */}
        <h1 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#222', lineHeight: '1.4' }}>
          {postData.title}
        </h1>

        {/* 작성자 및 메타 정보 */}
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '25px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>writer <strong style={{ color: '#222', marginLeft: '5px' }}>{postData.nickname}</strong></span>
          <span>{postData.date}</span>
          <span>👁️ {postData.view_count}</span>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '25px' }} />

        {/* 본문 내용 */}
        <div style={{ minHeight: '150px', lineHeight: '1.8', color: '#333', fontSize: '15px', whiteSpace: 'pre-line', marginBottom: '30px' }}>
          {postData.content}
        </div>

        {/* 첨부 이미지 영역 */}
        <div style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '6px', padding: '15px', backgroundColor: '#fafafa', width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>📷 휠 이미지</span>
        </div>

        {/* 좋아요 버튼 영역 */}
        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={handleLikeClick}
            style={{ 
              backgroundColor: isLiked ? '#e74c3c' : '#eaeaea', 
              color: isLiked ? '#fff' : '#333', 
              border: 'none', 
              padding: '8px 18px', 
              borderRadius: '5px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '14px',
              transition: '0.2s'
            }}
          >
            ❤️ 좋아요 {likesCount}
          </button>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '20px' }} />

        {/* 댓글 섹션 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', color: '#222', marginBottom: '15px' }}>댓글</h3>
          
          {/* 댓글 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {comments.map((item) => (
              <div key={item.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#444', marginBottom: '4px' }}>
                  {item.nickname}
                </div>
                <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* 댓글 입력 폼 */}
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="댓글을 입력하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ flex: 1, padding: '12px 15px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }}
            />
            <button 
              type="submit"
              style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              등록하기
            </button>
          </form>
        </div>

        {/* 하단 목록으로 돌아가기 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ backgroundColor: '#7f8c8d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
          >
            목록으로
          </button>
        </div>

      </div>

    </div>
  );
}