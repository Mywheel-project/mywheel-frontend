import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import SynthesisToast from './components/SynthesisToast';
import { SynthesisProvider } from './context/SynthesisContext';
import ProtectedRoute from './components/ProtectedRoute';

// Custom 메인 탭 및 하위 컴포넌트 임포트
import CustomPage from './pages/custom/CustomPage';
import WheelTuning from './pages/custom/WheelTuning';
import MyCarSpecs from './pages/custom/MyCarSpecs';
import WheelSpecsSearch from './pages/custom/WheelSpecsSearch';
import OffsetCalculator from './pages/custom/OffsetCalculator';

// 주요 메뉴 및 커뮤니티 컴포넌트 임포트
import MyPage from './pages/MyPage';
import MapPage from './pages/MapPage';
import PostList from './PostList';
import PostCreate from './PostCreate';
import PostDetail from './PostDetail';
import PostEdit from './PostEdit';

function App() {
  return (
    <Router>
      <SynthesisProvider>
        <Header />
        <SynthesisToast />
        <Routes>
          {/* [공개 라우트] 메인 홈 페이지만 로그인 없이 접속 가능 */}
          <Route path="/" element={<Home />} />

          {/* [보호된 라우트] 홈을 제외한 모든 페이지는 로그인 필수 */}
          <Route element={<ProtectedRoute />}>
            {/* MAP */}
            <Route path="/map" element={<MapPage />} />

            {/* CUSTOM 중첩 라우팅 */}
            <Route path="/custom" element={<CustomPage />}>
              <Route index element={<Navigate to="tuning" replace />} />
              <Route path="tuning" element={<WheelTuning />} />
              <Route path="my-specs" element={<MyCarSpecs />} />
              <Route path="search" element={<WheelSpecsSearch />} />
              <Route path="calculator" element={<OffsetCalculator />} />
            </Route>

            {/* 커뮤니티 전체 (목록, 상세, 작성, 수정) */}
            <Route path="/community" element={<PostList />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/community/create" element={<PostCreate />} />
            <Route path="/community/edit/:id" element={<PostEdit />} />

            {/* 마이페이지 */}
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </SynthesisProvider>
    </Router>
  );
}

export default App;
