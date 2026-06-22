# Handoff: SoundMatch — Music Discovery App

## Overview
SoundMatch is a music-discovery app with the mechanics of a dating app: users **swipe through songs** one card at a time. Swipe **right** to like/heart a track, **left** to dismiss it. Liked songs collect in a **Liked** tab that can be exported to Spotify as a playlist. Each song "profile" card shows album art, track/artist/album, and a 30-second preview; an **info** affordance opens a panel about the track and artist.

The app is a native-feeling **iPhone** experience (portrait, 402 × 874 pt logical canvas). It is built around four destinations:
1. **Onboarding / taste setup** (first run)
2. **Discover** — the swipe deck (primary screen)
3. **Liked** — saved songs, playlist-style, with Spotify export
4. **Profile** — listening stats + settings

---

## About the Design Files
The files in this bundle are **design references created in HTML/React (via in-browser Babel)** — interactive prototypes that show the intended look, motion, and behavior. **They are not production code to copy verbatim.**

The task is to **recreate these designs in the target codebase's environment** using its established patterns and libraries. The natural target here is a **native iOS app (SwiftUI)** or **React Native**, since this is a phone app with swipe gestures, haptics, and audio playback — but any framework the team standardizes on is fine. If there is no existing environment, choose the most appropriate stack for a gesture-driven mobile music app and implement there. Use the HTML only to understand layout, tokens, copy, and interaction intent.

Two implementation notes that matter when porting:
- The prototype draws the **iPhone bezel/status bar itself** (`app/ios-frame.jsx`). In a real app the OS provides these — **ignore the bezel/status-bar chrome** and implement only the screen content inside it.
- The prototype loads **album art** and **Spotify previews** over the network (iTunes artwork API + Spotify embed). In production, use the **Spotify Web API / iOS SDK** for both artwork and 30-second previews.

---

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, motion, and copy are final and intentional. Recreate the UI pixel-accurately using the codebase's UI toolkit. Exact tokens are listed under **Design Tokens** below.

The bundle intentionally contains **multiple explored variations** for several screens (3 each for onboarding, profile, stats, liked, info panel, and the swipe card). **The "primary / build-this" direction for each is called out per-screen below.** The other variations are kept for context and future reference — don't build all three; build the chosen one unless the team decides otherwise.

---

## Design Tokens

Authored in **OKLCH** (source of truth in `app/tokens.css`); hex equivalents given for convenience. Theme is **dark, deep-aubergine, minimal**.

### Surfaces
| Token | Role | OKLCH | Hex |
|---|---|---|---|
| `--sm-bg` | App canvas | `oklch(0.150 0.026 318)` | `#100812` |
| `--sm-bg-grad` | Ambient gradient top | `oklch(0.185 0.034 320)` | `#190D1C` |
| `--sm-surface` | Card / panel | `oklch(0.205 0.030 318)` | `#1D1320` |
| `--sm-surface-2` | Elevated / sheet | `oklch(0.250 0.036 320)` | `#291C2C` |
| `--sm-surface-3` | Hover / chips | `oklch(0.300 0.040 320)` | `#37273A` |

### Text
| Token | Role | OKLCH | Hex |
|---|---|---|---|
| `--sm-text` | High emphasis | `oklch(0.965 0.010 320)` | `#F6F1F8` |
| `--sm-text-2` | Mid emphasis | `oklch(0.760 0.022 320)` | `#B8ADBA` |
| `--sm-text-3` | Low emphasis | `oklch(0.575 0.028 320)` | `#807483` |

### Accent (orchid) — themeable
| Token | Role | OKLCH | Hex |
|---|---|---|---|
| `--sm-accent` | Primary accent | `oklch(0.730 0.122 322)` | `#CC8DD5` |
| `--sm-accent-ink` | Text/icon on accent | `oklch(0.150 0.040 322)` | `#130515` |
| `--sm-accent-press` | Pressed accent | 82% accent + black | — |
| `--sm-accent-soft` | Tint fill (chips, callouts) | 15% accent | — |
| `--sm-accent-line` | Tint border | 42% accent | — |

