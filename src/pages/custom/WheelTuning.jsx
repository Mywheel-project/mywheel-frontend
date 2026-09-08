import { useState, useEffect } from 'react';
import styles from './WheelTuning.module.css';
import toolsIconImg from '../../assets/custompage/tool.png';
import { WHEEL_ASSETS, BRANDS } from '../../data/wheels';


const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const USER_STORAGE_KEY = 'mywheel_user';
const API_BASE_URL = 'http://localhost:8000';

function getStoredUserId() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved)?.id ?? null : null;
  } catch {
    return null;
  }
}

function WheelTuning() {
  // 1. 차량 사진 관련 State
  const [carFile, setCarFile] = useState(null);
  const [carImagePreview, setCarImagePreview] = useState(null);
  const [isDraggingCar, setIsDraggingCar] = useState(false);

  // 2. 휠 선택 및 모달 관련 State
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedWheelId, setSelectedWheelId] = useState(null);
  const [wheelFile, setWheelFile] = useState(null);
  const [wheelImagePreview, setWheelImagePreview] = useState(null);
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);

  const userId = getStoredUserId();

  // 즐겨찾기 상태 관리 (localStorage + 서버 동기화)
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

  // 3. API 요청 및 결과 State
  const [isLoading, setIsLoading] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);

  // 모달 오픈 시 ESC 키 닫기 핸들러 등록
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsWheelModalOpen(false);
    };
    if (isWheelModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWheelModalOpen]);

  // 파일 유효성 검사
  const validateImageFile = (file) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WEBP 등)만 업로드할 수 있습니다.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`파일 용량이 너무 큽니다. ${MAX_FILE_SIZE_MB}MB 이하의 사진을 올려주세요.`);
      return false;
    }
    return true;
  };

  // 내 차 사진 업로드 및 드래그 앤 드롭
  const applyCarFile = (file) => {
    if (!validateImageFile(file)) return;
    if (carImagePreview) URL.revokeObjectURL(carImagePreview);
    setCarFile(file);
    setCarImagePreview(URL.createObjectURL(file));
  };

  const handleCarImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) applyCarFile(file);
  };

  const handleRemoveCarImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (carImagePreview) URL.revokeObjectURL(carImagePreview);
    setCarFile(null);
    setCarImagePreview(null);
  };

  // 휠 프리셋 선택 토글
  const handleSelectPresetWheel = (wheelId) => {
    if (selectedWheelId === wheelId) {
      setSelectedWheelId(null);
    } else {
      setSelectedWheelId(wheelId);
      if (wheelImagePreview) URL.revokeObjectURL(wheelImagePreview);
      setWheelFile(null);
      setWheelImagePreview(null);
    }
  };

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async (e, wheelId) => {
    e.stopPropagation();

    // 1. 낙관적 UI 업데이트 (로컬 즉시 반영)
    const nextIds = favoriteWheelIds.includes(wheelId)
      ? favoriteWheelIds.filter((id) => id !== wheelId)
      : [...favoriteWheelIds, wheelId];
    setFavoriteWheelIds(nextIds);
    localStorage.setItem('mywheel_favorites', JSON.stringify(nextIds));

    // 2. 로그인 유저인 경우 서버 DB 동기화
    if (userId) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/favorites/wheels/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            wheel_id: wheelId,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.favorite_wheel_ids)) {
            setFavoriteWheelIds(data.favorite_wheel_ids);
            localStorage.setItem('mywheel_favorites', JSON.stringify(data.favorite_wheel_ids));
          }
        }
      } catch (err) {
        console.error('즐겨찾기 서버 저장 실패:', err);
      }
    }
  };

  // 휠 직접 업로드
  const applyWheelFile = (file) => {
    if (!validateImageFile(file)) return;
    if (wheelImagePreview) URL.revokeObjectURL(wheelImagePreview);
    setWheelFile(file);
    setWheelImagePreview(URL.createObjectURL(file));
    setSelectedWheelId(null);
  };

  const handleWheelImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) applyWheelFile(file);
  };

  const handleRemoveWheelImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wheelImagePreview) URL.revokeObjectURL(wheelImagePreview);
    setWheelFile(null);
    setWheelImagePreview(null);
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
        const selectedPreset = WHEEL_ASSETS.find((w) => w.id === selectedWheelId);
        if (selectedPreset) {
          const res = await fetch(selectedPreset.image);
          const blob = await res.blob();
          const ext = selectedPreset.image.split('.').pop().split('?')[0] || 'png';
          formData.append(
            'uploaded_wheel_image',
            blob,
            `${selectedPreset.brand}_${selectedPreset.modelName}.${ext}`
          );
        }
      }

      const response = await fetch('http://localhost:8000/api/v1/custom/synthesize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '합성 요청에 실패했습니다.');
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

  // 결과 이미지 저장 핸들러
  const handleDownloadImage = async () => {
    if (!resultImageUrl) return;

    try {
      const res = await fetch(resultImageUrl);
      const blob = await res.blob();
      const defaultFileName = `mywheel_custom_${Date.now()}.jpg`;

      if ('showSaveFilePicker' in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [{ description: 'JPEG Image', accept: { 'image/jpeg': ['.jpg'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
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
      if (err.name !== 'AbortError') {
        console.error('다운로드 오류:', err);
        alert('이미지 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const selectedPreset = WHEEL_ASSETS.find((w) => w.id === selectedWheelId);

  // 브랜드별 묶음 정렬 로직
  const filteredWheels = WHEEL_ASSETS
    .filter((w) => {
      if (selectedBrand === 'ALL') return true;
      if (selectedBrand === '즐겨찾기') return favoriteWheelIds.includes(w.id);
      return w.brand === selectedBrand;
    })
    .sort((a, b) => {
      // 1. 브랜드 이름 기준 오름차순 (BBS -> ENKEI -> HRE ... 브랜드별로 묶임)
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;

      // 2. 같은 브랜드 안에서는 모델명(또는 id) 순서로 정렬
      return a.modelName.localeCompare(b.modelName);
    });

  return (
    <div className={styles.tuningContainer}>
      {resultImageUrl ? (
        /* CASE A: 결과 화면 */
        <div className={styles.resultContainer}>
          <div className={styles.resultHeader}>
            <span className={styles.badgeSuccess}>COMPLETE</span>
            <h2>이미지 생성이 완료되었습니다</h2>
            <p>완성된 나만의 튜닝 차량을 확인하고 고화질로 저장해 보세요</p>
          </div>

          <div className={styles.resultImageWrapper}>
            <img src={resultImageUrl} alt="휠 튜닝 완료" className={styles.resultImage} />
          </div>

          <div className={styles.resultButtonGroup}>
            <button onClick={handleDownloadImage} className={styles.saveBtn}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              이미지 저장하기
            </button>
            <button onClick={() => setResultImageUrl(null)} className={styles.resetBtn}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              다른 휠로 다시 만들기
            </button>
          </div>
        </div>
      ) : (
        /* CASE B: 휠 합성 작업 화면 */
        <>
          <div className={styles.headerText}>
            <h2>내 차에 어울리는 완벽한 휠을 찾아보세요</h2>
            <p>차량 사진을 올리고 원하는 휠을 선택하면, AI가 원본 각도와 조명에 맞춰 자연스럽게 합성해 드립니다</p>
          </div>

          <div className={styles.mainContent}>
            {/* STEP 1. 차량 사진 등록 카드 */}
            <div className={styles.columnSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.stepBadge}>STEP 1</span>
                <span>차량 사진 등록</span>
              </div>

              <label
                className={`${styles.uploadCard} ${carImagePreview ? styles.hasPreview : ''} ${
                  isDraggingCar ? styles.isDragging : ''
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingCar(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDraggingCar(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCar(false);
                  applyCarFile(e.dataTransfer?.files?.[0]);
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCarImageUpload}
                  onClick={(e) => { e.target.value = ''; }}
                  className={styles.fileInput}
                />

                {carImagePreview ? (
                  <div className={styles.previewContainer}>
                    <img src={carImagePreview} alt="업로드된 차량" className={styles.previewImage} />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={handleRemoveCarImage}
                      title="사진 삭제"
                    >
                      ✕
                    </button>
                    <div className={styles.imageOverlay}>
                      <span>🔄 클릭 또는 드래그하여 사진 변경</span>
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
                    <p className={styles.uploadPrimaryText}>
                      {isDraggingCar ? '여기에 사진을 놓으세요!' : '내 자동차 사진 업로드'}
                    </p>
                    <p className={styles.uploadSubText}>클릭하거나 사진을 드래그해 놓으세요 (최대 15MB)</p>
                  </div>
                )}
              </label>
            </div>

            {/* 가운데 공구 결합 아이콘 */}
            <div className={styles.centerIcon}>
              <div className={styles.toolIconWrapper}>
                <img src={toolsIconImg} alt="튜닝 공구 아이콘" className={styles.toolsImg} />
              </div>
            </div>

            {/* STEP 2. 장착할 휠 선택 */}
            <div className={styles.columnSection}>
              <div className={styles.sectionLabel}>
                <span className={styles.stepBadge}>STEP 2</span>
                <span>장착할 휠 선택</span>
              </div>

              <div className={styles.wheelSelectionGroup}>
                {/* 휠 에셋 모달 오픈 카드 및 현재 선택 상태 요약 */}
                <div
                  className={`${styles.modalOpenCard} ${selectedPreset ? styles.cardActive : ''}`}
                  onClick={() => setIsWheelModalOpen(true)}
                >
                  {selectedPreset ? (
                    <div className={styles.selectedWheelSummary}>
                      <img
                        src={selectedPreset.image}
                        alt={selectedPreset.modelName}
                        className={styles.selectedWheelThumb}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className={styles.selectedWheelInfo}>
                        <span className={styles.selectedBrandBadge}>{selectedPreset.brand}</span>
                        <h4 className={styles.selectedModelName}>{selectedPreset.modelName}</h4>
                        <span className={styles.reselectHint}>클릭하여 다른 휠로 변경</span>
                      </div>
                      <button
                        type="button"
                        className={styles.clearWheelBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWheelId(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className={styles.modalOpenPlaceholder}>
                      <div className={styles.catalogIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </div>
                      <div>
                        <p className={styles.modalOpenPrimary}>휠 카탈로그에서 선택하기</p>
                        <p className={styles.modalOpenSub}>브랜드별 프리셋 휠 구경 및 선택</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 휠 사진 직접 추가하기 박스 */}
                <label
                  className={`${styles.addWheelCard} ${
                    wheelFile ? styles.customWheelSelected : ''
                  } ${isDraggingWheel ? styles.isDragging : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingWheel(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingWheel(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingWheel(false);
                    applyWheelFile(e.dataTransfer?.files?.[0]);
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWheelImageUpload}
                    onClick={(e) => { e.target.value = ''; }}
                    className={styles.fileInput}
                  />

                  {wheelImagePreview ? (
                    <div className={styles.customWheelPreview}>
                      <img src={wheelImagePreview} alt="선택된 휠" className={styles.customWheelThumb} />
                      <div className={styles.customWheelInfo}>
                        <span className={styles.customWheelSuccess}>✓ 직접 등록한 휠 선택됨</span>
                        <span className={styles.customWheelChangeText}>클릭 또는 드래그하여 다른 휠로 변경</span>
                      </div>
                      <button
                        type="button"
                        className={styles.customWheelRemoveBtn}
                        onClick={handleRemoveWheelImage}
                        title="휠 사진 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className={styles.addWheelPlaceholder}>
                      <span className={styles.addIcon}>+</span>
                      <span>
                        {isDraggingWheel ? '여기에 휠 사진을 놓으세요!' : '원하는 휠 사진 직접 추가하기 (드래그 가능)'}
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* 하단 실행 버튼 */}
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

      {/* ----------------- 휠 에셋 선택 모달 창 ----------------- */}
      {isWheelModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsWheelModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3>휠 에셋 카탈로그</h3>
                <p>장착하고 싶은 브랜드와 휠 모델을 선택하세요</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsWheelModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* 브랜드 탭 필터 */}
            <div className={styles.brandTabsWrapper}>
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={`${styles.brandTab} ${selectedBrand === brand ? styles.activeBrandTab : ''}`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* 모달 휠 그리드 */}
            <div className={styles.modalWheelGrid}>
              {filteredWheels.map((wheel) => (
                <div
                  key={wheel.id}
                  className={`${styles.modalWheelCard} ${
                    selectedWheelId === wheel.id ? styles.selectedModalWheel : ''
                  }`}
                  onClick={() => handleSelectPresetWheel(wheel.id)}
                >
                  {/* 즐겨찾기 별 토글 버튼 */}
                  <button
                    type="button"
                    className={`${styles.starBtn} ${
                      favoriteWheelIds.includes(wheel.id) ? styles.starActive : ''
                    }`}
                    onClick={(e) => handleToggleFavorite(e, wheel.id)}
                    title={favoriteWheelIds.includes(wheel.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    ★
                  </button>

                  <div className={styles.wheelImageFrame}>
                    <img
                      src={wheel.image}
                      alt={wheel.modelName}
                      className={styles.wheelAssetImg}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className={styles.wheelDiscFallback} style={{ display: 'none' }}>
                      <div className={styles.wheelSpokeCross} />
                      <div className={styles.wheelCenterCap} />
                    </div>
                  </div>

                  <div className={styles.wheelMeta}>
                    <span className={styles.wheelBrandTag}>{wheel.brand}</span>
                    <strong className={styles.wheelModelTitle}>{wheel.modelName}</strong>
                  </div>

                  {selectedWheelId === wheel.id && <div className={styles.checkBadge}>✓</div>}
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={() => setIsWheelModalOpen(false)}
              >
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WheelTuning;