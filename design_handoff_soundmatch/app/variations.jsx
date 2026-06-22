/* SoundMatch — exploration variations (static screens for the canvas) → window */

const { useState: useV } = React;
const ST = window.SM_TRACKS;
const STATS = window.SM_STATS;
const LIKED4 = [ST[0], ST[3], ST[4], ST[1]];

/* ---- shared phone wrapper (mirrors app.jsx layout) ---- */
function FauxTab({ active }) {
  const tabs = [['discover', 'Discover', 'discover'], ['liked', 'Liked', 'heart'], ['profile', 'Profile', 'user']];
  return (
    <div style={{ flexShrink: 0, display: 'flex', padding: '10px 14px 24px', gap: 6, background: 'linear-gradient(to top, var(--sm-bg) 60%, transparent)', borderTop: '1px solid var(--sm-line)' }}>
      {tabs.map(([id, label, icon]) => {
        const on = active === id;
        return (
          <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '6px 0' }}>
            <Icon name={icon} size={24} color={on ? 'var(--sm-accent)' : 'var(--sm-text-3)'} fill={icon === 'heart' && on} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: on ? 'var(--sm-text)' : 'var(--sm-text-3)' }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Phone({ tab, pad = 44, children }) {
  const ambient = { height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', background: 'radial-gradient(120% 60% at 50% -6%, var(--sm-bg-grad) 0%, transparent 52%), var(--sm-bg)' };
  return (
    <IOSDevice dark>
      <div className="sm-root" style={ambient}>
        <div style={{ flex: '1 1 0', minHeight: 0, paddingTop: pad, display: 'flex', flexDirection: 'column' }}>{children}</div>
        {tab && <FauxTab active={tab} />}
      </div>
    </IOSDevice>
  );
}

function FooterBtn({ label = 'Continue', sub }) {
  return (
    <div style={{ flexShrink: 0, padding: '14px 0 4px' }}>
      <div style={{ width: '100%', borderRadius: 14, padding: '16px', background: 'var(--sm-accent)', color: 'var(--sm-accent-ink)', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15.5, textAlign: 'center', boxShadow: '0 12px 30px -12px var(--sm-accent-soft)' }}>{label}</div>
      {sub && <div style={{ textAlign: 'center', color: 'var(--sm-text-3)', fontSize: 13, paddingTop: 12 }}>{sub}</div>}
    </div>
  );
}

/* ================================================================
   ONBOARDING / TASTE SETUP  ×3
================================================================ */
const GENRES = ['Atmospheric DnB', 'Liquid', 'Ambient', 'Jazzy', 'Soulful', 'Deep', 'Classic', 'Funk', 'Melodic'];

function OnbChips() {
  const sel = ['Atmospheric DnB', 'Liquid', 'Deep'];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 24px 28px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 34 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 1 ? 'var(--sm-accent)' : 'var(--sm-surface-3)' }} />)}</div>
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Step 2 · Your sound</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.2, marginBottom: 10 }}>What are you into?</div>
        <div style={{ fontSize: 14.5, color: 'var(--sm-text-3)', marginBottom: 26 }}>Pick a few — we’ll tune your first stack.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {GENRES.map(g => {
            const on = sel.includes(g);
            return <span key={g} style={{ fontWeight: 500, fontSize: 14, padding: '11px 16px', borderRadius: 999, whiteSpace: 'nowrap', border: `1px solid ${on ? 'var(--sm-accent-line)' : 'var(--sm-line-strong)'}`, background: on ? 'var(--sm-accent-soft)' : 'var(--sm-surface)', color: on ? 'var(--sm-accent)' : 'var(--sm-text-2)' }}>{g}</span>;
          })}
        </div>
      </div>
      <FooterBtn />
    </div>
  );
}

