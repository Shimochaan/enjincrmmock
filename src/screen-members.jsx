// Members list + Member detail (v0.2 — SNS column + SNS tab).

const { useState: useStateMembers } = React;

// 今日の日付を "YYYY-MM-DD" で返す
const todayStr = () => new Date().toISOString().slice(0, 10);

// 新規会員の入力フォーム（モーダル）
const NewMemberForm = ({ onClose, onAdd }) => {
  const [name, setName]     = useStateMembers("");
  const [email, setEmail]   = useStateMembers("");
  const [phone, setPhone]   = useStateMembers("");
  const [status, setStatus] = useStateMembers("active");
  const [job, setJob]       = useStateMembers("");
  const [tags, setTags]     = useStateMembers(""); // カンマ区切りで入力

  const submit = () => {
    if (!name.trim()) return; // 名前は必須
    // 入力値から1人分の会員オブジェクトを組み立てる
    const member = {
      id: "u" + Date.now(),               // 他と重ならないID
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      joined: todayStr(),
      status,
      lastSeen: 0,
      visits: 0,
      proposals: 0,
      // "PM, エンジニア" のような入力を ["PM","エンジニア"] に変換
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      job: job.trim(),
      skills: [],
      interests: [],
      note: [],
    };
    onAdd(member);
  };

  return (
    <Modal title="新規会員を登録" onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>キャンセル</button>
        <button className="btn btn-primary" onClick={submit} disabled={!name.trim()}>
          <IconPlus size={13}/>保存
        </button>
      </>
    }>
      <Field label="名前" required>
        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" autoFocus/>
      </Field>
      <div className="field-row">
        <Field label="メール">
          <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="taro@example.com"/>
        </Field>
        <Field label="電話">
          <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="080-1234-5678"/>
        </Field>
      </div>
      <div className="field-row">
        <Field label="ステータス">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="dormant">dormant</option>
            <option value="new">new</option>
          </select>
        </Field>
        <Field label="職業">
          <input className="field-input" value={job} onChange={(e) => setJob(e.target.value)} placeholder="プロダクトマネージャー"/>
        </Field>
      </div>
      <Field label="タグ（カンマ区切り）">
        <input className="field-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="PM, エンジニア"/>
      </Field>
    </Modal>
  );
};

