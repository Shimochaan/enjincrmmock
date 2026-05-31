// Mock data — 25 members, 6 events, 5 proposals, with cross-references.

const TODAY = new Date("2026-05-24");
const daysAgo = (d) => {
  const x = new Date(TODAY); x.setDate(x.getDate() - d);
  return x.toISOString().slice(0, 10);
};

const MEMBERS = [
  { id: "m01", name: "山田 太郎",   email: "yamada.t@example.com",  phone: "080-1234-5678", joined: "2025-09-15", status: "active",  lastSeen: 4,   visits: 12, proposals: 2, tags: ["PM", "エンジニア", "起案者"], job: "プロダクトマネージャー", skills: ["プロダクト戦略", "UX", "SQL"], interests: ["AI", "コミュニティ運営", "起案"], note: ["起案ピッチ会で積極的に質問。次回登壇候補", "紹介経由でenjinに参加"] },
  { id: "m02", name: "鈴木 花子",   email: "suzuki.h@example.com",   phone: "090-3344-1212", joined: "2024-12-03", status: "dormant", lastSeen: 118, visits: 3,  proposals: 0, tags: ["Dev"], job: "フロントエンドエンジニア", skills: ["React", "TypeScript"], interests: ["AI", "Web技術"], note: ["最後の参加から3ヶ月。月末に声かけ予定。"] },
  { id: "m03", name: "佐藤 健",     email: "sato.k@example.com",     phone: "070-5566-7788", joined: "2025-03-22", status: "active",  lastSeen: 14,  visits: 8,  proposals: 1, tags: ["Biz", "営業"], job: "BizDev", skills: ["セールス", "事業企画"], interests: ["越境EC", "東南アジア"], note: ["越境EC案件で動きあり"] },
  { id: "m04", name: "高橋 美咲",   email: "takahashi.m@example.com",phone: "080-9988-7766", joined: "2026-02-08", status: "active",  lastSeen: 4,   visits: 4,  proposals: 0, tags: ["新人", "デザイン"], job: "デザイナー", skills: ["UI", "イラスト"], interests: ["コミュニティデザイン"], note: ["初参加から積極的"] },
  { id: "m05", name: "田中 一郎",   email: "tanaka.i@example.com",   phone: "090-1111-2222", joined: "2024-08-30", status: "dormant", lastSeen: 124, visits: 6,  proposals: 1, tags: ["PM", "起案者"], job: "PM", skills: ["新規事業"], interests: ["越境EC"], note: ["越境EC支援を起案中、ピッチ予定"] },
  { id: "m06", name: "渡辺 直樹",   email: "watanabe.n@example.com", phone: "080-2222-3333", joined: "2025-05-12", status: "active",  lastSeen: 14,  visits: 9,  proposals: 0, tags: ["Dev", "AI"], job: "AIエンジニア", skills: ["LLM", "Python"], interests: ["AI", "プロダクト"], note: [] },
  { id: "m07", name: "中村 結衣",   email: "nakamura.y@example.com", phone: "090-4444-5555", joined: "2025-07-01", status: "active",  lastSeen: 14,  visits: 7,  proposals: 0, tags: ["Dev"], job: "バックエンドエンジニア", skills: ["Go", "AWS"], interests: ["インフラ"], note: [] },
  { id: "m08", name: "小林 翔",     email: "kobayashi.s@example.com",phone: "070-6666-7777", joined: "2025-11-20", status: "active",  lastSeen: 14,  visits: 5,  proposals: 0, tags: ["Biz"], job: "事業企画", skills: ["事業計画"], interests: ["新規事業"], note: [] },
  { id: "m09", name: "加藤 大輔",   email: "kato.d@example.com",     phone: "080-8888-9999", joined: "2025-04-15", status: "active",  lastSeen: 14,  visits: 6,  proposals: 0, tags: ["Dev"], job: "フルスタックエンジニア", skills: ["Next.js", "Supabase"], interests: ["MVP開発"], note: [] },
  { id: "m10", name: "吉田 さくら", email: "yoshida.s@example.com",  phone: "090-0000-1111", joined: "2025-10-10", status: "active",  lastSeen: 24,  visits: 4,  proposals: 0, tags: ["デザイン"], job: "プロダクトデザイナー", skills: ["Figma", "リサーチ"], interests: ["UX"], note: [] },
  { id: "m11", name: "山本 大樹",   email: "yamamoto.d@example.com", phone: "080-2233-4455", joined: "2024-11-05", status: "active",  lastSeen: 36,  visits: 8,  proposals: 1, tags: ["PM", "起案者"], job: "PM", skills: ["プロダクト"], interests: ["シニア向けサービス"], note: ["シニア向けLT会の起案者"] },
  { id: "m12", name: "森 美月",     email: "mori.m@example.com",     phone: "070-3344-5566", joined: "2025-01-30", status: "active",  lastSeen: 14,  visits: 7,  proposals: 0, tags: ["Biz", "営業"], job: "セールス", skills: ["BtoB"], interests: ["SaaS"], note: [] },
  { id: "m13", name: "石井 春樹",   email: "ishii.h@example.com",    phone: "090-1212-3434", joined: "2025-06-12", status: "active",  lastSeen: 14,  visits: 5,  proposals: 0, tags: ["Dev"], job: "ML エンジニア", skills: ["TensorFlow"], interests: ["AI"], note: [] },
  { id: "m14", name: "井上 千秋",   email: "inoue.c@example.com",    phone: "080-4545-6767", joined: "2025-12-20", status: "active",  lastSeen: 24,  visits: 3,  proposals: 0, tags: ["新人"], job: "学生", skills: ["プログラミング学習中"], interests: ["AI", "起業"], note: [] },
  { id: "m15", name: "松本 涼",     email: "matsumoto.r@example.com",phone: "090-5656-7878", joined: "2025-02-14", status: "dormant", lastSeen: 102, visits: 4,  proposals: 0, tags: ["Biz"], job: "コンサル", skills: ["戦略コンサル"], interests: ["新規事業"], note: ["最近接点なし"] },
  { id: "m16", name: "藤田 葵",     email: "fujita.a@example.com",   phone: "080-9898-7676", joined: "2025-08-22", status: "active",  lastSeen: 14,  visits: 6,  proposals: 0, tags: ["デザイン"], job: "ブランドデザイナー", skills: ["ブランディング"], interests: ["コミュニティ"], note: [] },
  { id: "m17", name: "岡田 真琴",   email: "okada.m@example.com",    phone: "090-7676-5454", joined: "2025-03-08", status: "active",  lastSeen: 14,  visits: 7,  proposals: 0, tags: ["Dev"], job: "iOS エンジニア", skills: ["Swift"], interests: ["モバイル"], note: [] },
  { id: "m18", name: "後藤 蓮",     email: "goto.r@example.com",     phone: "070-3232-1010", joined: "2026-01-15", status: "active",  lastSeen: 14,  visits: 3,  proposals: 0, tags: ["新人", "Dev"], job: "新卒エンジニア", skills: ["TypeScript"], interests: ["スタートアップ"], note: [] },
  { id: "m19", name: "近藤 蒼",     email: "kondo.a@example.com",    phone: "080-2424-3636", joined: "2024-10-18", status: "dormant", lastSeen: 145, visits: 2,  proposals: 0, tags: ["Biz"], job: "営業", skills: ["セールス"], interests: ["B2B"], note: ["半年近く参加なし"] },
  { id: "m20", name: "斎藤 結菜",   email: "saito.y@example.com",    phone: "090-5050-9090", joined: "2025-09-03", status: "active",  lastSeen: 14,  visits: 5,  proposals: 0, tags: ["デザイン"], job: "イラストレーター", skills: ["イラスト", "アニメーション"], interests: ["ビジュアル"], note: [] },
  { id: "m21", name: "三浦 凜",     email: "miura.r@example.com",    phone: "080-7070-2020", joined: "2025-07-25", status: "active",  lastSeen: 14,  visits: 4,  proposals: 0, tags: ["PM"], job: "プロジェクトマネージャー", skills: ["スクラム"], interests: ["プロダクト開発"], note: [] },
  { id: "m22", name: "原田 翼",     email: "harada.t@example.com",   phone: "090-3838-4747", joined: "2025-12-10", status: "active",  lastSeen: 36,  visits: 3,  proposals: 0, tags: ["Dev"], job: "DevOpsエンジニア", skills: ["k8s"], interests: ["インフラ"], note: [] },
  { id: "m23", name: "村上 楓",     email: "murakami.k@example.com", phone: "070-9090-1717", joined: "2024-09-30", status: "dormant", lastSeen: 95,  visits: 5,  proposals: 0, tags: ["Biz"], job: "事業開発", skills: ["事業企画"], interests: ["ヘルスケア"], note: [] },
  { id: "m24", name: "西村 颯",     email: "nishimura.s@example.com",phone: "080-1919-8181", joined: "2026-03-05", status: "active",  lastSeen: 4,   visits: 2,  proposals: 0, tags: ["新人"], job: "リサーチャー", skills: ["定性調査"], interests: ["ユーザーリサーチ"], note: [] },
  { id: "m25", name: "竹内 蒼真",   email: "takeuchi.s@example.com", phone: "090-6161-2525", joined: "2025-04-28", status: "active",  lastSeen: 14,  visits: 6,  proposals: 0, tags: ["Dev", "AI"], job: "AIエンジニア", skills: ["LLMOps"], interests: ["AI"], note: [] },
];

