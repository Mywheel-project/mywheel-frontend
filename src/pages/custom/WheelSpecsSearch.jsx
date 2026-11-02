import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './WheelSearch.module.css';
import { fetchCustomLimits } from '../../utils/customLimit';
import { useSynthesis } from '../../context/SynthesisContext';

function WheelSpecsSearch() {
  const [wheelName, setWheelName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [error, setError] = useState(null);

  // 전역 Context 연동 (페이지 이동 시에도 검색 상태 및 결과 보존)
  const {
    isSearchingWheel: loading,
    wheelSearchResult: searchResult,
    wheelSearchQuery: lastSearched,
    startWheelSearch,
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

    setError(null);

    await startWheelSearch(trimmedWheel, trimmedCar, {
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
            <strong>{lastSearched?.wheel || wheelName}</strong>
            {(lastSearched?.car || carModel) && <> (차량: <strong>{lastSearched?.car || carModel}</strong>)</>}의 제원 및 호환성을 분석 중입니다...
          </p>
        </div>
      )}

      {/* 에러 안내 */}
      {error && !loading && (
        <div className={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}

      {/* 2. 하단 호환성 및 제원 결과 박스 */}
      {searchResult && !loading && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>
            [{lastSearched?.wheel} {lastSearched?.car ? `× ${lastSearched?.car} 호환성 진단` : '제원 정보'}]
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

export default WheelSpecsSearch;