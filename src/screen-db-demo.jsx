// ============================================================
// 画面: Supabase DBデモ（課題提出用 / 双方向のDB管理を実演する画面）
// ------------------------------------------------------------
// この画面でやっていること:
//   1. Supabase Auth でログイン（メール＋パスワード）
//   2. ログイン後、DBから「会員」「イベント」「参加記録」を読み込む
//   3. 参加記録(event_participants)を
//        ・「イベント側」から（このイベントに、この会員を追加）
//        ・「会員側」から  （この会員を、このイベントに追加）
//      の どちらからでも 追加できる
//   4. 追加した行は同じ1つのテーブルに入り、下の一覧に即反映される
//      → 「会員⇄イベントを単一DBで双方向管理している」ことの証明
//
// ※ 他のモック画面（会員/イベント/起案…）は従来どおりダミー定数で動く。
//   この画面だけが本物のSupabaseに繋がっている。
// ============================================================

// React のフックに、このファイル専用の別名を付ける（他ファイルと名前衝突させないため）
const { useState: useStateDemo, useEffect: useEffectDemo } = React;

const DbDemoScreen = () => {
  // ── 認証まわりの状態 ─────────────────────────────
  const [session, setSession] = useStateDemo(null);   // ログイン中のセッション情報（未ログインは null）
  const [email, setEmail]       = useStateDemo("");    // ログインフォーム: メール入力
  const [password, setPassword] = useStateDemo("");    // ログインフォーム: パスワード入力
  const [authError, setAuthError] = useStateDemo("");  // ログイン失敗時のエラーメッセージ
  const [authBusy, setAuthBusy]   = useStateDemo(false); // ログイン処理中フラグ（ボタン連打防止）

  // ── DBから読み込んだデータの状態 ─────────────────
  const [members, setMembers]           = useStateDemo([]); // 会員一覧
  const [events, setEvents]             = useStateDemo([]); // イベント一覧
  const [participants, setParticipants] = useStateDemo([]); // 参加記録一覧（中間テーブル）
  const [loading, setLoading]   = useStateDemo(false);      // 読み込み中フラグ
  const [dataError, setDataError] = useStateDemo("");       // 読み込み/書き込みエラー
  const [flash, setFlash]       = useStateDemo("");         // 「追加しました」等の一時メッセージ

  // ── 2つの追加フォームの入力状態 ───────────────────
  // (A) イベント側から: 選んだイベントに、選んだ会員を追加
  const [evSideEvent, setEvSideEvent]   = useStateDemo(""); // 選択中のイベントid
  const [evSideMember, setEvSideMember] = useStateDemo(""); // 選択中の会員id
  const [evSideStatus, setEvSideStatus] = useStateDemo("present");
  // (B) 会員側から: 選んだ会員を、選んだイベントに追加
  const [mbSideMember, setMbSideMember] = useStateDemo("");
  const [mbSideEvent, setMbSideEvent]   = useStateDemo("");
  const [mbSideStatus, setMbSideStatus] = useStateDemo("present");

  // ============================================================
  // 1) 起動時: いまログイン済みか確認し、ログイン状態の変化を監視する
  // ============================================================
  useEffectDemo(() => {
    if (!window.SUPABASE_CONFIGURED) return; // 接続設定が未入力なら何もしない

    // 既存セッション（前回ログインの記憶）があれば取得して反映
    sb.auth.getSession().then(({ data }) => setSession(data.session));

    // ログイン/ログアウトが起きるたびに session を更新する購読
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s));

    // 画面を離れるとき購読を解除（メモリリーク防止のお作法）
    return () => sub.subscription.unsubscribe();
  }, []);

  // ============================================================
  // 2) ログインできたら（session が入ったら）DBデータを読み込む
  // ============================================================
  useEffectDemo(() => {
    if (session) loadAll();
    // session が変わるたびに実行（ログイン直後に1回走る）
  }, [session]);

  // DBから3種類のデータをまとめて読み込む関数
  const loadAll = async () => {
    setLoading(true);
    setDataError("");
    try {
      // 会員: id・名前・メール・ステータスを名前順で取得
      const mRes = await sb.from("members")
        .select("id,name,email,status")
        .order("name");
      if (mRes.error) throw mRes.error;

      // イベント: id・タイトル・日付を日付順で取得
      const eRes = await sb.from("events")
        .select("id,title,date")
        .order("date");
      if (eRes.error) throw eRes.error;

      // 参加記録: 中間テーブルを取得。members(name)/events(title) は
      //   外部キーをたどって「会員名」「イベント名」も一緒に取る書き方（埋め込み取得）。
      const pRes = await sb.from("event_participants")
        .select("id,status,note,member_id,event_id, members(name), events(title)")
        .order("created_at", { ascending: false });
      if (pRes.error) throw pRes.error;

      // 取れたデータを画面の状態にセット
      setMembers(mRes.data || []);
      setEvents(eRes.data || []);
      setParticipants(pRes.data || []);
    } catch (err) {
      // 失敗したら理由を画面に出す（RLS未設定・通信エラーなど）
      setDataError(err.message || String(err));
    } finally {
      setLoading(false); // 成否に関わらず読み込み中フラグは解除
    }
  };

  // ============================================================
  // 3) ログイン / ログアウト
  // ============================================================
  const doLogin = async () => {
    setAuthBusy(true);
    setAuthError("");
    // メール＋パスワードでログイン。成功すると onAuthStateChange が発火し session が入る
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message); // 失敗理由を表示
    setAuthBusy(false);
  };

  const doLogout = async () => {
    await sb.auth.signOut(); // ログアウト。session が null に戻る
  };

  // ============================================================
  // 4) 参加記録を1件追加（2つのフォームが共通で呼ぶ中核処理）
  // ------------------------------------------------------------
  //   イベント側からでも会員側からでも、結局やることは同じ:
  //   event_participants テーブルに1行 入れる（または既存行を更新）。
  //   → これが「双方向だが単一DB」のキモ。
  // ============================================================
  const addParticipant = async (eventId, memberId, status) => {
    setDataError("");
    setFlash("");
    // 入力チェック: イベントと会員の両方が選ばれているか
    if (!eventId || !memberId) {
      setDataError("イベントと会員の両方を選んでください。");
      return;
    }
    // upsert = 無ければ挿入(insert)・有れば更新(update)。
    // onConflict で「同じイベント×同じ会員」が既にある場合は上書き（二重登録を防ぐ）。
    const { error } = await sb.from("event_participants")
      .upsert(
        { event_id: eventId, member_id: memberId, status },
        { onConflict: "event_id,member_id" }
      );
    if (error) {
      setDataError(error.message);
      return;
    }
    setFlash("参加記録を保存しました（DBに書き込み済み）");
    await loadAll(); // 最新状態を読み直して一覧に反映
  };

  // 会員id → 名前 / イベントid → タイトル を引くための小さなヘルパ
  const memberName = (id) => members.find(m => m.id === id)?.name || "(不明)";
  const eventTitle = (id) => events.find(e => e.id === id)?.title || "(不明)";

  // 参加ステータスを色付きバッジで表示するための対応表（Badgeが対応する色名に合わせる）
  const statusTone = { present: "emerald", late: "amber", absent: "red" };
  const statusLabel = { present: "出席", late: "遅刻", absent: "欠席" };

  // ============================================================
  // 以降は「画面の見た目(JSX)」。状態に応じて出し分ける。
  // ============================================================

  // (a) 接続設定がまだ → 設定方法を案内して終了
  if (!window.SUPABASE_CONFIGURED) {
    return (
      <div className="page">
        <div className="page-title">Supabase DBデモ</div>
        <Card title="⚙️ 接続設定がまだです">
          <p>
            <code>src/supabase-client.jsx</code> の <code>SUPABASE_URL</code> と
            <code> SUPABASE_ANON_KEY</code> を、自分のSupabaseプロジェクトの値に書き換えてください。
          </p>
          <p style={{ color: "var(--fg-muted)" }}>
            値は Supabase管理画面 → Project Settings → API の
            「Project URL」「anon public key」にあります。
          </p>
        </Card>
      </div>
    );
  }

  // (b) 未ログイン → ログインフォームを表示
  if (!session) {
    return (
      <div className="page">
        <div className="page-title">Supabase DBデモ</div>
        <div className="page-subtitle">ログインすると、DBに繋がった画面が表示されます</div>
        <div style={{ maxWidth: 380 }}>
          <Card title="🔐 ログイン">
            <Field label="メールアドレス">
              <input className="field-input" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="you@example.com" autoFocus/>
            </Field>
            <Field label="パスワード">
              <input className="field-input" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     onKeyDown={(e) => { if (e.key === "Enter") doLogin(); }}
                     placeholder="••••••••"/>
            </Field>
            {/* ログイン失敗時のエラー表示 */}
            {authError && <div style={{ color: "var(--danger, #e11)", fontSize: 13, marginTop: 8 }}>{authError}</div>}
            <button className="btn btn-primary" style={{ marginTop: 12, width: "100%" }}
                    onClick={doLogin} disabled={authBusy}>
              {authBusy ? "ログイン中…" : "ログイン"}
            </button>
            <p style={{ color: "var(--fg-muted)", fontSize: 12, marginTop: 10 }}>
              ※ Supabase管理画面で発行したアカウント（三木・中澤・下山）でログインできます。
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // (c) ログイン済み → DBデモ本体
  return (
    <div className="page">
      {/* ヘッダ: ログイン中ユーザーと操作ボタン */}
      <div className="page-title">Supabase DBデモ</div>
      <div className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>ログイン中: <b>{session.user.email}</b></span>
        <button className="btn" onClick={loadAll}><IconRefresh size={13}/>再読み込み</button>
        <button className="btn" onClick={doLogout}>ログアウト</button>
      </div>

      {/* 状態メッセージ */}
      {loading   && <div style={{ margin: "8px 0", color: "var(--fg-muted)" }}>読み込み中…</div>}
      {flash     && <div style={{ margin: "8px 0", color: "var(--success, #0a0)" }}>{flash}</div>}
      {dataError && <div style={{ margin: "8px 0", color: "var(--danger, #e11)" }}>エラー: {dataError}</div>}

      {/* ── 2つの追加フォームを横並び（同じテーブルに別方向から書き込む） ── */}
      {/* display:flex で2枚のカードを左右に並べる。各カードを flex:1 で半分ずつに */}
      <div style={{ display: "flex", gap: 12, alignItems: "stretch", marginTop: 8 }}>
        {/* (A) イベント側から参加者を追加 */}
        <div style={{ flex: 1 }}>
        <Card title="① イベント側から参加者を追加">
          <Field label="イベントを選ぶ">
            <select value={evSideEvent} onChange={(e) => setEvSideEvent(e.target.value)}>
              <option value="">— 選択 —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}（{ev.date}）</option>)}
            </select>
          </Field>
          <Field label="追加する会員">
            <select value={evSideMember} onChange={(e) => setEvSideMember(e.target.value)}>
              <option value="">— 選択 —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="出欠">
            <select value={evSideStatus} onChange={(e) => setEvSideStatus(e.target.value)}>
              <option value="present">出席</option>
              <option value="late">遅刻</option>
              <option value="absent">欠席</option>
            </select>
          </Field>
          <button className="btn btn-primary" style={{ marginTop: 8 }}
                  onClick={() => addParticipant(evSideEvent, evSideMember, evSideStatus)}>
            <IconPlus size={13}/>このイベントに追加
          </button>
        </Card>
        </div>

        {/* (B) 会員側から参加イベントを追加 */}
        <div style={{ flex: 1 }}>
        <Card title="② 会員側から参加イベントを追加">
          <Field label="会員を選ぶ">
            <select value={mbSideMember} onChange={(e) => setMbSideMember(e.target.value)}>
              <option value="">— 選択 —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="参加するイベント">
            <select value={mbSideEvent} onChange={(e) => setMbSideEvent(e.target.value)}>
              <option value="">— 選択 —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}（{ev.date}）</option>)}
            </select>
          </Field>
          <Field label="出欠">
            <select value={mbSideStatus} onChange={(e) => setMbSideStatus(e.target.value)}>
              <option value="present">出席</option>
              <option value="late">遅刻</option>
              <option value="absent">欠席</option>
            </select>
          </Field>
          <button className="btn btn-primary" style={{ marginTop: 8 }}
                  onClick={() => addParticipant(mbSideEvent, mbSideMember, mbSideStatus)}>
            <IconPlus size={13}/>このイベントに参加
          </button>
        </Card>
        </div>
      </div>

      {/* ── 参加記録の一覧（①②どちらで追加してもここに出る = 同じ1つのDB） ── */}
      <div style={{ marginTop: 16 }}>
      <Card title={`参加記録（event_participants）  全 ${participants.length} 件`}>
        <table className="tbl">
          <thead>
            <tr><th>会員</th><th>イベント</th><th>出欠</th><th>メモ</th></tr>
          </thead>
          <tbody>
            {participants.length === 0 && (
              <tr><td colSpan={4} style={{ color: "var(--fg-muted)" }}>まだ参加記録がありません。上のフォームから追加してみてください。</td></tr>
            )}
            {participants.map(p => (
              <tr key={p.id}>
                {/* members(name)/events(title) は埋め込み取得した値。無ければidから引く */}
                <td>{p.members?.name || memberName(p.member_id)}</td>
                <td>{p.events?.title || eventTitle(p.event_id)}</td>
                <td><Badge tone={statusTone[p.status]}>{statusLabel[p.status] || p.status}</Badge></td>
                <td style={{ color: "var(--fg-muted)" }}>{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      </div>
    </div>
  );
};

// app.jsx から参照できるよう global に置く（このファイルはモジュールではないので自動的にglobalだが明示）
window.DbDemoScreen = DbDemoScreen;
