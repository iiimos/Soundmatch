/* SoundMatch — root App: tab bar, state, tweaks, info overlay → mounts */

const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "oklch(0.73 0.122 322)",
  "cardLayout": "classic",
  "infoStyle": "sheet",
  "likedLayout": "list",
  "realEmbed": false
}/*EDITMODE-END*/;

function TabBar({ active, onChange, likedCount }) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: 'discover' },
    { id: 'liked', label: 'Liked', icon: 'heart', badge: likedCount },
    { id: 'profile', label: 'Profile', icon: 'user' }
  ];
  return (
    <div style={{
      flexShrink: 0, display: 'flex', padding: '10px 14px 24px', gap: 6,
      background: 'linear-gradient(to top, var(--sm-bg) 60%, transparent)',
      borderTop: '1px solid var(--sm-line)'
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} className="sm-tap" onClick={() => onChange(t.id)} style={{
            flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5, padding: '6px 0', position: 'relative'
          }}>
            <div style={{ position: 'relative' }}>
              <Icon name={t.icon} size={24} color={on ? 'var(--sm-accent)' : 'var(--sm-text-3)'} fill={t.icon === 'heart' && on} stroke={t.icon === 'heart' ? 2 : 2} />
              {t.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -9, minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 999, background: 'var(--sm-accent)', color: 'var(--sm-accent-ink)',
                  fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, display: 'grid', placeItems: 'center',
                  border: '2px solid var(--sm-bg)'
                }}>{t.badge}</span>
              )}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em', color: on ? 'var(--sm-text)' : 'var(--sm-text-3)' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [phase, setPhase] = useStateA('onboarding'); // 'onboarding' | 'app'
  const [tab, setTab] = useStateA('discover');
  const [liked, setLiked] = useStateA([]);
  const [infoTrack, setInfoTrack] = useStateA(null);

  // apply accent
  useEffectA(() => {
    document.documentElement.style.setProperty('--sm-accent', t.accent);
  }, [t.accent]);

  const tracks = window.SM_TRACKS;
  const openInfo = (track) => setInfoTrack(track);

  const onLike = (track) => setLiked(L => L.find(x => x.id === track.id) ? L : [...L, track]);
  const onPass = () => {};
  const onRewind = (last) => { if (last.dir === 'right') setLiked(L => L.filter(x => x.id !== last.track.id)); };

  const ambient = {
    height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
    background: `radial-gradient(120% 60% at 50% -6%, var(--sm-bg-grad) 0%, transparent 52%), var(--sm-bg)`
  };

  return (
    <div className="sm-root" style={ambient}>
      {phase === 'onboarding' ? (
        <OnboardingFlow onDone={() => setPhase('app')} />
      ) : (
        <React.Fragment>
          <div style={{ flex: '1 1 0', minHeight: 0, paddingTop: 48, display: 'flex', flexDirection: 'column' }}>
            {tab === 'discover' && (
              <DiscoverScreen
                tracks={tracks} onLike={onLike} onPass={onPass} onRewind={onRewind}
                openInfo={openInfo} layout={t.cardLayout} useReal={t.realEmbed} />
            )}
            {tab === 'liked' && (
              <LikedScreen liked={liked} openInfo={openInfo} layout={t.likedLayout} />
            )}
            {tab === 'profile' && (
              <ProfileScreen stats={window.SM_STATS} likedCount={liked.length} onReplayOnboarding={() => { setPhase('onboarding'); }} />
            )}
          </div>
          <TabBar active={tab} onChange={setTab} likedCount={liked.length} />
        </React.Fragment>
      )}

      {infoTrack && (
        <InfoSheet track={infoTrack} infoStyle={t.infoStyle} useReal={t.realEmbed} onClose={() => setInfoTrack(null)} />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakColor label="Accent" value={t.accent}
          options={['oklch(0.73 0.122 322)', 'oklch(0.70 0.13 285)', 'oklch(0.68 0.16 350)', 'oklch(0.75 0.10 220)']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Swipe card" />
        <TweakRadio label="Layout" value={t.cardLayout}
          options={['classic', 'fullbleed', 'framed']}
          onChange={(v) => setTweak('cardLayout', v)} />
        <TweakSection label="Info panel" />
        <TweakRadio label="Style" value={t.infoStyle}
          options={['sheet', 'full']}
          onChange={(v) => setTweak('infoStyle', v)} />
        <TweakSection label="Liked tab" />
        <TweakRadio label="Layout" value={t.likedLayout}
          options={['list', 'compact', 'grid']}
          onChange={(v) => setTweak('likedLayout', v)} />
        <TweakSection label="Preview" />
        <TweakToggle label="Real Spotify embed" value={t.realEmbed}
          onChange={(v) => setTweak('realEmbed', v)} />
        <TweakButton label="Replay onboarding" onClick={() => setPhase('onboarding')} />
      </TweaksPanel>
    </div>
  );
}

function Root() {
  return (
    <IOSDevice dark>
      <App />
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
