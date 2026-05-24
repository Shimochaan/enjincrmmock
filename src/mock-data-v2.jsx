// v0.2 additions: SNS handles per member, SNS posts + reactions,
// proposal updates + docs/links + source.

// ─── Per-member SNS handles ─────────────────────────────────────
// Not every member has every platform; some have none.
const MEMBER_SNS = {
  m01: { x: "yamada_taro",   instagram: "yamada.taro", linkedin: "/in/yamada-taro" },
  m02: { x: "hsuzuki_dev" },
  m03: { x: "satoken_biz",   facebook: "sato.ken.bizdev" },
  m04: { instagram: "misaki.design", threads: "misaki.design" },
  m05: { x: "tanaka_ichi" },
  m06: { x: "watanabe_ai",   threads: "watanabe_ai" },
  m07: { x: "yui_backend",   linkedin: "/in/yui-nakamura" },
  m08: { facebook: "shokobayashi.biz" },
  m09: { x: "kato_dev",      instagram: "kato.dai" },
  m10: { instagram: "sakura.ux", x: "sakura_ux" },
  m11: { x: "yamamoto_pm",   linkedin: "/in/daiki-yamamoto" },
  m12: { x: "mori_sales" },
  m13: {},
  m14: { x: "chiaki_student" },
  m15: {},
  m16: { instagram: "aoi.brand", x: "fujita_aoi" },
  m17: { x: "okada_ios" },
  m18: {},
  m19: {},
  m20: { instagram: "yuna.illust", x: "yuna_illust" },
  m21: { x: "rin_pm" },
  m22: { x: "tsubasa_ops" },
  m23: {},
  m24: { x: "hayate_research" },
  m25: { x: "soma_llm",      threads: "soma_llm" },
};

