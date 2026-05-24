// Events list + Event detail.

const { useState: useStateEvents } = React;

const EventsListScreen = () => {
  const { navigate } = useRouter();
  const [search, setSearch] = useStateEvents("");
  const [formatFilter, setFormatFilter] = useStateEvents("all");

  const filtered = EVENTS
    .filter(e => !search || e.title.includes(search) || e.theme.includes(search))
    .filter(e => formatFilter === "all" || e.format === formatFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAttendance = EVENTS.reduce((acc, e) => {
    const present = e.participants.filter(p => p.status === "present" || p.status === "late").length;
    return acc + present / e.participants.length;
  }, 0);
  const avgAttend = Math.round((totalAttendance / EVENTS.length) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">イベント一覧</h1>
          <div className="page-subtitle">累計 {EVENTS.length} 件 / 平均出席率 {avgAttend}%</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><IconDownload size={13}/>CSV出力</button>
          <button className="btn btn-primary"><IconPlus size={13}/>新規イベント</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="input" style={{ minWidth: 320 }}>
          <IconSearch size={14}/>
          <input placeholder="タイトル・テーマで検索..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
        <div className="grow"/>
        <Select value="recent" options={[
          { value: "recent", label: "並び: 開催日 ↓" },
          { value: "old", label: "並び: 開催日 ↑" },
          { value: "attend", label: "並び: 出席数" },
        ]} onChange={() => {}}/>
      </div>

      <div>
        <div className="filter-row">
          <span className="label">形式</span>
          {[
            { v: "all", l: "全て" },
            { v: "online", l: "オンライン" },
            { v: "offline", l: "オフライン" },
          ].map(o => (
            <button key={o.v} className={"facet-pill " + (formatFilter === o.v ? "active" : "")}
                    onClick={() => setFormatFilter(o.v)}>{o.l}</button>
          ))}
          <span className="divider"/>
          <span className="label">期間</span>
          <button className="facet-pill">直近30日</button>
          <button className="facet-pill">直近90日</button>
        </div>

        <div className="list-wrap" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>日付</th>
                <th>タイトル</th>
                <th style={{ width: 100 }}>形式</th>
                <th>ホスト</th>
                <th style={{ width: 80 }} className="right">参加</th>
                <th style={{ width: 110 }} className="right">出席率</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const present = e.participants.filter(p => p.status === "present" || p.status === "late").length;
                const rate = Math.round(present / e.participants.length * 100);
                return (
                  <tr key={e.id} onClick={() => navigate({ screen: "event", id: e.id })}>
                    <td className="muted tabular">{e.date}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{e.title}</div>
                      <div className="muted tiny">{e.theme}</div>
                    </td>
                    <td><Badge tone="outline">{e.format === "online" ? "オンライン" : "オフライン"}</Badge></td>
                    <td className="muted">{e.host}</td>
                    <td className="num right">{e.participants.length}</td>
                    <td className="num right" style={{ color: rate >= 70 ? "var(--emerald-fg)" : rate >= 50 ? "var(--amber-fg)" : "var(--red-fg)" }}>{rate}%</td>
                    <td className="actions"><IconChevronRight size={12}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EventDetailScreen = ({ id }) => {
  const { navigate } = useRouter();
  const e = eventById(id);
  const [pSearch, setPSearch] = useStateEvents("");
  const [showAdd, setShowAdd] = useStateEvents(false);
  if (!e) return <div className="page"><div className="empty">イベントが見つかりません</div></div>;

  const present = e.participants.filter(p => p.status === "present" || p.status === "late").length;
  const rate = Math.round(present / e.participants.length * 100);
  const visibleParticipants = e.participants
    .map(p => ({ p, m: memberById(p.memberId) }))
    .filter(x => !pSearch || x.m.name.includes(pSearch));

  const memberIdsAlready = new Set(e.participants.map(p => p.memberId));
  const addCandidates = MEMBERS.filter(m => !memberIdsAlready.has(m.id));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{e.title}</h1>
          <div className="page-subtitle">
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate({ screen: "events" })}>イベント</span>
            <span style={{ margin: "0 6px", color: "var(--fg-muted)" }}>/</span>
            {e.title}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><IconCopy size={13}/>複製</button>
          <button className="btn"><IconEdit size={13}/>編集</button>
          <button className="btn btn-ghost"><IconMoreH size={13}/></button>
        </div>
      </div>

      <div className="member-header" style={{ alignItems: "flex-start" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, background: "var(--bg-sunken)",
          display: "grid", placeItems: "center", color: "var(--fg-sub)"
        }}>
          <IconCalendar size={24}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{e.title}</span>
            <Badge tone="outline">{e.format === "online" ? "オンライン" : "オフライン"}</Badge>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 13, color: "var(--fg-sub)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconCalendar size={12}/>{e.date}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconClock size={12}/>{e.time}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconUser size={12}/>ホスト: {e.host}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--fg-sub)" }}>テーマ: {e.theme}</div>
          <div className="stat-row">
            <div className="stat"><div className="stat-num">{e.participants.length}</div><div className="stat-lbl">参加予定</div></div>
            <div className="stat"><div className="stat-num">{present}</div><div className="stat-lbl">出席</div></div>
            <div className="stat"><div className="stat-num">{rate}%</div><div className="stat-lbl">出席率</div></div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <Card title="所感・トピック" action={<button className="btn btn-sm"><IconEdit size={11}/>編集</button>}>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{e.summary}</div>
          </Card>

          <div style={{ height: 18 }}/>

          <Card title={`参加者 (${e.participants.length}名)`} action={
            <div style={{ display: "flex", gap: 8 }}>
              <div className="input" style={{ padding: "4px 8px" }}>
                <IconSearch size={12}/>
                <input placeholder="名前で検索" value={pSearch} onChange={(ev) => setPSearch(ev.target.value)} style={{ width: 120, fontSize: 12 }}/>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><IconPlus size={11}/>参加者追加</button>
            </div>
          } flush>
            <table className="tbl">
              <thead>
                <tr>
                  <th className="col-check"><Checkbox checked={false} onChange={() => {}}/></th>
                  <th>名前</th>
                  <th style={{ width: 130 }}>状態</th>
                  <th>反応メモ</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {visibleParticipants.map(({ p, m }) => (
                  <tr key={p.memberId} onClick={(ev) => { ev.stopPropagation(); navigate({ screen: "member", id: m.id }); }}>
                    <td className="col-check"><Checkbox checked={false} onChange={() => {}}/></td>
                    <td>
                      <span className="member-link">
                        <Avatar name={m.name} size="sm"/>
                        <span className="name">{m.name}</span>
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" onClick={(ev) => ev.stopPropagation()}>
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: p.status === "present" ? "var(--emerald)" :
                                       p.status === "late" ? "var(--amber)" :
                                       p.status === "absent" ? "var(--red)" : "var(--fg-muted)"
                        }}/>
                        {STATUS_DEF.attendance[p.status]?.label || p.status}
                        <IconChevronDown size={11} className="chev"/>
                      </span>
                    </td>
                    <td className="muted" style={{ fontStyle: p.note ? "normal" : "italic" }}>
                      {p.note || "—"}
                    </td>
                    <td className="actions"><IconEdit size={12}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {showAdd && (
            <Card title="参加者を追加" action={<button className="icon-btn" onClick={() => setShowAdd(false)}><IconX size={14}/></button>}>
              <div className="input" style={{ marginBottom: 10 }}>
                <IconSearch size={14}/>
                <input placeholder="会員を検索..." />
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                {addCandidates.slice(0, 8).map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                    <Checkbox checked={false} onChange={() => {}}/>
                    <Avatar name={m.name} size="sm"/>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                    <div className="tag-row">{m.tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button className="btn" onClick={() => setShowAdd(false)}>キャンセル</button>
                <button className="btn btn-primary">追加</button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card title="出席ステータス内訳" flush>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {["present", "late", "absent"].map(s => {
                const n = e.participants.filter(p => p.status === s).length;
                const pct = (n / e.participants.length) * 100;
                const def = STATUS_DEF.attendance[s];
                return (
                  <div key={s}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span><Badge tone={def.tone} dot>{def.label}</Badge></span>
                      <span className="tabular muted">{n} ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ height: 4, background: "var(--bg-sunken)", borderRadius: 999 }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 999,
                        background: s === "present" ? "var(--emerald)" : s === "late" ? "var(--amber)" : "var(--red)"
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ height: 18 }}/>

          <Card title="関連起案" flush>
            <div style={{ padding: 12 }}>
              {PROPOSALS.filter(p => p.events.includes(e.id)).map(p => (
                <div key={p.id} className="recent-row" style={{ padding: "8px 0", borderBottom: "none" }}
                     onClick={() => navigate({ screen: "proposal", id: p.id })}>
                  <IconStar size={13} style={{ color: "var(--fg-muted)" }}/>
                  <div className="ttl">{p.title}</div>
                  <StatusBadge kind="proposal" value={p.status}/>
                </div>
              ))}
              {PROPOSALS.filter(p => p.events.includes(e.id)).length === 0 && (
                <div className="muted" style={{ fontSize: 12, padding: "4px 0" }}>なし</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

window.EventsListScreen = EventsListScreen;
window.EventDetailScreen = EventDetailScreen;
