import Header from '@/components/common/Header';
import Container from '@/components/common/Container';
import FestivalInfoFooter from '@/pages/FestivalInfo/components/FestivalInfoFooter';
import { useParams } from 'react-router-dom';
import getFestivalInfo from '@/apis/festivals/getFestivalInfo';
import { useQuery } from '@tanstack/react-query';
import FestivalPoster from '@/pages/FestivalInfo/components/FestivalPoster';
import FestivalBannerSection from '@/pages/FestivalInfo/components/FestivalBannerSection';
import './festival-info.css';
import FestivalContentInfoSection from '@/pages/FestivalInfo/components/FestivalContentInfoSection';
import FestivalContentOverviewSection from '@/pages/FestivalInfo/components/FestivalContentOverviewSection';
import FestivalContentReviewSection from '@/pages/FestivalInfo/components/FestivalContentReviewSection';
import getReview from '@/apis/review/getReview';
import FestivalContentManagerSection from '@/pages/FestivalInfo/components/FestivalContentManagerSection';
import FestivalContentNoticeSection from '@/pages/FestivalInfo/components/FestivalContentNoticeSection';
import LoadingPage from '@/components/loading/LoadingPage';
import ErrorPage from '@/components/error/ErrorPage';
import { useAuth } from '@/context/AuthContext';
import SEOHead from '@/components/common/SEOHead';

const FestivalInfoPage = () => {
  const { festivalId } = useParams();
  const { isInitialized } = useAuth();
  const {
    data: festivalData,
    isPending: isFestivalPending,
    isError: isFestivalError,
  } = useQuery({
    queryKey: ['festival', festivalId],
    queryFn: () => getFestivalInfo({ festivalId: festivalId || '' }),
    select: (data) => data.data,
    enabled: !!festivalId && isInitialized,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const {
    data: reviewsData,
    isPending: isReviewsPending,
    isError: isReviewsError,
  } = useQuery({
    queryKey: ['reviews', festivalId],
    queryFn: () => getReview({ festivalId: festivalId || '' }),
    select: (data) => data.data,
  });
  const { userInfo } = useAuth();

  const isManager = userInfo?.userId === festivalData?.content.managerId;

  if (isFestivalPending || isReviewsPending) {
    return <LoadingPage title="축제 정보" message="축제 정보를 불러오는 중" variant="page" />;
  }

  if (isFestivalError || isReviewsError || !festivalId) {
    return (
      <ErrorPage
        title="축제 정보"
        message="축제 정보를 불러오는 중 오류가 발생했습니다."
        variant="page"
      />
    );
  }

  return (
    <Container>
      <SEOHead
        title={`${festivalData.content.title} | FestaPick`}
        description={
          festivalData.content.overView ||
          `${festivalData.content.title}의 상세 정보를 확인해보세요.`
        }
        url={`/festival/${festivalId}`}
        image={festivalData.content.posterInfo || undefined}
      />
      <Header variant="all" title="축제 정보" />
      <div className="ui-page festival-detail-page">
        <FestivalPoster
          posterUrl={festivalData.content.posterInfo}
          imageUrls={festivalData.content.imageInfos}
          title={festivalData.content.title}
        />
        <div className="festival-detail-sections">
          <FestivalContentInfoSection
            content={festivalData.content}
            averageScore={festivalData.content.averageScore ?? 0}
            reviewCount={reviewsData.totalElements}
          />
          <FestivalBannerSection
            url={festivalData.content.homePage}
            isMyWish={festivalData.content.isMyWish}
            wishCount={festivalData.content.wishCount}
          />
          <FestivalContentOverviewSection
            festivalId={festivalId}
            overview={festivalData.content.overView}
            isManager={isManager}
          />
          <FestivalContentNoticeSection festivalId={festivalId} isManager={isManager} />
          <FestivalContentManagerSection festivalId={festivalId} isManager={isManager} />
          <FestivalContentReviewSection
            reviewsData={reviewsData.content}
            festivalTitle={festivalData.content.title}
          />
        </div>
      </div>
      <FestivalInfoFooter />
    </Container>
  );
};

export default FestivalInfoPage;
