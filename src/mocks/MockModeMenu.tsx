import './mock-mode.css';
import { mockScreens } from './mockScreens';
const MockModeMenu = () => (
  <aside className="mock-mode-tools" aria-label="개발 목 모드">
    <details>
      <summary>
        <strong>MOCK</strong>
        <span>샘플 계정 · 화면 목록</span>
        <span aria-hidden="true">⌄</span>
      </summary>
      <nav aria-label="목 화면 바로가기">
        <p>
          로그인 없이 모든 화면을 살펴보세요. 실제 저장·업로드·소셜 로그인·채팅 전송은 수행하지
          않습니다.
        </p>
        {mockScreens.map(([label, to]) => (
          <a key={to} href={to}>
            {label}
          </a>
        ))}
      </nav>
    </details>
  </aside>
);
export default MockModeMenu;
