import Home from '@/components/icon/HomeIcon';
import Profile from '@/components/icon/ProfileIcon';
import Search from '@/components/icon/SearchIcon';
import Pick from '@/components/icon/PickIcon';
import { Link, useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routes';
type FooterSelected = 'home' | 'search' | 'pick' | 'my' | 'none';
const items = [
  { id: 'home', icon: Home, label: '홈', path: ROUTE_PATH.HOME },
  { id: 'search', icon: Search, label: '검색', path: ROUTE_PATH.SEARCH },
  { id: 'pick', icon: Pick, label: 'AI PICK', path: ROUTE_PATH.AI_RECOMMENDATION_HISTORIES },
  { id: 'my', icon: Profile, label: 'My', path: ROUTE_PATH.MY },
] as const;
const Footer = ({ initialSelected = 'none' }: { initialSelected?: FooterSelected }) => {
  const { pathname } = useLocation();
  const selected: FooterSelected =
    pathname === '/'
      ? 'home'
      : /^\/(search|festivals)(\/|$)/.test(pathname)
        ? 'search'
        : /^\/pick(\/|$)/.test(pathname)
          ? 'pick'
          : /^\/(mypage|settings)(\/|$)/.test(pathname)
            ? 'my'
            : initialSelected;
  return (
    <nav className="ui-footer" aria-label="주요 메뉴">
      <div className="ui-width ui-footer-surface">
        {items.map(({ id, icon: Icon, label, path }) => (
          <Link
            key={id}
            to={path}
            className="ui-nav-link"
            aria-current={selected === id ? 'page' : undefined}
          >
            <Icon className="size-6" variant={selected === id ? 'solid' : 'outline'} />
            <span className={selected === id ? 'font-bold' : 'font-normal'}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
export default Footer;
