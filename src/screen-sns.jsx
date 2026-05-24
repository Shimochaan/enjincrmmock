// SNS Posts list + SNS Post detail (with high-speed reaction input).

const { useState: useStateSns, useRef: useRefSns, useEffect: useEffectSns } = React;

const PF_OPTIONS = ["x", "instagram", "facebook", "threads", "linkedin", "tiktok", "youtube"];
const PF_LABELS = {
  x: "X (Twitter)", instagram: "Instagram", facebook: "Facebook",
  threads: "Threads", linkedin: "LinkedIn", tiktok: "TikTok", youtube: "YouTube", other: "Other",
};

const SnsListScreen = () => {
  const { navigate } = useRouter();
  const [pf, setPf] = useStateSns("all");
  const [theme, setTheme] = useStateSns("all");
  const [search, setSearch] = useStateSns("");

  const themes = [...new Set(SNS_POSTS.map(p => p.theme))];

  const filtered = SNS_POSTS
    .filter(p => pf === "all" || p.platform === pf)
    .filter(p => theme === "all" || p.theme === theme)
    .filter(p => !search || p.excerpt.includes(search))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">SNS投稿マスタ</h1>
          <div className="page-subtitle">
            累計 <strong style={{ color: "var(--fg)" }}>{SNS_POSTS.length}</strong> 件
            <span style={{ margin: "0 8px", color: "var(--fg-muted)" }}>·</span>
            反応総数 <strong style={{ color: "var(--fg)" }}>{totalReactions}</strong>
            <span style={{ margin: "0 8px", color: "var(--fg-muted)" }}>·</span>
            ユニーク反応会員 <strong style={{ color: "var(--fg)" }}>{uniqueReactingMembers}</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><IconDownload size={13}/>CSV出力</button>
          <button className="btn btn-primary"><IconPlus size={13}/>新規投稿登録</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="input" style={{ minWidth: 320 }}>
          <IconSearch size={14}/>
          <input placeholder="投稿冒頭・テーマで検索..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
        <div className="grow"/>
        <Select value="date_desc" options={[
          { value: "date_desc", label: "並び: 投稿日 ↓" },
          { value: "react_desc", label: "並び: 反応数 ↓" },
          { value: "members_desc", label: "並び: 反応会員数 ↓" },
        ]} onChange={() => {}}/>
      </div>

      <div>
        <div className="filter-row">
          <span className="label">プラットフォーム</span>
          <button className={"facet-pill " + (pf === "all" ? "active" : "")} onClick={() => setPf("all")}>全て</button>
          {PF_OPTIONS.map(p => (
            <button key={p} className={"facet-pill " + (pf === p ? "active" : "")}
                    onClick={() => setPf(p)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <SnsBadge platform={p} size={16}/> {PF_LABELS[p].split(" ")[0]}
            </button>
          ))}
          <span className="divider"/>
          <span className="label">テーマ</span>
          <button className={"facet-pill " + (theme === "all" ? "active" : "")} onClick={() => setTheme("all")}>全て</button>
          {themes.map(t => (
            <button key={t} className={"facet-pill " + (theme === t ? "active" : "")} onClick={() => setTheme(t)}>{t}</button>
          ))}
        </div>

        <div className="list-wrap" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="col-check"><Checkbox checked={false} onChange={() => {}}/></th>
                <th style={{ width: 130 }}>日時</th>
                <th style={{ width: 40 }}>PF</th>
                <th>投稿冒頭</th>
                <th style={{ width: 130 }}>テーマ</th>
                <th style={{ width: 70 }} className="right">反応</th>
                <th style={{ width: 80 }} className="right">会員</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const uniqMembers = new Set(p.reactions.map(r => r.memberId)).size;
                return (
                  <tr key={p.id} onClick={() => navigate({ screen: "sns-post", id: p.id })}>
                    <td className="col-check"><Checkbox checked={false} onChange={() => {}}/></td>
                    <td className="muted tabular">{p.postedAt.slice(5, 16)}</td>
                    <td><SnsBadge platform={p.platform}/></td>
                    <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 380 }}>
                      {p.excerpt}
                    </td>
                    <td><Badge tone="outline">{p.theme}</Badge></td>
                    <td className="num right">{p.reactions.length}</td>
                    <td className="num right">{uniqMembers}</td>
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

const SnsPostDetailScreen = ({ id }) => {
  const { navigate } = useRouter();
  const post = snsPostById(id);
  const [reactions, setReactions] = useStateSns(post?.reactions || []);
  const [showAdd, setShowAdd] = useStateSns(false);
  const [addSearch, setAddSearch] = useStateSns("");
  const [addType, setAddType] = useStateSns("like");
  const [addNote, setAddNote] = useStateSns("");
  const searchRef = useRefSns(null);

  useEffectSns(() => {
    if (showAdd) searchRef.current?.focus();
  }, [showAdd]);

  if (!post) return <div className="page"><div className="empty">投稿が見つかりません</div></div>;

  const reactedIds = new Set(reactions.map(r => r.memberId));
  const candidates = MEMBERS
    .filter(m => !reactedIds.has(m.id))
    .filter(m => !addSearch || m.name.includes(addSearch))
    .slice(0, 6);

  const counts = {};
  reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });

  const addReaction = (memberId) => {
    setReactions([...reactions, {
      memberId, type: addType, note: addNote,
      at: TODAY.toISOString().slice(0, 10),
    }]);
    setAddSearch("");
    setAddNote("");
    setTimeout(() => searchRef.current?.focus(), 0);
  };
  const removeReaction = (memberId, at) => {
    setReactions(reactions.filter(r => !(r.memberId === memberId && r.at === at)));
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && candidates.length > 0) {
      e.preventDefault();
      addReaction(candidates[0].id);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{post.excerpt.slice(0, 30)}...</h1>
          <div className="page-subtitle">
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate({ screen: "sns" })}>SNS投稿</span>
            <span style={{ margin: "0 6px", color: "var(--fg-muted)" }}>/</span>
            {PF_LABELS[post.platform]} · {post.postedAt}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={post.url} target="_blank" rel="noreferrer" className="btn"><IconExternal size={13}/>投稿を開く</a>
          <button className="btn"><IconEdit size={13}/>編集</button>
          <button className="btn btn-ghost"><IconMoreH size={13}/></button>
        </div>
      </div>

      <div className="member-header" style={{ alignItems: "flex-start" }}>
        <SnsBadge platform={post.platform} size={56}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{PF_LABELS[post.platform]}</span>
            <Badge tone="outline">{post.theme}</Badge>
            <span style={{ fontSize: 12, color: "var(--fg-sub)" }}>{post.postedAt}</span>
          </div>
          <a href={post.url} target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6,
            fontSize: 12, color: "var(--fg-sub)", textDecoration: "none"
          }}>
            <IconLink size={11}/>{post.url}
          </a>
          <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7 }}>{post.excerpt}</div>
          {post.note && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--fg-sub)", fontStyle: "italic" }}>
              メモ: {post.note}
            </div>
          )}
          <div className="stat-row">
            <div className="stat"><div className="stat-num">{reactions.length}</div><div className="stat-lbl">反応総数</div></div>
            <div className="stat"><div className="stat-num">{new Set(reactions.map(r => r.memberId)).size}</div><div className="stat-lbl">反応会員</div></div>
            <div className="stat" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {Object.entries(counts).map(([t, n]) => {
                const def = REACTION_DEF[t];
                const I = def.icon;
                return (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: def.color }}>
                    <I size={14}/><span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{n}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Card title={`反応会員 (${reactions.length}名)`} action={
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <IconPlus size={11}/>反応会員を追加
        </button>
      } flush>
        <table className="tbl">
          <thead>
            <tr>
              <th>会員</th>
              <th style={{ width: 130 }}>反応種別</th>
              <th>反応メモ</th>
              <th style={{ width: 110 }}>入力日</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {reactions.length === 0 && <tr><td colSpan={5}><div className="empty">まだ反応会員はいません</div></td></tr>}
            {reactions.map(r => {
              const m = memberById(r.memberId);
              if (!m) return null;
              return (
                <tr key={r.memberId + r.at} onClick={(ev) => { ev.stopPropagation(); navigate({ screen: "member", id: m.id }); }}>
                  <td>
                    <span className="member-link">
                      <Avatar name={m.name} size="sm"/>
                      <span className="name">{m.name}</span>
                    </span>
                  </td>
                  <td><ReactionChip type={r.type}/></td>
                  <td className="muted" style={{ fontStyle: r.note ? "normal" : "italic" }}>{r.note || "—"}</td>
                  <td className="muted tabular">{r.at}</td>
                  <td className="actions" onClick={(ev) => { ev.stopPropagation(); removeReaction(r.memberId, r.at); }}>
                    <IconX size={13}/>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {showAdd && (
        <div style={{ marginTop: 18 }}>
          <Card title="高速入力モード" meta="会員を入力 → 種別を選択 → Enterで確定、続けて入力" action={
            <button className="icon-btn" onClick={() => setShowAdd(false)}><IconX size={14}/></button>
          }>
            <div className="input" style={{ marginBottom: 12 }}>
              <IconSearch size={14}/>
              <input ref={searchRef} placeholder="会員名で検索... (Enterで一番上を選択)"
                     value={addSearch} onChange={(e) => setAddSearch(e.target.value)}
                     onKeyDown={handleKey}/>
              <span className="kbd" style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-muted)", padding: "1px 5px", borderRadius: 4, background: "var(--bg)", border: "1px solid var(--border)" }}>↵</span>
            </div>

            {addSearch && (
              <div style={{ marginBottom: 14, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
                {candidates.length === 0 ? (
                  <div className="empty" style={{ padding: 16 }}>候補なし</div>
                ) : candidates.map((m, i) => (
                  <div key={m.id} onClick={() => addReaction(m.id)}
                       style={{
                         display: "flex", alignItems: "center", gap: 10,
                         padding: "8px 12px",
                         borderBottom: i < candidates.length - 1 ? "1px solid var(--border)" : "none",
                         cursor: "pointer",
                         background: i === 0 ? "var(--bg-elev)" : "transparent",
                       }}>
                    <Avatar name={m.name} size="sm"/>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                    <div className="tag-row">{m.tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}</div>
                    {i === 0 && <Badge tone="outline" className="" >Enter</Badge>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <span className="label" style={{ fontSize: 12, color: "var(--fg-sub)", alignSelf: "center", marginRight: 4 }}>反応種別</span>
              {Object.entries(REACTION_DEF).map(([k, def]) => {
                const I = def.icon;
                const isActive = addType === k;
                return (
                  <button key={k} onClick={() => setAddType(k)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "6px 14px", borderRadius: 999,
                            border: `1px solid ${isActive ? def.color : "var(--border)"}`,
                            background: isActive ? def.color + "1a" : "var(--bg)",
                            color: isActive ? def.color : "var(--fg)",
                            fontSize: 13, fontWeight: 500, cursor: "pointer",
                          }}>
                    <I size={14}/>{def.label}
                  </button>
                );
              })}
            </div>

            <div className="input" style={{ marginBottom: 12 }}>
              <input placeholder="反応メモ (任意, 例: 行きます!)" value={addNote} onChange={(e) => setAddNote(e.target.value)}/>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setShowAdd(false)}>閉じる</button>
              <button className="btn btn-primary" disabled={candidates.length === 0}
                      onClick={() => candidates[0] && addReaction(candidates[0].id)}>
                追加(+続けて)
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

window.SnsListScreen = SnsListScreen;
window.SnsPostDetailScreen = SnsPostDetailScreen;
window.PF_LABELS = PF_LABELS;
window.PF_OPTIONS = PF_OPTIONS;
