import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PostList from './PostList';
import PostCreate from './PostCreate';

function App() {
  return (
    <Router>
      {/* 공통 헤더는 최상단에 딱 한 번만 렌더링되도록 유지합니다 */}
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<PostList />} />
        <Route path="/community/create" element={<PostCreate />} />
      </Routes>
    </Router>
  );
}

export default App;