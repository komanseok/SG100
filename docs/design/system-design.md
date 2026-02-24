# SG100 - 서구를 바꾸는 100가지 약속 투표 웹앱 설계

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | SG100 공약 투표 웹앱 |
| 목적 | 대전 서구 구민이 100개 공약 중 관심 공약에 좋아요 투표 |
| 후보 | 주정봉 (더불어민주당 대전 서구청장 예비후보) |
| 대상 사용자 | 대전 서구 구민 (모바일 중심) |
| 투표 방식 | 각 공약별 좋아요 (개수 제한 없음) |
| 인증 | 없음 (브라우저 fingerprint 기반 중복 방지) |
| 백엔드 | Supabase |

---

## 2. 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|----------|
| Frontend | Next.js 14 (App Router) | SSR/SSG, SEO, 빠른 초기 로딩 |
| UI | Tailwind CSS + shadcn/ui | 빠른 개발, 반응형, 모바일 최적화 |
| Backend/DB | Supabase (PostgreSQL) | 무료 티어, 실시간 구독, Row Level Security |
| Deployment | Vercel | Next.js 최적 호스팅, 무료 티어 |
| 상태관리 | React Query (TanStack Query) | 서버 상태 캐싱, 낙관적 업데이트 |
| 중복방지 | FingerprintJS (오픈소스) | 브라우저 고유 식별, 쿠키 대안 |

---

## 3. 데이터 모델 (Supabase/PostgreSQL)

### 3.1 테이블: `categories` (7대 전략)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | 카테고리 ID (1~7) |
| order_num | INT | 표시 순서 |
| name | TEXT | 카테고리명 |
| pledge_count | INT | 소속 공약 수 |
| color | TEXT | 테마 컬러 hex |
| icon | TEXT | 아이콘명 |

### 3.2 테이블: `pledges` (100개 공약)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | 공약 ID (1~100) |
| category_id | INT FK | categories.id 참조 |
| number | INT | 공약 번호 |
| title | TEXT | 공약 제목 |
| like_count | INT DEFAULT 0 | 좋아요 수 |
| created_at | TIMESTAMPTZ | 생성일 |

### 3.3 테이블: `votes` (투표 기록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | 투표 ID |
| pledge_id | INT FK | pledges.id 참조 |
| fingerprint | TEXT | 브라우저 fingerprint hash |
| created_at | TIMESTAMPTZ | 투표 시각 |

**UNIQUE CONSTRAINT**: (pledge_id, fingerprint) - 동일 브라우저에서 같은 공약 중복 투표 방지

### 3.4 RLS (Row Level Security) 정책

```sql
-- votes: 누구나 INSERT 가능, SELECT는 집계만
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 누구나 투표 가능 (INSERT)
CREATE POLICY "Anyone can vote" ON votes
  FOR INSERT WITH CHECK (true);

-- 자신의 투표만 조회 가능 (좋아요 취소용)
CREATE POLICY "Read own votes" ON votes
  FOR SELECT USING (true);

-- pledges: 누구나 읽기 가능
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON pledges
  FOR SELECT USING (true);

-- categories: 누구나 읽기 가능
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON categories
  FOR SELECT USING (true);
```

### 3.5 Database Function (좋아요 토글)

