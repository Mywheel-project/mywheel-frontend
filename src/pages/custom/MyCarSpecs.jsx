import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MyCarSpecs.module.css';

function MyCarSpecs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      alert('차종을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentQuery(query);

    try {
      const response = await fetch('http://localhost:8000/api/v1/recommend/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_model: query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '제원 추천 분석에 실패했습니다.');
      }

      const data = await response.json();
      setSearchResult(data.gemini_response);
    } catch (err) {
      console.error('제원 추천 API 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.specsContainer}>
      {/* 상단 제목 및 안내 문구 */}
      <div className={styles.headerText}>
        <h2>차량에 맞는 최적의 스펙을 제안하는 페이지입니다</h2>
        <p>자신의 차종을 상세하게 적어주세요 (ex. 아반떼 CN7, 제네시스 G80, W219 CLS)</p>
      </div>

      {/* 1. 검색창 영역 */}
      <form className={styles.searchBarWrapper} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="차종을 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? '분석 중...' : '검색'}
        </button>
      </form>

      {/* 로딩 안내 */}
      {loading && (
        <div className={styles.loadingBox}>
          <p>AI 피팅 엔지니어가 <strong>{currentQuery}</strong>의 휠/타이어 제원을 분석하고 있습니다...</p>
        </div>
      )}

      {/* 에러 안내 */}
      {error && !loading && (
        <div className={styles.errorBox}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* 2. 하단 제원 결과 박스 */}
      {searchResult && !loading && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>[{currentQuery} 휠/타이어 추천 제원]</h3>
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {searchResult}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCarSpecs;