/* SoundMatch — shared UI primitives → window
   Icons, CoverArt, Eq, Chip, BrandedPlayer, SpotifyEmbed */

const { useState, useRef, useEffect } = React;

/* ----------------------------------------------------------------
   Icons
---------------------------------------------------------------- */
const ICON_PATHS = {
  discover: 'M3.5 7.5 12 4l8.5 3.5L12 11 3.5 7.5Zm0 4.5L12 15.5 20.5 12M3.5 16.5 12 20l8.5-3.5',
  heart: 'M12 20.6l-1.32-1.2C5.9 15.05 3 12.42 3 9.2 3 6.6 5.04 4.6 7.6 4.6c1.45 0 2.84.67 3.75 1.74L12 7.05l.65-.71A4.96 4.96 0 0 1 16.4 4.6C18.96 4.6 21 6.6 21 9.2c0 3.22-2.9 5.85-7.68 10.2L12 20.6z',
  x: 'M6 6l12 12M18 6L6 18',
  info: 'M12 11v6M12 7.5h.01',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  rewind: 'M3 4v6h6M3.5 10a9 9 0 1 1 .8 7',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20c.7-3.5 3.6-5.5 7-5.5s6.3 2 7 5.5',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z|M19.4 13a7.6 7.6 0 0 0 .1-2l1.8-1.4-1.9-3.3-2.2.9a7.5 7.5 0 0 0-1.7-1l-.3-2.3H9.7l-.3 2.3a7.5 7.5 0 0 0-1.7 1l-2.2-.9-1.9 3.3L5.4 11a7.6 7.6 0 0 0 0 2l-1.8 1.4 1.9 3.3 2.2-.9c.5.4 1.1.7 1.7 1l.3 2.3h4.6l.3-2.3c.6-.3 1.2-.6 1.7-1l2.2.9 1.9-3.3L19.4 13Z',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  sliders: 'M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M8 10v4M18 16v4',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7',
  flame: 'M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 .5-1.5 1-2 1 2 2 3 2 5a5 5 0 1 1-10 0c0-4 3.5-5 5-10Z',
  grip: 'M8 7h.01M8 12h.01M8 17h.01M14 7h.01M14 12h.01M14 17h.01'
};

