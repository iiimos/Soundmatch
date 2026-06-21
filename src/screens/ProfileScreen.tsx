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
  FlatList,
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
import { COLORS, SPACING } from '../constants/theme';

export default function ProfileScreen() {
  const userProfile = useStore((s) => s.userProfile);
  const likedTracks = useStore((s) => s.likedTracks);
  const dislikedTrackIds = useStore((s) => s.dislikedTrackIds);
  const tasteProfile = useStore((s) => s.tasteProfile);
  const setTasteGenres = useStore((s) => s.setTasteGenres);
  const setTastePlaylistUrl = useStore((s) => s.setTastePlaylistUrl);
  const setTasteSeeds = useStore((s) => s.setTasteSeeds);

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
  const recentlyLiked = likedTracks.slice(0, 5);

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
      const artistIds: string[] = [];
      for (const track of likedTracks) {
        if (track.uri) {
          const trackArtistMatch = track.artist;
          if (trackArtistMatch) {
            // We need artist IDs — extract from the track data via API
          }
        }
      }

      // Fetch track details to get artist IDs, then batch fetch artists
      const trackIds = likedTracks.map((t) => t.id);
      const uniqueArtistIds: string[] = [];

      // Use the apiFetch to get tracks with artist IDs
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
      // Silently fail — genres are non-critical
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
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        {userProfile?.imageUrl ? (
          <Image source={{ uri: userProfile.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={36} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.userText}>
          <Text style={styles.userName}>{userProfile?.displayName ?? 'User'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email ?? ''}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalLiked}</Text>
          <Text style={styles.statLabel}>Liked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalDisliked}</Text>
          <Text style={styles.statLabel}>Passed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: matchRate >= 50 ? COLORS.primary : COLORS.accent }]}>
            {matchRate}%
          </Text>
          <Text style={styles.statLabel}>Match Rate</Text>
        </View>
      </View>

      {/* Recently Liked */}
      {recentlyLiked.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Liked</Text>
          <FlatList
            horizontal
            data={recentlyLiked}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
            renderItem={({ item }) => (
              <View style={styles.recentItem}>
                <Image source={{ uri: item.albumCover }} style={styles.recentCover} />
                <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Top Genres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Genres</Text>
        {loadingGenres ? (
          <ActivityIndicator color={COLORS.primary} style={styles.genreLoader} />
        ) : topGenres.length > 0 ? (
          <View style={styles.topGenreList}>
            {topGenres.map((item, index) => {
              const maxCount = topGenres[0].count;
              const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <View key={item.genre} style={styles.topGenreRow}>
                  <Text style={styles.topGenreRank}>{index + 1}</Text>
                  <View style={styles.topGenreBarContainer}>
                    <View style={[styles.topGenreBar, { width: `${barWidth}%` }]} />
                    <Text style={styles.topGenreName}>{item.genre}</Text>
                  </View>
                  <Text style={styles.topGenreCount}>{item.count}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyHint}>
            Like some songs to see your top genres
          </Text>
        )}
      </View>

      {/* Taste Profile — Genre Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taste Profile</Text>
        <Text style={styles.sectionDesc}>Select up to 5 genres to tune your recommendations</Text>

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

        <TouchableOpacity style={styles.applyButton} onPress={applyGenres} activeOpacity={0.8}>
          <Text style={styles.applyText}>Apply Genre Seeds</Text>
        </TouchableOpacity>
      </View>

      {/* Taste Profile — Playlist Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reference Playlist</Text>
        <Text style={styles.sectionDesc}>
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
          style={[styles.applyButton, styles.applyButtonSecondary, loadingPlaylist && styles.applyButtonDisabled]}
          onPress={applyPlaylist}
          disabled={loadingPlaylist}
          activeOpacity={0.8}
        >
          {loadingPlaylist ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.applyTextSecondary}>Apply Playlist Seeds</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPad} />

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: SPACING.md,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  recentList: {
    gap: SPACING.md,
  },
  recentItem: {
    width: 110,
  },
  recentCover: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.sm,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  recentArtist: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  genreLoader: {
    marginVertical: SPACING.lg,
  },
  topGenreList: {
    gap: SPACING.sm,
  },
  topGenreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  topGenreRank: {
    width: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  topGenreBarContainer: {
    flex: 1,
    height: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topGenreBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 8,
    opacity: 0.3,
  },
  topGenreName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
  },
  topGenreCount: {
    width: 28,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.text,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyTextSecondary: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  bottomPad: {
    height: 40,
  },
});