Alternate accents offered in the prototype's tweak panel: violet `#B58BE0`, magenta `#E085C2`, steel-blue `#7FB8E0`. The soft/line/press variants derive from whatever `--sm-accent` is set to.

### Swipe feedback & brand
| Token | Role | OKLCH | Hex |
|---|---|---|---|
| `--sm-like` | Like / right swipe (blue) | `oklch(0.700 0.150 248)` | `#45A4F6` |
| `--sm-nope` | Dislike / left swipe (red) | `oklch(0.630 0.205 22)` | `#EB424D` |
| `--sm-like-glow` | Like glow | like @ 55% alpha | — |
| `--sm-nope-glow` | Dislike glow | nope @ 55% alpha | — |
| `--sm-spotify` | Spotify green (**embeds/export only**) | — | `#1ED760` |

> **Color discipline:** blue and red are reserved *exclusively* for swipe feedback; Spotify green appears *only* inside real Spotify embeds or the export button. Everything else is aubergine + orchid.

### Hairlines (alpha overlays over any surface; base `#E8D6FA`)
- `--sm-line` → `rgba(232, 214, 250, 0.085)`
- `--sm-line-strong` → `rgba(232, 214, 250, 0.150)`

### Corner radii
| Token | px | Use |
|---|---|---|
| `--r-card` | 30 | Swipe cards |
| `--r-lg` | 22 | Panels, list cards |
| `--r-md` | 16 | Fields, players, tags-containers |
| `--r-sm` | 11 | Small chips |
| `--r-pill` | 999 | Pills, buttons, tags |

### Shadows / elevation
- `--shadow-card`: `0 2px 4px rgba(0,0,0,.4), 0 28px 64px -24px rgba(0,0,0,.85)`
- `--shadow-sheet`: `0 -8px 40px -8px rgba(0,0,0,.6)`
- `--shadow-float`: `0 8px 24px -8px rgba(0,0,0,.7)`

### Swipe glow (dynamic)
Top card shadow interpolates toward a colored glow as it's dragged:
`var(--shadow-card), 0 0 {30 + a*40}px {a*4}px var(--sm-like-glow|--sm-nope-glow)` where `a` = clamp(dragDistance / threshold, 0, 1).

---

## Typography

Three families, loaded from Google Fonts (substitute with bundled equivalents in production):
- **Michroma** (`--font-display`) — wide geometric display. Brand wordmark, screen titles, track titles, big numerals. Weight 400 only; letter-spacing ~0.01em. *Michroma is unusually wide — budget horizontal space and never let it fall back to a narrow system font or layout will reflow.*
- **Hanken Grotesk** (`--font-ui`) — body/UI text. Weights 300/400/500/600/700.
- **Space Mono** (`--font-mono`) — eyebrows, metadata, stats, timestamps, catalogue numbers. Uppercase, letter-spacing 0.08–0.22em.

Representative sizes (logical px on the 402-wide canvas):
- Screen title (Michroma): **26px**, line-height 1.0
- Card track title (Michroma): **23px** (classic) / **30px** (full-bleed & framed hero)
- Eyebrow (Space Mono, uppercase): **10.5px**, letter-spacing 0.22em, color `--sm-text-3`
- Body / row primary (Hanken 500–600): **14–15px**
- Row secondary / meta: **12–13px**, color `--sm-text-3`
- Stat numerals (Michroma): **22–25px**; Wrapped hero numeral **52px**
- Tag/chip label: **12.5–14px**, weight 500
- Buttons: **15px**, weight 600–700

---

## Global layout & chrome

