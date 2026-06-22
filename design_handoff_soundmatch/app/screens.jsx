/* SoundMatch — Liked, Profile/Settings, Onboarding → window */

const { useState: useStateS, useEffect: useEffectS } = React;

/* ================================================================
   LIKED  (playlist-style + Spotify export)
================================================================ */
function ExportButton({ count }) {
  const [state, setState] = useStateS('idle'); // idle | working | done
  function run() {
    if (state !== 'idle') return;
    setState('working');
    setTimeout(() => setState('done'), 1400);
  }
  return (
    <button className="sm-tap" onClick={run} disabled={state !== 'idle'} style={{
      width: '100%', border: 'none', borderRadius: 16, padding: '15px 18px', cursor: state === 'idle' ? 'pointer' : 'default',
      background: state === 'done' ? 'var(--sm-surface-3)' : 'var(--sm-spotify)',
      color: state === 'done' ? 'var(--sm-text)' : '#06210f',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, whiteSpace: 'nowrap',
      fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15,
      boxShadow: state === 'done' ? 'none' : '0 10px 26px -12px rgba(30,215,96,0.6)'
    }}>
      {state === 'idle' && <React.Fragment><SpotifyGlyph size={19} /> Export to Spotify</React.Fragment>}
      {state === 'working' && <React.Fragment><span style={{ width: 17, height: 17, border: '2.4px solid rgba(6,33,15,0.35)', borderTopColor: '#06210f', borderRadius: '50%', display: 'inline-block', animation: 'sm-spin 0.7s linear infinite' }} /> Creating playlist…</React.Fragment>}
      {state === 'done' && <React.Fragment><Icon name="check" size={18} color="var(--sm-spotify)" stroke={2.6} /> Saved · {count} tracks in Spotify</React.Fragment>}
    </button>
  );
}

function LikedRow({ track, dense, playing, onPlay, openInfo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: dense ? 11 : 13, padding: dense ? '8px 4px' : '9px 4px' }}>
      <Icon name="grip" size={18} color="var(--sm-text-3)" style={{ opacity: 0.5, flexShrink: 0 }} />
      <CoverArt track={track} size={dense ? 42 : 50} radius={dense ? 9 : 11} />
      <div style={{ flex: 1, minWidth: 0 }} onClick={() => openInfo(track)}>
        <div style={{ fontSize: dense ? 14 : 15, fontWeight: 600, color: 'var(--sm-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--sm-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
          {track.artist} · {track.duration}
        </div>
      </div>
      {playing && <Eq active />}
      <button className="sm-tap" onClick={() => onPlay(track.id)} aria-label={playing ? 'Pause' : 'Play preview'} style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: playing ? 'var(--sm-accent)' : 'var(--sm-surface-3)',
        color: playing ? 'var(--sm-accent-ink)' : 'var(--sm-text)',
        border: `1px solid ${playing ? 'transparent' : 'var(--sm-line-strong)'}`, display: 'grid', placeItems: 'center'
      }}>
        <Icon name={playing ? 'pause' : 'play'} size={15} fill color="currentColor" style={{ marginLeft: playing ? 0 : 1.5 }} />
      </button>
    </div>
  );
}