function OnbTiles() {
  const sel = ['Atmospheric DnB', 'Liquid', 'Soulful'];
  const tiles = [['Atmospheric DnB', 322], ['Liquid', 296], ['Soulful', 268], ['Funk', 16], ['Ambient', 248], ['Jazzy', 200]];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 20px 28px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 1 ? 'var(--sm-accent)' : 'var(--sm-surface-3)' }} />)}</div>
      <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Step 2 · Your vibes</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 23, lineHeight: 1.2, marginBottom: 4 }}>Pick your palette</div>
      <div style={{ fontSize: 14, color: 'var(--sm-text-3)', marginBottom: 20 }}>Tap the sounds that feel like you.</div>
      <div style={{ flex: '1 1 0', minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
        {tiles.map(([name, h]) => {
          const on = sel.includes(name);
          return (
            <div key={name} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '1 / 0.82', background: `linear-gradient(150deg, oklch(0.46 0.135 ${h}), oklch(0.24 0.07 ${h + 14}))`, boxShadow: on ? '0 0 0 2px var(--sm-accent)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 12px)' }} />
              <div style={{ position: 'absolute', left: 13, bottom: 12, right: 13, fontFamily: 'var(--font-display)', fontSize: 13.5, color: '#fff', lineHeight: 1.15 }}>{name}</div>
              <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: on ? 'var(--sm-accent)' : 'rgba(12,8,18,0.4)', border: on ? 'none' : '1.5px solid rgba(255,255,255,0.5)', display: 'grid', placeItems: 'center' }}>
                {on && <Icon name="check" size={14} color="var(--sm-accent-ink)" stroke={3} />}
              </div>
            </div>
          );
        })}
      </div>
      <FooterBtn label="Continue · 3 picked" />
    </div>
  );
}

function OnbDials() {
  const Dial = ({ left, right, val }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}><span>{left}</span><span>{right}</span></div>
      <div style={{ position: 'relative', height: 6, borderRadius: 4, background: 'var(--sm-surface-3)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: val + '%', borderRadius: 4, background: 'var(--sm-accent)' }} />
        <div style={{ position: 'absolute', left: `calc(${val}% - 13px)`, top: -10, width: 26, height: 26, borderRadius: '50%', background: 'var(--sm-accent)', border: '3px solid var(--sm-bg)', boxShadow: '0 2px 10px -2px var(--sm-accent-soft)' }} />
      </div>
    </div>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 24px 28px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 34 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 2 ? 'var(--sm-accent)' : 'var(--sm-surface-3)' }} />)}</div>
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Step 3 · Calibrate</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.2, marginBottom: 10 }}>Set your taste dials</div>
        <div style={{ fontSize: 14.5, color: 'var(--sm-text-3)', marginBottom: 38 }}>We’ll bias your stack from here.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <Dial left="Familiar" right="Adventurous" val={64} />
          <Dial left="Mellow" right="Energetic" val={42} />
          <Dial left="Vocal" right="Instrumental" val={78} />
        </div>
        <div style={{ display: 'flex', gap: 11, padding: 13, borderRadius: 14, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', marginTop: 40 }}>
          <CoverArt track={ST[0]} size={44} radius={9} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--sm-text-3)', marginBottom: 2 }}>Sample match</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>So Long · Seba</div>
          </div>
          <Eq active />
        </div>
      </div>
      <FooterBtn label="Start swiping" />
    </div>
  );
}

/* ================================================================
   LISTENING STATS  ×3
================================================================ */
function StatTile2({ big, label }) {
  return (
    <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: '16px 16px 14px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 25, lineHeight: 1 }}>{big}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sm-text-3)', marginTop: 9 }}>{label}</div>
    </div>
  );
}

