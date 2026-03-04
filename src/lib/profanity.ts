// 한국어 금칙어 목록 (욕설, 비방, 성적 표현)
const PROFANITY_LIST = [
  // 욕설
  "씨발", "시발", "씨팔", "시팔", "씨바", "시바",
  "개새끼", "개세끼", "개색끼", "개색기", "개쉐끼",
  "병신", "병싄", "빙신", "ㅂㅅ",
  "지랄", "지럴", "짓거리",
  "미친놈", "미친년", "미친새끼",
  "존나", "졸라", "존니", "좆",
  "꺼져", "닥쳐", "뒤져", "뒤져라", "죽어",
  "ㅅㅂ", "ㅆㅂ", "ㅂㅅ", "ㅈㄹ",
  "새끼", "쌍놈", "쌍년",
  "개같은", "개놈", "개년",
  "멍청이", "바보", "얼간이",
  "썅", "엠창", "느금마",
  "fuck", "shit", "damn",
  // 비방
  "찌질이", "한남충", "한녀충", "김치녀", "된장녀",
  "틀딱", "꼰대", "쓰레기",
  // 성적 표현
  "보지", "자지", "성기", "섹스", "야동",
  "강간", "성폭행", "몰카",
];

// 공백/특수문자 삽입 우회 방어: 각 글자 사이에 선택적 공백/특수문자 허용
function buildPattern(word: string): RegExp {
  const escaped = word
    .split("")
    .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s\\-_.!@#$%^&*]*");
  return new RegExp(escaped, "i");
}

const PROFANITY_PATTERNS = PROFANITY_LIST.map(buildPattern);

export function containsProfanity(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  return PROFANITY_PATTERNS.some((pattern) => pattern.test(normalized));
}
