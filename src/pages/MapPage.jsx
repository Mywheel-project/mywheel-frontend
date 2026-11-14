import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './MapPage.module.css';


// FastAPI 백엔드 주소. .env(VITE_API_URL)에서 불러온다.
const API_BASE_URL = import.meta.env.VITE_API_URL;


// 서울시청 - 위치 권한을 거부했거나 가져오지 못했을 때 쓰는 기본 지도 중심 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

// 브라우저에게 현재 위치 권한을 요청한다. 거부/실패/미지원 시에는 null을 반환해서
// 호출부가 기본 좌표로 자연스럽게 대체할 수 있게 한다.
function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

function MapPage() {
  const pageRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]); // 현재 지도에 그려진 정비업체 마커들
  const infoWindowRef = useRef(null); // 마커 클릭 시 재사용할 정보창
  const mapRef = useRef(null); // 생성된 네이버 지도 인스턴스
  const myMarkerRef = useRef(null); // 내 위치 파란 점 마커
  const noticeTimerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [shops, setShops] = useState([]); // 현재 지도 영역 안의 정비업체 목록
  const [isLocating, setIsLocating] = useState(false);
  const [notice, setNotice] = useState(''); // 지도 위 짧은 안내 문구

  const showNotice = (message) => {
    setNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(''), 2500);
  };

  // 내 위치 마커를 새로 그리거나, 이미 있으면 위치만 옮긴다.
  const placeMyLocationMarker = (map, location) => {
    const position = new window.naver.maps.LatLng(location.lat, location.lng);
    if (myMarkerRef.current) {
      myMarkerRef.current.setPosition(position);
      return;
    }
    myMarkerRef.current = new window.naver.maps.Marker({
      position,
      map,
      title: '내 위치',
      icon: {
        content: `<div class="${styles.myLocationDot}"></div>`,
        anchor: new window.naver.maps.Point(8, 8),
      },
      zIndex: 200,
    });
  };

  // "내 위치로 이동" 버튼
  const handleMoveToMyLocation = async () => {
    const map = mapRef.current;
    if (!map || isLocating) return;

    setIsLocating(true);
    const location = await getCurrentPosition();
    setIsLocating(false);

    if (!location) {
      showNotice('현재 위치를 확인할 수 없어요. 위치 권한을 확인해주세요.');
      return;
    }

    placeMyLocationMarker(map, location);
    map.setZoom(16);
    map.panTo(new window.naver.maps.LatLng(location.lat, location.lng));
  };

  // 목록 카드를 누르면 해당 매장으로 지도를 옮기고 정보창을 연다.
  const handleShopClick = (index) => {
    const map = mapRef.current;
    const marker = markersRef.current[index];
    if (!map || !marker) return;

    map.panTo(marker.getPosition());
    window.naver.maps.Event.trigger(marker, 'click');
  };

  // 지도에 현재 보이는 영역 안의 정비업체를 조회해 핀으로 그린다.
  const loadShopsInView = async (map) => {
    const bounds = map.getBounds();
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    const params = new URLSearchParams({
      sw_lat: sw.lat(),
      sw_lng: sw.lng(),
      ne_lat: ne.lat(),
      ne_lng: ne.lng(),
    });

    const response = await fetch(`${API_BASE_URL}/map/nearby?${params}`);
    if (!response.ok) return;
    const shops = await response.json();

    // 이전에 그려둔 마커를 지우고 새로 받은 목록으로 다시 그린다.
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = shops.map((shop) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(shop.latitude, shop.longitude),
        map,
        title: shop.name,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        const address = shop.road_address || shop.lot_address || '';
        const hours =
          shop.open_time && shop.close_time ? `${shop.open_time} ~ ${shop.close_time}` : '';
        infoWindowRef.current.setContent(`
          <div style="padding:10px 12px;min-width:180px;">
            <strong>${shop.name}</strong><br/>
            ${address}<br/>
            ${shop.phone || ''}${shop.phone && hours ? ' · ' : ''}${hours}
          </div>
        `);
        infoWindowRef.current.open(map, marker);
      });

      return marker;
    });
    setShops(shops);
  };

  // 헤더 아래 남은 화면 높이에 페이지를 맞춰서, 지도와 지점 목록이
  // 스크롤 없이 한 화면에 보이게 한다. (헤더 높이가 로고 크기에 따라 달라서 직접 잰다)
  useLayoutEffect(() => {
    const fitToViewport = () => {
      const page = pageRef.current;
      if (!page) return;
      const top = page.getBoundingClientRect().top + window.scrollY;
      page.style.height = `${Math.max(window.innerHeight - top, 0)}px`;
    };

    fitToViewport();
    window.addEventListener('resize', fitToViewport);
    return () => window.removeEventListener('resize', fitToViewport);
  }, []);

  // 페이지 높이가 바뀌면 네이버 지도에도 새 크기를 알려준다.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      mapRef.current?.autoResize?.();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const [{ client_id: clientId }, myLocation] = await Promise.all([
          fetch(`${API_BASE_URL}/map/client-id`).then((response) => {
            if (!response.ok) throw new Error('지도 설정을 불러오지 못했습니다.');
            return response.json();
          }),
          getCurrentPosition(),
        ]);

        // 네이버 지도 JS SDK가 이미 로드돼 있으면 재사용한다.
        if (!window.naver?.maps) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('네이버 지도 스크립트를 불러오지 못했습니다.'));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !mapContainerRef.current) return;

        const center = myLocation ?? DEFAULT_CENTER;
        const map = new window.naver.maps.Map(mapContainerRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom: myLocation ? 16 : 14,
        });
        mapRef.current = map;
        infoWindowRef.current = new window.naver.maps.InfoWindow({ content: ' ' });

        if (myLocation) placeMyLocationMarker(map, myLocation);

        window.naver.maps.Event.addListener(map, 'idle', () => loadShopsInView(map));

        setStatus('ready');
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message);
          setStatus('error');
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      clearTimeout(noticeTimerRef.current);
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.page}>
      {status === 'error' && <p className={styles.errorText}>{errorMessage}</p>}
      <div className={styles.mapWrapper}>
        {status === 'loading' && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>주변 정비소 지도를 불러오는 중입니다...</p>
            <p className={styles.loadingSubtext}>위치 정보 확인 및 지도 로딩에 몇 초 정도 걸릴 수 있습니다.</p>
          </div>
        )}
        <div ref={mapContainerRef} className={styles.mapContainer} />

        {status === 'ready' && (
          <button
            type="button"
            className={styles.locateBtn}
            onClick={handleMoveToMyLocation}
            disabled={isLocating}
            aria-label="내 위치로 이동"
            title="내 위치로 이동"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" fill="currentColor" />
              <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {notice && <p className={styles.notice}>{notice}</p>}
      </div>

      <section className={styles.shopSection}>
        <div className={styles.shopHeader}>
          <div>
            <span className={styles.shopBadge}>WHEEL TUNING</span>
            <h2 className={styles.shopTitle}>내 주변 휠 튜닝 지점</h2>
            <p className={styles.shopDesc}>
              지도에 보이는 영역의 휠 정비·튜닝 매장이에요. 지도를 움직이면 목록이 바뀌어요.
            </p>
          </div>
          {status === 'ready' && <span className={styles.shopCount}>{shops.length}곳</span>}
        </div>

        {status === 'ready' && shops.length === 0 && (
          <p className={styles.shopEmpty}>
            이 근처에는 등록된 지점이 없어요. 지도를 축소하거나 다른 곳으로 이동해 보세요.
          </p>
        )}

        {shops.length > 0 && (
          <ul className={styles.shopList}>
            {shops.map((shop, index) => {
              const address = shop.road_address || shop.lot_address;
              const hours =
                shop.open_time && shop.close_time ? `${shop.open_time} ~ ${shop.close_time}` : '';
              return (
                <li key={shop.id ?? `${shop.name}-${shop.latitude}-${shop.longitude}`}>
                  <button
                    type="button"
                    className={styles.shopCard}
                    onClick={() => handleShopClick(index)}
                  >
                    <strong className={styles.shopName}>{shop.name}</strong>
                    {address && <span className={styles.shopMeta}>{address}</span>}
                    {(shop.phone || hours) && (
                      <span className={styles.shopMeta}>
                        {shop.phone}
                        {shop.phone && hours ? ' · ' : ''}
                        {hours}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MapPage;
