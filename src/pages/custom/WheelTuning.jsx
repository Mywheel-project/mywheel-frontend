import { useState } from 'react';
import styles from './WheelTuning.module.css';
import toolsIconImg from '../../assets/custompage/tool.png';

// 임시 휠 프리셋 데이터
const DUMMY_WHEELS = [
  { id: 1, name: 'BBS Super RS', isFavorite: true },
  { id: 2, name: 'Rays TE37', isFavorite: false },
  { id: 3, name: 'Work Meister S1', isFavorite: false },
  { id: 4, name: 'Enkei RPF1', isFavorite: false },
  { id: 5, name: 'OZ Ultraleggera', isFavorite: true },
  { id: 6, name: 'Rotiform BLQ', isFavorite: false },
  { id: 7, name: 'HRE P101', isFavorite: false },
  { id: 8, name: 'Advan GT', isFavorite: false },
];

function WheelTuning() {
  // 1. 차량 사진 관련 State
  const [carFile, setCarFile] = useState(null);
  const [carImagePreview, setCarImagePreview] = useState(null);

  // 2. 휠 선택 관련 State
  const [selectedWheelId, setSelectedWheelId] = useState(null);
  const [wheelFile, setWheelFile] = useState(null);
  const [wheelImagePreview, setWheelImagePreview] = useState(null);

  // 3. API 요청 및 결과 State
  const [isLoading, setIsLoading] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);

  // 내 차 사진 업로드 핸들러
  const handleCarImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCarFile(file);
      setCarImagePreview(URL.createObjectURL(file));
    }
  };

  // 휠 프리셋 클릭 핸들러 (재클릭 시 선택 해제)
  const handleSelectPresetWheel = (wheelId) => {
    if (selectedWheelId === wheelId) {
      setSelectedWheelId(null);
    } else {
      setSelectedWheelId(wheelId);
      setWheelFile(null);
      setWheelImagePreview(null);
    }
  };

  // 휠 사진 직접 업로드 핸들러
  const handleWheelImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWheelFile(file);
      setWheelImagePreview(URL.createObjectURL(file));
      setSelectedWheelId(null);
    }
  };

  // AI 휠 합성 요청 함수
  const handleSynthesize = async () => {
    if (!carFile) {
      alert('튜닝할 자동차 사진을 업로드해 주세요!');
      return;
    }

    if (!selectedWheelId && !wheelFile) {
      alert('장착할 휠을 선택하거나 직접 휠 사진을 올려주세요!');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('original_vehicle_image', carFile);

      if (wheelFile) {
        formData.append('uploaded_wheel_image', wheelFile);
      } else if (selectedWheelId) {
        const selectedPreset = DUMMY_WHEELS.find(
          (w) => w.id === selectedWheelId
        );
        formData.append(
          'selected_asset_id',
          selectedPreset ? selectedPreset.name : String(selectedWheelId)
        );
      }

      const response = await fetch(
        'http://localhost:8000/api/v1/custom/synthesize',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || '합성 요청에 실패했습니다.'
        );
      }

      const data = await response.json();
      setResultImageUrl(data.result_image_url);
    } catch (error) {
      console.error('합성 오류:', error);
      alert(`오류 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 결과 이미지 다운로드 핸들러 (경로 선택 창 지원)
  const handleDownloadImage = async () => {
    if (!resultImageUrl) return;

    try {
      const res = await fetch(resultImageUrl);
      const blob = await res.blob();
      const defaultFileName = `mywheel_custom_${Date.now()}.jpg`;

      // 1. 최신 브라우저 (Chrome, Edge 등): '다른 이름으로 저장' 파일 탐색기 창 열기
      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [
            {
              description: 'JPEG Image',
              accept: { 'image/jpeg': ['.jpg'] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // 2. 미지원 브라우저: 기본 a 태그 다운로드 폴백
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = defaultFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      // 사용자가 탐색기 창에서 '취소'를 누른 경우는 에러 알림 생략
      if (err.name !== 'AbortError') {
        console.error('다운로드 오류:', err);
        alert('이미지 저장 중 오류가 발생했습니다.');
      }
    }
  };

  // 다시 만들기 (초기화)
  const handleReset = () => {
    setResultImageUrl(null);
  };

  const selectedPreset = DUMMY_WHEELS.find((w) => w.id === selectedWheelId);

  return (
    <div className={styles.tuningContainer}>
      {/* ----------------- CASE A: 결과 화면 ----------------- */}
      {resultImageUrl ? (
        <div className={styles.resultContainer}>
          {/* 1. 상단 안내 문구 */}
          <div className={styles.resultHeader}>
            <span className={styles.badgeSuccess}>COMPLETE</span>
            <h2>이미지 생성이 완료되었습니다</h2>
            <p>완성된 나만의 튜닝 차량을 확인하고 고화질로 저장해 보세요</p>
          </div>

          {/* 2. 중앙 완성 사진 프레임 */}
          <div className={styles.resultImageWrapper}>
            <img
              src={resultImageUrl}
              alt="휠 튜닝 완료"
              className={styles.resultImage}
            />
          </div>

          {/* 3. 하단 버튼 그룹 */}
          <div className={styles.resultButtonGroup}>
            <button
              onClick={handleDownloadImage}
              className={styles.saveBtn}
            >
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              이미지 저장하기
            </button>

            <button
              onClick={handleReset}
              className={styles.resetBtn}
            >
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              다른 휠로 다시 만들기
            </button>
          </div>
        </div>
      ) : (
        /* ----------------- CASE B: 휠 합성 작업 화면 ----------------- */
        <>
          {/* 상단 타이틀 영역 */}
          <div className={styles.headerText}>
            <h2>내 차에 어울리는 완벽한 휠을 찾아보세요</h2>
            <p>
              차량 사진을 올리고 원하는 휠을 선택하면, AI가 원본 각도와 조명에 맞춰 자연스럽게 합성해 드립니다
            </p>
          </div>

          {/* 메인 작업 영역 */}
          <div className={styles.mainContent}>
            {/* 1. 왼쪽: 튜닝할 자동차 사진 업로드 박스 */}
            <div className={styles.columnSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.stepBadge}>STEP 1</span>
                <span>차량 사진 등록</span>
              </div>

              <label className={`${styles.uploadCard} ${carImagePreview ? styles.hasPreview : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCarImageUpload}
                  className={styles.fileInput}
                />

                {carImagePreview ? (
                  <div className={styles.previewContainer}>
                    <img
                      src={carImagePreview}
                      alt="업로드된 차량"
                      className={styles.previewImage}
                    />
                    <div className={styles.imageOverlay}>
                      <span>🔄 사진 변경하기</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIconCircle}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <p className={styles.uploadPrimaryText}>내 자동차 사진 업로드</p>
                    <p className={styles.uploadSubText}>측면 또는 45도 각도 사진 권장</p>
                  </div>
                )}
              </label>
            </div>

            {/* 2. 가운데: 공구/결합 아이콘 */}
            <div className={styles.centerIcon}>
              <div className={styles.toolIconWrapper}>
                <img
                  src={toolsIconImg}
                  alt="튜닝 공구 아이콘"
                  className={styles.toolsImg}
                />
              </div>
            </div>

            {/* 3. 오른쪽: 휠 프리셋 그리드 & 직접 추가 */}
            <div className={styles.columnSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.stepBadge}>STEP 2</span>
                <span>
                  장착할 휠 선택 {selectedPreset && <strong className={styles.selectedWheelLabel}>({selectedPreset.name})</strong>}
                </span>
              </div>

              <div className={styles.wheelSelectionGroup}>
                {/* 휠 이미지 8개 그리드 */}
                <div className={styles.wheelGrid}>
                  {DUMMY_WHEELS.map((wheel) => (
                    <button
                      key={wheel.id}
                      type="button"
                      title={wheel.name}
                      className={`${styles.wheelItem} ${
                        selectedWheelId === wheel.id ? styles.selectedWheel : ''
                      }`}
                      onClick={() => handleSelectPresetWheel(wheel.id)}
                    >
                      <div className={styles.wheelDisc}>
                        <div className={styles.wheelSpokeCross} />
                        <div className={styles.wheelCenterCap} />
                      </div>
                      <span className={styles.wheelItemName}>{wheel.name}</span>

                      {wheel.isFavorite && (
                        <span className={styles.starBadge} title="인기 휠">★</span>
                      )}
                      {selectedWheelId === wheel.id && (
                        <div className={styles.checkBadge}>✓</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* 휠 사진 직접 추가하기 박스 */}
                <label
                  className={`${styles.addWheelCard} ${
                    wheelFile ? styles.customWheelSelected : ''
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWheelImageUpload}
                    className={styles.fileInput}
                  />

                  {wheelImagePreview ? (
                    <div className={styles.customWheelPreview}>
                      <img src={wheelImagePreview} alt="선택된 휠" className={styles.customWheelThumb} />
                      <div className={styles.customWheelInfo}>
                        <span className={styles.customWheelSuccess}>✓ 직접 등록한 휠 선택됨</span>
                        <span className={styles.customWheelChangeText}>클릭하여 다른 휠로 변경</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.addWheelPlaceholder}>
                      <span className={styles.addIcon}>+</span>
                      <span>원하는 휠 사진 직접 추가하기</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* 하단 결과보기 버튼 */}
          <div className={styles.actionGroup}>
            <button
              className={styles.submitBtn}
              onClick={handleSynthesize}
              disabled={isLoading || !carFile || (!selectedWheelId && !wheelFile)}
            >
              {isLoading ? (
                <span className={styles.loadingTextWrapper}>
                  <span className={styles.spinner} />
                  휠 합성 진행 중... (약 10~15초 소요)
                </span>
              ) : (
                '휠 튜닝 결과보기'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default WheelTuning;