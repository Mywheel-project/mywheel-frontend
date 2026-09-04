// import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './CustomPage.module.css';

function CustomPage() {
  return (
    <div className={styles.customContainer}>
      {/* 3개 서브 탭 메뉴 */}
      <div className={styles.tabContainer}>
        <NavLink 
          to="/custom/tuning" 
          className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.activeTab}` : styles.tabItem}
        >
          휠 튜닝
        </NavLink>
        <NavLink 
          to="/custom/my-specs" 
          className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.activeTab}` : styles.tabItem}
        >
          개인 차량 휠/타이어 제원
        </NavLink>
        <NavLink 
          to="/custom/search" 
          className={({ isActive }) => isActive ? `${styles.tabItem} ${styles.activeTab}` : styles.tabItem}
        >
          휠 제원 검색
        </NavLink>
      </div>

      {/* 탭 클릭에 따라 바뀌는 화면이 출력되는 영역 */}
      <div className={styles.contentArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default CustomPage;