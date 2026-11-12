import Logo from '@/components/icon/LogoIcon';
import Button from '@/components/common/Button';
import API_ENDPOINTS from '@/constants/apiEndpoints';
import { apiBaseUrl } from '@/apis/apiInstance';

const LoginContent = () => {
  /**
   * 구글 OAuth 로그인 페이지로 리다이렉트
   * 리다이렉트하는 의도를 명확히 하기 위해 assign 메서드로 수정하였습니다.
   * @returns 구글 OAuth 로그인 페이지로 리다이렉트
   */
  const handleGoogleLogin = () => {
    const loginUrl = `${apiBaseUrl}${API_ENDPOINTS.GOOGLE_LOGIN}`;

    window.location.assign(loginUrl);
  };
  /**
   * 카카오 OAuth 로그인 페이지로 리다이렉트
   * @returns 카카오 OAuth 로그인 페이지로 리다이렉트
   */
  const handleKakaoLogin = () => {
    const timestamp = Date.now();
    const loginUrl = `${apiBaseUrl}${API_ENDPOINTS.KAKAO_LOGIN}?t=${timestamp}`;

    window.location.assign(loginUrl);
  };

  return (
    <div className="ui-page flex flex-col items-center justify-center min-h-[calc(100dvh-var(--ui-chrome-height))]">
      <div
        style={{ borderTop: '4px solid var(--color-secondary-300)' }}
        className="ui-panel w-full flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center items-center gap-2 mb-5 max-w-full">
            <Logo className="w-11 h-11 shrink-0" />
            <h1 className="text-[clamp(2rem,9vw,2.75rem)] font-bold tracking-tight text-ui-ink">
              FestaPick
            </h1>
          </div>
          <p className="ui-body text-ui-muted text-center">소셜로그인으로 빠르게 시작하세요!</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Button
            variant="socialLogin"
            size="lg"
            fullWidth
            onClick={handleGoogleLogin}
            className="min-h-12 border-ui-line bg-white text-ui-ink hover:bg-secondary-50 hover:border-secondary-300"
          >
            <img src="/login/google.svg" alt="Google" className="w-5 h-5 mr-3" />
            구글 로그인
          </Button>

          <Button
            variant="socialLogin"
            size="lg"
            fullWidth
            onClick={handleKakaoLogin}
            className="min-h-12 border-yellow-400 bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:border-yellow-500"
          >
            <img src="/login/kakao.svg" alt="Kakao" className="w-5 h-5 mr-3" />
            카카오 로그인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
