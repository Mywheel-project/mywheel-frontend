import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';

// Custom 메인 탭 및 하위 컴포넌트 임포트
import CustomPage from './pages/custom/CustomPage';
import WheelTuning from './pages/custom/WheelTuning';
import MyCarSpecs from './pages/custom/MyCarSpecs';
import WheelSpecsSearch from './pages/custom/WheelSpecsSearch';

// 임시 페이지 컴포넌트 (추후 실제 파일 작성 시 임포트 경로 변경)
const MapPage = () => <div style={{ padding: '3rem', textAlign: 'center' }}>MAP 페이지 준비 중...</div>;
const CommunityPage = () => <div style={{ padding: '3rem', textAlign: 'center' }}>COMMUNITY 페이지 준비 중...</div>;
const MyPage = () => <div style={{ padding: '3rem', textAlign: 'center' }}>MY PAGE 준비 중...</div>;
const LoginPage = () => <div style={{ padding: '3rem', textAlign: 'center' }}>로그인/회원가입 페이지 준비 중...</div>;

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* 메인 홈 페이지 */}
        <Route path="/" element={<Home />} />

        {/* CUSTOM 중첩 라우팅 (Sub-routing) */}
        <Route path="/custom" element={<CustomPage />}>
          {/* /custom 기본 접속 시 /custom/tuning 으로 리다이렉트 */}
          <Route index element={<Navigate to="tuning" replace />} />
          <Route path="tuning" element={<WheelTuning />} />
          <Route path="my-specs" element={<MyCarSpecs />} />
          <Route path="search" element={<WheelSpecsSearch />} />
        </Route>

        {/* 기타 주요 메뉴 라우팅 */}
        <Route path="/map" element={<MapPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;