function StatsBars() {
  return (
    <React.Fragment>
      <ScreenHeader title="Listening" subtitle="Last 30 days" right={<div style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--sm-line-strong)', background: 'var(--sm-surface)', display: 'grid', placeItems: 'center' }}><Icon name="clock" size={19} color="var(--sm-text-2)" /></div>} />
      <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '4px 16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 16 }}>
          <StatTile2 big="31h" label="Listened" />
          <StatTile2 big="312" label="Swipes" />
          <StatTile2 big="38%" label="Like rate" />
          <StatTile2 big={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="flame" size={20} color="var(--sm-accent)" fill />12</span>} label="Day streak" />
        </div>
        <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: 18 }}>
          <div className="sm-eyebrow" style={{ marginBottom: 16 }}>Top genres</div>
          {STATS.topGenres.map(g => (
            <div key={g.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13.5, gap: 10 }}><span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{g.name}</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--sm-text-3)', flexShrink: 0 }}>{g.pct}%</span></div>
              <div style={{ height: 7, borderRadius: 4, background: 'var(--sm-surface-3)', overflow: 'hidden' }}><div style={{ width: g.pct + '%', height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--sm-accent), oklch(0.6 0.13 300))' }} /></div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

function StatsWrapped() {
  const donut = 'conic-gradient(var(--sm-accent) 0 62%, oklch(0.6 0.13 296) 62% 86%, oklch(0.55 0.1 248) 86% 100%)';
  return (
    <React.Fragment>
      <ScreenHeader title="Your sound" subtitle="2026 · so far" />
      <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '8px 18px 20px' }}>
        <div style={{ borderRadius: 22, padding: '26px 20px', background: 'linear-gradient(155deg, oklch(0.30 0.08 322), oklch(0.20 0.05 300))', border: '1px solid var(--sm-accent-line)', marginBottom: 16 }}>
          <div className="sm-eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>Minutes listened</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, lineHeight: 1, color: '#fff' }}>1,840</div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', marginTop: 12 }}>That’s ~31 hours deep in the low-end. Top 4% of liquid listeners.</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 18, padding: 18, marginBottom: 16 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: donut, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--sm-surface)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 15 }}>3</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Genre split</div>
            {[['Atmospheric DnB', 'var(--sm-accent)', 62], ['Liquid', 'oklch(0.6 0.13 296)', 24], ['Ambient', 'oklch(0.55 0.1 248)', 14]].map(([n, c, p]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, flex: 1, whiteSpace: 'nowrap' }}>{n}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-3)' }}>{p}%</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 11 }}>
          <div style={{ flex: 1, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: 16 }}>
            <div className="sm-eyebrow" style={{ marginBottom: 10 }}>On repeat</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, lineHeight: 1.15 }}>So Long</div>
            <div style={{ fontSize: 12, color: 'var(--sm-text-3)', marginTop: 4 }}>Seba · 41 plays</div>
          </div>
          <div style={{ flex: 1, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: 16 }}>
            <div className="sm-eyebrow" style={{ marginBottom: 10 }}>Era</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>1996–2003</div>
            <div style={{ fontSize: 12, color: 'var(--sm-text-3)', marginTop: 4 }}>Golden age</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function StatsProfile() {
  const spectrum = [['Energy', 42], ['Warmth', 78], ['Depth', 88], ['Tempo', 71], ['Vocal', 22]];
  const artists = [['Seba', 'SE', 322, 64], ['LTJ Bukem', 'LB', 248, 48], ['Big Bud', 'BB', 268, 37], ['Wax Doctor', 'WD', 16, 21]];
  return (
    <React.Fragment>
      <ScreenHeader title="Taste profile" subtitle="How you listen" />
      <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '4px 16px 20px' }}>
        <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 18, padding: 18, marginBottom: 16 }}>
          <div className="sm-eyebrow" style={{ marginBottom: 18 }}>Your spectrum</div>
          {spectrum.map(([n, v]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 13 }}>
              <span style={{ width: 56, fontSize: 12.5, color: 'var(--sm-text-2)', flexShrink: 0 }}>{n}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 5, background: 'var(--sm-surface-3)', overflow: 'hidden' }}><div style={{ width: v + '%', height: '100%', borderRadius: 5, background: 'var(--sm-accent)' }} /></div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-3)', width: 26, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="sm-eyebrow" style={{ margin: '4px 4px 12px' }}>Top artists</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {artists.map(([n, m, h, plays], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 14, padding: '11px 14px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--sm-text-3)', width: 16 }}>{i + 1}</span>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(150deg, oklch(0.5 0.12 ${h}), oklch(0.26 0.06 ${h + 18}))`, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: '#fff' }}>{m}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--sm-text-3)', marginTop: 1 }}>{plays} plays</div></div>
              <Icon name="chevron" size={17} color="var(--sm-text-3)" />
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, {
  Phone, FauxTab, FooterBtn,
  OnbChips, OnbTiles, OnbDials,
  StatsBars, StatsWrapped, StatsProfile, StatTile2, LIKED4
});
