// Import screen (rough) + Settings (minimal).

const ImportScreen = () => {
  const [target, setTarget] = React.useState("members");
  const [hasFile, setHasFile] = React.useState(true);

  const previewRows = [
    { ok: true,  num: 1, name: "山田 太郎", email: "ya@example.com", joined: "2025-09-15", status: "新規" },
    { ok: true,  num: 2, name: "鈴木 花子", email: "su@example.com", joined: "2024-12-03", status: "新規" },
    { ok: false, num: 3, name: "",          email: "sa@example.com", joined: "不正な日付", status: "エラー" },
    { ok: true,  num: 4, name: "田中 一郎", email: "ta@example.com", joined: "2024-08-30", status: "新規" },
    { ok: true,  num: 5, name: "渡辺 直樹", email: "wa@example.com", joined: "2025-05-12", status: "新規" },
  ];
  const errCount = previewRows.filter(r => !r.ok).length;
  const okCount = previewRows.filter(r => r.ok).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">インポート</h1>
          <div className="page-subtitle">スプレッドシートからの一括取り込み</div>
        </div>
      </div>

      <div style={{ maxWidth: 880 }}>
        <div className="import-step">
          <h3><span className="step-num">1</span>取り込み対象</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { v: "members",      l: "会員",                 icon: IconUsers },
              { v: "events",       l: "イベント",             icon: IconCalendar },
              { v: "participants", l: "参加実績",             icon: IconCheck },
              { v: "proposals",    l: "起案(手動)",          icon: IconStar },
              { v: "gform",        l: "Google Form → 起案",   icon: IconInbox },
              { v: "sns",          l: "SNS投稿マスタ",        icon: IconShare },
            ].map(o => {
              const I = o.icon;
              return (
                <button key={o.v} className={"facet-pill " + (target === o.v ? "active" : "")}
                        onClick={() => setTarget(o.v)} style={{ padding: "6px 14px" }}>
                  <I size={12}/>{o.l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="import-step">
          <h3><span className="step-num">2</span>CSVファイル</h3>
          {hasFile ? (
            <div className="dropzone has-file">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg)", display: "grid", placeItems: "center", color: "var(--fg-sub)", border: "1px solid var(--border)" }}>
                  <IconFileText size={18}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>members_20260524.csv</div>
                  <div className="muted tiny tabular">24 KB · 5 行のプレビュー</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setHasFile(false)}>削除</button>
              </div>
            </div>
          ) : (
            <div className="dropzone" onClick={() => setHasFile(true)} style={{ cursor: "pointer" }}>
              <IconUpload size={20} style={{ color: "var(--fg-muted)", marginBottom: 6 }}/>
              <div style={{ fontSize: 13 }}>ドラッグ&ドロップ または <span style={{ color: "var(--fg)", fontWeight: 500, textDecoration: "underline" }}>ファイルを選択</span></div>
              <div className="muted tiny" style={{ marginTop: 4 }}>CSV / Google Sheets エクスポート対応</div>
            </div>
          )}
        </div>

        <div className="import-step">
          <h3><span className="step-num">3</span>カラムマッピング</h3>
          <div>
            {[
              { csv: "氏名",     db: "name",                 ok: true,  note: "" },
              { csv: "メアド",   db: "email",                ok: true,  note: "" },
              { csv: "電話",     db: "phone",                ok: true,  note: "" },
              { csv: "登録日",   db: "joined_at",            ok: false, note: "形式: YYYY/MM/DD" },
              { csv: "職業",     db: "profile.job",          ok: true,  note: "" },
              { csv: "X ハンドル",  db: "sns_handles.x",         ok: true,  note: "NEW v0.2" },
              { csv: "IG ハンドル", db: "sns_handles.instagram", ok: true,  note: "NEW v0.2" },
              { csv: "興味",     db: "interests",            ok: false, note: "区切り: カンマ" },
            ].map((r, i) => (
              <div key={i} className="mapping-row">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <IconFileText size={13} style={{ color: "var(--fg-muted)" }}/>
                  <span style={{ fontWeight: 500 }}>{r.csv}</span>
                </div>
                <IconChevronRight size={13} style={{ color: "var(--fg-muted)" }}/>
                <button className="select" style={{ justifyContent: "space-between", width: "100%" }}>
                  <span className="mono" style={{ fontSize: 12 }}>{r.db}</span>
                  <IconChevronDown size={12} className="chev"/>
                </button>
                <div style={{ fontSize: 11.5 }}>
                  {r.ok ? (r.note ? <Badge tone="blue" dot>{r.note}</Badge> : <Badge tone="emerald" dot>OK</Badge>) : <Badge tone="amber" dot>{r.note}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="import-step">
          <h3><span className="step-num">4</span>プレビュー</h3>
          <div className="list-wrap" style={{ marginBottom: 12 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>name</th>
                  <th>email</th>
                  <th>joined_at</th>
                  <th>status</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map(r => (
                  <tr key={r.num} style={{ background: !r.ok ? "var(--red-soft)" : undefined }}>
                    <td style={{ color: r.ok ? "var(--fg-muted)" : "var(--red-fg)" }} className="tabular">
                      {r.ok ? r.num : <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconX size={12}/>{r.num}</span>}
                    </td>
                    <td>{r.name || <span className="muted" style={{ fontStyle: "italic" }}>(空)</span>}</td>
                    <td className="muted">{r.email}</td>
                    <td className="tabular" style={{ color: r.ok ? "var(--fg-sub)" : "var(--red-fg)" }}>{r.joined}</td>
                    <td>{r.ok ? <Badge tone="blue" dot>新規</Badge> : <Badge tone="red" dot>エラー</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
            <span><Badge tone="emerald" dot>取り込み可能 {okCount} 件</Badge></span>
            <span><Badge tone="red" dot>エラー {errCount} 件</Badge></span>
            <div style={{ flex: 1 }}/>
            <button className="btn">キャンセル</button>
            <button className="btn"><IconDownload size={13}/>エラー行をDL</button>
            <button className="btn btn-primary">{okCount} 件を取り込む</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsScreen = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">設定</h1>
          <div className="page-subtitle">運用ルール・タグ管理</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 1080 }}>
        <Card title="タグ管理">
          <div className="tag-row">
            {ALL_TAGS.map(t => <Tag key={t}>{t}</Tag>)}
          </div>
          <button className="btn btn-sm" style={{ marginTop: 12 }}><IconPlus size={11}/>タグ追加</button>
        </Card>

        <Card title="アラート閾値">
          <dl className="kv">
            <dt>dormant判定</dt><dd>最終参加 <strong className="tabular">90</strong> 日以上前</dd>
            <dt>接点なし通知</dt><dd>最終参加 <strong className="tabular">60</strong> 日以上前</dd>
            <dt>新規→active判定</dt><dd>初参加から <strong className="tabular">30</strong> 日以内に2回参加</dd>
          </dl>
        </Card>

        <Card title="チーム">
          <div className="recent-list">
            {[
              { name: "佐藤 オーナー", role: "Owner", email: "owner@enjin.dev" },
              { name: "山田 太郎", role: "Editor", email: "yamada.t@example.com" },
            ].map((u, i) => (
              <div key={i} className="recent-row" style={{ padding: "8px 0", borderBottom: i === 0 ? "1px solid var(--border)" : "none" }}>
                <Avatar name={u.name} size="sm"/>
                <div className="ttl">
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div className="muted tiny">{u.email}</div>
                </div>
                <Badge tone="outline">{u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="連携">
          <div className="recent-list">
            {[
              { name: "Google Sheets", state: "未接続" },
              { name: "Slack",         state: "接続済み" },
              { name: "Notion",        state: "未接続" },
            ].map((u, i) => (
              <div key={i} className="recent-row" style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div className="ttl" style={{ fontWeight: 500 }}>{u.name}</div>
                <Badge tone={u.state === "接続済み" ? "emerald" : "outline"} dot={u.state === "接続済み"}>{u.state}</Badge>
                <button className="btn btn-sm">{u.state === "接続済み" ? "管理" : "接続"}</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

window.ImportScreen = ImportScreen;
window.SettingsScreen = SettingsScreen;
