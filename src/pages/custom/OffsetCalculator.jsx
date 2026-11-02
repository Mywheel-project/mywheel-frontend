import React, { useState, useMemo } from 'react';
import styles from './OffsetCalculator.module.css';

// 안전한 숫자 포맷 함수 (undefined, NaN 방지)
const safeFormat = (val, digits = 1) => {
  const num = Number(val);
  if (isNaN(num) || !Number.isFinite(num)) {
    return (0).toFixed(digits);
  }
  return num.toFixed(digits);
};

// 기본 초기값 (0 세팅)
const INITIAL_WHEEL_STATE = {
  rimWidth: 0,  // inch
  et: 0,        // mm
  spacer: 0,    // mm
  diameter: 0,  // inch
  tireWidth: 0, // mm
  aspect: 0,    // %
};

function OffsetCalculator() {
  // 기존 휠/타이어 스펙 (Current Setup) - 초기 상태 0
  const [currentWheel, setCurrentWheel] = useState({ ...INITIAL_WHEEL_STATE });

  // 변경 휠/타이어 스펙 (New Setup) - 초기 상태 0
  const [newWheel, setNewWheel] = useState({ ...INITIAL_WHEEL_STATE });

  // 타이어 비교 탭 / 옵션 토글
  const [includeTire, setIncludeTire] = useState(true);

  // 실시간 기하 계산
  const fitment = useMemo(() => {
    const curW = Number(currentWheel.rimWidth) || 0;
    const curET = Number(currentWheel.et) || 0;
    const curSp = Number(currentWheel.spacer) || 0;
    const curD = Number(currentWheel.diameter) || 0;
    const curTW = Number(currentWheel.tireWidth) || 0;
    const curAR = Number(currentWheel.aspect) || 0;

    const newW = Number(newWheel.rimWidth) || 0;
    const newET = Number(newWheel.et) || 0;
    const newSp = Number(newWheel.spacer) || 0;
    const newD = Number(newWheel.diameter) || 0;
    const newTW = Number(newWheel.tireWidth) || 0;
    const newAR = Number(newWheel.aspect) || 0;

    // 1. 림 폭 (mm)
    const curWidthMm = curW * 25.4;
    const newWidthMm = newW * 25.4;

    // 2. 유효 옵셋 (Effective ET = ET - Spacer)
    const curEffET = curET - curSp;
    const newEffET = newET - newSp;

    // 3. Backspacing (허브 장착면에서 안쪽 림 끝까지의 거리 - 서스펜션 간격 기준)
    const curBackspacing = curWidthMm > 0 ? (curWidthMm / 2) + curEffET : 0;
    const newBackspacing = newWidthMm > 0 ? (newWidthMm / 2) + newEffET : 0;

    // 4. Frontspacing (허브 장착면에서 바깥쪽 림 끝까지의 거리 - 휀더 돌출 기준)
    const curFrontspacing = curWidthMm > 0 ? (curWidthMm / 2) - curEffET : 0;
    const newFrontspacing = newWidthMm > 0 ? (newWidthMm / 2) - newEffET : 0;

    // 5. 변화량 계산 (둘 다 입력되었을 때 유의미)
    const pokeDiff = (curWidthMm > 0 && newWidthMm > 0) ? (newFrontspacing - curFrontspacing) : 0;
    const innerDiff = (curWidthMm > 0 && newWidthMm > 0) ? (newBackspacing - curBackspacing) : 0;

    // 6. 타이어 계산
    const curSidewall = curTW * (curAR / 100);
    const newSidewall = newTW * (newAR / 100);

    const curTotalDiameter = curD > 0 ? (curD * 25.4) + (curSidewall * 2) : 0;
    const newTotalDiameter = newD > 0 ? (newD * 25.4) + (newSidewall * 2) : 0;

    const curCircumference = curTotalDiameter > 0 ? curTotalDiameter * Math.PI : 0;
    const newCircumference = newTotalDiameter > 0 ? newTotalDiameter * Math.PI : 0;

    const diameterDiff = (curTotalDiameter > 0 && newTotalDiameter > 0) ? (newTotalDiameter - curTotalDiameter) : 0;
    const circumferenceDiff = (curCircumference > 0 && newCircumference > 0) ? (newCircumference - curCircumference) : 0;
    
    const speedoErrorPercent = (curCircumference > 0 && newCircumference > 0)
      ? ((newCircumference - curCircumference) / curCircumference) * 100 
      : 0;

    const actualSpeedAt100 = 100 * (1 + speedoErrorPercent / 100);

    return {
      curWidthMm: Number.isFinite(curWidthMm) ? curWidthMm : 0,
      newWidthMm: Number.isFinite(newWidthMm) ? newWidthMm : 0,
      curEffET: Number.isFinite(curEffET) ? curEffET : 0,
      newEffET: Number.isFinite(newEffET) ? newEffET : 0,
      curBackspacing: Number.isFinite(curBackspacing) ? curBackspacing : 0,
      newBackspacing: Number.isFinite(newBackspacing) ? newBackspacing : 0,
      curFrontspacing: Number.isFinite(curFrontspacing) ? curFrontspacing : 0,
      newFrontspacing: Number.isFinite(newFrontspacing) ? newFrontspacing : 0,
      pokeDiff: Number.isFinite(pokeDiff) ? pokeDiff : 0,
      innerDiff: Number.isFinite(innerDiff) ? innerDiff : 0,
      curTotalDiameter: Number.isFinite(curTotalDiameter) ? curTotalDiameter : 0,
      newTotalDiameter: Number.isFinite(newTotalDiameter) ? newTotalDiameter : 0,
      curCircumference: Number.isFinite(curCircumference) ? curCircumference : 0,
      newCircumference: Number.isFinite(newCircumference) ? newCircumference : 0,
      diameterDiff: Number.isFinite(diameterDiff) ? diameterDiff : 0,
      circumferenceDiff: Number.isFinite(circumferenceDiff) ? circumferenceDiff : 0,
      speedoErrorPercent: Number.isFinite(speedoErrorPercent) ? speedoErrorPercent : 0,
      actualSpeedAt100: Number.isFinite(actualSpeedAt100) ? actualSpeedAt100 : 100,
    };
  }, [currentWheel, newWheel]);

  // 초기화 핸들러 (0으로 리셋)
  const handleReset = () => {
    setCurrentWheel({ ...INITIAL_WHEEL_STATE });
    setNewWheel({ ...INITIAL_WHEEL_STATE });
  };

  // SVG 다이어그램 좌표 계산 (단면도)
  const svgCenterY = 125;
  const hubX = 195; // 허브 장착면
  const scale = 1.0;

  const curLeft = hubX - (fitment.curBackspacing || 0) * scale;
  const curWidth = (fitment.curWidthMm || 0) * scale;
  const curHeight = 130;

  const newLeft = hubX - (fitment.newBackspacing || 0) * scale;
  const newWidth = (fitment.newWidthMm || 0) * scale;
  const newHeight = 130;

  const hasInputValues = (currentWheel.rimWidth > 0 || newWheel.rimWidth > 0);

  return (
    <div className={styles.container}>
      {/* 상단 제목 및 설명 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleBadge}>OFFSET CALCULATOR</div>
          <h2 className={styles.title}>휠 옵셋(ET) & 스탠스 계산기</h2>
          <p className={styles.subtitle}>
            기존 휠 스펙과 신규 휠 스펙을 비교하여 휀더 돌출량과 서스펜션 간섭 여유를 실시간으로 확인하세요
          </p>
        </div>
        <button className={styles.resetBtn} onClick={handleReset} title="수치 전체 초기화">
          ↻ 초기화
        </button>
      </div>

      {/* 메인 2열 그리드 */}
      <div className={styles.mainGrid}>
        
        {/* 좌측: 제원 입력 영역 */}
        <div className={styles.inputSection}>
          
          {/* 1. 기존 휠 (Current Setup) */}
          <div className={`${styles.specCard} ${styles.currentCard}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardBadgeCurrent}>CURRENT</span>
              <h3>기존 휠 / 타이어</h3>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>림 폭 (Width)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    placeholder="0"
                    value={currentWheel.rimWidth === 0 ? '' : currentWheel.rimWidth}
                    onChange={(e) => setCurrentWheel({ ...currentWheel, rimWidth: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  />
                  <span className={styles.unit}>J</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>옵셋 (ET)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="1"
                    min="-70"
                    max="80"
                    placeholder="0"
                    value={currentWheel.et === 0 ? '' : currentWheel.et}
                    onChange={(e) => setCurrentWheel({ ...currentWheel, et: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  />
                  <span className={styles.unit}>mm</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>스페이서</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="60"
                    placeholder="0"
                    value={currentWheel.spacer === 0 ? '' : currentWheel.spacer}
                    onChange={(e) => setCurrentWheel({ ...currentWheel, spacer: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  />
                  <span className={styles.unit}>mm</span>
                </div>
              </div>
            </div>

            {includeTire && (
              <div className={styles.tireSubSection}>
                <div className={styles.tireSubTitle}>타이어 규격</div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>단면폭</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="385"
                      placeholder="0"
                      value={currentWheel.tireWidth === 0 ? '' : currentWheel.tireWidth}
                      onChange={(e) => setCurrentWheel({ ...currentWheel, tireWidth: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>편평비(%)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="85"
                      placeholder="0"
                      value={currentWheel.aspect === 0 ? '' : currentWheel.aspect}
                      onChange={(e) => setCurrentWheel({ ...currentWheel, aspect: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>휠 인치(R)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="26"
                      placeholder="0"
                      value={currentWheel.diameter === 0 ? '' : currentWheel.diameter}
                      onChange={(e) => setCurrentWheel({ ...currentWheel, diameter: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. 신규 휠 (New Setup) */}
          <div className={`${styles.specCard} ${styles.newCard}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardBadgeNew}>NEW</span>
              <h3>신규 휠 / 타이어</h3>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>림 폭 (Width)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    placeholder="0"
                    value={newWheel.rimWidth === 0 ? '' : newWheel.rimWidth}
                    onChange={(e) => setNewWheel({ ...newWheel, rimWidth: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  />
                  <span className={styles.unit}>J</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>옵셋 (ET)</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="1"
                    min="-70"
                    max="80"
                    placeholder="0"
                    value={newWheel.et === 0 ? '' : newWheel.et}
                    onChange={(e) => setNewWheel({ ...newWheel, et: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  />
                  <span className={styles.unit}>mm</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>스페이서</label>
                <div className={styles.inputWithUnit}>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="60"
                    placeholder="0"
                    value={newWheel.spacer === 0 ? '' : newWheel.spacer}
                    onChange={(e) => setNewWheel({ ...newWheel, spacer: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                  />
                  <span className={styles.unit}>mm</span>
                </div>
              </div>
            </div>

            {includeTire && (
              <div className={styles.tireSubSection}>
                <div className={styles.tireSubTitle}>타이어 규격</div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>단면폭</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="385"
                      placeholder="0"
                      value={newWheel.tireWidth === 0 ? '' : newWheel.tireWidth}
                      onChange={(e) => setNewWheel({ ...newWheel, tireWidth: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>편평비(%)</label>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      max="85"
                      placeholder="0"
                      value={newWheel.aspect === 0 ? '' : newWheel.aspect}
                      onChange={(e) => setNewWheel({ ...newWheel, aspect: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>휠 인치(R)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="26"
                      placeholder="0"
                      value={newWheel.diameter === 0 ? '' : newWheel.diameter}
                      onChange={(e) => setNewWheel({ ...newWheel, diameter: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.toggleRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeTire}
                onChange={(e) => setIncludeTire(e.target.checked)}
              />
              <span>타이어 외경 및 속도계 오차 계산 포함</span>
            </label>
          </div>
        </div>

        {/* 우측: 핵심 결과 요약 및 2D 단면 시각화 */}
        <div className={styles.resultSection}>
          
          {/* 핵심 지표 2개 카드 */}
          <div className={styles.highlightGrid}>
            {/* 1. 바깥쪽 휀더 돌출량 */}
            <div className={`${styles.highlightCard} ${fitment.pokeDiff > 0 ? styles.alertWarning : styles.alertNormal}`}>
              <div className={styles.highlightTitle}>
                <span>바깥쪽 휀더 돌출 (Poke)</span>
                <span className={styles.badgeIndicator}>외측</span>
              </div>
              <div className={styles.highlightValue}>
                {fitment.pokeDiff > 0 ? `+${safeFormat(fitment.pokeDiff, 1)}` : safeFormat(fitment.pokeDiff, 1)} <small>mm</small>
              </div>
              <p className={styles.highlightDesc}>
                {fitment.pokeDiff > 0 ? (
                  <>기존 대비 <strong>{safeFormat(fitment.pokeDiff, 1)}mm</strong> 더 바깥쪽으로 돌출</>
                ) : fitment.pokeDiff < 0 ? (
                  <>기존 대비 <strong>{safeFormat(Math.abs(fitment.pokeDiff), 1)}mm</strong> 안쪽으로 인입</>
                ) : (
                  <>기존 휠과 바깥쪽 돌출 위치 동일</>
                )}
              </p>
            </div>

            {/* 2. 안쪽 서스펜션 간격 */}
            <div className={`${styles.highlightCard} ${fitment.innerDiff > 0 ? styles.alertDanger : styles.alertSafe}`}>
              <div className={styles.highlightTitle}>
                <span>서스펜션 간격 (Clearance)</span>
                <span className={styles.badgeIndicator}>내측</span>
              </div>
              <div className={styles.highlightValue}>
                {fitment.innerDiff > 0 ? `-${safeFormat(fitment.innerDiff, 1)}` : fitment.innerDiff < 0 ? `+${safeFormat(Math.abs(fitment.innerDiff), 1)}` : `0.0`} <small>mm</small>
              </div>
              <p className={styles.highlightDesc}>
                {fitment.innerDiff > 0 ? (
                  <>서스펜션 쪽으로 <strong>{safeFormat(fitment.innerDiff, 1)}mm</strong> 접근 (간섭 유의)</>
                ) : fitment.innerDiff < 0 ? (
                  <>서스펜션 안쪽 공간 <strong>{safeFormat(Math.abs(fitment.innerDiff), 1)}mm</strong> 여유 확보</>
                ) : (
                  <>기존 휠과 안쪽 서스펜션 간격 동일</>
                )}
              </p>
            </div>
          </div>

          {/* 2D 단면 SVG 그래픽 시각화 */}
          <div className={styles.visualizerCard}>
            <div className={styles.visualizerHeader}>
              <h4>휠 단면 시각화 (Top-down View)</h4>
              <div className={styles.legend}>
                <span className={styles.legendCur}><i /> 기존 ({currentWheel.rimWidth || 0}J ET{currentWheel.et || 0})</span>
                <span className={styles.legendNew}><i /> 신규 ({newWheel.rimWidth || 0}J ET{newWheel.et || 0})</span>
              </div>
            </div>

            <div className={styles.svgWrapper}>
              <svg viewBox="0 0 370 250" className={styles.visualizerSvg}>
                <defs>
                  <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#f2f2f2" strokeWidth="1" />
                  </pattern>
                  <pattern id="curHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#bbb" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="strutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <linearGradient id="springGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* 차체 기준 영역 라벨 */}
                <text x="16" y="24" className={styles.svgAreaLabel}>← 서스펜션 / 쇼바 (내측)</text>
                <text x="270" y="24" className={styles.svgAreaLabel}>휀더 / 차체 (외측) →</text>

                {/* [서스펜션 & 코일오버 시각화 일러스트] (X: 18~42) */}
                <g className={styles.suspensionIllustration}>
                  <rect x="18" y="38" width="28" height="8" rx="2" fill="#334155" />
                  <rect x="27" y="44" width="10" height="162" rx="2" fill="url(#strutGrad)" />
                  <rect x="21" y="58" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="70" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="82" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="94" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="106" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="118" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="130" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="142" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="154" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="166" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="21" y="178" width="22" height="6" rx="3" fill="url(#springGrad)" stroke="#1e40af" strokeWidth="0.5" />
                  <rect x="20" y="196" width="24" height="14" rx="2" fill="#334155" />
                  <circle cx="26" cy="203" r="2" fill="#fff" opacity="0.8" />
                  <circle cx="38" cy="203" r="2" fill="#fff" opacity="0.8" />
                  <text x="32" y="226" fill="#475569" fontSize="8.5" fontWeight="bold" textAnchor="middle">서스펜션</text>
                </g>

                {/* 허브 장착면 (Hub Mounting Surface) 기준선 */}
                <line x1={hubX} y1="35" x2={hubX} y2="210" stroke="#ff4d4f" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x={hubX - 10} y={svgCenterY - 26} width="10" height="52" fill="#1e293b" rx="2" />
                <text x={hubX - 5} y={svgCenterY + 3} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">허브</text>
                <text x={hubX} y="226" className={styles.hubLabel} textAnchor="middle">장착면</text>

                {/* 기존 휠 박스 (너비가 0보다 클 때 렌더링) */}
                {curWidth > 0 && (
                  <rect
                    x={curLeft}
                    y={svgCenterY - curHeight / 2}
                    width={curWidth}
                    height={curHeight}
                    fill="url(#curHatch)"
                    stroke="#888"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    rx="3"
                    opacity="0.75"
                  />
                )}

                {/* 신규 휠 박스 (너비가 0보다 클 때 렌더링) */}
                {newWidth > 0 && (
                  <rect
                    x={newLeft}
                    y={svgCenterY - newHeight / 2}
                    width={newWidth}
                    height={newHeight}
                    fill="rgba(230, 0, 0, 0.12)"
                    stroke="#e60000"
                    strokeWidth="2"
                    rx="3"
                  />
                )}

                {/* 림 립 강조선 (신규 휠 입력 시) */}
                {newWidth > 0 && (
                  <>
                    <line
                      x1={newLeft + newWidth}
                      y1={svgCenterY - newHeight / 2 - 6}
                      x2={newLeft + newWidth}
                      y2={svgCenterY + newHeight / 2 + 6}
                      stroke="#e60000"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={newLeft}
                      y1={svgCenterY - newHeight / 2 - 6}
                      x2={newLeft}
                      y2={svgCenterY + newHeight / 2 + 6}
                      stroke="#e60000"
                      strokeWidth="2.5"
                    />
                  </>
                )}

                {/* 휀더 바깥쪽 변화량 표시선 */}
                {hasInputValues && Math.abs(fitment.pokeDiff) > 0.5 && (
                  <g>
                    <line
                      x1={curLeft + curWidth}
                      y1={svgCenterY - 45}
                      x2={newLeft + newWidth}
                      y2={svgCenterY - 45}
                      stroke="#e60000"
                      strokeWidth="1.5"
                    />
                    <text
                      x={(curLeft + curWidth + newLeft + newWidth) / 2}
                      y={svgCenterY - 51}
                      className={styles.svgDiffText}
                      textAnchor="middle"
                    >
                      {fitment.pokeDiff > 0 ? `+${safeFormat(fitment.pokeDiff, 1)}mm 돌출` : `${safeFormat(fitment.pokeDiff, 1)}mm 인입`}
                    </text>
                  </g>
                )}

                {/* 안쪽 서스펜션 변화량 표시선 */}
                {hasInputValues && Math.abs(fitment.innerDiff) > 0.5 && (
                  <g>
                    <line
                      x1={curLeft}
                      y1={svgCenterY + 45}
                      x2={newLeft}
                      y2={svgCenterY + 45}
                      stroke={fitment.innerDiff > 0 ? '#d9363e' : '#28a745'}
                      strokeWidth="1.5"
                    />
                    <text
                      x={(curLeft + newLeft) / 2}
                      y={svgCenterY + 59}
                      className={styles.svgDiffText}
                      textAnchor="middle"
                      fill={fitment.innerDiff > 0 ? '#d9363e' : '#28a745'}
                    >
                      {fitment.innerDiff > 0 ? `${safeFormat(fitment.innerDiff, 1)}mm 축소` : `${safeFormat(Math.abs(fitment.innerDiff), 1)}mm 여유`}
                    </text>
                  </g>
                )}

                {!hasInputValues && (
                  <text x={hubX + 140} y={svgCenterY} fill="#aaa" fontSize="10" fontWeight="600" textAnchor="middle">
                    제원을 입력하면 도면이 표시됩니다
                  </text>
                )}
              </svg>
            </div>
          </div>

          {/* 타이어 종합 비교 상세 테이블 */}
          {includeTire && (
            <div className={styles.detailTableCard}>
              <h4>휠 & 타이어 상세 비교 데이터</h4>
              <div className={styles.tableResponsive}>
                <table className={styles.specTable}>
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th>기존</th>
                      <th>신규</th>
                      <th>차이</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>전체 림 폭 (Rim Width)</td>
                      <td>{safeFormat(fitment.curWidthMm, 1)} mm ({currentWheel.rimWidth || 0}J)</td>
                      <td>{safeFormat(fitment.newWidthMm, 1)} mm ({newWheel.rimWidth || 0}J)</td>
                      <td className={fitment.newWidthMm > fitment.curWidthMm ? styles.textBoldRed : styles.textBold}>
                        {(fitment.newWidthMm - fitment.curWidthMm) >= 0 ? `+` : ``}
                        {safeFormat(fitment.newWidthMm - fitment.curWidthMm, 1)} mm
                      </td>
                    </tr>
                    <tr>
                      <td>유효 옵셋 (Effective ET)</td>
                      <td>ET {fitment.curEffET}</td>
                      <td>ET {fitment.newEffET}</td>
                      <td>{(fitment.newEffET - fitment.curEffET) >= 0 ? `+` : ``}{(fitment.newEffET - fitment.curEffET)} mm</td>
                    </tr>
                    <tr>
                      <td>타이어 전체 외경 (Diameter)</td>
                      <td>{safeFormat(fitment.curTotalDiameter, 1)} mm</td>
                      <td>{safeFormat(fitment.newTotalDiameter, 1)} mm</td>
                      <td className={Math.abs(fitment.diameterDiff) > 15 ? styles.textDanger : ''}>
                        {fitment.diameterDiff >= 0 ? `+` : ``}{safeFormat(fitment.diameterDiff, 1)} mm
                      </td>
                    </tr>
                    <tr>
                      <td>타이어 둘레 (Circumference)</td>
                      <td>{safeFormat(fitment.curCircumference, 1)} mm</td>
                      <td>{safeFormat(fitment.newCircumference, 1)} mm</td>
                      <td>
                        {fitment.circumferenceDiff >= 0 ? `+` : ``}{safeFormat(fitment.circumferenceDiff, 1)} mm
                      </td>
                    </tr>
                    <tr>
                      <td>속도계 오차 (100km/h 기준)</td>
                      <td>100.0 km/h</td>
                      <td>실제 {safeFormat(fitment.actualSpeedAt100, 1)} km/h</td>
                      <td className={styles.textBold}>
                        {fitment.speedoErrorPercent >= 0 ? `+` : ``}{safeFormat(fitment.speedoErrorPercent, 2)} %
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default OffsetCalculator;
