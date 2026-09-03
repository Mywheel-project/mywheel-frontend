import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import WheelDetailModal from '../components/WheelDetailModal';
import styles from './MyPage.module.css';

import carImg from '../assets/homepage/car_before.png';
import carAfterImg from '../assets/homepage/car_after.png';
import wheelImg from '../assets/homepage/wheel_main.png';

const GALLERY_IMAGES = [
  carImg,
  carAfterImg,
  carImg,
  carAfterImg,
  carImg,
  carAfterImg,
  carImg,
  carAfterImg,
];

const DEFAULT_WHEEL_DETAIL = {
  specs: [
    '휠 사이즈 : 19인치',
    '림 폭 및 오프셋 8.0J +55',
    'PCD 114.3',
    '허브 보어 67.1 mm',
  ],
  fitmentGuide: [
    {
      title: '① 1인치 다운 (18인치)',
      paragraphs: [
        '승차감 및 경제성: 많은 코나 N 유저들이 승차감 개선과 타이어 비용 절감을 위해 18인치로 인치 다운을 합니다. (추천 타이어: 235/45R18 또는 245/40R18)',
      ],
    },
    {
      title: '② 오프셋(Offset)과 돌출',
      bullets: [
        '추천 사양: 8.5J +45에서 +50 사이가 가장 대중적입니다.',
        '돌출 주의: +45 미만(예: +35 등)으로 내려가면 휠이 휀더 밖으로 돌출되어 자동차 검사 시 문제가 되거나, 과격한 주행 시 간섭이 생길 수 있습니다.',
      ],
    },
  ],
};

const FAVORITE_WHEELS = [
  { id: 1, name: '현대 코나 N 휠1', image: wheelImg, ...DEFAULT_WHEEL_DETAIL },
  { id: 2, name: '현대 코나 N 휠2', image: wheelImg, ...DEFAULT_WHEEL_DETAIL },
  { id: 3, name: '현대 코나 N 휠3', image: wheelImg, ...DEFAULT_WHEEL_DETAIL },
  { id: 4, name: '현대 코나 N 휠4', image: wheelImg, ...DEFAULT_WHEEL_DETAIL },
  { id: 5, name: '현대 코나 N 휠5', image: wheelImg, ...DEFAULT_WHEEL_DETAIL },
  { id: 6, name: '현대 코나 N 휠6', image: wheelImg, ...DEFAULT_WHEEL_DETAIL },
];

const VISIBLE_WHEELS = 3;
const GALLERY_IMAGES_PER_PAGE = 6;

// Header 에서 로그인 성공 시 저장하는 것과 동일한 localStorage 키.
// 여기서는 로그인 여부 판단과 "내 id" 를 얻는 용도로만 사용하고,
// 실제 닉네임/이메일/프로필 사진은 항상 /users/me 를 호출해 DB 최신값을 받아온다.
const USER_STORAGE_KEY = 'mywheel_user';
const API_BASE_URL = 'http://localhost:8000';

function getStoredUserId() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved)?.id ?? null : null;
  } catch {
    return null;
  }
}

const DEFAULT_PROFILE = {
  name: '닉네임(이름)',
  email: 'example@gmail.com',
  avatarUrl: null,
};

