// Runs read-only inside Lighthouse's isolated browser world.
export function collectComparisonGeometry(fixture) {
  const d = globalThis.document,
    root = d.documentElement,
    url = new URL(globalThis.location.href),
    path = url.pathname;
  const text = d.body.innerText,
    normalized = text.replace(/\s/g, '');
  const has = (value) => normalized.includes(value.replace(/\s/g, ''));
  const images = [...d.images]
    .filter((el) => el.getBoundingClientRect().width > 0)
    .map((el) => ({ src: new URL(el.src).pathname, loaded: el.complete && el.naturalWidth > 0 }));
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    };
  };
  let ready = false,
    expected = 'unknown comparison route';
  if (path === '/') {
    expected = 'map + FestaPick';
    ready = has('FestaPick') && images.some((i) => i.src === '/koreamap.svg' && i.loaded);
  } else if (path.startsWith('/festivals/')) {
    if (url.searchParams.get('demo') === 'empty') {
      expected = 'empty festival list';
      ready = has('축제가 없습니다') && !d.querySelector('a[href^="/festival/"]');
    } else if (url.searchParams.get('demo') === 'error') {
      expected = 'festival error state';
      ready = has('오류');
    } else {
      expected = fixture.festivals[0].title;
      ready = fixture.festivals.every((f) => has(f.title));
    }
  } else if (/^\/festival\/\d+\/notices$/.test(path)) {
    expected = 'festival notices';
    ready = has(fixture.notices[0].title);
  } else if (/^\/festival\/\d+$/.test(path)) {
    expected = 'festival detail with reviews';
    ready = has(fixture.festivals[0].title) && fixture.reviews.every((r) => has(r.reviewerName));
  } else if (path === '/search') {
    expected = 'search input and requested results';
    const input = d.querySelector('input');
    const keyword = url.searchParams.get('q');
    ready =
      !!input &&
      (!keyword ||
        (input.value === keyword &&
          has('검색 결과') &&
          fixture.festivals.some((f) => f.title.includes(keyword) && has(f.title))));
  } else if (path === '/pick/histories') {
    expected = 'history + actual style enum labels';
    ready =
      has('당신의 선택') &&
      has('자연/경관') &&
      has('체험/참여') &&
      has('예술/공연') &&
      has(fixture.festivals[0].title);
  } else if (path.startsWith('/pick/')) {
    const mbti = url.searchParams.get('step') === 'mbti';
    expected = mbti ? 'MBTI choices' : 'style choices';
    ready = mbti
      ? has('여행 MBTI') && !!d.querySelector('input[placeholder]')
      : has('전통 문화') && has('다음');
  } else if (path === '/mypage') {
    expected = 'profile collections';
    ready = has('좋아요') && has(fixture.festivals[0].title);
  } else if (path.startsWith('/chat/')) {
    expected = 'sample chat and composer';
    ready = has('이번 주말에 수국축제 가시는 분 계신가요?') && !!d.querySelector('textarea');
  } else if (path === '/login') {
    expected = 'social login';
    ready = has('구글 로그인') && has('카카오 로그인');
  } else if (path === '/settings') {
    expected = 'profile and settings';
    ready = has(fixture.user.username) && has('축제 관리하기') && has('계정');
  } else if (path.includes('fm-permission-application')) {
    expected = 'manager application';
    ready = has('소속') && !!d.querySelector('input[name="department"]');
  } else if (path.includes('festival-register')) {
    expected = 'festival form';
    ready = has('축제 제목') && !!d.querySelector('input[name="startDate"]');
  } else if (path.includes('/settings/faq')) {
    expected = 'FAQ';
    ready = has('자주 묻는 질문');
  }

  if (root.dataset.mockMode === 'true') {
    const settled = !d.querySelector('.animate-spin,[aria-busy="true"]');
    if (path === '/search') {
      const q = url.searchParams.get('q'),
        input = d.querySelector('input');
      ready =
        settled &&
        !!input &&
        (!q ||
          (input.value === q && has('검색 결과') && (has('샘플') || has('검색 결과가 없습니다'))));
    }
    if (path.startsWith('/festivals/'))
      ready =
        settled &&
        ((has('샘플') && d.querySelectorAll('a[href^="/festival/"]').length > 0) ||
          has('축제가 없습니다'));
    if (/^\/festival\/\d+$/.test(path)) ready = settled && has('샘플') && has('상세정보');
    if (path.startsWith('/chat/')) ready = settled && has('샘플') && !!d.querySelector('textarea');
    if (path === '/pick/histories') ready = settled && has('당신의 선택') && has('샘플');
    if (path === '/mypage' && url.searchParams.get('tab') === 'reviewed')
      ready = settled && has('내가 작성한 리뷰') && !!d.querySelector('a[href^="/review/"]');
    if (/^\/review\/\d+\/edit$/.test(path))
      ready = settled && !!d.querySelector('textarea') && has('리뷰');
  }
  return {
    path,
    width: root.clientWidth,
    innerWidth: globalThis.innerWidth,
    scrollWidth: root.scrollWidth,
    font: globalThis.getComputedStyle(root).fontSize,
    ready,
    expected,
    headings: [...d.querySelectorAll('h1,h2,h3')].map((el) => el.textContent),
    images,
    nestedControls: d.querySelectorAll('a button,button a').length,
    appRect: rect(d.querySelector('main,.min-h-screen')),
    map: rect(d.querySelector('img[src="/koreamap.svg"]')),
    footer: rect(d.querySelector('.ui-footer-surface,.app-nav-surface,.hybrid-footer-surface')),
    composer: rect(d.querySelector('textarea')),
    textSample: text.slice(0, 1000),
  };
}
