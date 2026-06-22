/* SoundMatch — Profile + Info panel variations (static) → window */

const SO = window.SM_TRACKS[0];

/* ---- small shared bits ---- */
function ArtistTile({ hue, size = 64, label = 'ARTIST\nPHOTO', radius = 16 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: 'hidden', position: 'relative', background: `linear-gradient(150deg, oklch(0.5 0.12 ${hue}), oklch(0.26 0.06 ${hue + 18}))`, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(120deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 9px)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.65)', textAlign: 'center', whiteSpace: 'pre-line' }}>{label}</div>
    </div>
  );
}
function DRow({ k, v, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: last ? 'none' : '1px solid var(--sm-line)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sm-text-3)' }}>{k}</span>
      <span style={{ fontSize: 14, color: 'var(--sm-text)', fontWeight: 500 }}>{v}</span>
    </div>
  );
}
function WhyCallout() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 16, background: 'var(--sm-accent-soft)', border: '1px solid var(--sm-accent-line)' }}>
      <Icon name="sparkle" size={18} color="var(--sm-accent)" fill style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sm-accent)', marginBottom: 5 }}>Why you’re seeing this</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--sm-text)' }}>{SO.why}</div>
      </div>
    </div>
  );
}

/* ================================================================
   PROFILE  ×3   (V1 = real ProfileScreen, reused in the canvas)
================================================================ */
function ProfileEditorial() {
  return (
    <React.Fragment>
      <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '20px 20px 24px', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px', background: 'linear-gradient(150deg, var(--sm-accent), oklch(0.5 0.13 300))', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--sm-accent-ink)', boxShadow: '0 16px 40px -14px var(--sm-accent-soft)' }}>S</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Sebastian</div>
        <div className="sm-eyebrow" style={{ marginTop: 8 }}>Member since 2026 · Stockholm</div>
        <div style={{ display: 'inline-flex', gap: 8, marginTop: 16 }}>
          <div style={{ padding: '9px 18px', borderRadius: 999, background: 'var(--sm-surface-3)', border: '1px solid var(--sm-line-strong)', fontSize: 13, fontWeight: 600 }}>Edit profile</div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--sm-surface-3)', border: '1px solid var(--sm-line-strong)', display: 'grid', placeItems: 'center' }}><Icon name="settings" size={17} color="var(--sm-text-2)" /></div>
        </div>

        <div style={{ display: 'flex', marginTop: 26, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--sm-line)', background: 'var(--sm-surface)' }}>
          {[['142', 'Liked'], ['38%', 'Like rate'], ['12', 'Streak']].map(([b, l], i) => (
            <div key={l} style={{ flex: 1, padding: '18px 8px', borderLeft: i ? '1px solid var(--sm-line)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{b}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sm-text-3)', marginTop: 7 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'left', marginTop: 24 }}>
          <div className="sm-eyebrow" style={{ marginBottom: 12 }}>Your top genres</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {['Atmospheric DnB', 'Liquid', 'Ambient', 'Jazzy'].map((g, i) => <Tag key={g} accent={i === 0}>{g}</Tag>)}
          </div>
        </div>

        <div style={{ textAlign: 'left', marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span className="sm-eyebrow">Recent likes</span>
            <span style={{ fontSize: 12, color: 'var(--sm-accent)' }}>See all</span>
          </div>
          <div style={{ display: 'flex', gap: 11 }}>
            {window.SM_TRACKS.slice(0, 4).map(t => <div key={t.id} style={{ flex: 1 }}><CoverArt track={t} size="100%" radius={12} /></div>)}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function ProfileList() {
  const Row = ({ icon, label, detail, control, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: last ? 'none' : '1px solid var(--sm-line)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--sm-accent-soft)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={icon} size={17} color="var(--sm-accent)" /></div>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 500 }}>{label}</div>{detail && <div style={{ fontSize: 12, color: 'var(--sm-text-3)', marginTop: 1 }}>{detail}</div>}</div>
      {control || <Icon name="chevron" size={18} color="var(--sm-text-3)" />}
    </div>
  );
  const Pill = ({ on }) => <div style={{ width: 46, height: 28, borderRadius: 999, padding: 3, background: on ? 'var(--sm-accent)' : 'var(--sm-surface-3)', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff' }} /></div>;
  return (
    <div className="sm-noscroll" style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: '6px 16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', marginBottom: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(150deg, var(--sm-accent), oklch(0.5 0.13 300))', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--sm-accent-ink)' }}>S</div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Sebastian</div><div style={{ fontSize: 12.5, color: 'var(--sm-text-3)', marginTop: 3 }}>@sebastian · 142 likes</div></div>
        <Icon name="chevron" size={18} color="var(--sm-text-3)" />
      </div>

      <div className="sm-eyebrow" style={{ margin: '4px 4px 10px' }}>Taste</div>
      <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <Row icon="sliders" label="Re-tune my taste" detail="Redo onboarding" />
        <Row icon="discover" label="Genres & moods" detail="Atmospheric DnB +3" last />
      </div>

      <div className="sm-eyebrow" style={{ margin: '4px 4px 10px' }}>Playback</div>
      <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <Row icon="play" label="Autoplay previews" control={<Pill on />} />
        <Row icon="sparkle" label="High-quality preview" control={<Pill />} last />
      </div>

      <div className="sm-eyebrow" style={{ margin: '4px 4px 10px' }}>Connections</div>
      <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', borderRadius: 16, overflow: 'hidden' }}>
        <Row icon="sparkle" label="Spotify" detail="Connected · sebastian" control={<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--sm-spotify)', letterSpacing: '0.08em' }}>LINKED</span>} />
        <Row icon="heart" label="Notifications" control={<Pill on />} last />
      </div>
    </div>
  );
}

/* ================================================================
   INFO PANEL  ×3
================================================================ */
function InfoBottomSheet() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* dimmed context */}
      <div style={{ position: 'absolute', inset: 0, padding: '8px 16px 0' }}>
        <div style={{ height: '100%', borderRadius: 'var(--r-card)', background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', filter: 'blur(1px)', opacity: 0.5 }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,4,10,0.6)' }} />
      {/* sheet */}
      <div className="sm-noscroll" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 70, background: 'var(--sm-surface-2)', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTop: '1px solid var(--sm-line-strong)', boxShadow: 'var(--shadow-sheet)', overflowY: 'auto', padding: '12px 20px 30px' }}>
        <div style={{ width: 38, height: 4, borderRadius: 3, background: 'var(--sm-line-strong)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="sm-eyebrow">Track Info</span>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--sm-line)', background: 'var(--sm-surface-3)', display: 'grid', placeItems: 'center' }}><Icon name="close" size={17} color="var(--sm-text-2)" stroke={2.4} /></div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
          <CoverArt track={SO} size={84} radius={16} />
          <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 21 }}>{SO.title}</div><div style={{ marginTop: 6, fontSize: 14.5, color: 'var(--sm-text-2)', fontWeight: 500 }}>{SO.artist} · feat. {SO.feat}</div></div>
        </div>
        <div style={{ marginBottom: 22 }}><WhyCallout /></div>
        <div className="sm-eyebrow" style={{ marginBottom: 11 }}>Genre & Mood</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 24 }}>{SO.tags.map((t, i) => <Tag key={t} accent={i === 0}>{t}</Tag>)}</div>
        <div className="sm-eyebrow" style={{ marginBottom: 11 }}>About the artist</div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}><ArtistTile hue={SO.hue} /><div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--sm-text-2)' }}>{SO.bio}</div></div>
        <div>
          <DRow k="Album" v={SO.album} /><DRow k="Year" v={SO.year} /><DRow k="Label" v={SO.label} /><DRow k="Tempo" v={SO.bpm + ' BPM'} last />
        </div>
      </div>
    </div>
  );
}

