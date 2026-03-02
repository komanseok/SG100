-- SG100 공약 투표 웹앱 DB 스키마
-- Supabase SQL Editor에서 실행

-- 1. 카테고리 테이블
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  order_num INT NOT NULL,
  name TEXT NOT NULL,
  pledge_count INT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT NOT NULL DEFAULT 'Star'
);

-- 2. 공약 테이블
CREATE TABLE pledges (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id),
  number INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 투표 기록 테이블
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledge_id INT NOT NULL REFERENCES pledges(id),
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pledge_id, fingerprint)
);

-- 4. 인덱스
CREATE INDEX idx_votes_fingerprint ON votes(fingerprint);
CREATE INDEX idx_votes_pledge_id ON votes(pledge_id);
CREATE INDEX idx_pledges_category_id ON pledges(category_id);
CREATE INDEX idx_pledges_like_count ON pledges(like_count DESC);

-- 5. RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read pledges" ON pledges FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can delete own vote" ON votes FOR DELETE USING (true);

-- 7. 좋아요 토글 함수
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
    DELETE FROM votes WHERE id = existing_vote;
    UPDATE pledges SET like_count = like_count - 1 WHERE id = p_pledge_id;
  ELSE
    INSERT INTO votes (pledge_id, fingerprint)
    VALUES (p_pledge_id, p_fingerprint);
    UPDATE pledges SET like_count = like_count + 1 WHERE id = p_pledge_id;
  END IF;

  SELECT like_count INTO new_count FROM pledges WHERE id = p_pledge_id;

  RETURN json_build_object(
    'liked', existing_vote IS NULL,
    'like_count', new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 시드 데이터: 카테고리
INSERT INTO categories (id, order_num, name, pledge_count, color, icon) VALUES
(1, 1, '주민주권 시대 AI 스마트 행정', 11, '#3B82F6', 'Building2'),
(2, 2, '대전 먹거리를 이끌 혁신 경제', 13, '#F59E0B', 'TrendingUp'),
(3, 3, '모두가 잘 사는 균형성장', 18, '#10B981', 'Scale'),
(4, 4, '기본이 튼튼한 사회', 28, '#EF4444', 'Shield'),
(5, 5, '품격 있는 교육 혁신', 13, '#8B5CF6', 'GraduationCap'),
(6, 6, '꿈꾸는 청년 도시', 11, '#EC4899', 'Sparkles'),
(7, 7, 'K-문화 선도 과학문화 도시', 6, '#F97316', 'Palette');

-- 9. 시드 데이터: 공약 100개
INSERT INTO pledges (number, category_id, title) VALUES
(1, 1, 'AI 기반 주민참여 리빙랩 서구 공감청 조성'),
(2, 1, '주민참여 예산제 확대·계층별 공모제 도입'),
(3, 1, 'AI 기반 데이터통합 지능형 구정 플랫폼 구축'),
(4, 1, '구청장 직통 365 소통폰, 이동 구청장실 정례화'),
(5, 1, '진정한 지방자치 - 동장 공모제 시범 운영'),
(6, 1, '24개 동 주민자치회 완전 정착·행정 지원'),
(7, 1, '현장 중심 찾아가는 이동 구청장실 운영'),
(8, 1, '보행자 안전 스마트 횡단보도 설치'),
(9, 1, 'AI 활용 공정 심사 시스템·채용 비리 차단'),
(10, 1, '시민 참여형 감사위원회 권한 강화'),
(11, 1, '버스정류장 스마트 쉼터 도입'),
(12, 2, 'AI 스타트업 밸리 특화 지구 조성'),
(13, 2, '충청판 실리콘밸리 혁신 창업 생태계 조성'),
(14, 2, '구청 출자 대전서구일자리주식회사 설립'),
(15, 2, '지역 맞춤형 서구형 일자리 3만5천개 창출'),
(16, 2, '소상공인 경영안정 자금 및 성장 단계별 지원'),
(17, 2, '중소기업 RE100 달성 원스톱 컨설팅 지원'),
(18, 2, '도심 속 힐링 스마트팜 및 도시농업 활성화'),
(19, 2, '지역농산물 직거래장터 개설 및 로컬푸드 확대'),
(20, 2, '도마·한민 전통시장 시설 현대화 및 디지털 전환'),
(21, 2, '지역화폐 발행 확대 및 골목상권 이용 혜택 강화'),
(22, 2, '친환경 제로웨이스트 상점 육성 및 인센티브제 도입'),
(23, 2, '창업자-소상공인 멘토링 매칭데이 정례화'),
(24, 2, '여성 친화적 창업 생태계 구축 및 유연 근무 일자리 지원'),
(25, 3, '원도심 거주 생활환경 인프라 개선 확대'),
(26, 3, '재개발·재건축 신속 통합 주거정비지원단 신설'),
(27, 3, '예비군훈련장 부지 서구 생활문화 랜드마크 구축'),
(28, 3, '골목상권 르네상스 프로젝트'),
(29, 3, '둔산 노후계획도시 정비 선도지구 지정·명품화'),
(30, 3, '교통 소외지역 수요응답형(DRT) 버스 도입'),
(31, 3, '방위사업청 둔산 이전 연계 방산기업 클러스터 구축'),
(32, 3, '주택가·상가 밀집 지역 공영주차장 확충'),
(33, 3, '갑천·유등천 생태 회복 하천 정비'),
(34, 3, '가수원·흑석 역세권 개발'),
(35, 3, '노후 공공임대주택 그린리모델링 추진'),
(36, 3, '에너지 취약계층 기후위기 폭염·한파 지원'),
(37, 3, '전기차·수소차 충전인프라 및 보급 대폭 확대'),
(38, 3, '공영자전거 타슈 활성화·자전거 도로 정비'),
(39, 3, '친환경 트램·BRT 연계 교통망 조기 구축'),
(40, 3, '노루벌 생태시민학교 운영'),
(41, 3, '갑천 생태습지 자연기반해법(NbS)지구 지정'),
(42, 3, '젠트리피케이션 방지 조례 추진'),
(43, 4, '신청주의 탈피, 찾아가는 선제적 AI 복지'),
(44, 4, '공공의료 기능 강화 및 구민 건강권 보장'),
(45, 4, '아동·초등·어르신 전 생애 통합 돌봄 체계 구축'),
(46, 4, '주민참여형 햇빛발전소 구축 및 햇빛연금 도입'),
(47, 4, '경력 보유 여성 경력인정제 도입 및 일자리 매칭'),
(48, 4, '어린이보호구역 AI 스마트 보행로 설치'),
(49, 4, '기후 위기 대응 탄소중립 선도도시 선포'),
(50, 4, 'AI·ICT 기반 지능형 재난 안전 통합 관리 시스템 구축'),
(51, 4, '임대차 위기 사전 알림·안심 계약 지원'),
(52, 4, '1인가구 맞춤형 안심·생활 지원체계 구축'),
(53, 4, '3대 하천 생태 복원 및 친수공간 조성'),
(54, 4, '24시간 안전 안심 공중화장실 및 디지털 성범죄 근절'),
(55, 4, '고독사 위험 상태 기반 조기 개입 구축'),
(56, 4, '청각·언어 장애인 위한 농아인 쉼터 개소'),
(57, 4, '생활체육 활성화 및 AI 퍼스널 트레이닝(PT) 도입'),
(58, 4, '전 구민 대상 안심 생활안전보험 가입'),
(59, 4, '범죄예방환경설계(CPTED) 및 지능형 CCTV 확대'),
(60, 4, '사람과 동물이 행복한 반려동물 친화도시 조성'),
(61, 4, '어르신 전담 효사랑 주치의 제도 운영'),
(62, 4, '자원 순환 AI 재활용품 무인 회수기 설치'),
(63, 4, '미세먼지 차단 도시 바람길 숲 조성'),
(64, 4, '빗물 재이용 스마트 빗물 저금통 설치 지원'),
(65, 4, '건강한 먹거리 선순환 서구형 푸드플랜 구축'),
(66, 4, '파크골프장 확대'),
(67, 4, '24개 동별 생활 밀착형 체육시설 확충'),
(68, 4, '독거어르신 요구르트 안부 확인·반찬 지원'),
(69, 4, '아동학대 예방·적극 대응체계 마련'),
(70, 4, '기후위기 대응 폭우 예방·관리 정책 체계화'),
(71, 5, 'AI·SW 교육 특화지구·미래학교 조성 지원'),
(72, 5, '노후 학교 그린스마트 스쿨 전환 지원'),
(73, 5, '학생 편의시설 환경 개선 지원'),
(74, 5, '과밀학급 해소 도안동고등학교 신설 추진'),
(75, 5, '지역사회 연계 맞춤형 진로 직업 교육'),
(76, 5, '저소득·다문화 가정 교육복지 사각지대 제로화'),
(77, 5, '청소년이 직접 기획하는 청소년 자치 교육 강화'),
(78, 5, '도서관 통합 네트워크 구축·작은 도서관 활성화'),
(79, 5, '글로벌 인재 양성 영어특화 공공도서관 운영'),
(80, 5, '찾아가는 평생학습 배달 강좌제 내실화'),
(81, 5, '디지털 소외 없는 어르신 디지털 배움터 운영'),
(82, 5, '어린이 안심 등하교 워킹 스쿨버스 도입'),
(83, 5, '학교 급식 저탄소·로컬푸드 식단 지원 확대'),
(84, 6, '청년 기본형 수당 지원'),
(85, 6, '폐원 시설 활용 청년문화예술 플랫폼 조성'),
(86, 6, '청년 머무는 직(職)·주(住)·락(樂) 문화선도산업단지 조성'),
(87, 6, '청년 자기 탐색 위한 갭이어(Gap year) 지원'),
(88, 6, '지역공공기관 지역인재 의무 채용 50% 확대 추진'),
(89, 6, '청년 꿈도전 지원 사업 확대'),
(90, 6, '청년 주거 안정 이사비·월세 지원'),
(91, 6, '대중교통비 절감 청년 기후동행카드 지원'),
(92, 6, '청년마을 조성'),
(93, 6, '공유킥보드 전용 주차구역·안전 이용 환경 조성'),
(94, 6, '청년 창업 친환경·업사이클링 분야 지원'),
(95, 7, '융복합 창작 거점 AI 아트 지원센터 건립'),
(96, 7, '예술 작품 디지털 전환(DX) 프로젝트 지원'),
(97, 7, '과학-예술-창업 페스티벌 추진'),
(98, 7, '전 주민 즐기는 과학·문화 융합프로젝트 확대'),
(99, 7, '지역예술가-주민 소통 문화 플리마켓 상설화'),
(100, 7, '장애인 예술가 창작 활동·전시 지원 강화');

-- 시퀀스 재설정
SELECT setval('categories_id_seq', 7);
SELECT setval('pledges_id_seq', 100);

-- ============================================
-- 구민의 목소리 (opinions) 관련 테이블
-- ============================================

-- 10. 의견 테이블
CREATE TABLE opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 2 AND 300),
  fingerprint TEXT NOT NULL,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. 의견 공감 테이블
