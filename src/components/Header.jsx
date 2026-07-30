import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import styles from './Header.module.css';
import logoImg from '../assets/Mywheellogo.png';

function Header() {
  const [authModal, setAuthModal] = useState(null);

  const openLogin = () => setAuthModal('login');
  const openSignup = () => setAuthModal('signup');
  const closeAuth = () => setAuthModal(null);

  return (
    <>
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
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            MAP
          </NavLink>
          <NavLink
            to="/custom"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            CUSTOM
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            COMMUNITY
          </NavLink>
          <NavLink
            to="/mypage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            MY PAGE
          </NavLink>
          <button type="button" className={styles.navLink} onClick={openLogin}>
            로그인/회원가입
          </button>
        </nav>
      </header>

      <LoginModal
        isOpen={authModal === 'login'}
        onClose={closeAuth}
        onOpenSignup={openSignup}
      />
      <SignupModal isOpen={authModal === 'signup'} onClose={closeAuth} />
    </>
  );
}

export default Header;