const EVENTS = [
  {
    id: "e01", title: "enjin定例#12", date: daysAgo(4), time: "20:00-22:00",
    format: "online", theme: "起案者LT × 5人", host: "オーナー本人",
    summary: "AIメンタリングBotの起案に多くの質問。次回の深掘り会候補。新規参加の高橋さんが活発で良い兆候。",
    participants: [
      { memberId: "m01", status: "present", note: "良い質問" },
      { memberId: "m04", status: "present", note: "初参加で積極的" },
      { memberId: "m03", status: "late", note: "" },
      { memberId: "m02", status: "absent", note: "体調不良連絡あり" },
      { memberId: "m06", status: "present", note: "" },
      { memberId: "m07", status: "present", note: "" },
      { memberId: "m08", status: "present", note: "" },
      { memberId: "m09", status: "present", note: "" },
      { memberId: "m10", status: "present", note: "" },
      { memberId: "m11", status: "present", note: "" },
      { memberId: "m12", status: "present", note: "" },
      { memberId: "m13", status: "present", note: "" },
      { memberId: "m16", status: "absent", note: "" },
      { memberId: "m17", status: "late", note: "" },
    ],
  },
  {
    id: "e02", title: "起案ピッチ会", date: daysAgo(14), time: "19:30-21:30",
    format: "offline", theme: "起案ピッチ × 3件", host: "山田 太郎",
    summary: "山田さんのAIメンタリングBot、田中さんの越境EC支援案件のピッチあり。",
    participants: [
      { memberId: "m01", status: "present", note: "登壇" },
      { memberId: "m03", status: "present", note: "" },
      { memberId: "m05", status: "present", note: "登壇" },
      { memberId: "m06", status: "present", note: "" },
      { memberId: "m09", status: "present", note: "" },
      { memberId: "m11", status: "present", note: "登壇" },
      { memberId: "m12", status: "present", note: "" },
      { memberId: "m16", status: "present", note: "" },
    ],
  },
  {
    id: "e03", title: "enjin定例#11", date: daysAgo(26), time: "20:00-22:00",
    format: "online", theme: "コミュニティ運営振り返り", host: "オーナー本人",
    summary: "1Qの振り返り。新規参加者の定着率がテーマに。",
    participants: [
      { memberId: "m01", status: "absent", note: "" },
      { memberId: "m04", status: "present", note: "" },
      { memberId: "m06", status: "present", note: "" },
      { memberId: "m07", status: "present", note: "" },
      { memberId: "m08", status: "present", note: "" },
      { memberId: "m09", status: "present", note: "" },
      { memberId: "m11", status: "present", note: "" },
      { memberId: "m12", status: "present", note: "" },
      { memberId: "m13", status: "present", note: "" },
      { memberId: "m16", status: "present", note: "" },
      { memberId: "m17", status: "present", note: "" },
      { memberId: "m20", status: "present", note: "" },
      { memberId: "m21", status: "present", note: "" },
      { memberId: "m25", status: "present", note: "" },
    ],
  },
  {
    id: "e04", title: "AIメンタリングBot キックオフ", date: daysAgo(4), time: "21:00-22:00",
    format: "online", theme: "実装キックオフ", host: "山田 太郎",
    summary: "実装方針合意。Next.js + Supabase で進行。",
    participants: [
      { memberId: "m01", status: "present", note: "ファシリ" },
      { memberId: "m04", status: "present", note: "" },
      { memberId: "m03", status: "present", note: "" },
      { memberId: "m06", status: "present", note: "" },
      { memberId: "m09", status: "present", note: "" },
    ],
  },
  {
    id: "e05", title: "enjin定例#10", date: daysAgo(54), time: "20:00-22:00",
    format: "online", theme: "新規参加者紹介LT", host: "オーナー本人",
    summary: "新規4名のLT。コミュニティの自己紹介文化を継続。",
    participants: [
      { memberId: "m04", status: "present", note: "" },
      { memberId: "m06", status: "present", note: "" },
      { memberId: "m07", status: "present", note: "" },
      { memberId: "m08", status: "present", note: "" },
      { memberId: "m11", status: "present", note: "" },
      { memberId: "m12", status: "present", note: "" },
      { memberId: "m18", status: "present", note: "初参加" },
      { memberId: "m24", status: "present", note: "初参加" },
      { memberId: "m25", status: "present", note: "" },
    ],
  },
  {
    id: "e06", title: "シニア向けサービス勉強会", date: daysAgo(40), time: "19:30-21:00",
    format: "offline", theme: "シニア向けLT会の起案関連", host: "山本 大樹",
    summary: "シニア向けLT会の起案に関する勉強会。",
    participants: [
      { memberId: "m11", status: "present", note: "登壇" },
      { memberId: "m12", status: "present", note: "" },
      { memberId: "m16", status: "present", note: "" },
      { memberId: "m20", status: "present", note: "" },
      { memberId: "m21", status: "present", note: "" },
    ],
  },
];

