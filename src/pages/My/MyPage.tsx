import Container from '@/components/common/Container';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import MyPageWishFestivalsSection from '@/pages/My/components/MyPageWishFestivalsSection';
import MyPageReviewFestivalsSection from '@/pages/My/components/MyPageReviewFestivalsSection';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorComponent from '@/components/error/ErrorComponent';
import { showToastAxiosError } from '@/utils/showToastMessage';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import MyPageOwnReviewPreviews from '@/pages/My/components/MyPageOwnReviewPreviews';
import MyPageChatSection from '@/pages/My/components/MyPageChatSection';

/**
 * 마이페이지
 * 채팅 목록을 조회
 * 좋아요한 축제와 리뷰 목록 조회
 * @returns 마이페이지
 */
const MyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get('tab') === 'reviewed' ? 'reviewed' : 'wishlist';
  const setSelectedTab = (tab: 'wishlist' | 'reviewed') => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (tab === 'reviewed') next.set('tab', 'reviewed');
        else next.delete('tab');
        return next;
      },
      { replace: true },
    );
  };

  const chooseStyle = 'bg-white text-ui-ink shadow-sm font-bold';
  const notChooseStyle = 'text-ui-muted';
  return (
    <Container>
      <Header variant="mypage" />
      <div className="ui-page">
        <div>
          <p className="ui-eyebrow">MY FESTAPICK</p>
          <h1 className="ui-title mt-2">나의 축제 모음</h1>
          <p className="ui-body mt-2 text-ui-muted">좋아하는 축제와 함께한 순간을 모아보세요.</p>
        </div>
        <ErrorBoundary
          FallbackComponent={() => (
            <ErrorComponent
              title="오류가 발생했습니다."
              message="잠시 후 다시 시도해주세요."
              showBackButton={true}
            />
          )}
          onError={(error) => {
            showToastAxiosError(error);
          }}
        >
          <Suspense
            fallback={
              <LoadingSpinner
                size="lg"
                message="채팅 목록을 불러오는 중..."
                className="ui-feedback min-h-32"
              />
            }
          >
            <MyPageChatSection />
          </Suspense>
        </ErrorBoundary>
        <div className="ui-tabs" role="group" aria-label="나의 축제 목록 선택">
          <button
            className={`min-h-12 rounded-xl px-4 py-3 text-sm transition-colors ${selectedTab === 'wishlist' ? chooseStyle : notChooseStyle} w-full`}
            aria-pressed={selectedTab === 'wishlist'}
            onClick={() => setSelectedTab('wishlist')}
          >
            좋아요
          </button>
          <button
            className={`min-h-12 rounded-xl px-4 py-3 text-sm transition-colors ${selectedTab === 'reviewed' ? chooseStyle : notChooseStyle} w-full`}
            aria-pressed={selectedTab === 'reviewed'}
            onClick={() => setSelectedTab('reviewed')}
          >
            리뷰
          </button>
        </div>
        {selectedTab === 'reviewed' && <MyPageOwnReviewPreviews />}
        <section
          aria-label={selectedTab === 'reviewed' ? '리뷰를 남긴 축제' : undefined}
          className="flex min-w-0 flex-col gap-4"
        >
          {selectedTab === 'reviewed' && <h2 className="ui-section-title">리뷰를 남긴 축제</h2>}
          <ErrorBoundary
            FallbackComponent={() => (
              <ErrorComponent
                title="오류가 발생했습니다."
                message="잠시 후 다시 시도해주세요."
                showBackButton={true}
              />
            )}
            onError={(error) => {
              showToastAxiosError(error);
            }}
          >
            <Suspense
              fallback={
                <LoadingSpinner
                  size="lg"
                  className="ui-feedback min-h-40"
                  message="좋아요한 축제를 불러오는 중..."
                />
              }
            >
              {selectedTab === 'wishlist' ? (
                <MyPageWishFestivalsSection />
              ) : (
                <MyPageReviewFestivalsSection />
              )}
            </Suspense>
          </ErrorBoundary>
        </section>
      </div>
      <Footer initialSelected="my" />
    </Container>
  );
};

export default MyPage;
