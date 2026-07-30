import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Header.module.css';
import logoImg from '../assets/Mywheellogo.png';

function Header() {
  return (
    <header className={styles.headerContainer}>
      {/* 로고 영역 */}
      <Link to="/" className={styles.logoGroup}>
        <img src={logoImg} alt="MyWheel Logo" className={styles.logoImage} />
        <h1 className={styles.logoTitle}>MY wheel</h1>
      </Link>

      {/* 메뉴 영역: Link 대신 NavLink 사용 */}
      <nav className={styles.navMenu}>
        <NavLink 
          to="/map" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          MAP
        </NavLink>
        <NavLink 
          to="/custom" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          CUSTOM
        </NavLink>
        <NavLink 
          to="/community" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          COMMUNITY
        </NavLink>
        <NavLink 
          to="/mypage" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          MY PAGE
        </NavLink>
        <NavLink 
          to="/login" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          로그인/회원가입
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;