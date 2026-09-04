import { useState } from 'react';
import styles from './WheelTuning.module.css';

import toolsIconImg from '../../assets/custompage/tool.png';

// 임시 휠 프리셋 데이터 (나중에 실제 휠 이미지 경로로 교체)
const DUMMY_WHEELS = [
  { id: 1, name: 'Wheel 1', isFavorite: true },
  { id: 2, name: 'Wheel 2', isFavorite: false },
  { id: 3, name: 'Wheel 3', isFavorite: false },
  { id: 4, name: 'Wheel 4', isFavorite: false },
  { id: 5, name: 'Wheel 5', isFavorite: true },
  { id: 6, name: 'Wheel 6', isFavorite: false },
  { id: 7, name: 'Wheel 7', isFavorite: false },
  { id: 8, name: 'Wheel 8', isFavorite: false },
];

function WheelTuning() {
  const [carImage, setCarImage] = useState(null);
  const [selectedWheel, setSelectedWheel] = useState(null);

  // 내 차 사진 업로드 핸들러
  const handleCarImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCarImage(URL.createObjectURL(file));
    }
  };

  // 휠 직접 추가 업로드 핸들러
  const handleWheelImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 직접 올린 휠 선택 처리 로직 작성 가능
      console.log('업로드된 휠 파일:', file);
    }
  };

  return (
    <div className={styles.tuningContainer}>
      {/* 상단 타이틀 영역 */}
      <div className={styles.headerText}>
        <h2>내 차에 어울리는 완벽한 휠을 찾아보세요</h2>
        <p>사진을 업로드하고 다양한 브랜드의 휠을 가상으로 장착해 보세요 AI가 각도와 조명을 자동으로 맞춰드립니다</p>
      </div>

      {/* 메인 작업 영역 (좌: 차량 / 중: 아이콘 / 우: 휠 선택) */}
      <div className={styles.mainContent}>
        
        {/* 1. 왼쪽: 튜닝할 자동차 사진 업로드 박스 */}
        <label className={styles.uploadCard}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleCarImageUpload} 
            className={styles.fileInput} 
          />
          {carImage ? (
            <img src={carImage} alt="업로드된 차량" className={styles.previewImage} />
          ) : (
            <div className={styles.uploadPlaceholder}>
              <p>튜닝할 자동차의 사진을</p>
              <p>올려주세요</p>
            </div>
          )}
        </label>

        {/* 2. 가운데: 아이콘 */}
        <div className={styles.centerIcon}>
          <img src={toolsIconImg} alt="튜닝 공구 아이콘" className={styles.toolsImg} />
        </div>

        {/* 3. 오른쪽: 휠 프리셋 그리드 & 직접 추가 */}
        <div className={styles.wheelSelectionGroup}>
          
          {/* 휠 이미지 8개 그리드 */}
          <div className={styles.wheelGrid}>
            {DUMMY_WHEELS.map((wheel) => (
              <div 
                key={wheel.id} 
                className={`${styles.wheelItem} ${selectedWheel === wheel.id ? styles.selectedWheel : ''}`}
                onClick={() => setSelectedWheel(wheel.id)}
              >
                {/* 휠 원형 자리 (나중에 <img src={wheel.img} /> 로 교체) */}
                <div className={styles.wheelCircle}>
                  <div className={styles.wheelInnerPattern} />
                </div>
                {wheel.isFavorite && <span className={styles.starBadge}>★</span>}
              </div>
            ))}
          </div>

          {/* 휠 사진 직접 추가하기 박스 */}
          <label className={styles.addWheelCard}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleWheelImageUpload} 
              className={styles.fileInput} 
            />
            <span>휠 사진 직접 추가하기</span>
          </label>

        </div>

      </div>

      {/* 하단 결과보기 버튼 */}
      <div className={styles.actionGroup}>
        <button className={styles.submitBtn}>결과보기</button>
      </div>
    </div>
  );
}

export default WheelTuning;