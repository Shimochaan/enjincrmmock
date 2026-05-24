// Proposals list (with source filter) + Proposal detail (source/docs/timeline) v0.2.

const { useState: useStateProp } = React;

const PROP_STATUSES = ["drafting", "adopted", "running", "done", "rejected"];

const SOURCE_LABEL = { google_form: "Form", manual: "手動" };
const SourceBadge = ({ source }) => {
  if (source.type === "google_form") {
    return <Badge tone="blue" dot>Form</Badge>;
  }
  return <Badge tone="outline">手動</Badge>;
};

const ProposalsListScreen = () => {
  const { navigate } = useRouter();
  const [view, setView] = useStateProp("table");
  const [search, setSearch] = useStateProp("");
  const [statusFilter, setStatusFilter] = useStateProp("all");
  const [sourceFilter, setSourceFilter] = useStateProp("all");

  const filtered = PROPOSALS
    .filter(p => statusFilter === "all" || p.status === statusFilter)
    .filter(p => {
      if (sourceFilter === "all") return true;
      const ext = proposalExt(p.id);
      return ext.source.type === sourceFilter;
    })
    .filter(p => !search || p.title.includes(search))
    .sort((a, b) => b.proposed.localeCompare(a.proposed));

  const adopted = PROPOSALS.filter(p => ["adopted", "running", "done"].includes(p.status)).length;
  const adoptedRate = Math.round((adopted / PROPOSALS.length) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">起案一覧</h1>
          <div className="page-subtitle">
            累計 <strong style={{ color: "var(--fg)" }}>{PROPOSALS.length}</strong> 件
            <span style={{ margin: "0 8px", color: "var(--fg-muted)" }}>·</span>
            採択 <strong style={{ color: "var(--emerald-fg)" }}>{adopted}</strong> 件
            <span style={{ margin: "0 8px", color: "var(--fg-muted)" }}>·</span>
            採択率 <strong style={{ color: "var(--fg)" }}>{adoptedRate}%</strong> ({adopted}/{PROPOSALS.length})
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="btn" style={{ padding: 0, gap: 0, overflow: "hidden" }}>
            <button className={"btn btn-sm " + (view === "table" ? "btn-primary" : "btn-ghost")}
                    style={{ border: "none", borderRadius: 0 }}
                    onClick={() => setView("table")}><IconTable size={12}/>テーブル</button>
            <button className={"btn btn-sm " + (view === "kanban" ? "btn-primary" : "btn-ghost")}
                    style={{ border: "none", borderRadius: 0 }}
                    onClick={() => setView("kanban")}><IconKanban size={12}/>カンバン</button>
          </div>
          <button className="btn btn-primary"><IconPlus size={13}/>新規起案</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="input" style={{ minWidth: 320 }}>
          <IconSearch size={14}/>
          <input placeholder="タイトル・起案者で検索..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      {view === "table" && (
        <div>
          <div className="filter-row">
            <span className="label">状態</span>
            {[
              { v: "all", l: "全て" },
              ...PROP_STATUSES.map(s => ({ v: s, l: STATUS_DEF.proposal[s].label })),
            ].map(o => (
              <button key={o.v} className={"facet-pill " + (statusFilter === o.v ? "active" : "")}
                      onClick={() => setStatusFilter(o.v)}>{o.l}</button>
            ))}
            <span className="divider"/>
            <span className="label">ソース</span>
            {[
              { v: "all",         l: "全て" },
              { v: "google_form", l: "Google Form" },
              { v: "manual",      l: "手動" },
            ].map(o => (
              <button key={o.v} className={"facet-pill " + (sourceFilter === o.v ? "active" : "")}
                      onClick={() => setSourceFilter(o.v)}>{o.l}</button>
            ))}
          </div>

          <div className="list-wrap" style={{ borderRadius: "0 0 var(--radius-lg) var(--radius-lg)" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th style={{ width: 200 }}>起案者</th>
                  <th style={{ width: 90 }}>ソース</th>
                  <th style={{ width: 100 }}>状態</th>
                  <th style={{ width: 100 }}>起案日</th>
                  <th style={{ width: 70 }} className="right">共同</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const proposer = memberById(p.proposer);
                  const ext = proposalExt(p.id);
                  return (
                    <tr key={p.id} onClick={() => navigate({ screen: "proposal", id: p.id })}>
                      <td>
                        <span style={{ fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <IconStar size={13} style={{ color: "var(--fg-muted)" }}/>{p.title}
                        </span>
                      </td>
                      <td>
                        <span className="member-link" onClick={(ev) => { ev.stopPropagation(); navigate({ screen: "member", id: proposer.id }); }}>
                          <Avatar name={proposer.name} size="sm"/>
                          <span className="name">{proposer.name}</span>
                        </span>
                      </td>
                      <td><SourceBadge source={ext.source}/></td>
                      <td><StatusBadge kind="proposal" value={p.status}/></td>
                      <td className="muted tabular">{p.proposed}</td>
                      <td className="num right">{p.cofounders.length}</td>
                      <td className="actions"><IconChevronRight size={12}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "kanban" && (
        <div className="kanban fade-in">
          {PROP_STATUSES.map(s => {
            const items = PROPOSALS.filter(p => p.status === s);
            const def = STATUS_DEF.proposal[s];
            return (
              <div key={s} className="kanban-col">
                <div className="kanban-col-head">
                  <Badge tone={def.tone} dot>{def.label}</Badge>
                  <span className="count tabular">{items.length}</span>
                </div>
                {items.map(p => {
                  const proposer = memberById(p.proposer);
                  return (
                    <div key={p.id} className="kanban-card" onClick={() => navigate({ screen: "proposal", id: p.id })}>
                      <div className="kc-title">{p.title}</div>
                      <div className="kc-meta">
                        <Avatar name={proposer.name} size="sm"/>
                        <span>{proposer.name}</span>
                        {p.cofounders.length > 0 && <span style={{ color: "var(--fg-muted)" }}>+{p.cofounders.length}</span>}
                        <span style={{ marginLeft: "auto" }} className="tabular">{p.proposed}</span>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="empty" style={{ padding: 18, fontSize: 12 }}>—</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProposalDetailScreen = ({ id }) => {
  const { navigate } = useRouter();
  const [showAddUpdate, setShowAddUpdate] = useStateProp(false);
  const [newType, setNewType] = useStateProp("discussion");
  const [tlLimit, setTlLimit] = useStateProp(10);

  const p = proposalById(id);
  if (!p) return <div className="page"><div className="empty">起案が見つかりません</div></div>;

  const proposer = memberById(p.proposer);
  const cofounders = p.cofounders.map(memberById);
  const relatedEvents = p.events.map(eventById).filter(Boolean);
  const ext = proposalExt(p.id);
  const updates = ext.updates;
  const shownUpdates = updates.slice(0, tlLimit);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{p.title}</h1>
          <div className="page-subtitle">
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate({ screen: "proposals" })}>起案</span>
            <span style={{ margin: "0 6px", color: "var(--fg-muted)" }}>/</span>
            {p.title}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><IconEdit size={13}/>編集</button>
          <button className="btn btn-ghost"><IconMoreH size={13}/></button>
        </div>
      </div>

      <div className="member-header" style={{ alignItems: "flex-start" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, background: "var(--accent-soft)",
          display: "grid", placeItems: "center", color: "var(--accent-soft-fg)"
        }}>
          <IconStar size={24}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{p.title}</span>
            <span className="status-pill" style={{ fontSize: 12 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: p.status === "adopted" || p.status === "done" ? "var(--emerald)" :
                             p.status === "running" ? "var(--blue)" :
                             p.status === "drafting" ? "var(--amber)" : "var(--red)"
              }}/>
              {STATUS_DEF.proposal[p.status].label}
              <IconChevronDown size={11} className="chev"/>
            </span>
            <span style={{ fontSize: 12, color: "var(--fg-sub)" }}>起案日: {p.proposed}</span>
            <SourceBadge source={ext.source}/>
            {ext.source.type === "google_form" && (
              <a href={ext.source.url} target="_blank" rel="noreferrer" className="btn btn-sm">
                <IconExternal size={11}/>Form回答原本を開く
              </a>
            )}
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: "var(--fg-sub)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span>起案者:</span>
            <span className="member-link" style={{ cursor: "pointer" }}
                  onClick={() => navigate({ screen: "member", id: proposer.id })}>
              <Avatar name={proposer.name} size="sm"/>
              <span className="name" style={{ color: "var(--fg)" }}>{proposer.name}</span>
            </span>
            {cofounders.length > 0 && (
              <>
                <span style={{ color: "var(--fg-muted)" }}>·</span>
                <span>共同:</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {cofounders.map(c => (
                    <span key={c.id} className="member-link" style={{ cursor: "pointer" }}
                          onClick={() => navigate({ screen: "member", id: c.id })}>
                      <Avatar name={c.name} size="sm"/>
                      <span style={{ color: "var(--fg)" }}>{c.name}</span>
                    </span>
                  ))}
                  <button className="facet-pill" style={{ color: "var(--fg-sub)" }}><IconPlus size={11}/></button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <Card title="概要" action={<button className="btn btn-sm"><IconEdit size={11}/>編集</button>}>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{p.summary}</div>
          </Card>

          <div style={{ height: 18 }}/>

          {/* Docs / Links section */}
          <Card title={`書類・リンク (${ext.docs.length + ext.links.length}件)`}
                action={
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-sm"><IconPaperclip size={11}/>ファイル</button>
                    <button className="btn btn-sm"><IconLink size={11}/>外部URL</button>
                  </div>
                } flush>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 11.5, color: "var(--fg-sub)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                <IconPaperclip size={11} style={{ verticalAlign: "-1px", marginRight: 4 }}/>
                ファイル添付 ({ext.docs.length})
              </div>
              {ext.docs.length === 0 ? (
                <div className="muted" style={{ fontSize: 12, padding: "4px 0" }}>添付ファイルなし</div>
              ) : ext.docs.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 0",
                  borderBottom: i < ext.docs.length - 1 ? "1px solid var(--border)" : "none"
                }}>
                  <DocChip kind={d.kind}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                    <div className="muted tiny tabular">{d.size} · {d.date}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm"><IconDownload size={11}/>DL</button>
                  <button className="btn btn-ghost btn-sm btn-danger"><IconTrash size={11}/></button>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11.5, color: "var(--fg-sub)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                <IconLink size={11} style={{ verticalAlign: "-1px", marginRight: 4 }}/>
                外部リンク ({ext.links.length})
              </div>
              {ext.links.length === 0 ? (
                <div className="muted" style={{ fontSize: 12, padding: "4px 0" }}>外部リンクなし</div>
              ) : ext.links.map((l, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 0",
                  borderBottom: i < ext.links.length - 1 ? "1px solid var(--border)" : "none"
                }}>
                  <DocChip kind={l.kind}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{l.title}</div>
                    <div className="muted tiny mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</div>
                  </div>
                  <a href={l.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    <IconExternal size={11}/>開く
                  </a>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ height: 18 }}/>

          {/* Update timeline */}
          <Card title={`アップデートタイムライン (${updates.length}件)`}
                action={<button className="btn btn-primary btn-sm" onClick={() => setShowAddUpdate(true)}>
                  <IconPlus size={11}/>アップデート追加
                </button>}>

            {showAddUpdate && (
              <div style={{
                background: "var(--bg-elev)", border: "1px solid var(--border)",
                borderRadius: 8, padding: 14, marginBottom: 18
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>アップデートを追加</div>
                  <button className="icon-btn" onClick={() => setShowAddUpdate(false)}><IconX size={14}/></button>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  {["discussion", "pivot", "docs", "status", "other"].map(k => {
                    const def = UPDATE_DEF[k];
                    const I = def.icon;
                    const isActive = newType === k;
                    return (
                      <button key={k} onClick={() => setNewType(k)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "5px 10px", borderRadius: 999,
                                border: `1px solid ${isActive ? def.color : "var(--border)"}`,
                                background: isActive ? def.bg : "var(--bg)",
                                color: isActive ? def.color : "var(--fg)",
                                fontSize: 12, fontWeight: 500, cursor: "pointer",
                              }}>
                        <I size={12}/>{def.label}
                      </button>
                    );
                  })}
                </div>
                <input className="input" placeholder="タイトル" style={{ width: "100%", marginBottom: 8 }}/>
                <textarea placeholder="本文(Markdown対応)"
                          style={{
                            width: "100%", minHeight: 90, fontFamily: "var(--font-sans)",
                            fontSize: 13, padding: 10, borderRadius: 6, border: "1px solid var(--border)",
                            background: "var(--bg)", color: "var(--fg)", resize: "vertical",
                          }}/>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button className="btn btn-sm"><IconPaperclip size={11}/>ファイル</button>
                  <button className="btn btn-sm"><IconLink size={11}/>外部URL</button>
                  <div style={{ flex: 1 }}/>
                  <button className="btn btn-sm" onClick={() => setShowAddUpdate(false)}>キャンセル</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddUpdate(false)}>追加する</button>
                </div>
              </div>
            )}

            <div className="timeline">
              {shownUpdates.map((u, i) => {
                const def = UPDATE_DEF[u.type] || UPDATE_DEF.other;
                const I = def.icon;
                return (
                  <div key={i} className="tl-item" style={{ padding: "14px 0", alignItems: "flex-start" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: def.bg, color: def.color,
                      display: "grid", placeItems: "center", flexShrink: 0,
                      border: `1px solid ${def.color}30`,
                      marginTop: 2,
                    }}>
                      <I size={16}/>
                    </div>
                    <div className="tl-body" style={{ marginLeft: 12 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: def.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {def.label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{u.title}</span>
                        <span className="muted tabular tiny" style={{ marginLeft: "auto" }}>{u.date} · by {u.by}</span>
                      </div>
                      {u.body && (
                        <div style={{ marginTop: 6, fontSize: 13, color: "var(--fg-sub)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                          {u.body}
                        </div>
                      )}
                      {u.attachment && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, padding: "4px 10px", background: "var(--bg-sunken)", borderRadius: 6, fontSize: 12 }}>
                          <DocChip kind={u.attachment.kind} size={22}/>
                          {u.attachment.title}
                        </div>
                      )}
                      {u.link && (
                        <a href={u.link.url} target="_blank" rel="noreferrer" style={{
                          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
                          padding: "4px 10px", background: "var(--bg-sunken)", borderRadius: 6,
                          fontSize: 12, color: "var(--fg)", textDecoration: "none"
                        }}>
                          <IconLink size={11}/>{u.link.title}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {updates.length > tlLimit && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, alignSelf: "center" }}
                        onClick={() => setTlLimit(tlLimit + 10)}>
                  もっと見る ({updates.length - tlLimit} 件)
                </button>
              )}
              {updates.length === 0 && <div className="empty">アップデートはまだありません</div>}
            </div>
          </Card>

          <div style={{ height: 18 }}/>

          <Card title="メモ" action={<button className="btn btn-sm"><IconPlus size={11}/>追加</button>}>
            {p.notes.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>メモはまだありません</div>
            ) : p.notes.map((n, i) => (
              <div key={i} className="note">
                <div className="note-meta tabular">{n.date}</div>
                <div>{n.text}</div>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <Card title="関連イベント" action={<button className="btn btn-sm"><IconLink size={11}/>紐づけ</button>} flush>
            <div style={{ padding: 12 }}>
              {relatedEvents.length === 0 && <div className="muted" style={{ fontSize: 12, padding: "8px 6px" }}>関連イベントなし</div>}
              {relatedEvents.map(e => (
                <div key={e.id} className="recent-row" style={{ padding: "8px 0", borderBottom: "none" }}
                     onClick={() => navigate({ screen: "event", id: e.id })}>
                  <IconCalendar size={13} style={{ color: "var(--fg-muted)" }}/>
                  <div className="ttl">
                    <div>{e.title}</div>
                    <div className="muted tiny tabular">{e.date}</div>
                  </div>
                  <IconChevronRight size={12} className="row-icon"/>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ height: 18 }}/>

          <Card title="関連メンバー" flush>
            <div style={{ padding: 12 }}>
              {[proposer, ...cofounders].map(m => (
                <div key={m.id} className="recent-row" style={{ padding: "8px 0", borderBottom: "none" }}
                     onClick={() => navigate({ screen: "member", id: m.id })}>
                  <Avatar name={m.name} size="sm"/>
                  <div className="ttl">
                    <div style={{ fontWeight: 500 }}>{m.name}</div>
                    <div className="muted tiny">{m.id === p.proposer ? "起案者" : "共同起案者"}</div>
                  </div>
                  <StatusBadge kind="member" value={m.status}/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

window.ProposalsListScreen = ProposalsListScreen;
window.ProposalDetailScreen = ProposalDetailScreen;