// ─── SNS posts master + reactions ────────────────────────────────
// Each post has a list of {memberId, type, note, at} reactions.
const SNS_POSTS = [
  {
    id: "s01", platform: "x", postedAt: "2026-05-22 14:30",
    excerpt: "起案ピッチ会の告知です!5/28(火)20:00から、5名の起案者が10分ずつ発表します。コメント・質問大歓迎です!",
    theme: "イベント告知",
    url: "https://x.com/enjin/status/1234567890",
    note: "通常より反応多め。次回もこのフォーマット採用。",
    reactions: [
      { memberId: "m01", type: "comment", note: "行きます!",    at: "2026-05-22" },
      { memberId: "m04", type: "like",    note: "",              at: "2026-05-22" },
      { memberId: "m05", type: "repost",  note: "",              at: "2026-05-22" },
      { memberId: "m03", type: "like",    note: "",              at: "2026-05-22" },
      { memberId: "m06", type: "quote",   note: "これは熱い",    at: "2026-05-22" },
      { memberId: "m02", type: "comment", note: "予定確認します",at: "2026-05-22" },
      { memberId: "m11", type: "like",    note: "",              at: "2026-05-22" },
      { memberId: "m12", type: "repost",  note: "",              at: "2026-05-22" },
      { memberId: "m25", type: "like",    note: "",              at: "2026-05-22" },
      { memberId: "m09", type: "like",    note: "",              at: "2026-05-22" },
      { memberId: "m07", type: "comment", note: "参加します",    at: "2026-05-23" },
      { memberId: "m17", type: "like",    note: "",              at: "2026-05-23" },
    ],
  },
  {
    id: "s02", platform: "instagram", postedAt: "2026-05-20 09:10",
    excerpt: "会場の様子と参加者の声。リアル開催ならではの濃い議論が生まれました。",
    theme: "日常",
    url: "https://instagram.com/p/abcdef/",
    note: "",
    reactions: [
      { memberId: "m01", type: "like", at: "2026-05-20" },
      { memberId: "m04", type: "like", at: "2026-05-20" },
      { memberId: "m10", type: "comment", note: "雰囲気いいですね", at: "2026-05-20" },
      { memberId: "m16", type: "like", at: "2026-05-20" },
      { memberId: "m20", type: "like", at: "2026-05-20" },
      { memberId: "m09", type: "like", at: "2026-05-21" },
      { memberId: "m12", type: "comment", note: "次回も期待!", at: "2026-05-21" },
      { memberId: "m25", type: "like", at: "2026-05-21" },
      { memberId: "m11", type: "like", at: "2026-05-21" },
    ],
  },
  {
    id: "s03", platform: "x", postedAt: "2026-05-18 21:45",
    excerpt: "AIメンタリングBotの起案紹介。G's受講生の進捗管理をAIで自動化する野心的なプロダクト。",
    theme: "起案紹介",
    url: "https://x.com/enjin/status/1234560000",
    note: "リポストが伸びた。AI系は反応取りやすい。",
    reactions: [
      { memberId: "m01", type: "repost", at: "2026-05-18" },
      { memberId: "m04", type: "like",   at: "2026-05-18" },
      { memberId: "m06", type: "quote",  note: "面白い", at: "2026-05-18" },
      { memberId: "m03", type: "repost", at: "2026-05-18" },
      { memberId: "m07", type: "like",   at: "2026-05-19" },
      { memberId: "m09", type: "like",   at: "2026-05-19" },
      { memberId: "m11", type: "like",   at: "2026-05-19" },
      { memberId: "m13", type: "like",   at: "2026-05-19" },
      { memberId: "m17", type: "comment",note: "詳細知りたい", at: "2026-05-19" },
      { memberId: "m22", type: "like",   at: "2026-05-19" },
      { memberId: "m25", type: "repost", at: "2026-05-20" },
      { memberId: "m05", type: "like",   at: "2026-05-20" },
      { memberId: "m12", type: "like",   at: "2026-05-20" },
      { memberId: "m08", type: "like",   at: "2026-05-20" },
      { memberId: "m21", type: "like",   at: "2026-05-20" },
    ],
  },
  {
    id: "s04", platform: "x", postedAt: "2026-05-15 12:00",
    excerpt: "定例#11のレポート。新規参加者の定着率について熱い議論がありました。",
    theme: "日常",
    url: "https://x.com/enjin/status/1234550000",
    reactions: [
      { memberId: "m01", type: "like", at: "2026-05-15" },
      { memberId: "m06", type: "like", at: "2026-05-15" },
      { memberId: "m11", type: "like", at: "2026-05-15" },
      { memberId: "m20", type: "like", at: "2026-05-16" },
      { memberId: "m25", type: "like", at: "2026-05-16" },
      { memberId: "m07", type: "comment", note: "良い議論でしたね", at: "2026-05-16" },
      { memberId: "m12", type: "like", at: "2026-05-16" },
    ],
  },
  {
    id: "s05", platform: "facebook", postedAt: "2026-05-10 18:20",
    excerpt: "起案者LTのお知らせ。5名の起案者が登壇予定です。",
    theme: "イベント告知",
    url: "https://facebook.com/enjin/posts/9876543",
    reactions: [
      { memberId: "m03", type: "comment", note: "参加検討", at: "2026-05-10" },
      { memberId: "m08", type: "like", at: "2026-05-10" },
      { memberId: "m16", type: "like", at: "2026-05-11" },
      { memberId: "m11", type: "like", at: "2026-05-11" },
    ],
  },
  {
    id: "s06", platform: "threads", postedAt: "2026-05-08 10:00",
    excerpt: "新メンバー紹介の投稿。デザイナー・PdM・エンジニアの3名がジョイン。",
    theme: "日常",
    url: "https://www.threads.net/@enjin/post/abcd",
    reactions: [
      { memberId: "m04", type: "like", at: "2026-05-08" },
      { memberId: "m06", type: "like", at: "2026-05-08" },
      { memberId: "m20", type: "comment", note: "よろしくお願いします", at: "2026-05-09" },
      { memberId: "m16", type: "like", at: "2026-05-09" },
      { memberId: "m25", type: "like", at: "2026-05-09" },
      { memberId: "m17", type: "reply", note: "私もそろそろLT準備します", at: "2026-05-09" },
    ],
  },
  {
    id: "s07", platform: "x", postedAt: "2026-05-05 19:00",
    excerpt: "コミュニティのスタンスについて。私たちは「成果」より「挑戦の数」を讃えます。",
    theme: "日常",
    url: "https://x.com/enjin/status/1234540000",
    reactions: [
      { memberId: "m01", type: "quote", note: "これに尽きる", at: "2026-05-05" },
      { memberId: "m11", type: "repost", at: "2026-05-05" },
      { memberId: "m12", type: "like", at: "2026-05-06" },
      { memberId: "m25", type: "like", at: "2026-05-06" },
      { memberId: "m04", type: "like", at: "2026-05-06" },
    ],
  },
  {
    id: "s08", platform: "x", postedAt: "2026-04-28 20:00",
    excerpt: "越境EC支援サービスの起案紹介。東南アジア向けの新しいアプローチ。",
    theme: "起案紹介",
    url: "https://x.com/enjin/status/1234530000",
    reactions: [
      { memberId: "m05", type: "comment", note: "ありがとうございます!", at: "2026-04-28" },
      { memberId: "m03", type: "like", at: "2026-04-28" },
      { memberId: "m12", type: "repost", at: "2026-04-29" },
      { memberId: "m11", type: "like", at: "2026-04-29" },
    ],
  },
];

