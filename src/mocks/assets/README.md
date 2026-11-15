# 고정 이미지 fixture

개발 mock과 로컬 성능 비교는 같은 원본 파일을 사용한다. 원본 프로젝트의 축제 mock URL을 HTTPS로 고정 복사했다.

| 파일 | 원본 |
| --- | --- |
| flowers.png | [가평 양떼목장 수국축제 이미지](https://tong.visitkorea.or.kr/cms/resource/88/3503888_image2_1.png) |
| jeonju.jpg | [한옥마을 전통연희 이미지](https://tong.visitkorea.or.kr/cms/resource/68/3485868_image2_1.jpg) |
| palace.jpg | [경기전 왕과의 산책 이미지](https://tong.visitkorea.or.kr/cms/resource/10/3495210_image2_1.jpg) |

측정 시 원본 바이트를 바꾸지 않는다. 목록·상세·리뷰는 같은 고정 이미지들을 참조한다.
fixture의 날짜·평점·찜 수는 검증용이며 실제 개최 여부나 추천 결과를 의미하지 않는다.
이미지 원본에 표시된 연도와 테스트용 날짜는 다를 수 있다.
실제 영상 전송 시나리오는 이 이미지 fixture의 성능 결과에 포함하지 않는다.
