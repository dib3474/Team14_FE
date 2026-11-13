import Container from '@/components/common/Container';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import SettingsContent from '@/pages/Settings/components/SettingsContent';
/**
 * 설정 페이지
 * 다양한 기능들을 제공합니다.
 * @returns 설정 페이지 컴포넌트
 * 설정 페이지 내용을 표시합니다.
 */
const SettingsPage = () => {
  return (
    <Container>
      <Header variant="page" title="설정" />
      <div className="ui-page">
        <SettingsContent />
      </div>
      <Footer initialSelected="my" />
    </Container>
  );
};

export default SettingsPage;
