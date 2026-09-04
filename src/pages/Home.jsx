import { Link } from 'react-router-dom';
import styles from './Home.module.css';

// 사용할 이미지 경로 (프로젝트 assets 폴더 위치에 맞게 수정해줘)
import mainWheelImg from '../assets/homepage/wheel_main.png'; 
import carBeforeImg from '../assets/homepage/car_before.png'; 
import carAfterImg from '../assets/homepage/car_after.png'; 
import mapPreviewImg from '../assets/homepage/preview_map.png'; 
import communityPreviewImg from '../assets/homepage/preview_community.png'; 

function Home() {
  return (
    <div className={styles.homeContainer}>
      
      {/* 1. HERO SECTION (상단 히어로 배너) */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h2>당신의 차를</h2>
          <h1>가장 멋지게 만드는 방법 <span>MY wheel</span></h1>
          <p>사용자의 실제 차량 사진을 기반으로 휠 튜닝 및 최적의 제원을 추천 받아보세요</p>
        </div>
        <div className={styles.heroImageWrapper}>
          <img src={mainWheelImg} alt="Wheel" className={styles.heroWheelImg} />
        </div>
        </div>
      </section>

      {/* 2. SECTION 1: 휠 커스텀 */}
      <section className={styles.featureSection}>
        <h2 className={styles.sectionTitle}>휠 커스텀</h2>
        <p className={styles.sectionSubtitle}>
          내 차 사진을 업로드하고 다양한 휠을 적용해<br />
          실제 장착된 모습을 미리 확인해보세요
        </p>

        {/* 튜닝 전 / 후 비교 카드 */}
        <div className={styles.customCompareWrapper}>
          <div className={styles.imageCard}>
            <img src={carBeforeImg} alt="튜닝 전" />
            <span className={styles.tag1}>튜닝 전</span>
          </div>
          <div className={styles.arrow}>➔</div>
          <div className={styles.imageCard}>
            <img src={carAfterImg} alt="튜닝 후" />
            <span className={styles.tag}>튜닝 후</span>
          </div>
        </div>

        <Link to="/custom" className={styles.actionBtn}>
          휠튜닝 바로가기
        </Link>
      </section>

      {/* 3. SECTION 2: 휠 & 타이어 추천 */}
      <section className={styles.featureSection}>
        <h2 className={styles.sectionTitle}>휠 & 타이어 추천</h2>
        <p className={styles.sectionSubtitle}>
          내 차에 맞는 휠과 타이어 제원을 확인하고<br />
          최적의 조합을 추천받아보세요
        </p>

        <div className={styles.previewBox}>
          <img src={mapPreviewImg} alt="휠 타이어 추천 프리뷰" className={styles.previewImg} />
        </div>

        <Link to="/map" className={styles.actionBtn}>
          휠/타이어 제원 바로가기
        </Link>
      </section>

      {/* 4. SECTION 3: 커뮤니티 */}
      <section className={styles.featureSection}>
        <h2 className={styles.sectionTitle}>커뮤니티</h2>
        <p className={styles.sectionSubtitle}>
          다른 사람들의 차량 커스텀을 구경하고<br />
          자유롭게 소통해보세요
        </p>

        <div className={styles.previewBox}>
          <img src={communityPreviewImg} alt="커뮤니티 프리뷰" className={styles.previewImg} />
        </div>

        <Link to="/community" className={styles.actionBtn}>
          커뮤니티 바로가기
        </Link>
      </section>

    </div>
  );
}

export default Home;