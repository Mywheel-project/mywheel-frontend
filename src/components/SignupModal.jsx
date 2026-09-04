import { useEffect, useId, useState } from 'react';
import styles from './SignupModal.module.css';
import { useAuth } from '../context/AuthContext';

const TERMS = [
  { key: 'service', label: '서비스 이용약관 동의(필수)', required: true },
  { key: 'privacy', label: '개인정보 수집 및 이용동의(필수)', required: true },
  { key: 'marketing', label: '마케팅 수신 동의(선택)', required: false },
];

function SignupModal({ isOpen, onClose }) {
  const titleId = useId();
  const { signup } = useAuth();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    marketing: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChecked = TERMS.every((term) => agreements[term.key]);
  const requiredChecked = TERMS.filter((t) => t.required).every((term) => agreements[term.key]);

  useEffect(() => {
    if (!isOpen) return;

    setNickname('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setAgreements({ service: false, privacy: false, marketing: false });
    setError('');

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

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const toggleAll = () => {
    const next = !allChecked;
    setAgreements({
      service: next,
      privacy: next,
      marketing: next,
    });
  };

  const toggleAgreement = (key) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!nickname.trim() || !email.trim() || !password.trim()) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!requiredChecked) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(nickname, email, password);
      onClose();
    } catch (err) {
      setError(err.message);
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
          회원가입
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="#9A9A9A" strokeWidth="1.8" />
                <path
                  d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"
                  stroke="#9A9A9A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              type="text"
              className={styles.input}
              placeholder="닉네임"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              autoComplete="nickname"
            />
          </label>

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
              autoComplete="new-password"
            />
          </label>

          <div className={styles.passwordConfirmGroup}>
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
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
              />
            </label>
            <p className={styles.helperText}>위의 비밀번호를 다시 입력하세요</p>
          </div>

          <div className={styles.termsBox}>
            <label className={styles.termRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={allChecked}
                onChange={toggleAll}
              />
              <span className={styles.termLabel}>전체 동의</span>
            </label>
            <div className={styles.termsDivider} />
            {TERMS.map((term) => (
              <div key={term.key} className={styles.termItem}>
                <label className={styles.termRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={agreements[term.key]}
                    onChange={() => toggleAgreement(term.key)}
                  />
                  <span className={styles.termLabel}>{term.label}</span>
                </label>
                <button type="button" className={styles.viewBtn}>
                  내용보기
                </button>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: '#e74c3c', fontSize: '13px', margin: '-8px 0 0' }}>{error}</p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '회원가입하기'}
          </button>
        </form>

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
            <button type="button" className={styles.googleBtn} aria-label="구글 로그인">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;