// Main App — router + tweaks integration.

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

const DEFAULTS = window.__TWEAK_DEFAULTS;

const App = () => {
  // Router state — kept in URL hash so refresh preserves
  const [route, setRoute] = useStateApp(() => parseHash() || { screen: "dashboard" });
  useEffectApp(() => {
    const h = () => { const r = parseHash(); if (r) setRoute(r); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const navigate = (next) => {
    const hash = toHash(next);
    if (location.hash !== "#" + hash) location.hash = hash;
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Tweaks
  const [tweaks, setTweak] = useTweaks(DEFAULTS);

  // Apply theme + density + accent to root
  useEffectApp(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.style.setProperty("--accent", tweaks.accent);
  }, [tweaks.theme, tweaks.density, tweaks.accent]);

  // Toggle theme via topbar button
  const toggleTheme = () => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark");

  // Determine page content + breadcrumbs
  let content, crumbs;
  switch (route.screen) {
    case "dashboard":
      content = <DashScreen/>;
      crumbs = [{ label: "ダッシュボード" }];
      break;
    case "members":
      content = <MembersListScreen initialFilter={route.filter}/>;
      crumbs = [{ label: "会員" }];
      break;
    case "member":
      content = <MemberDetailScreen id={route.id}/>;
      crumbs = [
        { label: "会員", onClick: () => navigate({ screen: "members" }) },
        { label: memberById(route.id)?.name || route.id },
      ];
      break;
    case "events":
      content = <EventsListScreen/>;
      crumbs = [{ label: "イベント" }];
      break;
    case "event":
      content = <EventDetailScreen id={route.id}/>;
      crumbs = [
        { label: "イベント", onClick: () => navigate({ screen: "events" }) },
        { label: eventById(route.id)?.title || route.id },
      ];
      break;
    case "proposals":
      content = <ProposalsListScreen/>;
      crumbs = [{ label: "起案" }];
      break;
    case "proposal":
      content = <ProposalDetailScreen id={route.id}/>;
      crumbs = [
        { label: "起案", onClick: () => navigate({ screen: "proposals" }) },
        { label: proposalById(route.id)?.title || route.id },
      ];
      break;
    case "sns":
      content = <SnsListScreen/>;
      crumbs = [{ label: "SNS投稿" }];
      break;
    case "sns-post":
      content = <SnsPostDetailScreen id={route.id}/>;
      crumbs = [
        { label: "SNS投稿", onClick: () => navigate({ screen: "sns" }) },
        { label: snsPostById(route.id)?.excerpt?.slice(0, 24) + "..." || route.id },
      ];
      break;
    case "import":
      content = <ImportScreen/>;
      crumbs = [{ label: "インポート" }];
      break;
    case "db-demo":                       // 追加: Supabase DBデモ画面
      content = <DbDemoScreen/>;
      crumbs = [{ label: "DBデモ" }];
      break;
    case "settings":
      content = <SettingsScreen/>;
      crumbs = [{ label: "設定" }];
      break;
    default:
      content = <DashScreen/>;
      crumbs = [{ label: "ダッシュボード" }];
  }

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      <div className="app">
        <Sidebar route={route} navigate={navigate}/>
        <div className="main">
          <Topbar crumbs={crumbs} theme={tweaks.theme} onTheme={toggleTheme}/>
          {content}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="テーマ">
          <TweakRadio label="モード" value={tweaks.theme}
                      onChange={(v) => setTweak("theme", v)}
                      options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}/>
          <TweakColor label="アクセント" value={tweaks.accent}
                      onChange={(v) => setTweak("accent", v)}
                      options={["#f97316", "#0ea5e9", "#10b981", "#8b5cf6", "#18181b"]}/>
        </TweakSection>
        <TweakSection label="密度">
          <TweakRadio label="テーブル行" value={tweaks.density}
                      onChange={(v) => setTweak("density", v)}
                      options={[
                        { value: "comfortable", label: "ゆとり" },
                        { value: "compact",     label: "コンパクト" },
                        { value: "dense",       label: "高密度" },
                      ]}/>
        </TweakSection>
        <TweakSection label="表示">
          <TweakToggle label="キーヒント表示" value={tweaks.showShortcutHint}
                       onChange={(v) => setTweak("showShortcutHint", v)}/>
        </TweakSection>
      </TweaksPanel>
    </RouterContext.Provider>
  );
};

function parseHash() {
  const h = location.hash.replace(/^#/, "");
  if (!h) return null;
  try {
    return JSON.parse(decodeURIComponent(h));
  } catch {
    return { screen: h };
  }
}
function toHash(route) {
  return encodeURIComponent(JSON.stringify(route));
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