const PROPOSALS = [
  {
    id: "p01", title: "AIメンタリングBot", status: "running",
    proposed: daysAgo(14), proposer: "m01", cofounders: ["m04", "m03"],
    summary: "G's受講生向けにAIが進捗をヒアリングし、メンターに要約を渡すSlackボット。MVP開発は Next.js + Supabase で進行中。",
    history: [
      { date: daysAgo(2), from: "adopted", to: "running", by: "オーナー" },
      { date: daysAgo(12), from: "drafting", to: "adopted", by: "オーナー", note: "定例#12でピッチ後" },
      { date: daysAgo(14), from: null, to: "drafting", by: "山田 太郎", note: "新規登録" },
    ],
    events: ["e02", "e04"],
    notes: [{ date: daysAgo(2), text: "採択。実装はSupabaseでよさそう。" }],
  },
  {
    id: "p02", title: "越境EC支援サービス", status: "drafting",
    proposed: daysAgo(9), proposer: "m05", cofounders: [],
    summary: "日本ブランドの東南アジア向けEC展開を、コミュニティ内のリソースで支援。",
    history: [
      { date: daysAgo(9), from: null, to: "drafting", by: "田中 一郎", note: "新規登録" },
    ],
    events: ["e02"],
    notes: [{ date: daysAgo(7), text: "オーナーから市場規模の補足要望あり。" }],
  },
  {
    id: "p03", title: "シニア向けLT会", status: "running",
    proposed: daysAgo(34), proposer: "m11", cofounders: ["m04"],
    summary: "シニア層がITサービスを使いこなすためのLT会を定期開催。",
    history: [
      { date: daysAgo(20), from: "adopted", to: "running", by: "オーナー" },
      { date: daysAgo(30), from: "drafting", to: "adopted", by: "オーナー" },
      { date: daysAgo(34), from: null, to: "drafting", by: "山本 大樹", note: "新規登録" },
    ],
    events: ["e06"],
    notes: [{ date: daysAgo(20), text: "実行フェーズへ。第1回は6月予定。" }],
  },
  {
    id: "p04", title: "子育てママSlackコミュニティ", status: "rejected",
    proposed: daysAgo(73), proposer: "m03", cofounders: [],
    summary: "コミュニティ内ママ層が集まれるSlackチャンネル。",
    history: [
      { date: daysAgo(60), from: "drafting", to: "rejected", by: "オーナー", note: "規模感が enjin と合わず保留" },
      { date: daysAgo(73), from: null, to: "drafting", by: "佐藤 健", note: "新規登録" },
    ],
    events: [],
    notes: [{ date: daysAgo(60), text: "別コミュニティでの実施を勧めた。" }],
  },
  {
    id: "p05", title: "コミュニティ運営ハンドブック", status: "adopted",
    proposed: daysAgo(7), proposer: "m11", cofounders: ["m16"],
    summary: "enjin の運営ノウハウを外部公開するハンドブック制作プロジェクト。",
    history: [
      { date: daysAgo(2), from: "drafting", to: "adopted", by: "オーナー" },
      { date: daysAgo(7), from: null, to: "drafting", by: "山本 大樹", note: "新規登録" },
    ],
    events: [],
    notes: [],
  },
];

