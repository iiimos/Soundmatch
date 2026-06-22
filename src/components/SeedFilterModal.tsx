import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import {
  fetchAvailableGenreSeeds,
  fetchPlaylistTracks,
  fetchUserPlaylists,
  SpotifyPlaylistSummary,
} from '../services/spotify';
import { COLORS, SPACING, RADII } from '../constants/theme';

interface SeedFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SeedFilterModal({ visible, onClose }: SeedFilterModalProps) {
  const tasteProfile = useStore((s) => s.tasteProfile);
  const setTasteGenres = useStore((s) => s.setTasteGenres);
  const setTastePlaylistUrl = useStore((s) => s.setTastePlaylistUrl);
  const setTasteSeeds = useStore((s) => s.setTasteSeeds);

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(tasteProfile.seedGenres);
  const [showAllGenres, setShowAllGenres] = useState(false);

  const [playlists, setPlaylists] = useState<SpotifyPlaylistSummary[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [applyingPlaylistId, setApplyingPlaylistId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedGenres(tasteProfile.seedGenres);
      fetchAvailableGenreSeeds().then(setAvailableGenres).catch(() => {});

      setLoadingPlaylists(true);
      fetchUserPlaylists()
        .then(setPlaylists)
        .catch(() => {})
        .finally(() => setLoadingPlaylists(false));
    }
  }, [visible]);

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
    onClose();
  };

  const applyPlaylist = async (playlist: SpotifyPlaylistSummary) => {
    setApplyingPlaylistId(playlist.id);
    try {
      setTastePlaylistUrl(`spotify:playlist:${playlist.id}`);
      const { trackIds, artistIds } = await fetchPlaylistTracks(playlist.id);
      if (trackIds.length === 0 && artistIds.length === 0) {
        Alert.alert('Empty Playlist', 'This playlist has no tracks to seed from.');
        return;
      }
      setTasteSeeds(trackIds, artistIds);
      onClose();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load playlist');
    } finally {
      setApplyingPlaylistId(null);
    }
  };

  const displayedGenres = showAllGenres ? availableGenres : availableGenres.slice(0, 20);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Text style={styles.headerEyebrow}>TUNE YOUR STACK</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={17} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Genre chips */}
            <Text style={styles.sectionTitle}>Genres</Text>
            <Text style={styles.sectionDesc}>Pick up to 5 to shape your feed</Text>

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
                <Text style={styles.showMore}>
                  {showAllGenres ? 'Show Less' : `Show All (${availableGenres.length})`}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.accentBtn} onPress={applyGenres} activeOpacity={0.8}>
              <Text style={styles.accentBtnText}>Apply Genres</Text>
            </TouchableOpacity>

            {/* Your Playlists */}
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Your Playlists</Text>
            <Text style={styles.sectionDesc}>Tap a playlist to seed your discover stack from its tracks</Text>

            {loadingPlaylists ? (
              <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} />
            ) : playlists.length === 0 ? (
              <Text style={styles.emptyText}>No playlists found</Text>
            ) : (
              playlists.map((pl) => {
                const isApplying = applyingPlaylistId === pl.id;
                return (
                  <TouchableOpacity
                    key={pl.id}
                    style={styles.playlistRow}
                    onPress={() => applyPlaylist(pl)}
                    disabled={applyingPlaylistId !== null}
                    activeOpacity={0.7}
                  >
                    {pl.imageUrl ? (
                      <Image source={{ uri: pl.imageUrl }} style={styles.playlistCover} />
                    ) : (
                      <View style={[styles.playlistCover, styles.playlistCoverPlaceholder]}>
                        <Ionicons name="musical-notes" size={18} color={COLORS.textMuted} />
                      </View>
                    )}
                    <View style={styles.playlistInfo}>
                      <Text style={styles.playlistName} numberOfLines={1}>{pl.name}</Text>
                      <Text style={styles.playlistMeta} numberOfLines={1}>
                        {pl.owner} · {pl.trackCount} tracks
                      </Text>
                    </View>
                    {isApplying ? (
                      <ActivityIndicator color={COLORS.accent} size="small" />
                    ) : (
                      <View style={styles.seedBtn}>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 4, 10, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: COLORS.lineStrong,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.lineStrong,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerEyebrow: {
    fontSize: 10.5,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 16,
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
  showMore: {
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
    marginBottom: 8,
  },
  accentBtnText: {
    color: COLORS.accentInk,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 22,
  },
  emptyText: {
    fontSize: 13.5,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  playlistCover: {
    width: 50,
    height: 50,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
  },
  playlistCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    minWidth: 0,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  playlistMeta: {
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  seedBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.accentLine,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
