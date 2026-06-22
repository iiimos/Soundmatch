/* SoundMatch — Discover (swipe deck) + Info sheet → window */

const { useState: useStateD, useRef: useRefD, useEffect: useEffectD } = React;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* ----------------------------------------------------------------
   Song card (3 layout variants)
---------------------------------------------------------------- */
function SongCard({ track, layout, useReal, openInfo, glow, interactive }) {
  const likeA = glow ? glow.like : 0;
  const nopeA = glow ? glow.nope : 0;

  const InfoBtn = (
    <button data-nodrag className="sm-tap" onClick={() => openInfo && openInfo(track)} aria-label="Track info" style={{
      width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--sm-line-strong)',
      background: 'rgba(20,14,28,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      color: 'var(--sm-text)', display: 'grid', placeItems: 'center', flexShrink: 0
    }}>
      <Icon name="info" size={20} />
    </button>
  );

  const MatchBadge = (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px 7px 10px',
      borderRadius: 999, background: 'rgba(20,14,28,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid var(--sm-accent-line)'
    }}>
      <Icon name="sparkle" size={14} color="var(--sm-accent)" fill />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--sm-accent)', letterSpacing: '0.04em' }}>{track.matchPct}% MATCH</span>
    </div>
  );

  const TitleBlock = ({ onLight }) => (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 23, lineHeight: 1.1, color: onLight ? '#fff' : 'var(--sm-text)', letterSpacing: '0.005em' }}>
        {track.title}
      </div>
      <div style={{ marginTop: 7, fontSize: 14.5, color: onLight ? 'rgba(255,255,255,0.82)' : 'var(--sm-text-2)', fontWeight: 500 }}>
        {track.artist}{track.feat ? <span style={{ opacity: 0.7 }}> · feat. {track.feat}</span> : null}
      </div>
      <div style={{ marginTop: 2, fontSize: 13, color: onLight ? 'rgba(255,255,255,0.6)' : 'var(--sm-text-3)' }}>
        {track.album} · {track.year}
      </div>
    </div>
  );

  const GlowLayer = (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: 'radial-gradient(120% 80% at 0% 50%, var(--sm-like-glow), transparent 60%)', opacity: likeA, transition: 'opacity 0.08s' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: 'radial-gradient(120% 80% at 100% 50%, var(--sm-nope-glow), transparent 60%)', opacity: nopeA, transition: 'opacity 0.08s' }} />
      {likeA > 0.15 && (
        <div style={{ position: 'absolute', top: 26, left: 22, zIndex: 6, transform: `rotate(-13deg) scale(${0.8 + likeA * 0.3})`, opacity: clamp(likeA * 1.4, 0, 1),
          fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--sm-like)', border: '3px solid var(--sm-like)', borderRadius: 12, padding: '4px 14px', letterSpacing: '0.04em' }}>LIKE</div>
      )}
      {nopeA > 0.15 && (
        <div style={{ position: 'absolute', top: 26, right: 22, zIndex: 6, transform: `rotate(13deg) scale(${0.8 + nopeA * 0.3})`, opacity: clamp(nopeA * 1.4, 0, 1),
          fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--sm-nope)', border: '3px solid var(--sm-nope)', borderRadius: 12, padding: '4px 14px', letterSpacing: '0.04em' }}>NOPE</div>
      )}
    </React.Fragment>
  );

  const baseShadow = 'var(--shadow-card)';
  const glowShadow = likeA > 0.02
    ? `${baseShadow}, 0 0 ${30 + likeA * 40}px ${likeA * 4}px var(--sm-like-glow)`
    : nopeA > 0.02
      ? `${baseShadow}, 0 0 ${30 + nopeA * 40}px ${nopeA * 4}px var(--sm-nope-glow)`
      : baseShadow;

  /* ---- FULL-BLEED ---- */
  if (layout === 'fullbleed') {
    return (
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-card)', overflow: 'hidden', background: 'var(--sm-surface)', boxShadow: glowShadow }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <CoverArt track={track} size="100%" radius={0} hero />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,8,18,0.96) 0%, rgba(12,8,18,0.65) 30%, transparent 56%)' }} />
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 5 }}>
          {MatchBadge}{InfoBtn}
        </div>
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{track.tags.slice(0, 3).map(t => <Tag key={t} accent>{t}</Tag>)}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.05, color: '#fff', letterSpacing: '0.005em' }}>{track.title}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.82)', fontWeight: 500, marginTop: -6 }}>
            {track.artist}{track.feat ? ` · feat. ${track.feat}` : ''} — {track.album}
          </div>
          <div data-nodrag><PreviewPlayer track={track} useReal={useReal} compact /></div>
        </div>
        {GlowLayer}
      </div>
    );
  }

  /* ---- FRAMED ---- */
  if (layout === 'framed') {
    return (
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-card)', background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', boxShadow: glowShadow, padding: 18, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>{MatchBadge}{InfoBtn}</div>
        <div style={{ flex: '1 1 0', minHeight: 0, display: 'grid', placeItems: 'center', marginBottom: 16 }}>
          <div style={{ width: '100%', maxWidth: 250, padding: 10, borderRadius: 22, background: 'var(--sm-bg)', border: '1px solid var(--sm-line-strong)' }}>
            <CoverArt track={track} size="100%" radius={14} hero />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 14 }}><TitleBlock /></div>
        <div data-nodrag><PreviewPlayer track={track} useReal={useReal} /></div>
        {GlowLayer}
      </div>
    );
  }

  /* ---- CLASSIC (default) ---- */
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-card)', background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', boxShadow: glowShadow, padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: '1 1 0', minHeight: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 286, position: 'relative' }}>
          <CoverArt track={track} size="100%" radius={20} hero />
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {MatchBadge}{InfoBtn}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '16px 2px 12px', gap: 10 }}>
        <TitleBlock />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 120 }}>
          {track.tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
      <div data-nodrag><PreviewPlayer track={track} useReal={useReal} /></div>
      {GlowLayer}
    </div>
  );
}

/* ----------------------------------------------------------------
   Action buttons
---------------------------------------------------------------- */
function ActionRow({ onPass, onLike, onRewind, canRewind }) {
  const btn = (cls, child, fn, extra = {}) => (
    <button className={`sm-act sm-tap ${cls}`} onClick={fn} style={extra.style} disabled={extra.disabled} aria-label={extra.label}>{child}</button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      {btn('nope', <Icon name="x" size={26} color="var(--sm-nope)" stroke={2.6} />, onPass, { label: 'Dislike' })}
      {btn('rewind', <Icon name="rewind" size={20} color={canRewind ? 'var(--sm-text-2)' : 'var(--sm-text-3)'} stroke={2.2} />, onRewind, { label: 'Rewind', disabled: !canRewind, style: { width: 50, height: 50, opacity: canRewind ? 1 : 0.4 } })}
      {btn('like', <Icon name="heart" size={30} color="var(--sm-like)" fill />, onLike, { label: 'Like' })}
    </div>
  );
}

/* ----------------------------------------------------------------
   Swipe deck
---------------------------------------------------------------- */
function SwipeDeck({ tracks, onLike, onPass, openInfo, onRewind, layout, useReal }) {
  const [idx, setIdx] = useStateD(0);
  const [pos, setPos] = useStateD({ x: 0, y: 0 });
  const [spring, setSpring] = useStateD(false);
  const [anim, setAnim] = useStateD(null);     // 'left' | 'right' | null
  const [history, setHistory] = useStateD([]);
  const drag = useRefD(null);
  const threshold = 105;

  const atEnd = idx >= tracks.length;

  function commit(dir) {
    setSpring(true); setAnim(dir);
    const t = tracks[idx];
    setTimeout(() => {
      dir === 'right' ? onLike(t) : onPass(t);
      setHistory(h => [...h, { track: t, dir }]);
      setIdx(i => i + 1);
      setPos({ x: 0, y: 0 }); setSpring(false); setAnim(null);
    }, 300);
  }

  function rewind() {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setIdx(i => Math.max(0, i - 1));
    onRewind && onRewind(last);
  }

  function onDown(e) {
    if (atEnd || anim) return;
    if (e.target.closest('[data-nodrag]')) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { x0: e.clientX, y0: e.clientY };
    setSpring(false);
  }
  function onMove(e) {
    if (!drag.current) return;
    setPos({ x: e.clientX - drag.current.x0, y: (e.clientY - drag.current.y0) * 0.4 });
  }
  function onUp() {
    if (!drag.current) return;
    const x = pos.x; drag.current = null;
    if (x > threshold) commit('right');
    else if (x < -threshold) commit('left');
    else { setSpring(true); setPos({ x: 0, y: 0 }); }
  }

  const likeA = anim === 'right' ? 1 : clamp(pos.x / threshold, 0, 1);
  const nopeA = anim === 'left' ? 1 : clamp(-pos.x / threshold, 0, 1);

  let tx = pos.x, ty = pos.y, rot = pos.x * 0.05, op = 1;
  if (anim === 'right') { tx = 620; ty = -50; rot = 24; op = 0; }
  if (anim === 'left') { tx = -620; ty = -50; rot = -24; op = 0; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* deck */}
      <div style={{ position: 'relative', flex: '1 1 0', minHeight: 0, padding: '4px 16px 0' }}>
        {atEnd ? (
          <div style={{ position: 'absolute', inset: '4px 16px 0', borderRadius: 'var(--r-card)', border: '1px dashed var(--sm-line-strong)', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 30 }}>
            <div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sm-accent-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
                <Icon name="check" size={30} color="var(--sm-accent)" stroke={2.4} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, marginBottom: 8 }}>All caught up</div>
              <div style={{ color: 'var(--sm-text-3)', fontSize: 14, lineHeight: 1.5, maxWidth: '26ch', margin: '0 auto 22px' }}>You’ve been through today’s picks. Rewind to reconsider, or check back later for a fresh stack.</div>
              <button className="sm-tap" onClick={() => { setIdx(0); setHistory([]); }} style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14.5, background: 'var(--sm-surface-3)', color: 'var(--sm-text)', border: '1px solid var(--sm-line-strong)', borderRadius: 999, padding: '12px 22px' }}>Replay stack</button>
            </div>
          </div>
        ) : (
          [2, 1, 0].map(off => {
            const t = tracks[idx + off];
            if (!t) return null;
            const isTop = off === 0;
            const scale = 1 - off * 0.05;
            const tyB = off * 14;
            if (isTop) {
              return (
                <div key={t.id + idx} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                  style={{ position: 'absolute', inset: '4px 16px 0', touchAction: 'none', cursor: drag.current ? 'grabbing' : 'grab', zIndex: 3,
                    transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`, opacity: op,
                    transition: spring ? 'transform 0.3s cubic-bezier(.2,.8,.2,1), opacity 0.3s' : 'none' }}>
                  <SongCard track={t} layout={layout} useReal={useReal} openInfo={openInfo} interactive glow={{ like: likeA, nope: nopeA }} />
                </div>
              );
            }
            return (
              <div key={t.id + idx} style={{ position: 'absolute', inset: '4px 16px 0', zIndex: 3 - off,
                transform: `translateY(${tyB}px) scale(${scale})`, opacity: off === 2 ? 0.0 : 0.55,
                transition: 'transform 0.3s ease, opacity 0.3s ease', pointerEvents: 'none', filter: 'saturate(0.85)' }}>
                <SongCard track={t} layout={layout} useReal={false} glow={{ like: 0, nope: 0 }} />
              </div>
            );
          })
        )}
      </div>
      {/* actions */}
      <div style={{ padding: '16px 0 8px', flexShrink: 0 }}>
        <ActionRow
          onPass={() => !atEnd && !anim && commit('left')}
          onLike={() => !atEnd && !anim && commit('right')}
          onRewind={rewind} canRewind={history.length > 0} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Discover screen
---------------------------------------------------------------- */
function DiscoverScreen(props) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Discover" subtitle="Tuned to your late-night listening" right={
        <button className="sm-tap" style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--sm-line-strong)', background: 'var(--sm-surface)', color: 'var(--sm-text-2)', display: 'grid', placeItems: 'center' }} aria-label="Filters">
          <Icon name="sliders" size={20} />
        </button>
      } />
      <div style={{ flex: '1 1 0', minHeight: 0 }}>
        <SwipeDeck {...props} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Info sheet
---------------------------------------------------------------- */
function ArtistPhoto({ track, size = 64 }) {
  const h = track.hue;
  return (
    <div style={{ width: size, height: size, borderRadius: 16, flexShrink: 0, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(150deg, oklch(0.5 0.12 ${h}), oklch(0.26 0.06 ${h + 18}))`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(120deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 9px)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>ARTIST<br />PHOTO</div>
    </div>
  );
}

function DetailRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--sm-line)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sm-text-3)' }}>{k}</span>
      <span style={{ fontSize: 14, color: 'var(--sm-text)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function InfoSheet({ track, infoStyle, useReal, onClose }) {
  const [show, setShow] = useStateD(false);
  useEffectD(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r); }, []);
  if (!track) return null;
  const full = infoStyle === 'full';
  const close = () => { setShow(false); setTimeout(onClose, 260); };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(6,4,10,0.6)', backdropFilter: 'blur(2px)', opacity: show ? 1 : 0, transition: 'opacity 0.26s' }} />
      <div className="sm-noscroll" style={{
        position: 'relative', background: 'var(--sm-surface-2)', borderTopLeftRadius: full ? 0 : 28, borderTopRightRadius: full ? 0 : 28,
        borderRadius: full ? 0 : undefined, height: full ? '100%' : 'auto', maxHeight: full ? '100%' : '90%', overflowY: 'auto',
        boxShadow: 'var(--shadow-sheet)', borderTop: '1px solid var(--sm-line-strong)',
        transform: show ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.32s cubic-bezier(.2,.85,.25,1)',
        paddingBottom: 40
      }}>
        {/* grabber / close */}
        <div style={{ position: 'sticky', top: 0, zIndex: 3, background: 'linear-gradient(var(--sm-surface-2), var(--sm-surface-2) 70%, transparent)', padding: full ? '54px 20px 10px' : '12px 20px 8px' }}>
          {!full && <div style={{ width: 38, height: 4, borderRadius: 3, background: 'var(--sm-line-strong)', margin: '0 auto 14px' }} />}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="sm-eyebrow">Track Info</span>
            <button className="sm-tap" onClick={close} aria-label="Close" style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--sm-line)', background: 'var(--sm-surface-3)', color: 'var(--sm-text-2)', display: 'grid', placeItems: 'center' }}>
              <Icon name="close" size={17} stroke={2.4} />
            </button>
          </div>
        </div>

        <div style={{ padding: '6px 20px 0' }}>
          {/* header */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <CoverArt track={track} size={84} radius={16} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 21, lineHeight: 1.12 }}>{track.title}</div>
              <div style={{ marginTop: 6, fontSize: 14.5, color: 'var(--sm-text-2)', fontWeight: 500 }}>{track.artist}{track.feat ? ` · feat. ${track.feat}` : ''}</div>
            </div>
          </div>

          {/* why recommended */}
          <div style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 16, background: 'var(--sm-accent-soft)', border: '1px solid var(--sm-accent-line)', marginBottom: 22 }}>
            <Icon name="sparkle" size={18} color="var(--sm-accent)" fill style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sm-accent)', marginBottom: 5 }}>Why you’re seeing this</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--sm-text)' }}>{track.why}</div>
            </div>
          </div>

          {/* tags */}
          <div className="sm-eyebrow" style={{ marginBottom: 11 }}>Genre &amp; Mood</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 24 }}>
            {track.tags.map((t, i) => <Tag key={t} accent={i === 0}>{t}</Tag>)}
          </div>

          {/* artist */}
          <div className="sm-eyebrow" style={{ marginBottom: 11 }}>About the artist</div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
            <ArtistPhoto track={track} size={64} />
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--sm-text-2)' }}>{track.bio}</div>
          </div>

          {/* details */}
          <div className="sm-eyebrow" style={{ marginBottom: 4 }}>Release</div>
          <div style={{ marginBottom: 24 }}>
            <DetailRow k="Album" v={track.album} />
            <DetailRow k="Year" v={track.year} />
            <DetailRow k="Label" v={track.label} />
            <DetailRow k="Catalogue" v={track.catalog} />
            <DetailRow k="Tempo" v={`${track.bpm} BPM`} />
            <DetailRow k="Length" v={track.duration} />
          </div>

          {/* listen */}
          <div className="sm-eyebrow" style={{ marginBottom: 11 }}>Listen</div>
          <SpotifyEmbed track={track} height={152} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DiscoverScreen, SwipeDeck, SongCard, InfoSheet });
