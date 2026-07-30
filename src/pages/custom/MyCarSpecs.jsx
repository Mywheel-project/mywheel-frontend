import { useState } from 'react';
import styles from './MyCarSpecs.module.css';

// 차종별 예시 제원 데이터 (추후 API 연동 위치)
const DUMMY_SPEC_DATA = {
  title: '[Mercedes-Benz W219 CLS 휠/타이어 제원]',
  basicSpecs: [
    'PCD: 112',
    '허브보어: 66.6mm',
    '볼트 규격: M14 × 1.5',
  ],
  recommendedWheelSpecs: [
    '전륜 (Front): 8.5J / 옵셋 +25 ~ +30',
    '후륜 (Rear): 9.5J ~ 10.0J / 옵셋 +25 ~ +28',
  ],
  recommendedTireSpecs: [
    '18인치 세팅: (앞) 245/40/18, (뒤) 275/35/18',
    '19인치 세팅: (앞) 245/35/19, (뒤) 275/30/19 (또는 285/30/19)',
  ],
  keyNotes: [
    '낮은 옵셋 필수: E클래스용(ET 35~45) 장착 시 휠이 안으로 너무 들어가므로 스페이서가 필요할 수 있습니다.',
    '스태거드 세팅: CLS 특유의 자세를 위해 전/후륜 휠 폭과 옵셋을 다르게 가져가는 것이 기본입니다.',
    'AMG 스타일: 가장 선호되는 뒤태는 후륜 옵셋 ET 25 내외 세팅입니다.',
  ],
};

function MyCarSpecs() {
  const [searchTerm, setSearchTerm] = useState('w219 cls');
  const [searchResult, setSearchResult] = useState(DUMMY_SPEC_DATA);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // 시연용: 무엇을 검색하든 W219 CLS 결과 또는 검색 결과를 세팅
    setSearchResult(DUMMY_SPEC_DATA);
  };

  return (
    <div className={styles.specsContainer}>
      {/* 상단 제목 및 안내 문구 */}
      <div className={styles.headerText}>
        <h2>차량에 맞는 최적의 스펙을 제안하는 페이지입니다</h2>
        <p>자신의 차종을 상세하게 적어주세요 (ex lf 소나타, w219 cls)</p>
      </div>

      {/* 1. 검색창 영역 */}
      <form className={styles.searchBarWrapper} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="차종을 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className={styles.searchBtn}>
          검색
        </button>
      </form>

      {/* 2. 하단 제원 결과 박스 */}
      {searchResult && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>{searchResult.title}</h3>

          <div className={styles.specSection}>
            <h4 className={styles.sectionHeading}>1. 휠 기본 제원</h4>
            <ul className={styles.specList}>
              {searchResult.basicSpecs.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.specSection}>
            <h4 className={styles.sectionHeading}>2. 권장 휠 상세 (전륜/후륜 차등 세팅)</h4>
            <ul className={styles.specList}>
              {searchResult.recommendedWheelSpecs.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.specSection}>
            <h4 className={styles.sectionHeading}>3. 권장 타이어 사이즈</h4>
            <ul className={styles.specList}>
              {searchResult.recommendedTireSpecs.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.specSection}>
            <h4 className={styles.sectionHeading}>4. 세팅 핵심 요약</h4>
            <ul className={styles.specList}>
              {searchResult.keyNotes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCarSpecs;