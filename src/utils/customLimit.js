// 커스텀 페이지 기능 주간 5회 사용 제한 유틸리티

const USER_STORAGE_KEY = 'mywheel_user';
const CLIENT_STORAGE_KEY = 'mywheel_client_id';
const API_BASE_URL = 'http://localhost:8000';

/**
 * 로그인된 유저 ID 반환 (없으면 null)
 */
export function getStoredUserId() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved)?.id ?? null : null;
  } catch {
    return null;
  }
}

/**
 * 비로그인 사용자 브라우저 고유 UUID 반환 (없으면 새로 발급하여 저장)
 */
export function getOrCreateClientId() {
  try {
    let clientId = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!clientId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        clientId = `client_${crypto.randomUUID()}`;
      } else {
        clientId = `client_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      }
      localStorage.setItem(CLIENT_STORAGE_KEY, clientId);
    }
    return clientId;
  } catch {
    return 'client_fallback';
  }
}

/**
 * 커스텀 기능 API 호출용 식별 헤더 객체 생성
 */
export function getCustomAuthHeaders() {
  const userId = getStoredUserId();
  const clientId = getOrCreateClientId();

  const headers = {
    'X-Client-Id': clientId,
  };

  if (userId) {
    headers['X-User-Id'] = String(userId);
  }

  return headers;
}

/**
 * 3가지 커스텀 기능의 주간 사용량 및 잔여 횟수 조회
 */
export async function fetchCustomLimits() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/custom/limits`, {
      method: 'GET',
      headers: getCustomAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('커스텀 기능 이용 한도 조회 실패:', error);
    return null;
  }
}
