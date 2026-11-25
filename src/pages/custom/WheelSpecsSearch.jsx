import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './WheelSearch.module.css';
import { fetchCustomLimits } from '../../utils/customLimit';
import { useSynthesis } from '../../context/SynthesisContext';
import { WHEEL_ASSETS } from '../../data/wheels';
import WheelCatalogModal from '../../components/WheelCatalogModal';
import { getStoredUserId, getAuthHeaders } from '../../utils/authStorage';

const API_BASE_URL = 'http://localhost:8000';

function WheelSpecsSearch() {
  const [wheelName, setWheelName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [error, setError] = useState(null);

  // 휠 카탈로그 모달 및 선택 State
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [selectedWheelId, setSelectedWheelId] = useState(null);

  // 즐겨찾기 상태 관리 (localStorage + 서버 동기화)
  const userId = getStoredUserId();
  const [favoriteWheelIds, setFavoriteWheelIds] = useState(() => {
    const saved = localStorage.getItem('mywheel_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return WHEEL_ASSETS.filter((w) => w.isFavorite).map((w) => w.id);
  });

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

  // 로그인된 경우 서버 DB의 즐겨찾기 목록을 조회해 동기화
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/api/v1/favorites/wheels?user_id=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.favorite_wheel_ids)) {
          setFavoriteWheelIds(data.favorite_wheel_ids);
          localStorage.setItem('mywheel_favorites', JSON.stringify(data.favorite_wheel_ids));
        }
      })
      .catch((err) => {
        console.error('즐겨찾기 목록 서버 조회 실패:', err);
      });
  }, [userId]);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async (e, wheelId) => {
    e.stopPropagation();

    const nextIds = favoriteWheelIds.includes(wheelId)
      ? favoriteWheelIds.filter((id) => id !== wheelId)
      : [...favoriteWheelIds, wheelId];
    setFavoriteWheelIds(nextIds);
    localStorage.setItem('mywheel_favorites', JSON.stringify(nextIds));

    if (userId) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/favorites/wheels/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            user_id: userId,
            wheel_id: wheelId,
          }),
        });
      } catch (err) {
        console.error('즐겨찾기 토글 실패:', err);
      }
    }
  };

  // 카탈로그 모달에서 휠 선택 시 처리
  const handleSelectWheel = (wheelId) => {
    const target = WHEEL_ASSETS.find((w) => w.id === wheelId);
    if (target) {
      setSelectedWheelId(wheelId);
      setWheelName(`${target.brand} ${target.modelName}`);
    }
    setIsWheelModalOpen(false);
  };

  // 휠 제품명 텍스트 직접 입력 시 처리
  const handleWheelNameChange = (e) => {
    const val = e.target.value;
    setWheelName(val);
    if (selectedWheelId) {
      const current = WHEEL_ASSETS.find((w) => w.id === selectedWheelId);
      if (current && `${current.brand} ${current.modelName}` !== val) {
        setSelectedWheelId(null);
      }
    }
  };

  // 휠 입력 내용 지우기
  const handleClearWheel = () => {
    setWheelName('');
    setSelectedWheelId(null);
  };

  const selectedWheel = WHEEL_ASSETS.find((w) => w.id === selectedWheelId);

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
        <p>휠 제품명을 입력하거나 카탈로그에서 선택하세요 (차종 입력 시 호환성까지 함께 분석됩니다)</p>
      </div>

      {/* 1. 상단 2분할 검색 바 */}
      <form className={styles.searchFormWrapper} onSubmit={handleSearch}>
        {/* 휠 제품명 입력 카드 (직접 입력 + 카탈로그 선택 버튼) */}
        <div className={`${styles.inputCard} ${styles.wheelInputCard}`}>
          {selectedWheel && (
            <div
              className={styles.wheelThumbWrapper}
              title={`${selectedWheel.brand} ${selectedWheel.modelName} (에셋 선택됨)`}
            >
              <img
                src={selectedWheel.image}
                alt={selectedWheel.modelName}
                className={styles.selectedWheelThumb}
              />
            </div>
          )}

          <input
            type="text"
            className={`${styles.searchInput} ${selectedWheel ? styles.searchInputWithThumb : ''}`}
            placeholder="휠 제품명 입력 또는 카탈로그 선택"
            value={wheelName}
            onChange={handleWheelNameChange}
            disabled={loading}
          />

          {wheelName && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearWheel}
              title="휠 이름 지우기"
              disabled={loading}
            >
              ✕
            </button>
          )}

          <button
            type="button"
            className={styles.catalogOpenBtn}
            onClick={() => setIsWheelModalOpen(true)}
            disabled={loading}
            title="에셋 카탈로그에서 휠 선택"
          >
            {/* <span className={styles.catalogBtnIcon}>🔍</span> */}
            <span className={styles.catalogBtnLabel}>+ 카탈로그</span>
          </button>
        </div>

        {/* 차종 입력 카드 */}
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

      {/* 휠 에셋 카탈로그 모달 */}
      <WheelCatalogModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        selectedWheelId={selectedWheelId}
        onSelectWheel={handleSelectWheel}
        favoriteWheelIds={favoriteWheelIds}
        onToggleFavorite={handleToggleFavorite}
      />

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