CREATE TABLE opinion_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id UUID NOT NULL REFERENCES opinions(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opinion_id, fingerprint)
);

-- 12. 인덱스
CREATE INDEX idx_opinions_created_at ON opinions(created_at DESC);
CREATE INDEX idx_opinions_like_count ON opinions(like_count DESC);
CREATE INDEX idx_opinions_fingerprint ON opinions(fingerprint);
CREATE INDEX idx_opinion_likes_opinion_id ON opinion_likes(opinion_id);
CREATE INDEX idx_opinion_likes_fingerprint ON opinion_likes(fingerprint);

-- 13. RLS 활성화
ALTER TABLE opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinion_likes ENABLE ROW LEVEL SECURITY;

-- 14. RLS 정책
CREATE POLICY "Public read opinions" ON opinions FOR SELECT USING (true);
CREATE POLICY "Anyone can create opinion" ON opinions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read opinion_likes" ON opinion_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can like opinion" ON opinion_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unlike opinion" ON opinion_likes FOR DELETE USING (true);

-- 15. 의견 공감 토글 함수
CREATE OR REPLACE FUNCTION toggle_opinion_like(
  p_opinion_id UUID,
  p_fingerprint TEXT
) RETURNS JSON AS $$
DECLARE
  existing_like UUID;
  new_count INT;
BEGIN
  SELECT id INTO existing_like
  FROM opinion_likes
  WHERE opinion_id = p_opinion_id AND fingerprint = p_fingerprint;

  IF existing_like IS NOT NULL THEN
    DELETE FROM opinion_likes WHERE id = existing_like;
    UPDATE opinions SET like_count = like_count - 1 WHERE id = p_opinion_id;
  ELSE
    INSERT INTO opinion_likes (opinion_id, fingerprint)
    VALUES (p_opinion_id, p_fingerprint);
    UPDATE opinions SET like_count = like_count + 1 WHERE id = p_opinion_id;
  END IF;

  SELECT like_count INTO new_count FROM opinions WHERE id = p_opinion_id;

  RETURN json_build_object(
    'liked', existing_like IS NULL,
    'like_count', new_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