function MyPage() {
  const [galleryPage, setGalleryPage] = useState(0);
  const [wheelIndex, setWheelIndex] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWheel, setSelectedWheel] = useState(null);
  // 로그인하지 않았거나 아직 응답이 오기 전에는 기본값을 보여준다.
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  // 회원 정보 수정(PUT /users/me) 요청 시 "나"를 식별하는 데 필요하다.
  const userId = getStoredUserId();

  // 마운트 시 /users/me 를 호출해 DB에 저장된 내 정보(닉네임/이메일/프로필 사진)를 받아온다.
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/users/me`, {
      headers: { 'X-User-Id': String(userId) },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setProfile({
          name: data.nickname,
          email: data.email,
          avatarUrl: data.profile_image,
        });
      })
      .catch(() => {
        // 네트워크 오류 등의 경우 기본값을 그대로 유지한다.
      });
  }, [userId]);

  const maxIndex = Math.max(0, FAVORITE_WHEELS.length - VISIBLE_WHEELS);

  const prevWheels = () => {
    setWheelIndex((prev) => Math.max(0, prev - 1));
  };

  const nextWheels = () => {
    setWheelIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleWheels = FAVORITE_WHEELS.slice(wheelIndex, wheelIndex + VISIBLE_WHEELS);

  const galleryPageCount = Math.ceil(GALLERY_IMAGES.length / GALLERY_IMAGES_PER_PAGE);
  const visibleGalleryImages = GALLERY_IMAGES.slice(
    galleryPage * GALLERY_IMAGES_PER_PAGE,
    galleryPage * GALLERY_IMAGES_PER_PAGE + GALLERY_IMAGES_PER_PAGE,
  );

  // EditProfileModal 이 PUT /users/me 로 DB 수정까지 마친 뒤, 최신 유저 정보를 넘겨준다.
  const handleConfirmProfile = (updatedUser) => {
    setProfile((prev) => ({
      name: updatedUser.nickname,
      email: updatedUser.email,
      avatarUrl: prev.avatarUrl, // 프로필 사진 수정은 아직 지원하지 않는다.
    }));

    // Header 가 localStorage 에서 닉네임을 읽으므로, 다음 새로고침에도 최신 값이 보이도록 갱신한다.
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* 왼쪽 컬럼 */}
        <div className={styles.leftColumn}>
          {/* 프로필 */}
          <section className={styles.card}>
            <div className={styles.profileRow}>
              <div className={styles.avatar} aria-hidden={!profile.avatarUrl}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="프로필" />
                ) : (
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#9E9E9E" />
                    <circle cx="32" cy="24" r="12" fill="#E8E8E8" />
                    <path
                      d="M10 56c0-12.15 9.85-22 22-22s22 9.85 22 22"
                      fill="#E8E8E8"
                    />
                  </svg>
                )}
              </div>
              <div className={styles.profileInfo}>
                <p className={styles.nickname}>{profile.name}</p>
                <p className={styles.email}>{profile.email}</p>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setIsEditOpen(true)}
                >
                  회원 정보 수정
                </button>
              </div>
            </div>
          </section>

          {/* 차량 정보 */}
          <section className={`${styles.card} ${styles.carCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>현대 그랜저 IG</h2>
              <Link to="/custom" className={styles.redBtn}>
                차량 추가 +
              </Link>
            </div>
            <div className={styles.carImageWrap}>
              <img src={carImg} alt="현대 그랜저 IG" className={styles.carImage} />
            </div>
            <ul className={styles.specList}>
              <li>PCD : 114.3 mm</li>
              <li>홀 수 : 5홀</li>
              <li>허브 보어 : 67.1 mm</li>
              <li>볼트 규격 : M12 × 1.5</li>
            </ul>
          </section>
        </div>

        {/* 오른쪽 컬럼 */}
        <div className={styles.rightColumn}>
          {/* 내 갤러리 */}
          <section className={`${styles.card} ${styles.galleryCard}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>내 갤러리 (20장)</h2>
              <Link to="/custom" className={styles.redBtn}>
                사진 생성
              </Link>
            </div>
            <div className={styles.galleryInner}>
              <div className={styles.galleryGrid}>
                {visibleGalleryImages.map((src, index) => {
                  const imageNumber = galleryPage * GALLERY_IMAGES_PER_PAGE + index + 1;
                  return (
                    <div key={imageNumber} className={styles.galleryItem}>
                      <img src={src} alt={`갤러리 사진 ${imageNumber}`} />
                    </div>
                  );
                })}
              </div>
              {galleryPageCount > 1 && (
                <div className={styles.galleryPagination} role="navigation" aria-label="갤러리 페이지">
                  {Array.from({ length: galleryPageCount }, (_, pageIndex) => (
                    <button
                      key={pageIndex}
                      type="button"
                      className={`${styles.pageBtn} ${galleryPage === pageIndex ? styles.pageBtnActive : ''}`}
                      onClick={() => setGalleryPage(pageIndex)}
                      aria-current={galleryPage === pageIndex ? 'page' : undefined}
                    >
                      {pageIndex + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 휠 즐겨찾기 */}
          <section className={`${styles.card} ${styles.favoritesCard}`}>
            <h2 className={styles.cardTitle}>휠 즐겨찾기 (20장)</h2>
            <div className={styles.carousel}>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={prevWheels}
                disabled={wheelIndex === 0}
                aria-label="이전 휠"
              >
                ◀
              </button>
              <div className={styles.wheelList}>
                {visibleWheels.map((wheel) => (
                  <button
                    key={wheel.id}
                    type="button"
                    className={styles.wheelItem}
                    onClick={() => setSelectedWheel(wheel)}
                  >
                    <div className={styles.wheelImageWrap}>
                      <img src={wheel.image} alt={wheel.name} />
                    </div>
                    <span className={styles.wheelName}>{wheel.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={nextWheels}
                disabled={wheelIndex >= maxIndex}
                aria-label="다음 휠"
              >
                ▶
              </button>
            </div>
          </section>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userId={userId}
        initialName={profile.name}
        initialEmail={profile.email}
        onConfirm={handleConfirmProfile}
      />
      <WheelDetailModal
        isOpen={Boolean(selectedWheel)}
        wheel={selectedWheel}
        onClose={() => setSelectedWheel(null)}
      />
    </div>
  );
}

export default MyPage;
