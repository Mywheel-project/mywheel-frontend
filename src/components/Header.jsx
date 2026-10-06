import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import styles from './Header.module.css';
import logoImg from '../assets/Mywheellogo3.png';
import { saveSession, getCurrentUser, clearSession } from '../utils/authStorage';

function Header() {
  const [authModal, setAuthModal] = useState(null);
  // 로그인/로그아웃 시 페이지를 새로고침하므로, 이 값은 매번 마운트될 때
  // localStorage 에서 한 번만 읽으면 된다 (별도 상태 갱신이 필요 없다).
  const user = getCurrentUser();

  const openLogin = () => setAuthModal('login');
  const openSignup = () => setAuthModal('signup');
  const closeAuth = () => setAuthModal(null);

  // LoginModal 에서 로그인에 성공했을 때 호출된다.
  // MyPage 등 다른 페이지들은 로그인 여부를 마운트 시점에만 확인하므로,
  // 로그인 상태 변경을 전체 화면에 바로 반영하기 위해 페이지를 새로고침한다.
  const handleLoginSuccess = (loggedInUser) => {
    saveSession(loggedInUser);
    window.location.reload();
  };

  const handleLogout = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <>
      <header className={styles.headerContainer}>
        {/* 로고 영역 */}
        <Link to="/" className={styles.logoGroup}>
          <img src={logoImg} alt="MyWheel Logo" className={styles.logoImage} />
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
          {user ? (
            <>
              <span className={styles.navLink}>{user.nickname}님</span>
              <button type="button" className={styles.navLink} onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button type="button" className={styles.navLink} onClick={openLogin}>
              로그인/회원가입
            </button>
          )}
        </nav>
      </header>

      <LoginModal
        isOpen={authModal === 'login'}
        onClose={closeAuth}
        onOpenSignup={openSignup}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignupModal
        isOpen={authModal === 'signup'}
        onClose={closeAuth}
        onSignupSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Header;
