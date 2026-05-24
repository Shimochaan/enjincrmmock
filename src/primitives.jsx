// Shared primitives: Badge, Avatar, StatusBadge, Tabs, Card, Checkbox, etc.

const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

const cls = (...xs) => xs.filter(Boolean).join(" ");

const Avatar = ({ name = "", size = "" }) => {
  const initials = name.split(/\s+/).map(s => s[0]).filter(Boolean).slice(0, 2).join("");
  // deterministic hue from name
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const bg = `hsl(${h}, 36%, 92%)`;
  const fg = `hsl(${h}, 40%, 28%)`;
  return (
    <div className={cls("avatar", size)} style={{ background: bg, color: fg, borderColor: `hsl(${h}, 30%, 85%)` }}>
      {initials}
    </div>
  );
};

const Badge = ({ tone = "default", dot = false, children, className = "" }) => {
  const map = {
    emerald: "badge-emerald", amber: "badge-amber", red: "badge-red",
    blue: "badge-blue", violet: "badge-violet",
    outline: "badge-outline", tag: "badge-tag",
  };
  return (
    <span className={cls("badge", map[tone] || "", className)}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
};

const STATUS_DEF = {
  member: {
    active:    { label: "active",    tone: "emerald" },
    dormant:   { label: "dormant",   tone: "amber" },
    new:       { label: "new",       tone: "blue" },
    withdrawn: { label: "withdrawn", tone: "red" },
  },
  proposal: {
    drafting:  { label: "起案中",   tone: "amber" },
    adopted:   { label: "採択",     tone: "emerald" },
    running:   { label: "実行中",   tone: "blue" },
    done:      { label: "完了",     tone: "violet" },
    rejected:  { label: "不採択",   tone: "red" },
  },
  attendance: {
    present:   { label: "出席",     tone: "emerald" },
    late:      { label: "遅刻",     tone: "amber" },
    absent:    { label: "欠席",     tone: "red" },
    pending:   { label: "未確定",   tone: "outline" },
  },
};

const StatusBadge = ({ kind, value }) => {
  const def = STATUS_DEF[kind]?.[value] || { label: value, tone: "outline" };
  return <Badge tone={def.tone} dot>{def.label}</Badge>;
};

const Checkbox = ({ checked, onChange, ...rest }) => (
  <span className="cb" data-checked={checked ? "true" : "false"}
        onClick={(e) => { e.stopPropagation(); onChange && onChange(!checked); }} {...rest}>
    {checked && <IconCheck size={11} />}
  </span>
);

const Tabs = ({ tabs, value, onChange }) => (
  <div className="tabs" role="tablist">
    {tabs.map(t => (
      <button key={t.value} className="tab" role="tab"
              data-active={t.value === value}
              onClick={() => onChange(t.value)}>
        {t.label}
        {t.count != null && <span className="count tabular">{t.count}</span>}
      </button>
    ))}
  </div>
);

const Card = ({ title, meta, action, children, flush = false, className = "" }) => (
  <div className={cls("card", className)}>
    {(title || action) && (
      <div className="card-header">
        <div>
          <div className="card-title">{title}</div>
          {meta && <div className="card-meta">{meta}</div>}
        </div>
        {action}
      </div>
    )}
    <div className={cls("card-body", flush && "flush")}>{children}</div>
  </div>
);

const KPI = ({ label, value, delta, deltaDir = "flat", spark, icon, onClick }) => (
  <div className="kpi" onClick={onClick} role="button">
    <div className="kpi-label">{icon}{label}</div>
    <div className="kpi-value">{value}</div>
    {delta && (
      <div className={`kpi-delta ${deltaDir}`}>
        {deltaDir === "up" && <IconArrowUp size={11} />}
        {deltaDir === "down" && <IconArrowDown size={11} />}
        {delta}
      </div>
    )}
    {spark && <div className="kpi-spark">{spark}</div>}
  </div>
);

// Sparkline
const Sparkline = ({ data, width = 80, height = 28, accent = "var(--fg)" }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / span) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
};

// BarChart (vertical, simple)
const BarChart = ({ data, height = 180, accent = "var(--fg)" }) => {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div style={{ height, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%",
              height: `${(d.value / max) * 100}%`,
              background: d.accent ? "var(--accent)" : accent,
              borderRadius: "4px 4px 0 0",
              opacity: 0.85,
              minHeight: 2,
              position: "relative"
            }}>
              {d.label2 && (
                <span style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 600, color: "var(--fg)" }}>
                  {d.label2}
                </span>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-sub)" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// LineChart (simple, single series)
const LineChart = ({ data, height = 180, accent = "var(--fg)" }) => {
  const w = 480;
  const h = height - 30;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const min = Math.min(...data.map(d => d.value));
  const span = max - min || 1;
  const stepX = w / (data.length - 1 || 1);
  const pts = data.map((d, i) => [i * stepX, h - ((d.value - min) / span) * (h - 20) - 10]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <div style={{ height }}>
      <svg width="100%" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`grad-${Math.random().toString(36).slice(2,7)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={accent} opacity="0.08"/>
        <path d={path} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--bg)" stroke={accent} strokeWidth="1.75"/>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--fg-sub)", marginTop: 4, padding: "0 2px" }}>
        {data.map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  );
};

// Tag chip
const Tag = ({ children, onRemove }) => (
  <span className="badge badge-tag">
    <span style={{ color: "var(--fg-muted)" }}>#</span>{children}
    {onRemove && <span style={{ marginLeft: 4, cursor: "pointer", color: "var(--fg-muted)" }} onClick={onRemove}>×</span>}
  </span>
);

// Select (lightweight, mock — opens menu, click to choose)
const Select = ({ value, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const cur = options.find(o => o.value === value);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className="select" onClick={() => setOpen(o => !o)}>
        {cur ? cur.label : (placeholder || "選択")}
        <IconChevronDown size={13} className="chev"/>
      </button>
      {open && (
        <div className="menu" style={{ top: "calc(100% + 4px)", left: 0 }}>
          {options.map(o => (
            <div key={o.value} className="menu-item" onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
              {o.value === value && <IconCheck size={13} style={{ marginLeft: "auto" }}/>}
            </div>
          ))}
        </div>
      )}
    </span>
  );
};

// Pagination
const Pager = ({ page, totalPages, onChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="pager">
      <button className="pg" disabled={page <= 1} onClick={() => onChange(page - 1)}><IconChevronLeft size={13}/></button>
      {pages.map(p => (
        <button key={p} className="pg" data-active={p === page} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="pg" disabled={page >= totalPages} onClick={() => onChange(page + 1)}><IconChevronRight size={13}/></button>
    </div>
  );
};

// Bar spark for KPI tiles
const KpiSpark = ({ data, color = "var(--fg)" }) => (
  <Sparkline data={data} width={70} height={26} accent={color}/>
);

Object.assign(window, {
  cls, Avatar, Badge, StatusBadge, STATUS_DEF, Checkbox, Tabs, Card, KPI,
  Sparkline, BarChart, LineChart, Tag, Select, Pager, KpiSpark,
});
