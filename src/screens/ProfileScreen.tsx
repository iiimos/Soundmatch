import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import {
  fetchAvailableGenreSeeds,
  batchFetchArtists,
  fetchPlaylistTracks,
  parsePlaylistId,
} from '../services/spotify';
import SettingsModal from '../components/SettingsModal';
import { COLORS, SPACING, RADII, FONTS } from '../constants/theme';

export default function ProfileScreen() {
  const userProfile = useStore((s) => s.userProfile);
  const likedTracks = useStore((s) => s.likedTracks);
  const dislikedTrackIds = useStore((s) => s.dislikedTrackIds);
  const tasteProfile = useStore((s) => s.tasteProfile);
  const setTasteGenres = useStore((s) => s.setTasteGenres);
  const setTastePlaylistUrl = useStore((s) => s.setTastePlaylistUrl);
  const setTasteSeeds = useStore((s) => s.setTasteSeeds);

  const [tab, setTab] = useState<'stats' | 'settings'>('stats');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [topGenres, setTopGenres] = useState<{ genre: string; count: number }[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(tasteProfile.seedGenres);
  const [playlistInput, setPlaylistInput] = useState(tasteProfile.seedPlaylistUrl);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);

  const totalLiked = likedTracks.length;
  const totalDisliked = dislikedTrackIds.length;
  const totalSwipes = totalLiked + totalDisliked;
  const matchRate = totalSwipes > 0 ? Math.round((totalLiked / totalSwipes) * 100) : 0;

  useEffect(() => {
    calculateTopGenres();
  }, [likedTracks.length]);

  useEffect(() => {
    loadAvailableGenres();
  }, []);

  const calculateTopGenres = useCallback(async () => {
    if (likedTracks.length === 0) {
      setTopGenres([]);
      return;
    }

    setLoadingGenres(true);
    try {
      const trackIds = likedTracks.map((t) => t.id);
      const uniqueArtistIds: string[] = [];

      const { apiFetch } = await import('../services/spotify');
      for (let i = 0; i < trackIds.length; i += 50) {
        const batch = trackIds.slice(i, i + 50);
        const response = await apiFetch(`/tracks?ids=${batch.join(',')}`);
        const data = await response.json();
        if (data.tracks) {
          for (const track of data.tracks) {
            if (track?.artists) {
              for (const artist of track.artists) {
                if (artist.id && !uniqueArtistIds.includes(artist.id)) {
                  uniqueArtistIds.push(artist.id);
                }
              }
            }
          }
        }
      }

      const artists = await batchFetchArtists(uniqueArtistIds);
      const genreCount: Record<string, number> = {};
      for (const artist of artists) {
        for (const genre of artist.genres) {
          genreCount[genre] = (genreCount[genre] ?? 0) + 1;
        }
      }

      const sorted = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));

      setTopGenres(sorted);
    } catch {
    } finally {
      setLoadingGenres(false);
    }
  }, [likedTracks]);

  const loadAvailableGenres = async () => {
    try {
      const genres = await fetchAvailableGenreSeeds();
      setAvailableGenres(genres);
    } catch {}
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre);
      if (prev.length >= 5) {
        Alert.alert('Limit Reached', 'You can select up to 5 genres.');
        return prev;
      }
      return [...prev, genre];
    });
  };

  const applyGenres = () => {
    if (selectedGenres.length === 0) {
      Alert.alert('Select Genres', 'Please select at least one genre.');
      return;
    }
    setTasteGenres(selectedGenres);
    Alert.alert('Taste Updated', 'Your discovery feed will refresh with new recommendations.');
  };

  const applyPlaylist = async () => {
    const playlistId = parsePlaylistId(playlistInput);
    if (!playlistId) {
      Alert.alert('Invalid Link', 'Please paste a valid Spotify playlist URL.');
      return;
    }

    setLoadingPlaylist(true);
    try {
      setTastePlaylistUrl(playlistInput);
      const { trackIds, artistIds } = await fetchPlaylistTracks(playlistId);
      if (trackIds.length === 0 && artistIds.length === 0) {
        Alert.alert('Empty Playlist', 'This playlist has no tracks to seed from.');
        return;
      }
      setTasteSeeds(trackIds, artistIds);
      Alert.alert('Taste Updated', 'Recommendations will now be based on this playlist.');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load playlist');
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const displayedGenres = showAllGenres ? availableGenres : availableGenres.slice(0, 20);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>
              {userProfile?.displayName ?? 'User'} · Member since 2026
            </Text>
            <Text style={styles.title}>Profile</Text>
          </View>
          <View style={styles.avatarContainer}>
            {userProfile?.imageUrl ? (
              <Image source={{ uri: userProfile.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarLetter}>
                  {(userProfile?.displayName ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmented}>
          {(['stats', 'settings'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.segmentBtn, tab === t && styles.segmentBtnActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'stats' ? (
          <>
            {/* KPI tiles */}
            <View style={styles.statsGrid}>
              <View style={styles.statTile}>
                <Text style={styles.statBig}>{totalLiked}</Text>
                <Text style={styles.statLabel}>TRACKS LIKED</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statBig}>{matchRate}%</Text>
                <Text style={styles.statLabel}>LIKE RATE</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statBig}>{totalSwipes}</Text>
                <Text style={styles.statLabel}>TOTAL SWIPES</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statBig}>{totalDisliked}</Text>
                <Text style={styles.statLabel}>PASSED</Text>
              </View>
            </View>

            {/* Top Genres */}
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>YOUR TOP GENRES</Text>
              {loadingGenres ? (
                <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
              ) : topGenres.length > 0 ? (
                topGenres.map((g) => {
                  const maxCount = topGenres[0].count;
                  const pct = maxCount > 0 ? (g.count / maxCount) * 100 : 0;
                  return (
                    <View key={g.genre} style={styles.genreRow}>
                      <View style={styles.genreInfo}>
                        <Text style={styles.genreName}>{g.genre}</Text>
                        <Text style={styles.genrePct}>{Math.round(pct)}%</Text>
                      </View>
                      <View style={styles.genreBarBg}>
                        <View style={[styles.genreBarFill, { width: `${pct}%` }]} />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyHint}>Like some songs to see your top genres</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Taste section */}
            <Text style={styles.sectionEyebrow}>TASTE</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Genres & moods</Text>
              <Text style={styles.cardDesc}>Select up to 5 genres to tune your recommendations</Text>

              <View style={styles.chipContainer}>
                {displayedGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleGenre(genre)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {genre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {availableGenres.length > 20 && (
                <TouchableOpacity onPress={() => setShowAllGenres(!showAllGenres)} activeOpacity={0.7}>
                  <Text style={styles.showMoreText}>
                    {showAllGenres ? 'Show Less' : `Show All (${availableGenres.length})`}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.accentBtn} onPress={applyGenres} activeOpacity={0.8}>
                <Text style={styles.accentBtnText}>Apply Genre Seeds</Text>
              </TouchableOpacity>
            </View>

            {/* Reference Playlist */}
            <Text style={styles.sectionEyebrow}>REFERENCE PLAYLIST</Text>
            <View style={styles.card}>
              <Text style={styles.cardDesc}>
                Paste a Spotify playlist link to seed recommendations from its tracks
              </Text>

              <TextInput
                style={styles.input}
                placeholder="https://open.spotify.com/playlist/..."
                placeholderTextColor={COLORS.textMuted}
                value={playlistInput}
                onChangeText={setPlaylistInput}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.outlineBtn, loadingPlaylist && styles.btnDisabled]}
                onPress={applyPlaylist}
                disabled={loadingPlaylist}
                activeOpacity={0.8}
              >
                {loadingPlaylist ? (
                  <ActivityIndicator color={COLORS.accent} size="small" />
                ) : (
                  <Text style={styles.outlineBtnText}>Apply Playlist Seeds</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Connections */}
            <Text style={styles.sectionEyebrow}>CONNECTIONS</Text>
            <View style={styles.card}>
              <View style={styles.settingsRow}>
                <View style={styles.settingsIcon}>
                  <Ionicons name="musical-note" size={17} color={COLORS.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingsLabel}>Spotify</Text>
                  <Text style={styles.settingsDetail}>Connected · {userProfile?.displayName ?? ''}</Text>
                </View>
                <Text style={styles.linkedBadge}>LINKED</Text>
              </View>
            </View>

            {/* Sign out */}
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => setSettingsVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eyebrow: {
    fontSize: 10.5,
    fontFamily: FONTS.mono,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
    marginBottom: 7,
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  avatarContainer: {},
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.accentInk,
  },
  segmentedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.md,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surfaceHover,
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    marginBottom: 18,
  },
  statTile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    padding: 16,
  },
  statBig: {
    fontSize: 25,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: FONTS.mono,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginTop: 9,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    padding: 18,
    marginBottom: 18,
  },
  cardEyebrow: {
    fontSize: 10.5,
    fontFamily: FONTS.mono,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  genreRow: {
    marginBottom: 14,
  },
  genreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    gap: 10,
  },
  genreName: {
    fontSize: 13.5,
    fontWeight: '500',
    color: COLORS.text,
  },
  genrePct: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  genreBarBg: {
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceHover,
    overflow: 'hidden',
  },
  genreBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    fontFamily: FONTS.mono,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
    marginBottom: 10,
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentLine,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.accent,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  accentBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  accentBtnText: {
    color: COLORS.accentInk,
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: SPACING.md,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingsDetail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  linkedBadge: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
    color: COLORS.spotify,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.dislike,
  },
});
