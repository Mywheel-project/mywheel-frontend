// src/__tests__/customLimit.test.js
import { getOrCreateClientId, getCustomAuthHeaders, fetchCustomLimits } from '../utils/customLimit';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

it('client id는 처음 한 번 만들고 그 뒤로는 같은 값을 재사용', () => {
  const first = getOrCreateClientId();
  expect(first).toMatch(/^client_/);
  expect(getOrCreateClientId()).toBe(first);
});

it('커스텀 API 헤더에 X-Client-Id가 들어간다', () => {
  expect(getCustomAuthHeaders()).toHaveProperty('X-Client-Id');
});

it('서버가 에러(500)를 주면 null 반환', async () => {
  // 진짜 서버 대신 가짜 fetch
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });
  expect(await fetchCustomLimits()).toBeNull();
});

it('서버가 정상 응답하면 JSON을 그대로 돌려준다', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ tuning: { remaining: 3 } }),
  });
  expect(await fetchCustomLimits()).toEqual({ tuning: { remaining: 3 } });
  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:8000/api/v1/custom/limits',
    expect.objectContaining({ method: 'GET' }),
  );
});