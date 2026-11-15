import '@/pages/Settings/settings.css';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}
/**
 * 설정 섹션 컴포넌트
 * @param title - 섹션 제목
 * @param children - 섹션 내용
 * @returns 설정 섹션 컴포넌트
 * 설정 섹션을 표시합니다.
 */
const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  return (
    <section className="ui-panel ui-settings-section">
      <h2 className="ui-section-title">{title}</h2>
      <div className="ui-settings-menu">{children}</div>
    </section>
  );
};

export default SettingsSection;
