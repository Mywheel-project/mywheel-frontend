import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../utils/authStorage';

/**
 * 로그인 인증 가드 컴포넌트 (Protected Route)
 * 로그인 세션이 없으면 알림을 띄우고 홈('/')으로 리다이렉트합니다.
 */
const ProtectedRoute = () => {
  const user = getCurrentUser();

  if (!user) {
    alert('로그인 후 이용 가능합니다.');
    return <Navigate to="/" replace />;
  }

  // 로그인 상태이면 하위 보호 라우트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