- **Canvas:** 402 × 874 logical pt, portrait. Content area sits below a ~48px top inset (status bar in real app) and above the tab bar.
- **Tab bar** (`app.jsx` → `TabBar`): fixed bottom, 3 destinations — **Discover** (icon `discover`), **Liked** (heart icon, shows a count badge), **Profile** (user icon). Active item tinted `--sm-accent` with label in `--sm-text`; inactive in `--sm-text-3`. ~24px icons, 10.5px labels, top hairline border, bottom padding 24px for the home indicator. Heart fills when Liked is active. Tabs are placed low/thumb-reachable by design.
- **Ambient background:** each screen sits on `radial-gradient(120% 60% at 50% -6%, --sm-bg-grad, transparent 52%)` over `--sm-bg`.
- **Screen header** (`ui.jsx` → `ScreenHeader`): left-aligned, optional mono **eyebrow** (subtitle) above a Michroma **title**; optional right-side circular icon button (42px, hairline border).

---

## Screens / Views

### 1. Onboarding / Taste setup  *(first run)*
Multi-step, full-screen flow with a segmented **progress bar** (thin pills, filled to current step in `--sm-accent`) and a primary CTA pinned to the bottom (`--sm-accent` fill, `--sm-accent-ink` text, radius 14, 16px padding, soft accent shadow). A muted "Skip for now" appears on middle steps.

Steps in the working flow (`screens.jsx` → `OnboardingFlow`): **(0) Welcome** — brand mark, "SOUND**MATCH**" wordmark, value prop; **(1) Genres** — selectable chips; **(2) Taste dials** — range sliders; **(3) Connect Spotify** — green connect button + a preview of the first match ("So Long" by Seba).

**Variations explored (build one):**
- **A · Chip cloud** — wrap of pill chips; selected = accent-soft fill + accent border + accent text. *Lowest friction.*
- **B · Genre tiles** — 2-col grid of colored mood tiles with a check badge top-right when selected.
- **C · Taste dials** — labeled sliders (Familiar↔Adventurous, Mellow↔Energetic, Vocal↔Instrumental) + sample-match card.

> **Primary / build this: A · Chip cloud** for genre selection, within the full multi-step `OnboardingFlow` (which already strings welcome → chips → dials → Spotify together). Dials (C) belong as the subsequent calibration step, not a competing screen.

Genre set used: Atmospheric DnB, Liquid, Ambient, Jazzy, Soulful, Deep, Classic, Funk, Melodic. (Note: "Rolling" was intentionally removed as a genre.)

---

### 2. Discover — the swipe deck  *(primary screen)*
**Purpose:** evaluate one song at a time; right = like, left = pass.

**Layout:** `ScreenHeader` ("Discover" / eyebrow "Tuned to your late-night listening" / right = filter button). Below it a **card stack** filling remaining height, then an **action row** pinned above the tab bar.

**Card stack (`discover.jsx` → `SwipeDeck`):**
- Renders up to 3 stacked cards. Back cards are scaled down (`scale 1 - off*0.05`) and offset down (`off*14px`), slightly desaturated, non-interactive.
- **Top card is draggable** (pointer events). Drag translates the card and rotates it (`rotate = x * 0.05deg`), with vertical movement damped to 40%.
- **Threshold = 105px.** Past threshold on release → commit; otherwise springs back (`transform 0.3s cubic-bezier(.2,.8,.2,1)`).
- **Commit animation:** card flies off to ±620px x, −50px y, ±24° rotation, opacity→0 over 300ms; then it's removed and the next card promotes.
- **Live feedback while dragging** (intensity `a` = clamp(|x| / 105, 0, 1)):
  - Right: blue glow bloom from the left edge + a rotated **"LIKE"** stamp (top-left, −13°) that scales/fades in past a=0.15; card shadow gains blue glow.
  - Left: red glow bloom from the right edge + **"NOPE"** stamp (top-right, +13°); red glow shadow.
- **Empty state:** "All caught up" with a check medallion and a "Replay stack" button.
- **Rewind:** history stack; rewinding restores the previous card and (if it was a like) removes it from Liked.

