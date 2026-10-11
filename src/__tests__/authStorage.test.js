// src/__tests__/authStorage.test.js
import { saveSession, getCurrentUser, getStoredUserId, getAuthHeaders, clearSession } from '../utils/authStorage';

beforeEach(() => localStorage.clear());

describe('authStorage', () => {
  it('로그인 전에는 유저가 없고 인증 헤더도 비어있다', () => {
    expect(getCurrentUser()).toBeNull();
    expect(getStoredUserId()).toBeNull();
    expect(getAuthHeaders()).toEqual({});
  });

  it('saveSession 후에는 id와 Bearer 헤더를 돌려준다', () => {
    saveSession({ id: 7, nickname: '성윤', access_token: 'abc.def.ghi' });
    expect(getStoredUserId()).toBe(7);
    expect(getAuthHeaders()).toEqual({ Authorization: 'Bearer abc.def.ghi' });
  });

  it('localStorage 값이 깨져 있어도 에러 없이 null', () => {
    localStorage.setItem('mywheel_user', '{이상한 JSON');
    expect(getCurrentUser()).toBeNull();
  });

  it('clearSession 하면 로그아웃 상태가 된다', () => {
    saveSession({ id: 1, access_token: 't' });
    clearSession();
    expect(getCurrentUser()).toBeNull();
  });
});