function InfoFull() {
  return (
    <div className="sm-noscroll" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ position: 'relative', height: 300 }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg, oklch(0.46 0.135 ${SO.hue}) 0%, oklch(0.24 0.07 ${SO.hue + 14}) 80%)` }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5, mixBlendMode: 'soft-light', background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 13px)' }} />
          <div style={{ position: 'absolute', width: '70%', height: '70%', right: '-12%', top: '-12%', background: `radial-gradient(circle, oklch(0.72 0.16 ${SO.hue} / 0.5), transparent 70%)`, filter: 'blur(8px)' }} />
          {SO.cover && <img src={SO.cover} alt={SO.title + ' cover'} draggable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--sm-surface) 2%, transparent 50%)' }} />
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(12,8,18,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center' }}><Icon name="back" size={20} color="#fff" /></div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(12,8,18,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center' }}><SpotifyGlyph size={18} color="#fff" /></div>
        </div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: '#fff', lineHeight: 1.05 }}>{SO.title}</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.85)', marginTop: 7, fontWeight: 500 }}>{SO.artist} · feat. {SO.feat}</div>
        </div>
      </div>
      <div style={{ padding: '4px 20px 30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, margin: '14px 0 22px' }}>{SO.tags.map((t, i) => <Tag key={t} accent={i === 0}>{t}</Tag>)}</div>
        <div style={{ marginBottom: 22 }}><WhyCallout /></div>
        <div className="sm-eyebrow" style={{ marginBottom: 11 }}>About the artist</div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}><ArtistTile hue={SO.hue} /><div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--sm-text-2)' }}>{SO.bio}</div></div>
        <div><DRow k="Album" v={SO.album} /><DRow k="Year" v={SO.year} /><DRow k="Label" v={SO.label} /><DRow k="Catalogue" v={SO.catalog} /><DRow k="Tempo" v={SO.bpm + ' BPM'} last /></div>
      </div>
    </div>
  );
}

function InfoArtist() {
  return (
    <div className="sm-noscroll" style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ position: 'relative', height: 250 }}>
        <ArtistTile hue={SO.hue} size="100%" radius={0} label={''} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--sm-surface) 3%, rgba(12,8,18,0.1) 60%)' }} />
        <div style={{ position: 'absolute', top: 14, left: 16, width: 38, height: 38, borderRadius: '50%', background: 'rgba(12,8,18,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center' }}><Icon name="back" size={20} color="#fff" /></div>
        <div style={{ position: 'absolute', left: 20, bottom: 16 }}>
          <div className="sm-eyebrow" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Artist</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: '#fff' }}>{SO.artist}</div>
        </div>
      </div>
      <div style={{ padding: '18px 20px 30px' }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--sm-text-2)', marginBottom: 22 }}>{SO.bio}</div>
        <div className="sm-eyebrow" style={{ marginBottom: 11 }}>On this track</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, borderRadius: 16, background: 'var(--sm-surface)', border: '1px solid var(--sm-line)', marginBottom: 22 }}>
          <CoverArt track={SO} size={56} radius={12} />
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{SO.title}</div><div style={{ fontSize: 12.5, color: 'var(--sm-text-3)', marginTop: 4 }}>{SO.album} · {SO.year}</div></div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--sm-accent)', display: 'grid', placeItems: 'center' }}><Icon name="play" size={16} fill color="var(--sm-accent-ink)" style={{ marginLeft: 2 }} /></div>
        </div>
        <div style={{ marginBottom: 22 }}><WhyCallout /></div>
        <div><DRow k="Label" v={SO.label} /><DRow k="Catalogue" v={SO.catalog} /><DRow k="Tempo" v={SO.bpm + ' BPM'} last /></div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileEditorial, ProfileList, InfoBottomSheet, InfoFull, InfoArtist, ArtistTile });
