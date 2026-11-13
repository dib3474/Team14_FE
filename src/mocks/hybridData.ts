import fixture from '../../scripts/design-comparison/fixture.json';
import MAP_PINS from '@/constants/mapPins';
import type { FestivalInfo } from '@/types/FestivalType';
import type { Review } from '@/apis/review/getReview';
import type { Notice } from '@/types/Notice';
import type { UserInfoResponse } from '@/types/UserType';
import type { FestivalPermissionDetail } from '@/apis/festivalManager/getMyFestivalPermissionDetail';
import type { FestivalRegistrationApplication } from '@/types/FestivalFormTypes';
import type { MyChat } from '@/apis/chat/getMyChats';
import type { MessageResponse } from '@/hooks/useChatRoom';

const images = [
  new URL('./assets/flowers.png', import.meta.url).href,
  new URL('./assets/jeonju.jpg', import.meta.url).href,
  new URL('./assets/palace.jpg', import.meta.url).href,
];
export const mockUser: UserInfoResponse['content'] = { ...fixture.user, userId: 7 };
export const localDate = (offset = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};
const periods = [
  { start: -7, end: 14, label: '진행 중' },
  { start: 21, end: 28, label: '개최 예정' },
  { start: -28, end: -14, label: '종료' },
];
export const mockFestivals: FestivalInfo[] = MAP_PINS.filter((pin) => pin.areaId !== '0').flatMap(
  (pin, regionIndex) =>
    periods.map((period, index) => {
      const source = fixture.festivals[index];
      const id = regionIndex * 3 + index + 1;
      return {
        id,
        managerId: id === 2 ? null : id === 1 || id % 3 === 0 ? 7 : 42,
        title: `${pin.name} ${source.title} (샘플 · ${period.label})`,
        addr1: `${pin.name} 샘플 축제광장 · 위치 확인용 예시`,
        addr2: '실제 개최 정보가 아닌 화면 미리보기용 샘플입니다.',
        posterInfo: images[index],
        startDate: localDate(period.start),
        endDate: localDate(period.end),
        averageScore: source.averageScore,
        wishCount: source.wishCount,
        areaCode: Number(pin.areaId),
        overView: `이 축제는 화면 확인을 위한 샘플입니다. 실제 일정과 장소가 아닙니다.\n\n${fixture.detail.overView}`,
        homePage: 'no_homepage',
        imageInfos: [...images],
        isMyWish: id % 2 === 1,
      };
    }),
);
export const mockReviews: Review[] = mockFestivals.flatMap((festival, index) => [
  ...fixture.reviews.map((review, reviewIndex) => ({
    ...review,
    reviewId: 900 + index * 10 + reviewIndex,
    userId: 7,
    reviewerName: mockUser.username,
    festivalTitle: festival.title,
    content: `${review.content} 화면 확인을 위한 샘플 리뷰입니다.`,
    imageUrls: review.imageUrls.length ? images.slice(0, 2) : [],
  })),
  {
    reviewId: 903 + index * 10,
    userId: 42,
    reviewerName: '다른 여행자 (샘플)',
    festivalTitle: festival.title,
    content: '다음 여행이 기대되는 샘플 후기입니다.',
    score: 4,
    imageUrls: [],
    videoUrl: '',
  },
]);
export const reviewsForFestival = (id: number) => {
  const festival = mockFestivals.find((item) => item.id === id);
  return festival ? mockReviews.filter((item) => item.festivalTitle === festival.title) : [];
};
export const mockNotices: Notice[] = fixture.notices.map((notice) => ({
  ...notice,
  userId: 7,
  title: `${notice.title} (샘플)`,
  updatedDate: `${localDate(-1)}T10:30:00`,
  images: [],
}));
export const mockFestivalPermissions: FestivalPermissionDetail[] = mockFestivals
  .slice(0, 6)
  .map((festival, index) => ({
    id: index + 1,
    title: festival.title,
    appliedDate: localDate(-index - 3),
    state: index % 2 === 0 ? 'PENDING' : 'APPROVED',
    posterImg: festival.posterInfo,
    docs: [],
  }));
export const mockCustomFestivals: FestivalRegistrationApplication[] = mockFestivals
  .slice(0, 6)
  .map((festival, index) => ({
    id: festival.id,
    title: festival.title,
    updatedDate: localDate(-index - 1),
    state: index % 2 === 0 ? 'PENDING' : 'APPROVED',
  }));
export const mockChats: MyChat[] = mockFestivals.slice(0, 3).map((festival) => ({
  roomId: 1000 + festival.id,
  roomName: `${festival.title} 채팅`,
  festivalId: festival.id,
  posterInfo: festival.posterInfo,
  existNewMessage: festival.id === 1,
}));
export const mockMessages: MessageResponse[] = [
  {
    id: 3,
    userId: 7,
    senderName: mockUser.username,
    profileImgUrl: mockUser.profileImageUrl,
    content: '이 대화는 화면 확인용 샘플입니다. 실제 메시지는 전송되지 않아요.',
    imageUrl: '',
  },
  {
    id: 2,
    userId: 42,
    senderName: '축제 친구 (샘플)',
    profileImgUrl: '/area/seoul.svg',
    content: '축제에 함께 가는 기분으로 둘러보세요!',
    imageUrl: '',
  },
  {
    id: 1,
    userId: 7,
    senderName: mockUser.username,
    profileImgUrl: mockUser.profileImageUrl,
    content: '사진도 함께 확인해요. (샘플)',
    imageUrl: images[0],
  },
];