// ─── Per-member reaction count cache ─────────────────────────────
const _reactionCounts = {};
SNS_POSTS.forEach(post => {
  post.reactions.forEach(r => {
    _reactionCounts[r.memberId] = (_reactionCounts[r.memberId] || 0) + 1;
  });
});
const snsReactionCount = (memberId) => _reactionCounts[memberId] || 0;

// All reactions for a member, with their post, sorted desc by date
const memberReactions = (memberId) => {
  const rows = [];
  SNS_POSTS.forEach(post => {
    post.reactions.forEach(r => {
      if (r.memberId === memberId) rows.push({ post, reaction: r });
    });
  });
  return rows.sort((a, b) => (b.reaction.at + b.post.postedAt).localeCompare(a.reaction.at + a.post.postedAt));
};

// SNS posts a member could be added to (already-reacted posts excluded)
const postsReactedByMember = (memberId) =>
  SNS_POSTS.filter(p => p.reactions.some(r => r.memberId === memberId));

// ─── Proposal updates timeline + docs/links + source ─────────────
const PROPOSAL_EXT = {
  p01: {
    source: { type: "google_form", url: "https://docs.google.com/forms/d/.../response" },
    docs: [
      { kind: "pdf",   title: "起案資料_v1.pdf",       size: "2.1MB", date: daysAgo(14), url: "#" },
      { kind: "pptx",  title: "ピッチデック_v2.pptx", size: "5.4MB", date: daysAgo(2),  url: "#" },
    ],
    links: [
      { kind: "notion", title: "要件メモ",     url: "https://notion.so/example" },
      { kind: "figma",  title: "UIモック",     url: "https://figma.com/example" },
      { kind: "docs",   title: "競合調査",     url: "https://docs.google.com/example" },
    ],
    updates: [
      {
        date: daysAgo(2), type: "docs", by: "オーナー",
        title: "ピッチデックv2 完成",
        body: "デモ動画を追加、競合比較スライドを差し替え。",
        attachment: { kind: "pptx", title: "ピッチデック_v2.pptx" },
      },
      {
        date: daysAgo(6), type: "pivot", by: "オーナー",
        title: "Slackボット → LINE Bot へ方針変更",
        body: "G'sメンターのSlack利用率が低いため、対象を社会人受講生のLINEへ転換。詳細は資料を参照。",
        link: { title: "競合調査(Google Docs)", url: "#" },
      },
      {
        date: daysAgo(9), type: "discussion", by: "オーナー",
        title: "田中さんと壁打ち(60分)",
        body: "・想定ユーザーがG's受講生に限定されすぎでは\n・課金モデルはB2Bが筋良さそう\n・次回までにLP1枚作る",
      },
      {
        date: daysAgo(12), type: "status", by: "オーナー",
        title: "起案中 → 採択",
        body: "定例#12のピッチで満場一致。",
      },
      {
        date: daysAgo(13), type: "discussion", by: "オーナー",
        title: "ピッチ前最終調整",
        body: "デモシナリオの順序を入れ替え。",
      },
      {
        date: daysAgo(14), type: "received", by: "Google Form",
        title: "起案を受付(Form回答)",
        body: "起案者: 山田太郎  カテゴリ: AI/エデュケーション",
      },
    ],
  },
  p02: {
    source: { type: "google_form", url: "https://docs.google.com/forms/d/.../response" },
    docs: [
      { kind: "pdf", title: "市場リサーチ.pdf", size: "1.8MB", date: daysAgo(7), url: "#" },
    ],
    links: [
      { kind: "docs", title: "競合・市場メモ", url: "#" },
    ],
    updates: [
      { date: daysAgo(7), type: "discussion", by: "オーナー", title: "市場規模の補足", body: "東南アジアEC市場の規模感の追加調査を依頼。" },
      { date: daysAgo(9), type: "received", by: "Google Form", title: "起案を受付(Form回答)", body: "起案者: 田中一郎  カテゴリ: EC/越境" },
    ],
  },
  p03: {
    source: { type: "manual" },
    docs: [],
    links: [
      { kind: "notion", title: "企画メモ", url: "#" },
    ],
    updates: [
      { date: daysAgo(20), type: "status", by: "オーナー", title: "採択 → 実行中", body: "第1回は6月予定。" },
      { date: daysAgo(30), type: "status", by: "オーナー", title: "起案中 → 採択", body: "" },
      { date: daysAgo(34), type: "discussion", by: "オーナー", title: "シニア層のITリテラシー調査メモ", body: "想定ユーザーのインタビュー結果を共有。" },
    ],
  },
  p04: {
    source: { type: "google_form", url: "#" },
    docs: [],
    links: [],
    updates: [
      { date: daysAgo(60), type: "status", by: "オーナー", title: "起案中 → 不採択", body: "規模感が enjin と合わず保留。別コミュニティでの実施を勧めた。" },
      { date: daysAgo(73), type: "received", by: "Google Form", title: "起案を受付(Form回答)", body: "起案者: 佐藤健  カテゴリ: コミュニティ" },
    ],
  },
  p05: {
    source: { type: "manual" },
    docs: [
      { kind: "pdf", title: "ハンドブック構成案.pdf", size: "0.9MB", date: daysAgo(5), url: "#" },
    ],
    links: [
      { kind: "notion", title: "目次構成", url: "#" },
    ],
    updates: [
      { date: daysAgo(2), type: "status", by: "オーナー", title: "起案中 → 採択", body: "" },
      { date: daysAgo(7), type: "received", by: "オーナー", title: "起案を登録(手動入力)", body: "" },
    ],
  },
};

