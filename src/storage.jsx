// ============================================================
// localStorage 練習用の保存ヘルパー
// ------------------------------------------------------------
// localStorage は「ブラウザの中にある小さな保存箱」です。
// ・ページをリロードしても消えない（同じブラウザなら残る）
// ・保存できるのは "文字列" だけ
//
// 配列やオブジェクトはそのままでは入れられないので、
//   保存するとき : JSON.stringify(配列)  → 文字列に変換して入れる
//   読み出すとき : JSON.parse(文字列)    → 元の配列に戻す
// という変換をはさみます。これが今回の課題のキモです。
//
// 開発者ツール(F12) → Application → Local Storage で、
// 下の2つのキーに配列が保存されていく様子を確認できます。
// ============================================================

// 保存する箱の名前(キー)。会員用とイベント用で分ける。
const STORAGE_KEYS = {
  members: "enjin_crm_members", // 自分で追加した「会員」の配列
  events:  "enjin_crm_events",  // 自分で追加した「イベント」の配列
};

// 指定キーから配列を読み出す（まだ何も無ければ空配列を返す）
function loadArray(key) {
  const raw = localStorage.getItem(key); // 文字列 or null が返る
  if (!raw) return [];                    // 初回など、何も無ければ空配列
  try {
    return JSON.parse(raw);               // 文字列 → 配列 に戻す
  } catch (e) {
    console.warn("localStorage の読み込みに失敗:", key, e);
    return [];
  }
}

// 指定キーに配列を保存する（配列 → 文字列 に変換して入れる）
function saveArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// --- ここから「会員」用 -------------------------------------

// 保存済みの会員配列を読み出す
function loadStoredMembers() {
  return loadArray(STORAGE_KEYS.members);
}

// 会員を1件追加して保存し、保存後の配列を返す
function addStoredMember(member) {
  const list = loadStoredMembers(); // ① 今の配列を読み出す
  list.push(member);                // ② 末尾に1件追加する
  saveArray(STORAGE_KEYS.members, list); // ③ 配列ごと保存し直す
  return list;
}

// --- ここから「イベント」用 ---------------------------------

// 保存済みのイベント配列を読み出す
function loadStoredEvents() {
  return loadArray(STORAGE_KEYS.events);
}

// イベントを1件追加して保存し、保存後の配列を返す
function addStoredEvent(event) {
  const list = loadStoredEvents();
  list.push(event);
  saveArray(STORAGE_KEYS.events, list);
  return list;
}

// 他のファイルからも呼べるように window に登録しておく
Object.assign(window, {
  STORAGE_KEYS,
  loadArray, saveArray,
  loadStoredMembers, addStoredMember,
  loadStoredEvents, addStoredEvent,
});
