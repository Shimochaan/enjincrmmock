// Dashboard screen v0.2 — 6 KPI tiles + SNS post summary.

const DashScreen = () => {
  const { navigate } = useRouter();

  const memberCount = MEMBERS.length;
  const activeCount = MEMBERS.filter(m => m.status === "active").length;
  const dormantCount = MEMBERS.filter(m => m.status === "dormant").length;
  const eventsThisMonth = EVENTS.filter(e => e.date >= "2026-05-01").length;
  const proposalsThisMonth = PROPOSALS.filter(p => p.proposed >= "2026-05-01").length;
  const adoptedCount = PROPOSALS.filter(p => p.status === "adopted" || p.status === "running" || p.status === "done").length;
  const adoptedRate = Math.round((adoptedCount / PROPOSALS.length) * 100);

  // v0.2: SNS metrics for THIS month
  const monthlyPosts = SNS_POSTS.filter(p => p.postedAt >= "2026-05-01");
  const monthlyReactionsAll = monthlyPosts.flatMap(p => p.reactions);
  const monthlyReactionsCount = monthlyReactionsAll.length;
  const monthlyReactingMembers = new Set(monthlyReactionsAll.map(r => r.memberId)).size;

  // Latest events
  const recentEvents = [...EVENTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  // Active proposals
  const liveProposals = PROPOSALS.filter(p => p.status !== "rejected" && p.status !== "done").slice(0, 4);
  // Stale (no contact + no SNS reaction recently)
  const stale = [...MEMBERS]
    .filter(m => m.lastSeen > 60 && m.status !== "withdrawn")
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 5);

  // Top SNS posts by reaction count
  const topPosts = [...SNS_POSTS]
    .sort((a, b) => b.reactions.length - a.reactions.length)
    .slice(0, 3);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">ダッシュボード</h1>
          <div className="page-subtitle">enjin コミュニティの健康状態を一瞥</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Select value="30d" options={[
            { value: "7d", label: "直近 7日" },
            { value: "30d", label: "直近 30日" },
            { value: "90d", label: "直近 90日" },
            { value: "12m", label: "直近 12ヶ月" },
          ]} onChange={() => {}}/>
        </div>
      </div>

      {/* KPI tiles — 6 tiles in 3x2 grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <KPI label={<><IconUsers size={12}/>会員総数</>} value={memberCount.toString()}
             delta="+3 (30日)" deltaDir="up"
             spark={<KpiSpark data={MEMBER_GROWTH.map(d => d.value)}/>}
             onClick={() => navigate({ screen: "members" })}/>
        <KPI label={<><IconCheck size={12}/>アクティブ</>} value={activeCount.toString()}
             delta={`${Math.round(activeCount / memberCount * 100)}% (参加+SNS反応)`} deltaDir="up"
             spark={<KpiSpark data={[28, 32, 33, 35, 36, 38]} color="var(--emerald)"/>}
             onClick={() => navigate({ screen: "members", filter: { status: "active" } })}/>
        <KPI label={<><IconAlert size={12}/>ドーマント</>} value={dormantCount.toString()}
             delta={`${stale.length} 名 接点なし`} deltaDir="flat"
             spark={<KpiSpark data={[6, 7, 6, 5, 5, 5]} color="var(--amber)"/>}
             onClick={() => navigate({ screen: "members", filter: { status: "dormant" } })}/>
        <KPI label={<><IconCalendar size={12}/>月間イベント</>} value={eventsThisMonth.toString()}
             delta="-1 (前月比)" deltaDir="down"
             spark={<KpiSpark data={[3, 4, 5, 4, 5, 4]}/>}
             onClick={() => navigate({ screen: "events" })}/>
        <KPI label={<><IconStar size={12}/>月間起案</>} value={proposalsThisMonth.toString()}
             delta={`採択率 ${adoptedRate}%`} deltaDir="up"
             spark={<KpiSpark data={[1, 1, 2, 1, 2, 3]} color="var(--accent)"/>}
             onClick={() => navigate({ screen: "proposals" })}/>
        <KPI label={<><IconShare size={12}/>SNS反応 / 会員数</>} value={`${monthlyReactionsCount} / ${monthlyReactingMembers}`}
             delta={`+${Math.floor(monthlyReactionsCount * 0.4)} (30日)`} deltaDir="up"
             spark={<KpiSpark data={[12, 18, 22, 28, 36, monthlyReactionsCount]} color="var(--violet)"/>}
             onClick={() => navigate({ screen: "sns" })}/>
      </div>

      {/* Charts row */}
      <div className="dash-grid" style={{ marginBottom: 16 }}>
        <div style={{ gridColumn: "span 6" }}>
          <Card title="会員数推移" meta="月次 / 直近6ヶ月">
            <LineChart data={MEMBER_GROWTH} accent="var(--fg)"/>
          </Card>
        </div>
        <div style={{ gridColumn: "span 6" }}>
          <Card title="エンゲージ推移" meta="参加 + SNS反応 / 月次平均">
            <BarChart data={ATTENDANCE_TREND.map(d => ({ ...d, label2: `${d.value}%` }))} accent="var(--fg)"/>
          </Card>
        </div>
      </div>

      {/* Lists row */}
      <div className="dash-grid">
        <div style={{ gridColumn: "span 5" }}>
          <Card title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconAlert size={14} style={{ color: "var(--amber-fg)" }}/>最近接点なし</span>}
                meta={`${stale.length} 名 / 60日以上(イベント+SNS反応)`}
                action={<button className="btn btn-ghost btn-sm" onClick={() => navigate({ screen: "members", filter: { status: "dormant" } })}>全件 <IconChevronRight size={12}/></button>}
                flush>
            <div className="recent-list">
              {stale.map(m => (
                <div key={m.id} className="recent-row" onClick={() => navigate({ screen: "member", id: m.id })}>
                  <Avatar name={m.name} size="sm"/>
                  <div className="ttl">{m.name}</div>
                  <div className="meta tabular">{m.lastSeen}日前</div>
                  <IconChevronRight size={12} className="row-icon"/>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div style={{ gridColumn: "span 7" }}>
          <Card title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconStar size={14}/>進行中の起案</span>}
                meta={`${liveProposals.length} 件`}
                action={<button className="btn btn-ghost btn-sm" onClick={() => navigate({ screen: "proposals" })}>全件 <IconChevronRight size={12}/></button>}
                flush>
            <div className="recent-list">
              {liveProposals.map(p => {
                const proposer = memberById(p.proposer);
                return (
                  <div key={p.id} className="recent-row" onClick={() => navigate({ screen: "proposal", id: p.id })}>
                    <StatusBadge kind="proposal" value={p.status}/>
                    <div className="ttl">{p.title}</div>
                    <div className="meta">起案: {proposer.name}</div>
                    <IconChevronRight size={12} className="row-icon"/>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* NEW v0.2: SNS posts summary */}
        <div style={{ gridColumn: "span 12" }}>
          <Card title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconShare size={14}/>直近のSNS投稿</span>}
                meta="反応数順 / 上位3件"
                action={<button className="btn btn-ghost btn-sm" onClick={() => navigate({ screen: "sns" })}>全件 <IconChevronRight size={12}/></button>}
                flush>
            <div className="recent-list">
              {topPosts.map(p => {
                const uniqMembers = new Set(p.reactions.map(r => r.memberId)).size;
                const counts = {};
                p.reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
                return (
                  <div key={p.id} className="recent-row" onClick={() => navigate({ screen: "sns-post", id: p.id })}>
                    <SnsBadge platform={p.platform}/>
                    <div className="meta tabular" style={{ width: 70 }}>{p.postedAt.slice(5, 10)}</div>
                    <div className="ttl">{p.excerpt}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {Object.entries(counts).slice(0, 3).map(([t, n]) => {
                        const def = REACTION_DEF[t];
                        const I = def.icon;
                        return (
                          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 2, color: def.color, fontSize: 12, fontWeight: 600 }}>
                            <I size={11}/>{n}
                          </span>
                        );
                      })}
                      <Badge tone="outline">会員 {uniqMembers}</Badge>
                    </div>
                    <IconChevronRight size={12} className="row-icon"/>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <Card title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconCalendar size={14}/>直近イベント</span>}
                meta={`${recentEvents.length} 件`}
                action={<button className="btn btn-ghost btn-sm" onClick={() => navigate({ screen: "events" })}>全件 <IconChevronRight size={12}/></button>}
                flush>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>日付</th>
                  <th>タイトル</th>
                  <th style={{ width: 110 }}>形式</th>
                  <th style={{ width: 110 }} className="right">参加</th>
                  <th style={{ width: 120 }} className="right">出席率</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map(e => {
                  const present = e.participants.filter(p => p.status === "present" || p.status === "late").length;
                  const rate = Math.round(present / e.participants.length * 100);
                  return (
                    <tr key={e.id} onClick={() => navigate({ screen: "event", id: e.id })}>
                      <td className="muted tabular">{e.date}</td>
                      <td><span style={{ fontWeight: 500 }}>{e.title}</span> <span style={{ color: "var(--fg-sub)", marginLeft: 8 }}>{e.theme}</span></td>
                      <td><Badge tone="outline">{e.format === "online" ? "オンライン" : "オフライン"}</Badge></td>
                      <td className="num right">{e.participants.length}</td>
                      <td className="num right">{rate}%</td>
                      <td className="actions"><IconChevronRight size={13}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

window.DashScreen = DashScreen;