```sql
CREATE OR REPLACE FUNCTION toggle_vote(
  p_pledge_id INT,
  p_fingerprint TEXT
) RETURNS JSON AS $$
DECLARE
  existing_vote UUID;
  new_count INT;
BEGIN
  SELECT id INTO existing_vote
  FROM votes
  WHERE pledge_id = p_pledge_id AND fingerprint = p_fingerprint;

  IF existing_vote IS NOT NULL THEN
    -- 좋아요 취소
    DELETE FROM votes WHERE id = existing_vote;
    UPDATE pledges SET like_count = like_count - 1 WHERE id = p_pledge_id;
  ELSE
    -- 좋아요 추가
    INSERT INTO votes (id, pledge_id, fingerprint)
    VALUES (gen_random_uuid(), p_pledge_id, p_fingerprint);
    UPDATE pledges SET like_count = like_count + 1 WHERE id = p_pledge_id;
  END IF;

  SELECT like_count INTO new_count FROM pledges WHERE id = p_pledge_id;

  RETURN json_build_object(
    'liked', existing_vote IS NULL,
    'like_count', new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. 페이지 구조 (라우팅)

```
/                    → 메인 페이지 (히어로 + 카테고리 네비게이션)
/vote                → 투표 페이지 (전체 공약 목록, 카테고리 필터, 좋아요)
/results             → 결과 페이지 (순위, 차트, 카테고리별 통계)
```

---

## 5. UI/UX 설계

### 5.1 메인 페이지 (`/`)

```
┌─────────────────────────────────┐
│  [로고]  SG100                  │
│  서구를 바꾸는 100가지 약속      │
├─────────────────────────────────┤
│                                 │
│     주정봉 후보 사진/일러스트      │
│                                 │
│  "AI 시대 선도하는 과학·문화도시"  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🗳 투표하러 가기 (CTA)    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📊 투표 결과 보기         │  │
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  [7대 전략 카테고리 카드 그리드]  │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🏛️   │ │ 💰   │ │ 🏙️   │   │
│  │스마트 │ │혁신  │ │균형  │   │
│  │행정   │ │경제  │ │성장  │   │
│  │(11)  │ │(13)  │ │(18)  │   │
│  └──────┘ └──────┘ └──────┘   │
│  ┌──────┐ ┌──────┐            │
│  │ 🤝   │ │ 📚   │  ...       │
│  │튼튼한│ │교육  │            │
│  │사회  │ │혁신  │            │
│  └──────┘ └──────┘            │
├─────────────────────────────────┤
│  총 투표수: 12,345              │
│  참여자 수: 2,456               │
└─────────────────────────────────┘
```

### 5.2 투표 페이지 (`/vote`)

```
┌─────────────────────────────────┐
│  ← 뒤로    SG100 투표    📊결과  │
├─────────────────────────────────┤
│  [카테고리 필터 탭 - 가로 스크롤]  │
│  | 전체 | 스마트행정 | 혁신경제 | │
├─────────────────────────────────┤
│  [검색바] 🔍 공약 검색...        │
├─────────────────────────────────┤
│                                 │
│  ── 1. 스마트 행정 (11개) ──    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 1. AI 기반 주민참여        │  │
│  │    리빙랩 서구 공감청 조성  │  │
│  │                  ❤️ 234   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 2. 주민참여 예산제 확대·   │  │
│  │    계층별 공모제 도입      │  │
│  │                  🤍 189   │  │
│  └───────────────────────────┘  │
│  ...                            │
│                                 │
│  ── 2. 혁신 경제 (13개) ──     │
│  ...                            │
│                                 │
├─────────────────────────────────┤
│  [하단 플로팅]                   │
│  내가 선택한 공약: 5개           │
│  ┌───────────────────────────┐  │
│  │   📊 결과 보기              │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 5.3 결과 페이지 (`/results`)

```
┌─────────────────────────────────┐
│  ← 뒤로    SG100 결과    🗳투표  │
├─────────────────────────────────┤
│  총 투표수: 12,345 | 참여: 2,456│
├─────────────────────────────────┤
│  [정렬] 인기순 | 카테고리별      │
├─────────────────────────────────┤
│                                 │
│  🏆 TOP 10 관심 공약            │
│                                 │
│  1. 청년 기본형 수당 지원    982 │
│  ████████████████████████░░  │
│                                 │
│  2. AI 기반 주민참여...      875 │
│  ██████████████████████░░░░  │
│                                 │
│  3. 공공의료 기능 강화...    823 │
│  █████████████████████░░░░░  │
│  ...                            │
│                                 │
├─────────────────────────────────┤
│  [카테고리별 통계 - 도넛 차트]    │
│                                 │
│     ┌──────────┐               │
│     │  도넛차트  │               │
│     │  카테고리별│               │
│     │  투표 비율 │               │
│     └──────────┘               │
│                                 │
│  📊 스마트행정  2,345 (19%)     │
│  📊 혁신경제    1,890 (15%)     │
│  📊 균형성장    2,100 (17%)     │
│  ...                            │
└─────────────────────────────────┘
```

### 5.4 디자인 토큰

```
Colors:
  primary:    #1E40AF (진한 파랑 - 더불어민주당 컨셉)
  secondary:  #3B82F6 (밝은 파랑)
  accent:     #EF4444 (좋아요 빨강)
  bg:         #F8FAFC (연한 배경)
  card:       #FFFFFF (카드 배경)

카테고리별 색상:
  1. 스마트 행정:  #3B82F6 (Blue)
  2. 혁신 경제:    #F59E0B (Amber)
  3. 균형 성장:    #10B981 (Emerald)
  4. 튼튼한 사회:  #EF4444 (Red)
  5. 교육 혁신:    #8B5CF6 (Violet)
  6. 청년 도시:    #EC4899 (Pink)
  7. K-문화 도시:  #F97316 (Orange)

Typography:
  heading: Pretendard Bold
  body: Pretendard Regular
  size-base: 16px (모바일 최적)

Spacing:
  card-padding: 16px
  section-gap: 24px
  page-padding: 16px (모바일), 32px (데스크탑)

Breakpoints:
  mobile: < 640px (primary target)
  tablet: 640px ~ 1024px
  desktop: > 1024px
```

---

## 6. 컴포넌트 구조

