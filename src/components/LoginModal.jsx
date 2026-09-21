import { useEffect, useId, useRef, useState } from 'react';
import styles from './LoginModal.module.css';

// FastAPI 백엔드 주소. 배포 시에는 .env(VITE_API_BASE_URL)로 분리하는 게 좋다.
const API_BASE_URL = 'http://localhost:8000';

// Google Cloud Console 에서 발급받은 OAuth 클라이언트 ID. (frontend/.env.local)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function LoginModal({ isOpen, onClose, onOpenSignup, onLoginSuccess }) {
  const titleId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 제출 중 중복 클릭 방지 + 에러 메시지 표시용 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Google Identity Services 가 실제 로그인 버튼(iframe)을 그려 넣을 컨테이너.
  // 우리 디자인의 googleBtn 위에 투명하게 겹쳐서, 클릭은 구글 버튼이 받고 화면엔 우리 버튼만 보이게 한다.
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setEmail('');
    setPassword('');
    setErrorMessage('');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !GOOGLE_CLIENT_ID) return;
    // index.html 에서 로드한 GIS 스크립트가 아직 준비 안 됐을 수 있으니 방어적으로 체크.
    if (!window.google?.accounts?.id || !googleButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        setErrorMessage('');
        try {
          const response = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          });
          const body = await response.json().catch(() => null);

          if (!response.ok) {
            const detail = body?.detail;
            throw new Error(typeof detail === 'string' ? detail : '구글 로그인에 실패했습니다.');
          }

          onLoginSuccess(body);
        } catch (error) {
          setErrorMessage(error.message);
        }
      },
    });

    // 매번 다시 그려도 되도록 비워준다 (모달을 여러 번 열 때 중복 렌더 방지).
    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'icon',
      shape: 'circle',
      size: 'large',
    });
  }, [isOpen, onLoginSuccess]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        // FastAPI 에러 응답은 detail 필드에 메시지(문자열) 또는
        // 검증 오류 배열이 담기므로 두 형태를 모두 처리한다.
        const detail = body?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(', ')
          : detail || '로그인에 실패했습니다.';
        throw new Error(message);
      }

      // body 는 { id, email, nickname } 형태 - 상위(Header)로 그대로 전달해
      // localStorage 저장 및 헤더 UI 갱신을 맡긴다.
      onLoginSuccess(body);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <h2 id={titleId} className={styles.title}>
          로그인
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6.5h16v11H4v-11Z"
                  stroke="#9A9A9A"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m4.5 7 7.5 6 7.5-6"
                  stroke="#9A9A9A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="email"
              className={styles.input}
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="#9A9A9A"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 10V7.5a4 4 0 0 1 8 0V10"
                  stroke="#9A9A9A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              type="password"
              className={styles.input}
              placeholder="비밀번호"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.helperLinks}>
          <button type="button" className={styles.helperBtn}>
            비밀번호 찾기
          </button>
          <span className={styles.helperDivider}>/</span>
          <button type="button" className={styles.helperBtn} onClick={onOpenSignup}>
            회원가입
          </button>
        </div>

        <div className={styles.socialSection}>
          <div className={styles.socialDivider}>
            <span>간편 로그인</span>
          </div>
          <div className={styles.socialButtons}>
            <button type="button" className={styles.kakaoBtn} aria-label="카카오 로그인">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  fill="#3C1E1E"
                  d="M12 4C7.03 4 3 7.13 3 11c0 2.45 1.6 4.6 4.02 5.86-.13.48-.84 3.14-.87 3.35 0 0-.17.1.08.2.1.04.23-.01.23-.01.3-.04 3.47-2.29 4.02-2.68.5.07 1.01.1 1.52.1 4.97 0 9-3.13 9-7S16.97 4 12 4Z"
                />
              </svg>
            </button>
            <div className={styles.googleBtnWrapper}>
              <button type="button" className={styles.googleBtn} aria-hidden="true" tabIndex={-1}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                  />
                </svg>
              </button>
              {/* Google Identity Services 가 이 위에 실제 로그인 버튼(iframe)을 투명하게 그린다. */}
              <div ref={googleButtonRef} className={styles.googleGisButton} aria-label="구글 로그인" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
