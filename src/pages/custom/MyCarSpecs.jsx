import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MyCarSpecs.module.css';
import { fetchCustomLimits } from '../../utils/customLimit';
import { useSynthesis } from '../../context/SynthesisContext';

function MyCarSpecs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // 전역 Context 연동 (페이지 이동 시에도 분석 상태 및 결과 보존)
  const {
    isRecommending: loading,
    recommendResult: searchResult,
    recommendQuery: currentQuery,
    startVehicleRecommend,
  } = useSynthesis();

  // 주간 5회 사용 제한 State
  const [weeklyLimit, setWeeklyLimit] = useState({
    remaining: 5,
    max: 5,
    used: 0,
  });

  // 주간 잔여 횟수 서버에서 조회
  useEffect(() => {
    fetchCustomLimits().then((data) => {
      if (data?.recommend) {
        setWeeklyLimit(data.recommend);
      }
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (weeklyLimit.remaining <= 0) {
      alert('이번 주 차량 제원 추천 이용 한도(5회)를 모두 소진하셨습니다. 매주 월요일 00:00에 다시 충전됩니다.');
      return;
    }

    const query = searchTerm.trim();
    if (!query) {
      alert('차종을 입력해 주세요.');
      return;
    }

    setError(null);

    await startVehicleRecommend(query, {
      onSuccess: (data) => {
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
      },
      onError: (err) => {
        if (err.message && err.message.includes('한도')) {
          setWeeklyLimit((prev) => ({ ...prev, remaining: 0, used: prev.max }));
        }
        setError(err.message || '오류가 발생했습니다.');
      },
    });
  };

  return (
    <div className={styles.specsContainer}>
      {/* 상단 제목 및 안내 문구 */}
      <div className={styles.headerText}>
        <div className={styles.headerTitleRow}>
          <h2>차량에 맞는 최적의 스펙을 제안하는 페이지입니다</h2>
          <span
            className={`${styles.limitBadge} ${weeklyLimit.remaining === 0 ? styles.limitExhausted : ''}`}
            title="매주 월요일 00:00에 5회 충전됩니다"
          >
            이번 주 잔여: <strong>{weeklyLimit.remaining}</strong> / {weeklyLimit.max}회
          </span>
        </div>
        <p>차량의 정확한 차종과 연식을 입력해주세요 (ex:  yf쏘나타 2012,  G80-DH 2018,  w219 cls 2007)</p>
      </div>

      {/* 1. 검색창 영역 */}
      <form className={styles.searchBarWrapper} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="차종과 연식을 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className={styles.searchBtn}
          disabled={loading || weeklyLimit.remaining <= 0}
        >
          {loading ? '분석 중...' : weeklyLimit.remaining <= 0 ? '한도 소진' : '검색'}
        </button>
      </form>
      <p className={styles.limitNotice}>
        제원 추천 기능은 매주 월요일 00:00에 5회씩 자동 충전됩니다 (잔여: {weeklyLimit.remaining}회)
      </p>

      {/* 로딩 안내 */}
      {loading && (
        <div className={styles.loadingBox}>
          <p><strong>{currentQuery || searchTerm}</strong>의 휠/타이어 제원을 분석하고 있습니다...</p>
        </div>
      )}

      {/* 에러 안내 */}
      {error && !loading && (
        <div className={styles.errorBox}>
          <p>{error}</p>
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