function Icon({ name, size = 22, color = 'currentColor', stroke = 2, fill = false, style }) {
  const d = ICON_PATHS[name] || '';
  const parts = d.split('|');
  if (fill) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
        {parts.map((p, i) => <path key={i} d={p} />)}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {parts.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

function SpotifyGlyph({ size = 16, color = '#06210f' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.62.62 0 01-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 11-.28-1.22c3.81-.87 7.08-.5 9.72 1.11.3.18.39.57.21.86zm1.23-2.74a.78.78 0 01-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 11-.45-1.49c3.63-1.1 8.15-.56 11.24 1.33.36.22.48.69.25 1.07zm.1-2.85C14.43 8.94 9.1 8.76 6.02 9.7a.93.93 0 11-.54-1.79c3.53-1.07 9.42-.86 13.13 1.34a.94.94 0 01-.95 1.61z"/>
    </svg>
  );
}

/* ----------------------------------------------------------------
   Equalizer bars
---------------------------------------------------------------- */
function Eq({ active = true, h = 13, color = 'var(--sm-accent)' }) {
  return (
    <span className="sm-eq" style={{ height: h }}>
      {[0,1,2,3].map(i => (
        <i key={i} style={{
          background: color,
          animationPlayState: active ? 'running' : 'paused',
          height: active ? '100%' : '30%'
        }} />
      ))}
    </span>
  );
}

/* ----------------------------------------------------------------
   Cover art — premium typographic sleeve (no hand-drawn imagery)
---------------------------------------------------------------- */
function monogram(title) {
  const words = title.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.slice(0, 2).toUpperCase();
}

/* ----------------------------------------------------------------
   Cover art — real album artwork, with a premium typographic fallback
   • track.cover  → hardcoded URL (used as-is, guaranteed)
   • track.q      → looked up once at runtime via the iTunes artwork API
                    (JSONP; validated against track.artistMatch)
   • otherwise    → typographic sleeve (monogram / hero title)
---------------------------------------------------------------- */
const SM_COVER_CACHE = {};      // id -> url | 'fail'
const SM_COVER_WAIT = {};       // id -> [setUrl,...]

function smFetchCover(track) {
  return new Promise((resolve) => {
    const cb = 'sm_itunes_' + Math.random().toString(36).slice(2);
    const s = document.createElement('script');
    let done = false;
    const cleanup = () => { try { delete window[cb]; s.remove(); } catch (e) {} };
    window[cb] = (data) => {
      done = true;
      let url = null;
      try {
        const results = (data && data.results) || [];
        const want = (track.artistMatch || '').toLowerCase();
        const hit = results.find(r => (r.artistName || '').toLowerCase().includes(want)) || null;
        if (hit && hit.artworkUrl100) url = hit.artworkUrl100.replace('100x100bb', '600x600bb');
      } catch (e) {}
      cleanup(); resolve(url);
    };
    s.onerror = () => { if (!done) { cleanup(); resolve(null); } };
    s.src = 'https://itunes.apple.com/search?term=' + encodeURIComponent(track.q) + '&entity=song&limit=6&callback=' + cb;
    document.body.appendChild(s);
    setTimeout(() => { if (!done) { cleanup(); resolve(null); } }, 6000);
  });
}

function useCover(track) {
  const cached = SM_COVER_CACHE[track.id];
  const initial = track.cover
    || (typeof cached === 'string' && cached.startsWith('http') ? cached : null);
  const [url, setUrl] = useState(initial);

  useEffect(() => {
    if (track.cover) { setUrl(track.cover); return; }
    if (!track.q) return;
    const c = SM_COVER_CACHE[track.id];
    if (typeof c === 'string' && c.startsWith('http')) { setUrl(c); return; }
    if (c === 'fail') return;
    if (c === 'pending') { (SM_COVER_WAIT[track.id] = SM_COVER_WAIT[track.id] || []).push(setUrl); return; }
    SM_COVER_CACHE[track.id] = 'pending';
    SM_COVER_WAIT[track.id] = [setUrl];
    smFetchCover(track).then((u) => {
      SM_COVER_CACHE[track.id] = u || 'fail';
      (SM_COVER_WAIT[track.id] || []).forEach(fn => fn(u || null));
      SM_COVER_WAIT[track.id] = [];
    });
  }, [track.id]);

  return url;
}

function CoverImg({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img src={src} alt={alt} onLoad={() => setLoaded(true)} draggable="false"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        opacity: loaded ? 1 : 0, transition: 'opacity 0.45s ease', userSelect: 'none' }} />
  );
}

function CoverArt({ track, size = '100%', radius = 18, hero = false }) {
  const cover = useCover(track);
  const h = track.hue;
  const bg = `linear-gradient(150deg, oklch(0.46 0.135 ${h}) 0%, oklch(0.24 0.07 ${h + 14}) 80%)`;
  return (
    <div style={{
      width: size, aspectRatio: '1 / 1', borderRadius: radius, position: 'relative',
      overflow: 'hidden', background: bg, flexShrink: 0,
      containerType: 'inline-size',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)'
    }}>
      {/* typographic sleeve — always rendered as the base / fallback */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'soft-light',
        background: `repeating-linear-gradient(115deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 13px)`
      }} />
      <div style={{
        position: 'absolute', width: '75%', height: '75%', right: '-14%', top: '-14%',
        background: `radial-gradient(circle, oklch(0.72 0.16 ${h} / 0.55), transparent 70%)`,
        filter: 'blur(6px)'
      }} />
      {hero ? (
        <div style={{ position: 'absolute', inset: 0, padding: '9% 10%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3.4cqw', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase' }}>
            {track.catalog}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1.02,
            fontSize: '12cqw', letterSpacing: '0.005em', textShadow: '0 2px 16px rgba(0,0,0,0.4)'
          }}>{track.title}</div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-display)', color: 'rgba(255,255,255,0.92)',
            fontSize: '34cqw', letterSpacing: '0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.35)'
          }}>{monogram(track.title)}</span>
        </div>
      )}
      {/* real artwork — fades in over the sleeve when available */}
      {cover && <CoverImg src={cover} alt={track.title + ' cover'} />}
    </div>
  );
}

/* ----------------------------------------------------------------
   Chip / Tag
---------------------------------------------------------------- */
function Tag({ children, accent = false }) {
  return (
    <span style={{
      fontSize: 12.5, fontWeight: 500, padding: '7px 12px', borderRadius: 999,
      whiteSpace: 'nowrap',
      background: accent ? 'var(--sm-accent-soft)' : 'var(--sm-surface-3)',
      color: accent ? 'var(--sm-accent)' : 'var(--sm-text-2)',
      border: `1px solid ${accent ? 'var(--sm-accent-line)' : 'var(--sm-line)'}`
    }}>{children}</span>
  );
}

