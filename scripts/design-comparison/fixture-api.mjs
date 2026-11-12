import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('./fixture.json', import.meta.url), 'utf8'));
const item = (content) => ({ content });
const page = (content, url) => {
  const size = Number(url.searchParams.get('size') || 6),
    n = Number(url.searchParams.get('page') || 0);
  return {
    content: content.slice(n * size, (n + 1) * size),
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
    last: (n + 1) * size >= content.length,
    first: n === 0,
    number: n,
    size,
    numberOfElements: content.slice(n * size, (n + 1) * size).length,
    empty: content.length === 0,
    pageable: {
      pageNumber: n,
      pageSize: size,
      offset: n * size,
      paged: true,
      unpaged: false,
      sort: { empty: true, sorted: false, unsorted: true },
    },
    sort: { empty: true, sorted: false, unsorted: true },
  };
};
const user = {
  userId: 7,
  username: '축제 여행자',
  email: 'traveler@example.test',
  profileImageUrl: '/area/jeju.svg',
};
export function fixtureResponse(method, url, referer) {
  const p = url.pathname,
    from = new URL(referer || 'http://localhost'),
    mode = from.searchParams.get('demo');
  const ok = (body) => ({ status: 200, headers: {}, body });
  if (p === '/api/jwt/exchange' && from.pathname === '/login')
    return { status: 401, headers: {}, body: {} };
  if (p === '/api/jwt/exchange')
    return {
      status: 200,
      headers: { authorization: 'Bearer local-design-preview-only' },
      body: {},
    };
  if (p === '/api/users/my') return ok(item(user));
  if (p === '/api/users/role') return ok(item({ isFestivalManagerOrAdmin: true }));
  if (p.startsWith('/oauth2/'))
    return {
      status: 501,
      headers: {},
      body: { message: '디자인 비교 프리뷰에서는 실제 소셜 로그인하지 않습니다.' },
    };
  if (mode === 'error' && method === 'GET')
    return { status: 500, headers: {}, body: { message: '비교용 오류 상태' } };
  const festivals = mode === 'empty' ? [] : data.festivals;
  if (/^\/api\/festivals\/area\//.test(p)) return ok(page(festivals, url));
  if (p === '/api/festivals' && method === 'GET')
    return ok(
      page(
        festivals.filter(
          (f) =>
            !url.searchParams.get('keyword') || f.title.includes(url.searchParams.get('keyword')),
        ),
        url,
      ),
    );
  if (
    [
      '/api/festivals/wishedBy/me',
      '/api/festivals/reviewedBy/me',
      '/api/festivals/my',
      '/api/festivals/my/custom',
    ].includes(p)
  )
    return ok(page(festivals, url));
  if (/^\/api\/festivals\/\d+\/reviews$/.test(p))
    return ok(page(mode === 'empty' ? [] : data.reviews, url));
  if (/^\/api\/festivals\/\d+\/notices$/.test(p))
    return ok(page(mode === 'empty' ? [] : data.notices, url));
  if (/^\/api\/festivals\/\d+\/chatRooms$/.test(p))
    return ok(item({ roomId: 1, roomName: '가평 양떼목장 수국축제 채팅방', festivalId: 1 }));
  if (/^\/api\/festivals\/\d+\/check-manager$/.test(p))
    return ok(item({ exists: true, exist: true }));
  if (/^\/api\/festivals\/\d+$/.test(p)) {
    const f = data.festivals.find((f) => f.id === Number(p.split('/').at(-1))) || data.festivals[0];
    return ok(item({ ...f, ...data.detail }));
  }
  if (p === '/api/recommendations/histories')
    return ok(
      item({
        recommendedFestivals: festivals.slice(0, 2),
        recommendationFormResponse: {
          userId: 7,
          areaCode: 2,
          styles: ['nature', 'food', 'art'],
          isNewPlace: true,
          isSolo: false,
          prefersEnjoyment: true,
          isSpontaneous: false,
          additionalInfo: '맛있는 음식과 자연 속 산책을 좋아해요.',
        },
      }),
    );
  if (p === '/api/recommendations' && method === 'POST')
    return ok(page(festivals.slice(0, 2), url));
  if (p === '/api/chatRooms/me')
    return ok(
      page(
        mode === 'empty'
          ? []
          : [
              {
                roomId: 1,
                roomName: '가평 양떼목장 수국축제 채팅방',
                festivalId: 1,
                posterInfo: '/__fixtures/flowers.png',
                existNewMessage: true,
              },
              {
                roomId: 2,
                roomName: '전주 문화유산야행 채팅방',
                festivalId: 2,
                posterInfo: '/__fixtures/jeonju.jpg',
                existNewMessage: false,
              },
            ],
        url,
      ),
    );
  if (/^\/api\/chatRooms\/\d+\/messages$/.test(p))
    return ok({
      content:
        mode === 'empty'
          ? []
          : [
              {
                id: 3,
                userId: 8,
                senderName: '봄바람',
                profileImgUrl: '/area/gangwon.svg',
                content:
                  '좋아요! 현장에서 만나요. 긴 메시지도 읽기 편하게 표시되는지 확인하고 있어요.',
                imageUrl: '',
              },
              {
                id: 2,
                userId: 7,
                senderName: '축제 여행자',
                profileImgUrl: '/area/jeju.svg',
                content: '네, 천천히 산책하고 사진도 찍으려고 해요 🌼',
                imageUrl: '',
              },
              {
                id: 1,
                userId: 8,
                senderName: '봄바람',
                profileImgUrl: '/area/gangwon.svg',
                content: '이번 주말에 수국축제 가시는 분 계신가요?',
                imageUrl: '',
              },
            ],
      hasMoreList: false,
      cursor: 0,
    });
  if (p === '/api/fm-permissions/my')
    return ok(
      item({
        id: 1,
        department: 'FestaPick 축제기획팀',
        updatedDate: '2026-11-12',
        state: 'PENDING',
        docsUrls: [],
      }),
    );
  if (p === '/api/reviews/my') return ok(page(data.reviews, url));
  if (p === '/api/festival-permissions/my') return ok(page([], url));
  return {
    status: 501,
    headers: {},
    body: { message: '비교 프리뷰에서는 실제 변경 요청을 처리하지 않습니다.', path: p },
  };
}
