import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MyPage from './pages/MyPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mypage" element={<MyPage />} />
        {/* 추후에 완성될 다른 페이지들 */}
        {/* <Route path="/custom" element={<CustomPage />} /> */}
        {/* <Route path="/map" element={<MapPage />} /> */}
        {/* <Route path="/community" element={<CommunityPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;