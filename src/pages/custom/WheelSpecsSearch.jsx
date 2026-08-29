import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './WheelSearch.module.css';

function WheelSearch() {
  const [wheelName, setWheelName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [lastSearched, setLastSearched] = useState({ wheel: '', car: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedWheel = wheelName.trim();
    const trimmedCar = carModel.trim();

    if (!trimmedWheel) {
      alert('휠 제품명을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setLastSearched({ wheel: trimmedWheel, car: trimmedCar });

    try {
      const response = await fetch('http://localhost:8000/api/v1/search/wheel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wheel_name: trimmedWheel,
          ...(trimmedCar ? { vehicle_model: trimmedCar } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '휠 제원 검색에 실패했습니다.');
      }

      const data = await response.json();
      setSearchResult(data.gemini_response);
    } catch (err) {
      console.error('휠 제원 검색 API 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      {/* 상단 타이틀 영역 */}
      <div className={styles.headerText}>
        <h2>특정 휠의 상세 정보를 빠르게 찾아보고 적합성을 확인하는 페이지입니다</h2>
        <p>휠 제품명을 입력하세요. 장착할 차종도 적어주시면 호환성 여부까지 한 번에 확인 가능합니다.</p>
      </div>

      {/* 1. 상단 2분할 검색 바 */}
      <form className={styles.searchFormWrapper} onSubmit={handleSearch}>
        <div className={styles.inputCard}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="휠 제품명을 입력해주세요 (ex. BBS LM, TE37)"
            value={wheelName}
            onChange={(e) => setWheelName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.inputCard}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="차종을 입력해주세요 (선택, ex. 아반떼 CN7)"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? '분석 중...' : '검색'}
        </button>
      </form>

      {/* 로딩 안내 */}
      {loading && (
        <div className={styles.loadingBox}>
          <p>
            AI 엔지니어가 <strong>{lastSearched.wheel}</strong>
            {lastSearched.car && <> (차량: <strong>{lastSearched.car}</strong>)</>}의 제원 및 호환성을 분석 중입니다...
          </p>
        </div>
      )}

      {/* 에러 안내 */}
      {error && !loading && (
        <div className={styles.errorBox}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* 2. 하단 호환성 및 제원 결과 박스 */}
      {searchResult && !loading && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>
            [{lastSearched.wheel} {lastSearched.car ? `× ${lastSearched.car} 호환성 진단` : '제원 정보'}]
          </h3>
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

export default WheelSearch;