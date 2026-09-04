import { useEffect, useRef, useState } from 'react';
import styles from './MapPage.module.css';

// FastAPI 백엔드 주소. 배포 시에는 .env(VITE_API_BASE_URL)로 분리하는 게 좋다.
const API_BASE_URL = 'http://localhost:8000';

// 서울시청 - 위치 권한을 거부했거나 가져오지 못했을 때 쓰는 기본 지도 중심 좌표
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

// 브라우저에게 현재 위치 권한을 요청한다. 거부/실패/미지원 시에는 null을 반환해서
// 호출부가 기본 좌표로 자연스럽게 대체할 수 있게 한다 (에러로 지도 전체를 막지 않는다).
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
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]); // 현재 지도에 그려진 정비업체 마커들 (다음 조회 전에 지우기 위해 보관)
  const infoWindowRef = useRef(null); // 마커 클릭 시 재사용할 정보창 하나
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // 지도에 현재 보이는 영역(bounding box) 안의 정비업체를 조회해 핀으로 그린다.
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
  };

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        // Client ID 요청과 "위치 정보 권한을 허용하시겠습니까?" 브라우저 프롬프트를
        // 동시에 진행한다 - 사용자가 권한 팝업에 응답하는 동안 기다릴 필요가 없다.
        const [{ client_id: clientId }, myLocation] = await Promise.all([
          fetch(`${API_BASE_URL}/map/client-id`).then((response) => {
            if (!response.ok) throw new Error('지도 설정을 불러오지 못했습니다.');
            return response.json();
          }),
          getCurrentPosition(),
        ]);

        // 네이버 지도 JS SDK는 한 번만 로드하면 되므로, 이미 로드돼 있으면 재사용한다.
        if (!window.naver?.maps) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // 파라미터명은 반드시 ncpKeyId (예전 이름인 ncpClientId를 쓰면 인증 오류가 난다)
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('네이버 지도 스크립트를 불러오지 못했습니다.'));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !mapContainerRef.current) return;

        // 위치 정보를 받아왔으면 그 위치를 초기 화면으로, 아니면 기본 좌표를 쓴다.
        const center = myLocation ?? DEFAULT_CENTER;
        const map = new window.naver.maps.Map(mapContainerRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom: myLocation ? 16 : 14,
        });
        infoWindowRef.current = new window.naver.maps.InfoWindow({ content: ' ' });

        if (myLocation) {
          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(myLocation.lat, myLocation.lng),
            map,
            title: '내 위치',
            icon: {
              content: `<div class="${styles.myLocationDot}"></div>`,
              anchor: new window.naver.maps.Point(8, 8),
            },
            zIndex: 200, // 정비업체 마커보다 위에 그려지도록
          });
        }

        // 지도를 움직이거나 확대/축소해서 멈출 때(idle)마다 보이는 영역의 정비업체를 다시 불러온다.
        // (idle은 최초 로드 완료 시에도 한 번 발생하므로 첫 화면의 핀도 이걸로 그려진다)
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
    };
  }, []);

  return (
    <div className={styles.page}>
      {status === 'error' && <p className={styles.errorText}>{errorMessage}</p>}
      <div ref={mapContainerRef} className={styles.mapContainer} />
    </div>
  );
}

export default MapPage;
