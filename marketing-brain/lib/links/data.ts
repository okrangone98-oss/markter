// 마케터 큐레이션 링크 — v0.1 + v1.0 공용 데이터
// 카테고리별로 그룹화. 새 도구 추가 시 이 파일만 수정하면 양쪽 반영.

export interface MarketerLink {
  name: string;
  url: string;
  desc: string;
  tag?: string; // 가격/유형 짧은 라벨
}

export interface LinkGroup {
  category: string;
  color: "cyan" | "purple" | "amber" | "green" | "blue" | "rose" | "slate";
  items: MarketerLink[];
}

export const MARKETER_LINKS: LinkGroup[] = [
  {
    category: "🤖 AI 생성·리서치",
    color: "cyan",
    items: [
      { name: "Google NotebookLM", url: "https://notebooklm.google.com", desc: "자료 업로드 → 노트·요약·인용 자동", tag: "구글 무료" },
      { name: "Google AI Studio", url: "https://aistudio.google.com", desc: "Gemini 모델 직접 사용 + API 키 발급", tag: "구글 무료" },
      { name: "Google Stitch", url: "https://stitch.withgoogle.com", desc: "텍스트/스케치 → UI·웹 디자인 생성", tag: "베타" },
      { name: "Claude", url: "https://claude.ai", desc: "Anthropic 챗봇, 긴 문맥·코딩 강함", tag: "Pro $20" },
      { name: "ChatGPT", url: "https://chat.openai.com", desc: "OpenAI 챗봇, 멀티모달 (이미지·음성)", tag: "Plus $20" },
      { name: "Perplexity", url: "https://perplexity.ai", desc: "실시간 웹 리서치 + 인용", tag: "프리미엄" },
      { name: "OpenRouter", url: "https://openrouter.ai", desc: "다중 LLM API 통합 (FREE 모델)", tag: "API" },
      { name: "Gamma", url: "https://gamma.app", desc: "AI 프리젠테이션·웹사이트 생성", tag: "무료/프로" },
    ],
  },
  {
    category: "🎨 디자인·이미지",
    color: "purple",
    items: [
      { name: "Canva", url: "https://canva.com", desc: "템플릿 기반 그래픽·동영상", tag: "프로 ₩15K" },
      { name: "Figma", url: "https://figma.com", desc: "UI/UX 디자인 + 협업", tag: "무료/팀" },
      { name: "Photopea", url: "https://photopea.com", desc: "브라우저 포토샵 (.psd 호환)", tag: "100% 무료" },
      { name: "Midjourney", url: "https://midjourney.com", desc: "최고급 AI 이미지 생성", tag: "$10/월~" },
      { name: "Recraft", url: "https://recraft.ai", desc: "벡터·라스터 AI 이미지", tag: "무료 50/일" },
      { name: "Remove.bg", url: "https://remove.bg", desc: "원클릭 배경 제거", tag: "무료" },
      { name: "Looka", url: "https://looka.com", desc: "AI 로고·브랜드 키트 생성", tag: "유료" },
    ],
  },
  {
    category: "🎬 영상·오디오",
    color: "amber",
    items: [
      { name: "CapCut", url: "https://capcut.com", desc: "쇼츠/릴스 편집 (PC·모바일)", tag: "무료" },
      { name: "Suno AI", url: "https://suno.com", desc: "텍스트 → 음악·노래 생성", tag: "무료 5/일" },
      { name: "ElevenLabs", url: "https://elevenlabs.io", desc: "최상급 TTS 음성 합성", tag: "무료 10K자/월" },
      { name: "Descript", url: "https://descript.com", desc: "오디오·영상을 텍스트로 편집", tag: "프리미엄" },
      { name: "Pixabay", url: "https://pixabay.com", desc: "무료 사진·영상·BGM", tag: "100% 무료" },
      { name: "Pexels", url: "https://pexels.com", desc: "무료 고화질 사진·영상", tag: "100% 무료" },
    ],
  },
  {
    category: "📱 마케팅 플랫폼 (한국)",
    color: "green",
    items: [
      { name: "Naver Blog", url: "https://blog.naver.com", desc: "네이버 블로그 운영", tag: "한국" },
      { name: "Naver SmartStore", url: "https://sell.smartstore.naver.com", desc: "네이버 커머스 셀러센터", tag: "한국" },
      { name: "Naver 검색광고", url: "https://searchad.naver.com", desc: "검색·디스플레이 광고 집행", tag: "한국" },
      { name: "Naver 비즈니스", url: "https://business.naver.com", desc: "네이버 비즈니스 채널 통합 관리", tag: "한국" },
      { name: "Instagram Business", url: "https://business.instagram.com", desc: "비즈니스 계정 + 인사이트", tag: "메타" },
      { name: "Threads", url: "https://threads.net", desc: "메타의 텍스트 SNS", tag: "메타" },
      { name: "YouTube Studio", url: "https://studio.youtube.com", desc: "유튜브 채널 관리·분석", tag: "구글" },
      { name: "TikTok", url: "https://tiktok.com", desc: "쇼츠 영상 플랫폼", tag: "글로벌" },
      { name: "카카오 비즈니스", url: "https://business.kakao.com", desc: "카카오톡 채널·플러스 친구", tag: "카카오" },
    ],
  },
  {
    category: "📊 분석·키워드",
    color: "blue",
    items: [
      { name: "Google Trends", url: "https://trends.google.com", desc: "검색 트렌드 + 비교 분석", tag: "무료" },
      { name: "Naver DataLab", url: "https://datalab.naver.com", desc: "네이버 검색·쇼핑 트렌드", tag: "무료" },
      { name: "블랙키위", url: "https://blackkiwi.net", desc: "네이버 키워드 검색량·연관어", tag: "한국" },
      { name: "키워드사운드", url: "https://keywordsound.com", desc: "한국어 키워드 분석", tag: "프리미엄" },
      { name: "네이버 검색광고 키워드도구", url: "https://manage.searchad.naver.com", desc: "월간 검색량·경쟁도", tag: "무료" },
      { name: "Similarweb", url: "https://similarweb.com", desc: "경쟁사 트래픽 분석", tag: "프리미엄" },
      { name: "Google Search Console", url: "https://search.google.com/search-console", desc: "내 사이트 검색 노출 분석", tag: "무료" },
      { name: "Google Analytics", url: "https://analytics.google.com", desc: "웹사이트 방문자 행동 분석", tag: "무료" },
    ],
  },
  {
    category: "📚 학습·뉴스",
    color: "rose",
    items: [
      { name: "마케케", url: "https://markk.day", desc: "마케팅 도구 큐레이션 (벤치마크)", tag: "한국" },
      { name: "마케터스", url: "https://marketers.kr", desc: "마케팅 뉴스·케이스 스터디", tag: "한국" },
      { name: "모비인사이드", url: "https://mobiinside.co.kr", desc: "모바일·디지털 인사이트", tag: "한국" },
      { name: "디지털인사이트", url: "https://ditoday.com", desc: "디지털 마케팅 트렌드", tag: "한국" },
      { name: "퍼블리", url: "https://publy.co", desc: "마케팅·기획 직무 콘텐츠", tag: "한국" },
      { name: "오픈서베이 트렌드", url: "https://www.opensurvey.co.kr/trend-report", desc: "한국 소비자 트렌드 리포트", tag: "한국" },
    ],
  },
  {
    category: "⚙️ 유틸리티",
    color: "slate",
    items: [
      { name: "Google Drive", url: "https://drive.google.com", desc: "파일 클라우드 + 협업", tag: "구글" },
      { name: "Google Sheets", url: "https://sheets.google.com", desc: "스프레드시트", tag: "구글" },
      { name: "Notion", url: "https://notion.so", desc: "올인원 워크스페이스", tag: "프리미엄" },
      { name: "Bitly", url: "https://bitly.com", desc: "단축 URL + 클릭 통계", tag: "무료/프로" },
      { name: "QR코드 생성기", url: "https://qr-code-generator.com", desc: "QR코드 만들기", tag: "무료" },
      { name: "임시 메일 (Mailinator)", url: "https://mailinator.com", desc: "테스트 가입용 임시 이메일", tag: "무료" },
    ],
  },
];

// Tag 색상 매핑 (한국 vs 글로벌 vs 가격 등 빠른 식별)
export const TAG_COLOR_MAP: Record<string, string> = {
  무료: "cyan",
  "100% 무료": "cyan",
  "구글 무료": "cyan",
  "네이버 무료": "cyan",
  베타: "amber",
  한국: "purple",
  메타: "blue",
  구글: "blue",
  네이버: "purple",
  카카오: "amber",
  글로벌: "slate",
  API: "purple",
};