```
src/
├── app/
│   ├── layout.tsx          # 공통 레이아웃 (네비게이션, 푸터)
│   ├── page.tsx            # 메인 페이지
│   ├── vote/
│   │   └── page.tsx        # 투표 페이지
│   └── results/
│       └── page.tsx        # 결과 페이지
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── Header.tsx          # 상단 네비게이션
│   ├── HeroSection.tsx     # 메인 히어로 섹션
│   ├── CategoryCard.tsx    # 카테고리 카드 (7개)
│   ├── CategoryFilter.tsx  # 카테고리 필터 탭
│   ├── PledgeCard.tsx      # 공약 카드 (좋아요 버튼 포함)
│   ├── PledgeList.tsx      # 공약 리스트 (필터+검색)
│   ├── LikeButton.tsx      # 좋아요 토글 버튼 (애니메이션)
│   ├── RankingList.tsx     # 순위 리스트
│   ├── StatsChart.tsx      # 카테고리별 통계 차트
│   ├── SearchBar.tsx       # 공약 검색
│   ├── FloatingBar.tsx     # 하단 플로팅 바
│   └── ShareButton.tsx     # SNS 공유 버튼
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── fingerprint.ts      # 브라우저 fingerprint 유틸
│   └── utils.ts            # 공통 유틸리티
├── hooks/
│   ├── usePledges.ts       # 공약 목록 조회 훅
│   ├── useVote.ts          # 투표 토글 훅 (낙관적 업데이트)
│   └── useStats.ts         # 통계 조회 훅
├── data/
│   └── pledges.ts          # 100개 공약 시드 데이터
└── types/
    └── index.ts            # TypeScript 타입 정의
```

---

## 7. API / Supabase 호출 설계

### 7.1 공약 목록 조회

```typescript
// GET: 전체 공약 + 카테고리 정보 + 내 투표 여부
const { data } = await supabase
  .from('pledges')
  .select(`
    id, number, title, like_count,
    categories(id, name, color, icon)
  `)
  .order('number');

// 내 투표 목록 (fingerprint 기반)
const { data: myVotes } = await supabase
  .from('votes')
  .select('pledge_id')
  .eq('fingerprint', fingerprint);
```

### 7.2 좋아요 토글

```typescript
// RPC 호출 (toggle_vote 함수)
const { data } = await supabase.rpc('toggle_vote', {
  p_pledge_id: pledgeId,
  p_fingerprint: fingerprint,
});
// 응답: { liked: boolean, like_count: number }
```

### 7.3 통계 조회

```typescript
// 카테고리별 총 좋아요 수
const { data } = await supabase
  .from('pledges')
  .select('category_id, like_count')
  .order('like_count', { ascending: false });
```

---

## 8. 핵심 기능 흐름

### 8.1 투표 플로우

```
사용자 앱 접속
  → 브라우저 fingerprint 생성 (localStorage 캐시)
  → 공약 목록 로드 + 내 투표 목록 로드
  → 좋아요 버튼 클릭
    → 낙관적 UI 업데이트 (즉시 하트 토글 + 카운트 변경)
    → Supabase RPC toggle_vote 호출
    → 실패 시 롤백
```

### 8.2 중복 투표 방지

```
1차: 브라우저 fingerprint (FingerprintJS 오픈소스)
  - Canvas, WebGL, 폰트, 화면 등 조합 해시
  - localStorage에 캐싱

2차: DB UNIQUE 제약조건
  - (pledge_id, fingerprint) 유니크
  - 동일 브라우저에서 같은 공약 재투표 시 좋아요 취소(토글)
```

---

## 9. 성능 최적화

| 전략 | 구현 |
|------|------|
| ISR | 결과 페이지 60초 캐시 재생성 |
| 낙관적 업데이트 | 투표 시 즉시 UI 반영, 실패 시 롤백 |
| 이미지 최적화 | next/image, WebP |
| 코드 분할 | 차트 라이브러리 dynamic import |
| 모바일 터치 | 좋아요 버튼 44px 이상 터치 타겟 |

---

## 10. 배포 계획

```
1. Supabase 프로젝트 생성 → 테이블/RLS/함수 설정
2. Vercel 배포 → 환경변수에 Supabase URL, ANON_KEY 설정
3. 커스텀 도메인 연결 (선택)
4. OG 이미지 설정 (SNS 공유 최적화)
```

---

## 11. 공약 데이터 요약 (7대 전략)

| # | 전략 | 공약 수 | 번호 |
|---|------|--------|------|
| 1 | 주민주권 시대 AI 스마트 행정 | 11개 | 1~11 |
| 2 | 대전 먹거리를 이끌 혁신 경제 | 13개 | 12~24 |
| 3 | 모두가 잘 사는 균형성장 | 18개 | 25~42 |
| 4 | 기본이 튼튼한 사회 | 28개 | 43~70 |
| 5 | 품격 있는 교육 혁신 | 13개 | 71~83 |
| 6 | 꿈꾸는 청년 도시 | 11개 | 84~94 |
| 7 | K-문화 선도 과학문화 도시 | 6개 | 95~100 |