const proposalExt = (id) => PROPOSAL_EXT[id] || { source: { type: "manual" }, docs: [], links: [], updates: [] };

// ─── Doc-kind icon helper ───────────────────────────────────────
const DOC_KINDS = {
  pdf:    { label: "PDF",    color: "#dc2626" },
  pptx:   { label: "PPT",    color: "#ea580c" },
  docx:   { label: "DOC",    color: "#2563eb" },
  xlsx:   { label: "XLS",    color: "#16a34a" },
  notion: { label: "Notion", color: "#000000" },
  figma:  { label: "Figma",  color: "#a855f7" },
  docs:   { label: "G.Docs", color: "#2563eb" },
  sheet:  { label: "Sheet",  color: "#16a34a" },
  image:  { label: "Image",  color: "#71717a" },
  other:  { label: "Other",  color: "#71717a" },
};

const DocChip = ({ kind, size = 32 }) => {
  const d = DOC_KINDS[kind] || DOC_KINDS.other;
  return (
    <span style={{
      width: size, height: size,
      display: "inline-grid", placeItems: "center",
      background: d.color + "1a", color: d.color,
      borderRadius: 6, fontSize: 10, fontWeight: 700,
      fontFamily: "Inter, sans-serif", flexShrink: 0,
    }}>{d.label}</span>
  );
};

// SNS post helpers
const snsPostById = (id) => SNS_POSTS.find(p => p.id === id);
const totalReactions = SNS_POSTS.reduce((acc, p) => acc + p.reactions.length, 0);
const uniqueReactingMembers = new Set(SNS_POSTS.flatMap(p => p.reactions.map(r => r.memberId))).size;

Object.assign(window, {
  MEMBER_SNS, SNS_POSTS, PROPOSAL_EXT, DOC_KINDS, DocChip,
  snsReactionCount, memberReactions, postsReactedByMember,
  proposalExt, snsPostById,
  totalReactions, uniqueReactingMembers,
});
