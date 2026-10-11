// src/__tests__/PostEdit.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PostEdit from '../PostEdit';
import { saveSession } from '../utils/authStorage';

// /community/edit/:id 주소로 들어온 것처럼 렌더링 (useParams 로 id=5 를 받게 됨)
const renderEdit = () => render(
  <MemoryRouter initialEntries={['/community/edit/5']}>
    <Routes>
      <Route path="/community/edit/:id" element={<PostEdit />} />
      <Route path="/community" element={<div>목록 페이지</div>} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

it('로그인 안 했으면 안내 후 목록으로 보내고, 서버에 요청하지 않는다', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderEdit();
  expect(await screen.findByText('목록 페이지')).toBeInTheDocument();
  expect(window.alert).toHaveBeenCalledWith('로그인이 필요합니다.');
  expect(fetchSpy).not.toHaveBeenCalled();
});

it('내 글이면 기존 제목에서 [카테고리]를 떼고 입력칸에 채운다', async () => {
  saveSession({ id: 1, access_token: 'tok' });
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ id: 5, user_id: 1, title: '[Q&A] 휠 사이즈 질문', content: '본문', images: [] }),
  });
  renderEdit();

  expect(await screen.findByDisplayValue('휠 사이즈 질문')).toBeInTheDocument();
  expect(screen.getByDisplayValue('본문')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/posts/5');
});