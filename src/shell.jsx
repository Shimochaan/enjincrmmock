// Sidebar + Topbar + RouterContext.

const RouterContext = React.createContext(null);
const useRouter = () => React.useContext(RouterContext);

const NAV_ITEMS = [
  { key: "dashboard", label: "ダッシュボード", icon: IconDashboard, hint: "g d" },
  { key: "members",   label: "会員",           icon: IconUsers,     hint: "g m" },
  { key: "events",    label: "イベント",       icon: IconCalendar,  hint: "g e" },
  { key: "proposals", label: "起案",           icon: IconStar,      hint: "g p" },
  { key: "sns",       label: "SNS投稿",        icon: IconShare,     hint: "g s" },
];
const NAV_SECONDARY = [
  { key: "import",    label: "インポート", icon: IconUpload },
  { key: "settings",  label: "設定",       icon: IconSettings },
];

const Sidebar = ({ route, navigate }) => {
  const active = route.screen;
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">e</div>
        <span>enjin CRM</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">メイン</div>
        {NAV_ITEMS.map(it => {
          const I = it.icon;
          return (
            <button key={it.key} className="nav-item" data-active={active === it.key}
                    onClick={() => navigate({ screen: it.key })}>
              <I size={16}/>{it.label}
              <span className="kbd">{it.hint}</span>
            </button>
          );
        })}
        <div className="nav-section-label">その他</div>
        {NAV_SECONDARY.map(it => {
          const I = it.icon;
          return (
            <button key={it.key} className="nav-item" data-active={active === it.key}
                    onClick={() => navigate({ screen: it.key })}>
              <I size={16}/>{it.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <Avatar name="Owner Sato" size="md"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>佐藤 オーナー</div>
          <div style={{ fontSize: 11.5, color: "var(--fg-sub)" }}>owner@enjin.dev</div>
        </div>
        <IconMoreH size={14} style={{ color: "var(--fg-muted)", cursor: "pointer" }}/>
      </div>
    </aside>
  );
};

const Topbar = ({ crumbs, actions, onTheme, theme }) => (
  <header className="topbar">
    <div className="breadcrumb">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep"><IconChevronRight size={12}/></span>}
          <span className={i === crumbs.length - 1 ? "crumb-current" : ""}
                style={{ cursor: c.onClick ? "pointer" : "default" }}
                onClick={c.onClick}>{c.label}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="topbar-spacer"/>
    <div className="global-search">
      <IconSearch size={14}/>
      <span>検索...</span>
      <span className="kbd">⌘K</span>
    </div>
    <button className="icon-btn" title="テーマ切替" onClick={onTheme}>
      {theme === "dark" ? <IconSun size={16}/> : <IconMoon size={16}/>}
    </button>
    <button className="icon-btn" title="通知">
      <IconBell size={16}/>
    </button>
    {actions}
  </header>
);

Object.assign(window, { RouterContext, useRouter, Sidebar, Topbar, NAV_ITEMS, NAV_SECONDARY });