**Card content (`SongCard`)** — every card includes album cover, **match %** badge (sparkle + "{n}% MATCH", accent), an **info "i" button** (top-right of art, 40px, glassy), track title (Michroma), artist (+ "feat." when present), album · year, genre/mood **tags**, and a **30-sec preview player** at the bottom. `data-nodrag` is set on the info button and the player so interacting with them doesn't start a drag.

**Card layout variations (build one):**
- **A · Classic** — album art hero (max 286px) with badge+info overlaid on the art; title/artist + tags row beneath; preview player at the bottom. Card = `--sm-surface`, hairline border, radius 30, 16px padding.
- **B · Full-bleed** — art fills the entire card; bottom gradient scrim; tags, title, artist, and a compact player overlaid at the bottom; badge+info at top.
- **C · Framed** — art centered inside an inset "frame" (inner `--sm-bg` mat), centered title block, full player below.

> **Primary / build this: A · Classic.** It's the most music-streaming-familiar and keeps the preview player prominent. Keep B as an alternate visual mode if desired.

**Action row (`ActionRow`)** — three circular buttons, centered, thumb-reachable: **Nope** (64px, red X, hover red glow), **Rewind** (50px, smaller, disabled until there's history), **Like** (76px — largest, blue heart, hover blue glow). These mirror the swipe gestures for accessibility (motor-accessibility was an explicit requirement). Press = scale 0.9.

---

### 3. Liked — saved songs  *(playlist-style + Spotify export)*
**Purpose:** review matches and export them to Spotify.

**Layout:** `ScreenHeader` ("Liked" / "{n} tracks you fell for" / right = shuffle button). Scrollable body containing:
1. **Playlist header card** — a stacked 4-cover thumbnail, "Your SoundMatch Mix", and "{n} TRACKS · ~{min} MIN" in mono.
2. **Export button** (`ExportButton`) — full-width Spotify-green, "Export to Spotify" with the Spotify glyph. Three states: idle → **working** (spinner, "Creating playlist…") → **done** (becomes surface-3, check + "Saved · {n} tracks in Spotify"). ~1.4s simulated; wire to the real Web API.
3. **Track list.**

**Layout variations (build one):**
- **A · List + players** — rows: drag-grip, 50px cover, title + "artist · duration", a now-playing **equalizer** when active, and a 38px play/pause button (accent when playing). Hairline separators inset to align past the artwork.
- **B · Compact** — same row, denser (42px cover, tighter padding) for long lists.
- **C · Artwork grid** — 2-col grid of covers with an overlaid play button and title/artist beneath.

> **Primary / build this: A · List + players** (matches the "playlist-style with Spotify export" requirement most directly). Offer Compact as a density option.

Tapping a row/cover opens the **Info panel** for that track. Rows are intended to be reorderable (grip handle shown).

---

### 4. Profile — stats + settings
**Purpose:** identity, listening insights, and app settings.

**Working screen (`screens.jsx` → `ProfileScreen`):** `ScreenHeader` ("Profile" / "Sebastian · Member since 2026" / right = avatar) with a **segmented control** toggling **Stats** and **Settings**.

- **Stats tab:** 2×2 KPI tiles (Tracks liked, Like rate, Listened hours, Day streak with flame icon); a **Top genres** card with labeled progress bars (gradient accent→violet fill); two small cards (Era, Total swipes).
- **Settings tab:** grouped rows under mono section headers — **Playback** (Autoplay previews toggle, High-quality preview toggle), **Connections** (Spotify "LINKED", Notifications toggle), **Taste** (Re-tune my taste → re-runs onboarding, Genres & moods). Each row: 32px accent-soft icon chip + label + optional detail + control (toggle or chevron). Toggles are 46×28 pills, accent when on. A ghost **Sign out** button (red text) at the bottom.

**Variations explored (build one):**
- **A · Stats + Settings** — the working segmented screen above.
- **B · Editorial hero** — centered large avatar, name, location, edit/settings actions, a 3-up stat strip, top-genre tags, and a recent-likes cover row.
- **C · List / settings-forward** — profile summary card on top, then iOS-style grouped settings (Taste / Playback / Connections).

> **Primary / build this: A · Stats + Settings.** It satisfies "Profile with stats and a settings tab" in one screen.

---

### 5. Listening stats
These are richer takes on the data shown in Profile→Stats; treat as the **content of the Stats tab / a dedicated insights screen.**
- **A · Bars & tiles** — KPI tiles + top-genre bars (dashboard feel).
- **B · Wrapped** — bold gradient hero card with a big "minutes listened" numeral, a **conic-gradient donut** genre split with legend, and on-repeat / era cards. Shareable "year in sound" energy.
- **C · Taste profile** — a **spectrum** (Energy/Warmth/Depth/Tempo/Vocal sliders) + a ranked **Top artists** list with monogram avatars.

> **Primary / build this: A · Bars & tiles** as the default Stats content; **B · Wrapped** is a great seasonal/shareable secondary view.

Sample stats (`data.js` → `SM_STATS`): 1,840 minutes, 312 swipes, 38% like rate, 12-day streak, era 1996–2003; top genres Atmospheric DnB 62% / Liquid 24% / Ambient 14%.

---

### 6. Info panel  *(the "i" affordance)*
**Purpose:** the story behind a track — opened from the card's info button or a Liked row.

**Working component (`discover.jsx` → `InfoSheet`)** shows, in order: header (cover + title + artist/feat), a **"Why you're seeing this"** callout (accent-soft card, sparkle icon, recommendation reason), **Genre & Mood** tags, **About the artist** (artist photo + bio), a **Release** detail table (Album, Year, Label, Catalogue, Tempo BPM, Length), and a **Listen** section embedding the real Spotify player.

**Variations (build one or support two presentations):**
- **A · Bottom sheet** — dismissible sheet rising from the bottom (grabber handle, dimmed/blurred backdrop, close button); spring `transform 0.32s cubic-bezier(.2,.85,.25,1)`. *Default.*
- **B · Full screen** — cover-art hero with gradient scrim, back + Spotify buttons, then tags / why / artist / release.
- **C · Artist-led** — leads with an artist hero and bio, then the track in context (play button) and release facts.

> **Primary / build this: A · Bottom sheet** (quick, in-context, dismissible). Info content fields are identical across variants — only the container/presentation differs.

Info content shown (per the requirement): artist bio + photo, genre/mood tags, release year & label, and "why this was recommended." (Lyrics and similar-artists were intentionally excluded.)

---

## Interactions & Behavior
- **Swipe gesture:** pointer drag → translate + rotate; release past 105px commits, else springs back. Commit flies card off-screen (300ms) and promotes the next. See Discover for exact transforms.
- **Buttons mirror gestures:** Nope/Like/Rewind in the action row trigger the same commit/rewind paths (accessibility path for users who can't drag — explicit requirement).
- **Drag feedback:** blue (right) / red (left) glow + LIKE/NOPE stamps, intensity scales with drag distance. Provide haptics on commit in native.
- **Rewind:** restores the last card; un-likes it if it had been liked.
- **Preview player (`BrandedPlayer`):** 30-second simulated playback — play/pause, animated progress bar, equalizer bars while playing; auto-stops at 0:30. In production back this with real 30s previews. A **real Spotify embed** (`SpotifyEmbed`, `theme=0` dark) is available behind a toggle.
- **Spotify export:** idle → working (spinner) → done; wire to Spotify Web API playlist creation.
- **Tab navigation:** instant screen swap; Liked badge reflects liked count.
- **Info sheet:** opens over current screen; backdrop tap or close button dismisses with reverse animation.
- **Reduced motion:** gate entrance/decorative animations behind `prefers-reduced-motion`; swipe still works without flourish.

## State Management
- `phase`: `'onboarding' | 'app'` (first-run gate; "Re-tune my taste" returns to onboarding).
- `tab`: `'discover' | 'liked' | 'profile'`.
- `liked`: ordered list of liked track objects (dedup by `id`). Drives Liked tab, badge count, profile stats.
- Discover-local: `idx` (current card), drag `pos`, commit `anim` (`'left'|'right'|null`), `history` (for rewind).
- `infoTrack`: track shown in the info panel, or null.
- Per-player: `playing`, elapsed `t` (0–30s).
- Theming: `--sm-accent` is a runtime CSS variable; soft/line/press derive from it.
- **Data fetching (production):** track feed/recommendations; album artwork (Spotify); 30s previews; playlist export; persisted likes & taste profile per user.

## Assets
- **Album artwork:** real covers loaded at runtime. "So Long" / "Universal Music" (Seba, *Producer 06*, Good Looking Records, GLRD06, 2003) use the actual Spotify CDN cover; others resolve via the iTunes artwork API, with a **typographic sleeve fallback** (monogram or hero title over a hue-tinted gradient) rendered instantly. In production, source all artwork from Spotify.
- **Icons:** inline SVG paths defined in `app/ui.jsx` (`ICON_PATHS`) — discover, heart, x, info, play/pause, rewind, user, settings, sparkle, flame, etc. Plus a dedicated Spotify glyph. Replace with the codebase's icon set; match weights/sizes.
- **Fonts:** Michroma, Hanken Grotesk, Space Mono (Google Fonts). Bundle equivalents in production.
- **No raster/photographic assets** are required beyond album art; the artist "photo" is a styled placeholder — wire to real artist images.
- **Sample track data:** `app/data.js` (`SM_TRACKS`, `SM_STATS`). Featured demo track: **"So Long" — Seba feat. Lo Tek**.

## Files
Implementation (all under `app/`):
- `app/tokens.css` — **the design system**: all color/spacing/radius/shadow/type tokens + base utilities, equalizer/keyframes, button & range styles. Start here.
- `app/ui.jsx` — shared primitives: `Icon`, `CoverArt` (+ runtime artwork loader & typographic fallback), `Tag`, `BrandedPlayer`, `SpotifyEmbed`, `PreviewPlayer`, `Eq`, `ScreenHeader`.
- `app/discover.jsx` — `SwipeDeck`, `SongCard` (3 layouts), `ActionRow`, `DiscoverScreen`, `InfoSheet`.
- `app/screens.jsx` — `LikedScreen` (3 layouts), `ProfileScreen` (stats+settings), `OnboardingFlow`.
- `app/variations.jsx`, `app/variations2.jsx` — static variation screens (onboarding/stats/profile/info) used for the exploration canvas; reference for the alternate directions.
- `app/app.jsx` — root: tab bar, app state, theming, tweak wiring.
- `app/data.js` — sample tracks + stats.
- `app/ios-frame.jsx` — **prototype-only** iPhone bezel/status bar (do not port).
- `app/tweaks-panel.jsx`, `app/design-canvas.jsx` — **prototype-only** tooling (theme tweaks + exploration canvas).

Runnable references (open in a browser):
- `SoundMatch.html` — the **working interactive app** (best single reference for behavior).
- `SoundMatch Design System.html` — the design-language reference (color, type, components).
- `SoundMatch Explorations.html` — all variations laid out side-by-side on a pan/zoom canvas.

---

## Implementation Notes / Recommendations
- Target **SwiftUI** or **React Native** for a real gesture + audio app; map the swipe physics to the platform's gesture system and add **haptics** on like/pass/commit.
- Reserve **blue/red strictly for swipe feedback** and **green strictly for Spotify** — don't let them leak into general UI.
- Keep **Michroma** for display only and ensure it's bundled (it's wide; fallbacks reflow layout).
- Hit targets ≥ 44pt (the action buttons are 50–76px by design).
- Honor `prefers-reduced-motion` / Reduce Motion.
- Build the **primary** variation per screen (called out above); the others are exploration context.
