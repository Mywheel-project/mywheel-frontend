import React, { createContext, useContext, useState } from 'react';
import { getCustomAuthHeaders } from '../utils/customLimit';

const API_BASE_URL = 'http://localhost:8000';

const SynthesisContext = createContext(null);

export function SynthesisProvider({ children }) {
  // 1. 휠 튜닝 (이미지 합성)
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState(null);

  // 2. 차량 제원 추천
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendResult, setRecommendResult] = useState(null);
  const [recommendQuery, setRecommendQuery] = useState('');

  // 3. 휠 제원 검색
  const [isSearchingWheel, setIsSearchingWheel] = useState(false);
  const [wheelSearchResult, setWheelSearchResult] = useState(null);
  const [wheelSearchQuery, setWheelSearchQuery] = useState({ wheel: '', car: '' });

  // 공통 토스트 알림
  const [toast, setToast] = useState(null);

  const dismissToast = () => {
    setToast(null);
  };

  // 1) 휠 튜닝 실행
  const startSynthesis = async (formData, { onSuccess, onError } = {}) => {
    if (isSynthesizing) return;

    setIsSynthesizing(true);
    setToast({
      show: true,
      type: 'pending',
      title: '휠 튜닝 진행 중',
      message: 'AI 휠 합성 진행 중... (약 10~15초 소요)',
    });

    try {
      const headers = getCustomAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/custom/synthesize`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '합성 요청에 실패했습니다.');
      }

      const data = await response.json();
      setSynthesisResult(data);

      setToast({
        show: true,
        type: 'success',
        title: '휠 튜닝 완료',
        message: '휠 튜닝이 완료되었습니다.',
        resultImageUrl: data.result_image_url,
        targetUrl: '/mypage',
        buttonText: '마이페이지 갤러리에서 보기',
        remaining: data.remaining,
      });

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('합성 처리 실패:', err);
      setToast({
        show: true,
        type: 'error',
        title: '휠 튜닝 오류',
        message: `오류 발생: ${err.message}`,
      });
      if (onError) onError(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // 2) 차량 제원 추천 실행
  const startVehicleRecommend = async (vehicleModel, { onSuccess, onError } = {}) => {
    if (isRecommending) return;

    setIsRecommending(true);
    setRecommendQuery(vehicleModel);
    setToast({
      show: true,
      type: 'pending',
      title: '차량 제원 분석 중',
      message: `${vehicleModel}의 제원을 분석하고 있습니다...`,
    });

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getCustomAuthHeaders(),
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/recommend/vehicle`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          vehicle_model: vehicleModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '제원 추천 분석에 실패했습니다.');
      }

      const data = await response.json();
      setRecommendResult(data.gemini_response);

      setToast({
        show: true,
        type: 'success',
        title: '차량 제원 분석 완료',
        message: `${vehicleModel} 추천 제원 분석이 완료되었습니다.`,
        targetUrl: '/custom/my-specs',
        buttonText: '추천 제원 보러가기',
        remaining: data.remaining,
      });

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('차량 제원 추천 실패:', err);
      setToast({
        show: true,
        type: 'error',
        title: '제원 추천 오류',
        message: `오류 발생: ${err.message}`,
      });
      if (onError) onError(err);
    } finally {
      setIsRecommending(false);
    }
  };

  // 3) 휠 제원 검색 실행
  const startWheelSearch = async (wheelName, carModel, { onSuccess, onError } = {}) => {
    if (isSearchingWheel) return;

    setIsSearchingWheel(true);
    setWheelSearchQuery({ wheel: wheelName, car: carModel });
    setToast({
      show: true,
      type: 'pending',
      title: '휠 제원 검색 중',
      message: `${wheelName}의 제원 및 호환성을 분석 중입니다...`,
    });

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getCustomAuthHeaders(),
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/search/wheel`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          wheel_name: wheelName,
          ...(carModel ? { vehicle_model: carModel } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '휠 제원 검색에 실패했습니다.');
      }

      const data = await response.json();
      setWheelSearchResult(data.gemini_response);

      setToast({
        show: true,
        type: 'success',
        title: '휠 제원 검색 완료',
        message: `${wheelName} 분석 결과가 준비되었습니다.`,
        targetUrl: '/custom/search',
        buttonText: '검색 결과 보러가기',
        remaining: data.remaining,
      });

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('휠 제원 검색 실패:', err);
      setToast({
        show: true,
        type: 'error',
        title: '휠 검색 오류',
        message: `오류 발생: ${err.message}`,
      });
      if (onError) onError(err);
    } finally {
      setIsSearchingWheel(false);
    }
  };

  return (
    <SynthesisContext.Provider
      value={{
        // 휠 튜닝
        isSynthesizing,
        synthesisResult,
        setSynthesisResult,
        startSynthesis,

        // 차량 제원 추천
        isRecommending,
        recommendResult,
        setRecommendResult,
        recommendQuery,
        setRecommendQuery,
        startVehicleRecommend,

        // 휠 제원 검색
        isSearchingWheel,
        wheelSearchResult,
        setWheelSearchResult,
        wheelSearchQuery,
        setWheelSearchQuery,
        startWheelSearch,

        // 공통 토스트
        toast,
        dismissToast,
      }}
    >
      {children}
    </SynthesisContext.Provider>
  );
}

export function useSynthesis() {
  const context = useContext(SynthesisContext);
  if (!context) {
    throw new Error('useSynthesis must be used within a SynthesisProvider');
  }
  return context;
}