const MembersListScreen = ({ initialFilter }) => {
  const { navigate } = useRouter();
  const [search, setSearch] = useStateMembers("");
  const [statusFilter, setStatusFilter] = useStateMembers(initialFilter?.status || "all");
  const [tagFilter, setTagFilter] = useStateMembers(initialFilter?.tag || null);
  const [snsHandleOnly, setSnsHandleOnly] = useStateMembers(false);
  const [snsMin, setSnsMin] = useStateMembers(0);
  const [selected, setSelected] = useStateMembers(new Set());
  const [page, setPage] = useStateMembers(1);
  const [showNew, setShowNew] = useStateMembers(false); // 新規会員フォームの開閉
  const [, setRefresh] = useStateMembers(0);            // 追加後に再描画させるためのカウンタ
  const perPage = 20;

  // フォームから受け取った会員を「保存 → 一覧に反映」する
  const handleAddMember = (member) => {
    addStoredMember(member); // ① localStorage の配列に追加保存
    MEMBERS.push(member);    // ② 画面が見ている配列にも追加（即反映用）
    setShowNew(false);
    setRefresh(n => n + 1);  // ③ 再描画
  };

  const filtered = MEMBERS.filter(m => {
    if (search && !m.name.includes(search) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (tagFilter && !m.tags.includes(tagFilter)) return false;
    if (snsHandleOnly && Object.keys(MEMBER_SNS[m.id] || {}).length === 0) return false;
    if (snsMin > 0 && snsReactionCount(m.id) < snsMin) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleAll = () => {
    if (pageRows.every(r => selected.has(r.id))) {
      const next = new Set(selected);
      pageRows.forEach(r => next.delete(r.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      pageRows.forEach(r => next.add(r.id));
      setSelected(next);
    }
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const appliedChips = [];
  if (statusFilter !== "all") appliedChips.push({ label: statusFilter, on: () => setStatusFilter("all") });
  if (tagFilter) appliedChips.push({ label: `#${tagFilter}`, on: () => setTagFilter(null) });
  if (snsHandleOnly) appliedChips.push({ label: "SNSハンドル登録あり", on: () => setSnsHandleOnly(false) });
  if (snsMin > 0) appliedChips.push({ label: `SNS反応≥${snsMin}`, on: () => setSnsMin(0) });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">会員一覧</h1>
          <div className="page-subtitle">全 {filtered.length} 件 / 全体 {MEMBERS.length} 名</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><IconDownload size={13}/>CSV出力</button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><IconPlus size={13}/>新規会員</button>
        </div>
      </div>

      {showNew && <NewMemberForm onClose={() => setShowNew(false)} onAdd={handleAddMember}/>}

      <div className="toolbar">
        <div className="input" style={{ minWidth: 320 }}>
          <IconSearch size={14}/>
          <input placeholder="名前・メールで検索..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
        <div className="grow"/>
        <Select value="joined_desc" options={[
          { value: "joined_desc", label: "並び: 入会日 ↓" },
          { value: "joined_asc",  label: "並び: 入会日 ↑" },
          { value: "lastseen",    label: "並び: 最終参加" },
          { value: "visits",      label: "並び: 参加回数" },
          { value: "sns",         label: "並び: SNS反応数" },
        ]} onChange={() => {}}/>
      </div>

      <div>
        <div className="filter-row">
          <span className="label">ステータス</span>
          {[
            { v: "all", l: "全て" },
            { v: "active", l: "active" },
            { v: "dormant", l: "dormant" },
            { v: "new", l: "new" },
          ].map(o => (
            <button key={o.v} className={"facet-pill " + (statusFilter === o.v ? "active" : "")}
                    onClick={() => setStatusFilter(o.v)}>{o.l}</button>
          ))}
          <span className="divider"/>
          <span className="label">タグ</span>
          {ALL_TAGS.slice(0, 5).map(t => (
            <button key={t} className={"facet-pill " + (tagFilter === t ? "active" : "")}
                    onClick={() => setTagFilter(tagFilter === t ? null : t)}>#{t}</button>
          ))}
          <span className="divider"/>
          <span className="label">SNS</span>
          <button className={"facet-pill " + (snsHandleOnly ? "active" : "")}
                  onClick={() => setSnsHandleOnly(v => !v)}>ハンドル登録あり</button>
          <button className={"facet-pill " + (snsMin >= 3 ? "active" : "")}
                  onClick={() => setSnsMin(snsMin >= 3 ? 0 : 3)}>反応 ≥3</button>
          <button className={"facet-pill " + (snsMin >= 10 ? "active" : "")}
                  onClick={() => setSnsMin(snsMin >= 10 ? 0 : 10)}>反応 ≥10</button>
        </div>

        {appliedChips.length > 0 && (
          <div className="applied-bar">
            適用中:
            {appliedChips.map((c, i) => (
              <Badge key={i} tone="outline">
                {c.label}
                <span style={{ marginLeft: 4, cursor: "pointer" }} onClick={c.on}>×</span>
              </Badge>
            ))}
            <button className="btn-ghost btn btn-sm" onClick={() => {
              setStatusFilter("all"); setTagFilter(null); setSnsHandleOnly(false); setSnsMin(0);
            }}>クリア</button>
          </div>
        )}

        <div className="list-wrap" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", borderTop: appliedChips.length ? "1px solid var(--border)" : "none" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="col-check">
                  <Checkbox checked={pageRows.length > 0 && pageRows.every(r => selected.has(r.id))}
                            onChange={toggleAll}/>
                </th>
                <th>名前</th>
                <th style={{ width: 100 }}>状態</th>
                <th style={{ width: 100 }}>入会日</th>
                <th style={{ width: 110 }}>最終参加</th>
                <th style={{ width: 60 }} className="right">参加</th>
                <th style={{ width: 60 }} className="right">起案</th>
                <th style={{ width: 70 }} className="right">SNS反</th>
                <th>タグ</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(m => {
                const snsCount = snsReactionCount(m.id);
                return (
                  <tr key={m.id} onClick={() => navigate({ screen: "member", id: m.id })}
                      data-selected={selected.has(m.id)} data-dim={m.lastSeen > 90 ? "true" : "false"}>
                    <td className="col-check">
                      <Checkbox checked={selected.has(m.id)} onChange={() => toggleOne(m.id)}/>
                    </td>
                    <td>
                      <span className="member-link">
                        <Avatar name={m.name} size="sm"/>
                        <span className="name">{m.name}</span>
                      </span>
                    </td>
                    <td><StatusBadge kind="member" value={m.status}/></td>
                    <td className="muted tabular">{m.joined}</td>
                    <td className="tabular" style={{ color: m.lastSeen > 90 ? "var(--amber-fg)" : "var(--fg-sub)" }}>{m.lastSeen}日前</td>
                    <td className="num right">{m.visits}</td>
                    <td className="num right" style={{ color: m.proposals > 0 ? "var(--fg)" : "var(--fg-muted)" }}>{m.proposals}</td>
                    <td className="num right" style={{ color: snsCount > 0 ? "var(--violet-fg)" : "var(--fg-muted)", fontWeight: snsCount > 0 ? 500 : 400 }}>
                      {snsCount}
                    </td>
                    <td>
                      <div className="tag-row">
                        {m.tags.slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}
                      </div>
                    </td>
                    <td className="actions"><IconMoreH size={13}/></td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr><td colSpan={10}><div className="empty">条件に一致する会員がいません</div></td></tr>
              )}
            </tbody>
          </table>
          <div className="tbl-foot">
            <span>{filtered.length} 件 / 表示: {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}</span>
            <Pager page={page} totalPages={totalPages} onChange={setPage}/>
            <Select value={String(perPage)} options={[{ value: "20", label: "20件/頁" }, { value: "50", label: "50件/頁" }, { value: "100", label: "100件/頁" }]} onChange={() => {}}/>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="bulk-bar slide-up">
            <strong>{selected.size}名選択中</strong>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5 }}>次の操作を選択</span>
            <div className="bulk-actions">
              <button className="bulk-btn"><IconTag size={11}/> タグ付け</button>
              <button className="bulk-btn"><IconDownload size={11}/> CSV出力</button>
              <button className="bulk-btn">アーカイブ</button>
              <button className="bulk-btn" onClick={() => setSelected(new Set())}>選択解除</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MemberDetailScreen = ({ id }) => {
  const { navigate } = useRouter();
  const m = memberById(id);
  const [tab, setTab] = useStateMembers("info");
  if (!m) return <div className="page"><div className="empty">会員が見つかりません</div></div>;

  const events = memberEvents(m.id);
  const proposals = memberProposals(m.id);
  const reactions = memberReactions(m.id);
  const handles = MEMBER_SNS[m.id] || {};
  const handleEntries = Object.entries(handles);
  const unregisteredPfs = PF_OPTIONS.filter(p => !handles[p]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{m.name}</h1>
          <div className="page-subtitle">
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate({ screen: "members" })}>会員</span>
            <span style={{ margin: "0 6px", color: "var(--fg-muted)" }}>/</span>
            {m.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><IconEdit size={13}/>編集</button>
          <button className="btn btn-ghost"><IconMoreH size={13}/></button>
        </div>
      </div>

      <div className="member-header">
        <Avatar name={m.name} size="lg"/>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{m.name}</span>
            <StatusBadge kind="member" value={m.status}/>
            <span style={{ fontSize: 12, color: "var(--fg-sub)" }}>入会: {m.joined}</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 13, color: "var(--fg-sub)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconMail size={12}/>{m.email}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><IconPhone size={12}/>{m.phone}</span>
            {handleEntries.length > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {handleEntries.map(([pf]) => <SnsBadge key={pf} platform={pf} size={16}/>)}
              </span>
            )}
          </div>
          <div className="tag-row" style={{ marginTop: 10 }}>
            {m.tags.map(t => <Tag key={t}>{t}</Tag>)}
            <button className="facet-pill" style={{ color: "var(--fg-sub)" }}><IconPlus size={11}/></button>
          </div>
          <div className="stat-row">
            <div className="stat"><div className="stat-num">{m.visits}</div><div className="stat-lbl">参加</div></div>
            <div className="stat"><div className="stat-num">{m.proposals}</div><div className="stat-lbl">起案</div></div>
            <div className="stat"><div className="stat-num">{reactions.length}</div><div className="stat-lbl">SNS反応</div></div>
            <div className="stat"><div className="stat-num">{m.lastSeen}日</div><div className="stat-lbl">最終接点</div></div>
          </div>
        </div>
      </div>

      <Tabs tabs={[
        { value: "info",      label: "基本情報" },
        { value: "events",    label: "イベント", count: events.length },
        { value: "proposals", label: "起案",     count: proposals.length },
        { value: "sns",       label: "SNS",      count: reactions.length },
        { value: "comm",      label: "コミ" },
      ]} value={tab} onChange={setTab}/>

      {tab === "info" && (
        <div className="detail-grid">
          <div>
            <Card title="プロフィール">
              <dl className="kv">
                <dt>職業</dt><dd>{m.job}</dd>
                <dt>スキル</dt><dd><div className="tag-row">{m.skills.map(s => <Tag key={s}>{s}</Tag>)}</div></dd>
                <dt>興味</dt><dd><div className="tag-row">{m.interests.map(s => <Tag key={s}>{s}</Tag>)}</div></dd>
                <dt>メール</dt><dd className="muted">{m.email}</dd>
                <dt>電話</dt><dd className="muted">{m.phone}</dd>
              </dl>
            </Card>

            <div style={{ height: 18 }}/>

            <Card title="運営メモ" action={<button className="btn btn-sm"><IconPlus size={11}/>追加</button>}>
              {m.note.length === 0 ? (
                <div className="empty" style={{ padding: 20 }}>まだメモはありません</div>
              ) : (
                <div>{m.note.map((n, i) => (
                  <div key={i} className="note">
                    <div className="note-meta tabular">{daysAgo(8 + i * 30)}</div>
                    <div>{n}</div>
                  </div>
                ))}</div>
              )}
            </Card>
          </div>
          <div>
            <Card title="関連エンティティ" flush>
              <div style={{ padding: "12px 18px" }}>
                <div style={{ fontSize: 11.5, color: "var(--fg-sub)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>起案 {proposals.length}</div>
                {proposals.length === 0 ? (
                  <div className="muted" style={{ fontSize: 12 }}>なし</div>
                ) : proposals.map(({ proposal, role }) => (
                  <div key={proposal.id} className="recent-row" style={{ padding: "8px 0", borderBottom: "none" }}
                       onClick={() => navigate({ screen: "proposal", id: proposal.id })}>
                    <IconStar size={13} style={{ color: "var(--fg-muted)" }}/>
                    <div className="ttl">{proposal.title}</div>
                    <Badge tone="outline">{role}</Badge>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--border)", padding: "12px 18px" }}>
                <div style={{ fontSize: 11.5, color: "var(--fg-sub)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>イベント {events.length}</div>
                {events.slice(0, 4).map(({ event }) => (
                  <div key={event.id} className="recent-row" style={{ padding: "8px 0", borderBottom: "none" }}
                       onClick={() => navigate({ screen: "event", id: event.id })}>
                    <IconCalendar size={13} style={{ color: "var(--fg-muted)" }}/>
                    <div className="ttl">{event.title}</div>
                    <span className="meta tabular">{event.date}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--border)", padding: "12px 18px" }}>
                <div style={{ fontSize: 11.5, color: "var(--fg-sub)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>SNS反応 {reactions.length}</div>
                {reactions.slice(0, 4).map(({ post, reaction }) => (
                  <div key={post.id + reaction.at} className="recent-row" style={{ padding: "8px 0", borderBottom: "none" }}
                       onClick={() => navigate({ screen: "sns-post", id: post.id })}>
                    <SnsBadge platform={post.platform} size={16}/>
                    <div className="ttl tiny">{post.excerpt.slice(0, 28)}...</div>
                    <ReactionChip type={reaction.type}/>
                  </div>
                ))}
                {reactions.length === 0 && <div className="muted" style={{ fontSize: 12 }}>なし</div>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "events" && (
        <Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 120 }}>日付</th>
                <th>イベント</th>
                <th style={{ width: 110 }}>状態</th>
                <th>メモ</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && <tr><td colSpan={5}><div className="empty">参加履歴なし</div></td></tr>}
              {events.map(({ event, attendance }) => (
                <tr key={event.id} onClick={() => navigate({ screen: "event", id: event.id })}>
                  <td className="muted tabular">{event.date}</td>
                  <td><span style={{ fontWeight: 500 }}>{event.title}</span> <span className="muted" style={{ marginLeft: 8 }}>{event.theme}</span></td>
                  <td><StatusBadge kind="attendance" value={attendance.status}/></td>
                  <td className="muted">{attendance.note || "—"}</td>
                  <td className="actions"><IconChevronRight size={12}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "proposals" && (
        <Card flush>
          <table className="tbl">
            <thead>
              <tr>
                <th>タイトル</th>
                <th style={{ width: 110 }}>役割</th>
                <th style={{ width: 110 }}>状態</th>
                <th style={{ width: 110 }}>起案日</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 && <tr><td colSpan={5}><div className="empty">起案なし</div></td></tr>}
              {proposals.map(({ proposal, role }) => (
                <tr key={proposal.id} onClick={() => navigate({ screen: "proposal", id: proposal.id })}>
                  <td style={{ fontWeight: 500 }}>{proposal.title}</td>
                  <td><Badge tone="outline">{role}</Badge></td>
                  <td><StatusBadge kind="proposal" value={proposal.status}/></td>
                  <td className="muted tabular">{proposal.proposed}</td>
                  <td className="actions"><IconChevronRight size={12}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "sns" && (
        <div>
          <Card title={`SNSハンドル (${handleEntries.length}件登録)`}
                action={<button className="btn btn-sm"><IconPlus size={11}/>ハンドル追加</button>} flush>
            <div style={{ padding: 12 }}>
              {handleEntries.length === 0 ? (
                <div className="empty" style={{ padding: 20 }}>ハンドル未登録</div>
              ) : handleEntries.map(([pf, handle]) => (
                <div key={pf} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 6px",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <SnsBadge platform={pf} size={28}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{PF_LABELS[pf]}</div>
                    <div className="muted tiny mono">{pf === "linkedin" ? handle : "@" + handle}</div>
                  </div>
                  <a href="#" className="btn btn-ghost btn-sm" onClick={(e) => e.preventDefault()}>
                    <IconExternal size={11}/>開く
                  </a>
                  <button className="btn btn-ghost btn-sm"><IconEdit size={11}/>編集</button>
                </div>
              ))}
              {unregisteredPfs.length > 0 && (
                <div style={{ padding: "12px 6px 4px", fontSize: 12, color: "var(--fg-sub)" }}>
                  未登録: {unregisteredPfs.map(p => <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 3, margin: "0 6px 0 0" }}>
                    <SnsBadge platform={p} size={14}/> {PF_LABELS[p].split(" ")[0]}
                  </span>)}
                </div>
              )}
            </div>
          </Card>

          <div style={{ height: 18 }}/>

          <Card title={`反応履歴 (${reactions.length}件)`} action={<Select value="newest" options={[{ value: "newest", label: "新しい順" }, { value: "oldest", label: "古い順" }]} onChange={() => {}}/>} flush>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>日時</th>
                  <th style={{ width: 40 }}>PF</th>
                  <th>投稿冒頭</th>
                  <th style={{ width: 130 }}>反応</th>
                  <th>反応メモ</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {reactions.length === 0 && <tr><td colSpan={6}><div className="empty">SNS反応はまだありません</div></td></tr>}
                {reactions.map(({ post, reaction }) => (
                  <tr key={post.id + reaction.at} onClick={() => navigate({ screen: "sns-post", id: post.id })}>
                    <td className="muted tabular">{reaction.at}</td>
                    <td><SnsBadge platform={post.platform}/></td>
                    <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>
                      {post.excerpt}
                    </td>
                    <td><ReactionChip type={reaction.type}/></td>
                    <td className="muted" style={{ fontStyle: reaction.note ? "normal" : "italic" }}>{reaction.note || "—"}</td>
                    <td className="actions"><IconChevronRight size={12}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "comm" && (
        <Card>
          <div className="empty" style={{ padding: 60 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: "var(--fg)" }}>コミュニケーションログ</div>
            <div>Phase 2 で実装予定。メール / Slack / DM の履歴を集約します。</div>
          </div>
        </Card>
      )}
    </div>
  );
};

window.MembersListScreen = MembersListScreen;
window.MemberDetailScreen = MemberDetailScreen;