// localStorage に保存済みの「自分で追加した会員/イベント」を読み込んで合流させる。
// （元の25件のモックはコードのまま。追加分だけを後ろに足す）
// storage.jsx が index.html で先に読み込まれている前提。
loadStoredMembers().forEach(m => MEMBERS.push(m));
loadStoredEvents().forEach(e => EVENTS.push(e));

// Aggregations / cross-references
const memberById = (id) => MEMBERS.find(m => m.id === id);
const eventById = (id) => EVENTS.find(e => e.id === id);
const proposalById = (id) => PROPOSALS.find(p => p.id === id);

// Events a member attended
const memberEvents = (memberId) => EVENTS
  .map(e => {
    const p = e.participants.find(p => p.memberId === memberId);
    return p ? { event: e, attendance: p } : null;
  })
  .filter(Boolean)
  .sort((a, b) => b.event.date.localeCompare(a.event.date));

// Proposals where member is proposer or cofounder
const memberProposals = (memberId) => PROPOSALS
  .filter(p => p.proposer === memberId || p.cofounders.includes(memberId))
  .map(p => ({ proposal: p, role: p.proposer === memberId ? "主" : "共同" }));

// All unique tags
const ALL_TAGS = [...new Set(MEMBERS.flatMap(m => m.tags))];

// Member-count time series (synthetic, looks like growth)
const MEMBER_GROWTH = [
  { label: "12月", value: 38 },
  { label: "1月",  value: 41 },
  { label: "2月",  value: 44 },
  { label: "3月",  value: 47 },
  { label: "4月",  value: 49 },
  { label: "5月",  value: 52 },
];
const ATTENDANCE_TREND = [
  { label: "12月", value: 64 },
  { label: "1月",  value: 71 },
  { label: "2月",  value: 68 },
  { label: "3月",  value: 75 },
  { label: "4月",  value: 72 },
  { label: "5月",  value: 78 },
];

Object.assign(window, {
  MEMBERS, EVENTS, PROPOSALS, ALL_TAGS,
  memberById, eventById, proposalById, memberEvents, memberProposals,
  MEMBER_GROWTH, ATTENDANCE_TREND, TODAY, daysAgo,
});
