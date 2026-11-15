import Button from '@/components/common/Button';
import Home from '@/components/icon/HomeIcon';
import LeftArrow from '@/components/icon/LeftArrowIcon';
import Profile from '@/components/icon/ProfileIcon';
import Logo from '@/components/icon/LogoIcon';
import Settings from '@/components/icon/SettingIcon';
import Leave from '@/components/icon/LeaveIcon';
import useNav from '@/hooks/useNav';
import { ROUTE_PATH } from '@/constants/routes';
import { Link } from 'react-router-dom';
export interface HeaderProps {
  variant?: 'logo' | 'page' | 'all' | 'mypage' | 'chat';
  title?: string;
  onClick?: () => void;
}
const Header = ({ variant = 'logo', title = '', onClick }: HeaderProps) => {
  const { goBack } = useNav();
  return (
    <header className="ui-header">
      <div className="ui-width ui-header-surface">
        {variant === 'logo' ? (
          <div className="ui-header-bar">
            <h1 className="ui-brand">
              <Logo className="size-9" aria-hidden="true" />
              <span>FestaPick</span>
            </h1>
          </div>
        ) : (
          <div
            className={`ui-header-bar ui-header-centered ${variant === 'all' ? 'ui-header-wide' : ''}`}
          >
            <div className="flex-1">
              <Button
                variant="icon"
                className="ui-header-control"
                aria-label="뒤로가기"
                onClick={goBack}
              >
                <LeftArrow className="size-5" />
              </Button>
            </div>
            {title || variant === 'mypage' ? (
              <h1 className="ui-header-title">{variant === 'mypage' ? '마이페이지' : title}</h1>
            ) : (
              <span />
            )}
            <div className="ui-header-actions flex-1">
              {variant === 'mypage' && (
                <Link to={ROUTE_PATH.SETTINGS} className="ui-header-control" aria-label="설정">
                  <Settings className="size-6" strokeWidth={2} />
                </Link>
              )}
              {variant === 'chat' && (
                <Button
                  variant="icon"
                  className="ui-header-control"
                  onClick={onClick}
                  aria-label="채팅방 나가기"
                >
                  <Leave className="size-5" />
                </Button>
              )}
              {variant === 'all' && (
                <>
                  <Link to={ROUTE_PATH.HOME} className="ui-header-control" aria-label="홈">
                    <Home className="size-5" />
                  </Link>
                  <Link to={ROUTE_PATH.MY} className="ui-header-control" aria-label="마이페이지">
                    <Profile className="size-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
