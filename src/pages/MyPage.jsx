import { useState } from 'react';
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

function MyPage() {
  const [wheelIndex, setWheelIndex] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWheel, setSelectedWheel] = useState(null);
  const [profile, setProfile] = useState({
    name: '닉네임(이름)',
    email: 'example@gmail.com',
    avatarUrl: null,
  });

  const maxIndex = Math.max(0, FAVORITE_WHEELS.length - VISIBLE_WHEELS);

  const prevWheels = () => {
    setWheelIndex((prev) => Math.max(0, prev - 1));
  };

  const nextWheels = () => {
    setWheelIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleWheels = FAVORITE_WHEELS.slice(wheelIndex, wheelIndex + VISIBLE_WHEELS);

  const handleConfirmProfile = ({ name, email, previewUrl }) => {
    setProfile((prev) => ({
      name,
      email,
      avatarUrl: previewUrl ?? prev.avatarUrl,
    }));
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
                {GALLERY_IMAGES.map((src, index) => (
                  <div key={index} className={styles.galleryItem}>
                    <img src={src} alt={`갤러리 사진 ${index + 1}`} />
                  </div>
                ))}
              </div>
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
