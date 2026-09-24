import React, { createContext, useContext, useState } from 'react';
import { getCustomAuthHeaders } from '../utils/customLimit';

const API_BASE_URL = 'http://localhost:8000';

const SynthesisContext = createContext(null);

export function SynthesisProvider({ children }) {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState(null);
  const [toast, setToast] = useState(null); // { show, type: 'success' | 'error', message, resultImageUrl, remaining }

  const dismissToast = () => {
    setToast(null);
  };

  const startSynthesis = async (formData, { onSuccess, onError } = {}) => {
    if (isSynthesizing) return;

    setIsSynthesizing(true);
    // 진행 중 상태 토스트 표시
    setToast({
      show: true,
      type: 'pending',
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

      // 성공 토스트 알림
      setToast({
        show: true,
        type: 'success',
        message: '휠 튜닝이 완료되었습니다!',
        resultImageUrl: data.result_image_url,
        resultId: data.result_id,
        remaining: data.remaining,
      });

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('합성 처리 실패:', err);
      setToast({
        show: true,
        type: 'error',
        message: `오류 발생: ${err.message}`,
      });
      if (onError) onError(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <SynthesisContext.Provider
      value={{
        isSynthesizing,
        synthesisResult,
        setSynthesisResult,
        toast,
        dismissToast,
        startSynthesis,
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
