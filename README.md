# Mealo (밀로) 웹 프로토타입

전시용 모바일 우선 웹 프로토타입. 모든 데이터는 더미입니다 (`src/data/mock.ts`).
디자인 기준: Figma `Mealo-APP` › ❤️‍🔥 UI 디자인 › **gui 클로드가 구현할 페이지 인터렉션**

## 실행

```bash
npm install
npm run dev        # 로컬 개발
npm run build      # 프로덕션 빌드 (dist/)
```

## 구조

```
public/assets/
├─ food/meal-1~3.webp      음식 사진 (asset/food img 에서 변환)
├─ sticker/*.webp          키워드 스티커 5종 (asset/sticker SVG를 3배 해상도로 변환)
└─ logo.svg
src/
├─ App.tsx                 라우팅 (명세 §5 경로)
├─ lib/router.tsx          History API 라우터
├─ styles/tokens.css       Figma 변수 (컬러·폰트)
├─ styles/home.css         홈 · 폴라로이드 카드 · 탭바
├─ data/mock.ts            더미 끼니, 키워드, 카드 위 스티커 배치
├─ components/
│  ├─ Polaroid.tsx         폴라로이드 카드 (사진+프레임+스티커)
│  ├─ PolaroidStack.tsx    홈 카드 스택 + 왼쪽 스와이프 인터랙션
│  └─ TabBar.tsx           하단 플로팅 탭바
└─ pages/                  IA 화면별 페이지
```

## 홈 인터랙션

- 앞 카드를 **왼쪽으로 스와이프** → 카드가 화면 아래(지나간 카드 자리)로 내려가고, 뒤 카드가 똑바로 서며 앞으로 나옴. 3장 순환.
- 앞 카드 **탭** → 상세페이지 (`/polaroids/:id`)
- 키보드: ← / → 다음 카드, Enter 상세
- 배경 글로우는 주황 단색, 9초 주기로 은은하게 움직임 (`prefers-reduced-motion` 시 정지)

## 아직 임시인 것

| 항목 | 상태 |
|---|---|
| 탭바·설정·뒤로가기 아이콘 | 임시 라인 아이콘 → Figma 아이콘 SVG 받으면 교체 |
| 헤더 영문 폰트 (BC Alphapipe) | 공개 웹폰트가 없어 Poppins로 대체 중 |
| 상세·캘린더·폴더·키워드·전등 화면 | 다음 단계에서 Figma 기준으로 리빌드 |
| 저장 방식 | 메모리 상태, 새로고침 시 더미로 초기화 |
