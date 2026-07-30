import { useState } from 'react';
import styles from './WheelSearch.module.css';

// 💡 Gemini API에서 responseSchema로 받아올 JSON 데이터와 동일한 예시 구조
const DUMMY_WHEEL_SEARCH_DATA = {
  summary: "결론부터 말씀드리면, 장착은 가능하지만 '허브링'과 '전용 볼트(또는 가공)'가 반드시 필요합니다. 두 차량의 휠 규격(제원)이 다르기 때문인데요,",
  unmatchedSpecs: [
    "PCD: 브라부스(112) vs 쏘나타(114.3) → 체결 불가",
    "허브보어: 브라부스(66.6mm) vs 쏘나타(67.1mm) → 휠 구멍이 작아 안 들어감"
  ],
  solutions: [
    "PCD 체인저 필수: 규격 변환을 위해 체인저를 써야 하나, 이로 인해 휠이 휀더 밖으로 돌출되어 검사가 어려울 수 있습니다.",
    "허브 가공: 쏘나타 허브축에 맞추기 위해 휠 안쪽 구멍을 깎아내는 선반 가공이 반드시 필요합니다."
  ],
  recommendation: "장착은 가능하지만 정품 휠 가공 시 가치가 크게 하락하며, 안전과 검사 통과 측면에서 위험 부담이 큽니다. 가급적 가공 없이 바로 장착 가능한 쏘나타 전용 규격(5홀 114.3)의 다른 명품 휠을 선택하시길 권장합니다."
};

function WheelSearch() {
  const [wheelName, setWheelName] = useState('');
  const [carModel, setCarModel] = useState('');
  
  // 💡 마크다운 텍스트 대신 JSON 객체를 관리하도록 변경
  const [searchResult, setSearchResult] = useState(DUMMY_WHEEL_SEARCH_DATA);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!wheelName.trim()) {
      alert('휠 제품명을 입력해 주세요.');
      return;
    }

    setLoading(true);
    
    // 임시 검색 테스트 (추후 Gemini API 호출 함수로 교체할 부분)
    setTimeout(() => {
      setSearchResult(DUMMY_WHEEL_SEARCH_DATA);
      setLoading(false);
    }, 300);
  };

  return (
    <div className={styles.searchContainer}>
      {/* 상단 타이틀 영역 */}
      <div className={styles.headerText}>
        <h2>특정 휠의 상세 정보를 빠르게 찾아보고 적합성을 확인하는 페이지입니다</h2>
        <p>휠 제품명을 입력하세요 장착할 차종도 적어주시면 호환성 여부까지 한 번에 확인 가능합니다.</p>
      </div>

      {/* 1. 상단 2분할 검색 바 */}
      <form className={styles.searchFormWrapper} onSubmit={handleSearch}>
        <div className={styles.inputCard}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="휠 제품명을 입력해주세요"
            value={wheelName}
            onChange={(e) => setWheelName(e.target.value)}
          />
        </div>

        <div className={styles.inputCard}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="차종을 입력해주세요 (필수X)"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.searchBtn} disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>

      {/* 2. 하단 JSON 호환성 및 제원 결과 박스 */}
      {searchResult && (
        <div className={styles.resultCard}>
          {/* 요약 문구 */}
          <p className={styles.summaryText}>{searchResult.summary}</p>

          {/* 1. 제원 불일치 항목 */}
          {searchResult.unmatchedSpecs?.length > 0 && (
            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionTitle}>1. 제원 불일치 (장착 불가 원인)</h4>
              <ul className={styles.specList}>
                {searchResult.unmatchedSpecs.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. 해결 과제 */}
          {searchResult.solutions?.length > 0 && (
            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionTitle}>2. 장착을 위한 해결 과제</h4>
              <ul className={styles.specList}>
                {searchResult.solutions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. 최종 조언 */}
          {searchResult.recommendation && (
            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionTitle}>3. 최종 조언</h4>
              <p className={styles.recommendText}>{searchResult.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WheelSearch;