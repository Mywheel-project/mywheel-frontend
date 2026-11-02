// 로그인 세션(유저 정보 + access token) localStorage 저장소 유틸리티.
// 새로고침/재방문해도 로그인 상태가 유지되도록 로그인/회원가입 응답 객체 전체를 저장한다.

const USER_STORAGE_KEY = 'mywheel_user';

/**
 * 로그인/회원가입 응답 객체(access_token 포함)를 저장
 */
export function saveSession(loginOrSignupResponse) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loginOrSignupResponse));
}

/**
 * 저장된 로그인 유저 객체 반환 (없으면 null)
 */
export function getCurrentUser() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

/**
 * 로그인된 유저 ID 반환 (없으면 null)
 */
export function getStoredUserId() {
  return getCurrentUser()?.id ?? null;
}

/**
 * API 호출용 인증 헤더 반환 (토큰이 없으면 빈 객체)
 */
export function getAuthHeaders() {
  const token = getCurrentUser()?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 로그아웃 시 저장된 세션 삭제
 */
export function clearSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
}
