// src/App.jsx 예시 (리액트 라우터 세팅 가정)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // 방금 만든 Header 컴포넌트 import
// import Home from './pages/Home'; // Home 페이지 (예시)
// import MapPage from './pages/MapPage'; // Map 페이지 (예시)

function App() {
  return (
    <Router>
      <div className="App">
        {/* 모든 페이지 상단에 고정으로 렌더링됨 */}
        <Header />

        {/* 페이지별 화면 단위 컴포넌트 배치 */}
        <main style={{ padding: '2rem' }}>
          {/* <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            {/* 다른 페이지 라우팅 추가 }
          </Routes> */}
        </main>
      </div>
    </Router>
  );
}

export default App;