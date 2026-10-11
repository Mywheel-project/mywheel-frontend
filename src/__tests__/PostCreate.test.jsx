// src/__tests__/PostCreate.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PostCreate from '../PostCreate';
import { saveSession } from '../utils/authStorage';

// useNavigate 를 쓰는 컴포넌트라 Router 로 감싸서 렌더링
const renderPage = () => render(<MemoryRouter><PostCreate /></MemoryRouter>);

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

it('화면이 에러 없이 그려진다', () => {
  renderPage();
  expect(screen.getByPlaceholderText('제목을 입력해주세요.')).toBeInTheDocument();
});

it('로그인 안 하고 등록하면 안내창이 뜨고 서버로 요청하지 않는다', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderPage();
  await userEvent.click(screen.getByRole('button', { name: '등록하기' }));
  expect(window.alert).toHaveBeenCalledWith('로그인이 필요합니다.');
  expect(fetchSpy).not.toHaveBeenCalled();
});

it('로그인 후 제목/내용을 쓰면 FormData로 POST 한다', async () => {
  saveSession({ id: 1, access_token: 'tok' });
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) });
  renderPage();

  await userEvent.type(screen.getByPlaceholderText('제목을 입력해주세요.'), '휠 후기');
  await userEvent.type(screen.getByPlaceholderText('자유롭게 내용을 작성해주세요...'), '좋아요');
  await userEvent.click(screen.getByRole('button', { name: '등록하기' }));

  const [url, options] = fetchSpy.mock.calls[0];
  expect(url).toBe('http://localhost:8000/api/posts');
  expect(options.headers).toEqual({ Authorization: 'Bearer tok' });
  expect(options.body.get('content')).toBe('좋아요');
  expect(options.body.get('title')).toContain('휠 후기');
});