/* ----------------------------------------------------------------
   Branded 30-second preview player (simulated)
---------------------------------------------------------------- */
function fmt(s) { const m = Math.floor(s / 60); const r = Math.floor(s % 60); return `${m}:${r.toString().padStart(2, '0')}`; }

function BrandedPlayer({ track, compact = false }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef(null);
  const last = useRef(null);
  const DUR = 30;

  useEffect(() => {
    if (!playing) { last.current = null; return; }
    const tick = (now) => {
      if (last.current == null) last.current = now;
      const dt = (now - last.current) / 1000; last.current = now;
      setT(prev => {
        const next = prev + dt;
        if (next >= DUR) { setPlaying(false); return 0; }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  const pct = (t / DUR) * 100;

  return (
    <div style={{
      background: 'var(--sm-surface-2)', border: '1px solid var(--sm-line)',
      borderRadius: 16, padding: compact ? '10px 12px' : '13px 15px',
      display: 'flex', alignItems: 'center', gap: 13
    }}>
      <button className="sm-tap" onClick={() => setPlaying(p => !p)} style={{
        width: compact ? 38 : 46, height: compact ? 38 : 46, borderRadius: '50%', flexShrink: 0,
        background: 'var(--sm-accent)', color: 'var(--sm-accent-ink)', border: 'none',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 6px 18px -8px var(--sm-accent-soft)'
      }} aria-label={playing ? 'Pause preview' : 'Play preview'}>
        <Icon name={playing ? 'pause' : 'play'} size={compact ? 15 : 18} fill color="currentColor" style={{ marginLeft: playing ? 0 : 2 }} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-2)', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {playing || t > 0 ? '30-SEC PREVIEW' : 'TAP TO PREVIEW'} · {fmt(t)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-3)' }}>0:30</span>
        </div>
        <div style={{ height: 4, borderRadius: 3, background: 'var(--sm-line-strong)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, right: `${100 - pct}%`, background: 'var(--sm-accent)', borderRadius: 3, transition: playing ? 'none' : 'right 0.2s' }} />
        </div>
      </div>
      {!compact && <Eq active={playing} />}
    </div>
  );
}

/* ----------------------------------------------------------------
   Real Spotify embed (dark theme=0), framed in aubergine
---------------------------------------------------------------- */
function SpotifyEmbed({ track, height = 152 }) {
  if (!track.spotifyId) {
    return (
      <div style={{
        borderRadius: 16, border: '1px dashed var(--sm-line-strong)', padding: '16px',
        background: 'var(--sm-surface)', fontFamily: 'var(--font-mono)', fontSize: 11.5,
        color: 'var(--sm-text-3)', lineHeight: 1.5, textAlign: 'center'
      }}>
        REAL SPOTIFY EMBED UNAVAILABLE FOR THIS SAMPLE TRACK — USING BRANDED PREVIEW
      </div>
    );
  }
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', border: '1px solid var(--sm-line-strong)',
      background: '#000', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)'
    }}>
      <iframe
        title={`Spotify · ${track.title}`}
        style={{ borderRadius: 16, display: 'block' }}
        src={`https://open.spotify.com/embed/track/${track.spotifyId}?utm_source=generator&theme=0`}
        width="100%" height={height} frameBorder="0" loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
    </div>
  );
}

/* Player that respects the global "real embed" preference */
function PreviewPlayer({ track, useReal, compact }) {
  if (useReal && track.spotifyId) return <SpotifyEmbed track={track} height={compact ? 80 : 152} />;
  return <BrandedPlayer track={track} compact={compact} />;
}

/* ----------------------------------------------------------------
   Screen header (brand row + large title)
---------------------------------------------------------------- */
function ScreenHeader({ title, subtitle, right }) {
  return (
    <div style={{ padding: '8px 18px 10px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {subtitle && <div className="sm-eyebrow" style={{ marginBottom: 7 }}>{subtitle}</div>}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '0.01em', lineHeight: 1 }}>{title}</div>
        </div>
        {right}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, SpotifyGlyph, Eq, CoverArt, Tag, BrandedPlayer, SpotifyEmbed, PreviewPlayer, fmt, ScreenHeader, monogram
});
