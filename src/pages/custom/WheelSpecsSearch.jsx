import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './WheelSearch.module.css';
import { getCustomAuthHeaders, fetchCustomLimits } from '../../utils/customLimit';

function WheelSearch() {
  const [wheelName, setWheelName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [lastSearched, setLastSearched] = useState({ wheel: '', car: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 주간 5회 사용 제한 State
  const [weeklyLimit, setWeeklyLimit] = useState({
    remaining: 5,
    max: 5,
    used: 0,
  });

  // 주간 잔여 횟수 서버에서 조회
  useEffect(() => {
    fetchCustomLimits().then((data) => {
      if (data?.search) {
        setWeeklyLimit(data.search);
      }
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (weeklyLimit.remaining <= 0) {
      alert('이번 주 휠 제원 검색 이용 한도(5회)를 모두 소진하셨습니다. 매주 월요일 00:00에 다시 충전됩니다.');
      return;
    }

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
      const headers = {
        'Content-Type': 'application/json',
        ...getCustomAuthHeaders(),
      };

      const response = await fetch('http://localhost:8000/api/v1/search/wheel', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          wheel_name: trimmedWheel,
          ...(trimmedCar ? { vehicle_model: trimmedCar } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setWeeklyLimit((prev) => ({ ...prev, remaining: 0, used: prev.max }));
        }
        throw new Error(errorData.detail || '휠 제원 검색에 실패했습니다.');
      }

      const data = await response.json();
      setSearchResult(data.gemini_response);

      // 잔여 횟수 즉시 갱신
      if (data.remaining !== undefined) {
        setWeeklyLimit((prev) => ({
          ...prev,
          remaining: data.remaining,
          used: prev.max - data.remaining,
        }));
      } else {
        setWeeklyLimit((prev) => ({
          ...prev,
          remaining: Math.max(0, prev.remaining - 1),
          used: prev.used + 1,
        }));
      }
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
        <div className={styles.headerTitleRow}>
          <h2>특정 휠의 상세 정보를 빠르게 찾아보고 적합성을 확인하는 페이지입니다</h2>
          <span
            className={`${styles.limitBadge} ${weeklyLimit.remaining === 0 ? styles.limitExhausted : ''}`}
            title="매주 월요일 00:00에 5회 충전됩니다"
          >
            이번 주 잔여: <strong>{weeklyLimit.remaining}</strong> / {weeklyLimit.max}회
          </span>
        </div>
        <p>휠 제품명을 입력하세요 (장착할 차종도 적어주시면 호환성 여부까지 한 번에 확인 가능합니다)</p>
      </div>

      {/* 1. 상단 2분할 검색 바 */}
      <form className={styles.searchFormWrapper} onSubmit={handleSearch}>
        <div className={styles.inputCard}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="휠 제품명을 입력해주세요 (ex BBS LM-R, TE37)"
            value={wheelName}
            onChange={(e) => setWheelName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.inputCard}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="(선택) 차종과 연식을 입력해주세요 (ex yf쏘나타 2012)"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={styles.searchBtn}
          disabled={loading || weeklyLimit.remaining <= 0}
        >
          {loading ? '분석 중...' : weeklyLimit.remaining <= 0 ? '한도 소진' : '검색'}
        </button>
      </form>
      <p className={styles.limitNotice}>
        휠 검색 기능은 매주 월요일 00:00에 5회씩 자동 충전됩니다 (잔여: {weeklyLimit.remaining}회)
      </p>

      {/* 로딩 안내 */}
      {loading && (
        <div className={styles.loadingBox}>
          <p>
            <strong>{lastSearched.wheel}</strong>
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