function LikedScreen({ liked, openInfo, layout }) {
  const [playing, setPlaying] = useStateS(null);
  const dense = layout === 'compact';
  const grid = layout === 'grid';
  const totalMin = liked.reduce((a, t) => a + parseInt(t.duration), 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Liked" subtitle={`${liked.length} tracks you fell for`} right={
        <button className="sm-tap" style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--sm-line-strong)', background: 'var(--sm-surface)', color: 'var(--sm-text-2)', display: 'grid', placeItems: 'center' }} aria-label="Shuffle">
          <Icon name="sparkle" size={19} />
        </button>
      } />

      <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px' }}>
        {liked.length === 0 ? (
          <div style={{ height: '70%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--sm-surface-2)', border: '1px solid var(--sm-line)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <Icon name="heart" size={26} color="var(--sm-text-3)" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 7 }}>No likes yet</div>
              <div style={{ color: 'var(--sm-text-3)', fontSize: 13.5, lineHeight: 1.5, maxWidth: '24ch', margin: '0 auto' }}>Swipe right on Discover and your matches land here.</div>
            </div>
          </div>
        ) : (
          <React.Fragment>
            {/* playlist header card */}
            <div style={{ display: 'flex', gap: 15, alignItems: 'center', padding: '14px 14px 16px', marginBottom: 14, borderRadius: 'var(--r-lg)', background: 'var(--sm-surface)', border: '1px solid var(--sm-line)' }}>
              <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
                {liked.slice(0, 4).map((t, i) => (
                  <div key={t.id} style={{ position: 'absolute', top: i * 4, left: i * 4, width: 60, height: 60 }}>
                    <CoverArt track={t} size={60} radius={10} />
                  </div>
                ))}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.15 }}>Your SoundMatch Mix</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-3)', marginTop: 7, letterSpacing: '0.04em' }}>{liked.length} TRACKS · ~{totalMin} MIN</div>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}><ExportButton count={liked.length} /></div>

            {grid ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {liked.map(t => (
                  <div key={t.id} className="sm-tap" onClick={() => openInfo(t)} style={{ position: 'relative' }}>
                    <CoverArt track={t} size="100%" radius={14} />
                    <button className="sm-tap" onClick={(e) => { e.stopPropagation(); setPlaying(p => p === t.id ? null : t.id); }} style={{
                      position: 'absolute', right: 8, bottom: 8, width: 36, height: 36, borderRadius: '50%', border: 'none',
                      background: playing === t.id ? 'var(--sm-accent)' : 'rgba(12,8,18,0.6)', backdropFilter: 'blur(8px)',
                      color: playing === t.id ? 'var(--sm-accent-ink)' : '#fff', display: 'grid', placeItems: 'center' }}>
                      <Icon name={playing === t.id ? 'pause' : 'play'} size={14} fill color="currentColor" style={{ marginLeft: playing === t.id ? 0 : 1.5 }} />
                    </button>
                    <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--sm-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.artist}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {liked.map((t, i) => (
                  <React.Fragment key={t.id}>
                    {i > 0 && <div style={{ height: 1, background: 'var(--sm-line)', margin: dense ? '0 0 0 60px' : '0 0 0 70px' }} />}
                    <LikedRow track={t} dense={dense} playing={playing === t.id} onPlay={(id) => setPlaying(p => p === id ? null : id)} openInfo={openInfo} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   PROFILE  (stats + settings)
================================================================ */
function StatTile({ big, label }) {
  return (
    <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: '16px 16px 14px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 25, color: 'var(--sm-text)', lineHeight: 1 }}>{big}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sm-text-3)', marginTop: 9 }}>{label}</div>
    </div>
  );
}

function SettingsRow({ icon, label, detail, control, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: last ? 'none' : '1px solid var(--sm-line)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--sm-accent-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={17} color="var(--sm-accent)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, color: 'var(--sm-text)', fontWeight: 500 }}>{label}</div>
        {detail && <div style={{ fontSize: 12, color: 'var(--sm-text-3)', marginTop: 1 }}>{detail}</div>}
      </div>
      {control || <Icon name="chevron" size={18} color="var(--sm-text-3)" />}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button className="sm-tap" onClick={() => onChange(!on)} style={{
      width: 46, height: 28, borderRadius: 999, border: 'none', padding: 3, flexShrink: 0,
      background: on ? 'var(--sm-accent)' : 'var(--sm-surface-3)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 0.2s'
    }} aria-pressed={on}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
    </button>
  );
}

function ProfileScreen({ stats, likedCount, onReplayOnboarding }) {
  const [tab, setTab] = useStateS('stats');
  const [autoplay, setAutoplay] = useStateS(true);
  const [hiq, setHiq] = useStateS(false);
  const [notif, setNotif] = useStateS(true);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Profile" subtitle="Sebastian · Member since 2026" right={
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(150deg, var(--sm-accent), oklch(0.5 0.13 300))', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--sm-accent-ink)' }}>S</div>
      } />

      {/* segmented */}
      <div style={{ padding: '4px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 12, padding: 4, gap: 4 }}>
          {['stats', 'settings'].map(t => (
            <button key={t} className="sm-tap" onClick={() => setTab(t)} style={{
              flex: 1, border: 'none', borderRadius: 9, padding: '9px 0', textTransform: 'capitalize',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13.5,
              background: tab === t ? 'var(--sm-surface-3)' : 'transparent',
              color: tab === t ? 'var(--sm-text)' : 'var(--sm-text-3)'
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '0 16px 24px' }}>
        {tab === 'stats' ? (
          <React.Fragment>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 18 }}>
              <StatTile big={likedCount} label="Tracks liked" />
              <StatTile big={`${stats.likeRate}%`} label="Like rate" />
              <StatTile big={`${(stats.minutes / 60).toFixed(0)}h`} label="Listened" />
              <StatTile big={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="flame" size={20} color="var(--sm-accent)" fill />{stats.streak}</span>} label="Day streak" />
            </div>

            <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: 18, marginBottom: 18 }}>
              <div className="sm-eyebrow" style={{ marginBottom: 16 }}>Your top genres</div>
              {stats.topGenres.map(g => (
                <div key={g.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13.5, gap: 10 }}>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{g.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--sm-text-3)', flexShrink: 0 }}>{g.pct}%</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 4, background: 'var(--sm-surface-3)', overflow: 'hidden' }}>
                    <div style={{ width: `${g.pct}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--sm-accent), oklch(0.6 0.13 300))' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 11 }}>
              <div style={{ flex: 1, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: '16px' }}>
                <div className="sm-eyebrow" style={{ marginBottom: 9 }}>Era</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{stats.decade}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, padding: '16px' }}>
                <div className="sm-eyebrow" style={{ marginBottom: 9 }}>Total swipes</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{stats.swipes}</div>
              </div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="sm-eyebrow" style={{ margin: '4px 4px 10px' }}>Playback</div>
            <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
              <SettingsRow icon="play" label="Autoplay previews" detail="Start audio as each card appears" control={<Toggle on={autoplay} onChange={setAutoplay} />} />
              <SettingsRow icon="sparkle" label="High-quality preview" detail="Uses more data" control={<Toggle on={hiq} onChange={setHiq} />} last />
            </div>

            <div className="sm-eyebrow" style={{ margin: '4px 4px 10px' }}>Connections</div>
            <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
              <SettingsRow icon="sparkle" label="Spotify" detail="Connected · sebastian" control={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-spotify)', letterSpacing: '0.08em' }}>LINKED</span>} />
              <SettingsRow icon="heart" label="Notifications" detail="New stacks &amp; fresh matches" control={<Toggle on={notif} onChange={setNotif} />} last />
            </div>

            <div className="sm-eyebrow" style={{ margin: '4px 4px 10px' }}>Taste</div>
            <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
              <SettingsRow icon="sliders" label="Re-tune my taste" detail="Redo the onboarding setup" control={<Icon name="chevron" size={18} color="var(--sm-text-3)" />} />
              <div className="sm-tap" onClick={onReplayOnboarding}><SettingsRow icon="discover" label="Genres &amp; moods" detail="Atmospheric DnB, Liquid +3" last /></div>
            </div>

            <button className="sm-tap" style={{ width: '100%', border: '1px solid var(--sm-line-strong)', background: 'transparent', color: 'var(--sm-nope)', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14.5 }}>Sign out</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   ONBOARDING
================================================================ */
const ONB_GENRES = ['Atmospheric DnB', 'Liquid', 'Ambient', 'Jazzy', 'Soulful', 'Deep', 'Classic', 'Funk', 'Melodic'];

function OnboardingFlow({ onDone }) {
  const [step, setStep] = useStateS(0);
  const [genres, setGenres] = useStateS(['Atmospheric DnB', 'Liquid']);
  const [adventure, setAdventure] = useStateS(60);
  const [energy, setEnergy] = useStateS(40);
  const steps = 4;

  const toggle = (g) => setGenres(s => s.includes(g) ? s.filter(x => x !== g) : [...s, g]);
  const next = () => step < steps - 1 ? setStep(step + 1) : onDone();

  const Slider = ({ value, onChange, left, right }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        <span>{left}</span><span>{right}</span>
      </div>
      <input type="range" min="0" max="100" value={value} onChange={e => onChange(+e.target.value)} className="sm-range" />
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '54px 24px 28px', background: 'radial-gradient(120% 70% at 50% -10%, var(--sm-bg-grad), transparent 60%)' }}>
      {/* progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40, flexShrink: 0 }}>
        {Array.from({ length: steps }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--sm-accent)' : 'var(--sm-surface-3)', transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: step === 0 ? 'center' : 'flex-start' }}>
        {step === 0 && (
          <div style={{ animation: 'none' }}>
            <div style={{ width: 60, height: 60, borderRadius: 17, background: 'linear-gradient(150deg, var(--sm-accent), oklch(0.55 0.14 318))', display: 'grid', placeItems: 'center', marginBottom: 30, boxShadow: '0 14px 40px -10px var(--sm-accent-soft)' }}>
              <Eq active h={22} color="var(--sm-accent-ink)" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 1.12, letterSpacing: '0.01em', marginBottom: 18 }}>SOUND<span style={{ color: 'var(--sm-accent)' }}>MATCH</span></div>
            <div style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--sm-text-2)', maxWidth: '28ch' }}>Swipe through songs like you’d swipe through dates. Heart the ones you love — build a mix of perfect matches.</div>
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: 'none' }}>
            <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Step 2 · Your sound</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.2, marginBottom: 10 }}>What are you into?</div>
            <div style={{ fontSize: 14.5, color: 'var(--sm-text-3)', marginBottom: 26 }}>Pick a few — we’ll tune your first stack.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ONB_GENRES.map(g => {
                const on = genres.includes(g);
                return (
                  <button key={g} className="sm-tap" onClick={() => toggle(g)} style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14, padding: '11px 16px', borderRadius: 999, whiteSpace: 'nowrap',
                    border: `1px solid ${on ? 'var(--sm-accent-line)' : 'var(--sm-line-strong)'}`,
                    background: on ? 'var(--sm-accent-soft)' : 'var(--sm-surface)', color: on ? 'var(--sm-accent)' : 'var(--sm-text-2)'
                  }}>{g}</button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'none' }}>
            <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Step 3 · Calibrate</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.2, marginBottom: 10 }}>Set your taste dials</div>
            <div style={{ fontSize: 14.5, color: 'var(--sm-text-3)', marginBottom: 34 }}>How adventurous should your matches be?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 38 }}>
              <Slider value={adventure} onChange={setAdventure} left="Familiar" right="Adventurous" />
              <Slider value={energy} onChange={setEnergy} left="Mellow" right="Energetic" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'none' }}>
            <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Step 4 · Connect</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.2, marginBottom: 10 }}>Link Spotify</div>
            <div style={{ fontSize: 14.5, color: 'var(--sm-text-3)', marginBottom: 28, lineHeight: 1.5 }}>Play full 30-second previews and export your liked mixes straight to your library.</div>
            <button className="sm-tap" style={{ width: '100%', border: 'none', borderRadius: 14, padding: '15px', background: 'var(--sm-spotify)', color: '#06210f', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
              <SpotifyGlyph size={19} /> Connect Spotify
            </button>
            <div style={{ display: 'flex', gap: 11, padding: 14, borderRadius: 14, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)' }}>
              <CoverArt track={window.SM_TRACKS[0]} size={44} radius={9} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>First up: “So Long”</div>
                <div style={{ fontSize: 12, color: 'var(--sm-text-3)', marginTop: 2 }}>Seba · a {genres[0] || 'liquid'} classic</div>
              </div>
              <Eq active />
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div style={{ flexShrink: 0, paddingTop: 20 }}>
        <button className="sm-tap" onClick={next} style={{ width: '100%', border: 'none', borderRadius: 14, padding: '16px', background: 'var(--sm-accent)', color: 'var(--sm-accent-ink)', fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15.5, boxShadow: '0 12px 30px -12px var(--sm-accent-soft)' }}>
          {step === 0 ? 'Get started' : step === steps - 1 ? 'Start swiping' : 'Continue'}
        </button>
        {step > 0 && step < steps - 1 && (
          <button className="sm-tap" onClick={onDone} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--sm-text-3)', fontFamily: 'var(--font-ui)', fontSize: 13.5, padding: '14px 0 0' }}>Skip for now</button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LikedScreen, ProfileScreen, OnboardingFlow });
