import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { useStore } from '../store/useStore';
import { exportToSpotify } from '../services/spotify';
import { Track } from '../types';
import { COLORS, SPACING, RADII } from '../constants/theme';

export default function LibraryScreen() {
  const likedTracks = useStore((s) => s.likedTracks);
  const removeLikedTrack = useStore((s) => s.removeLikedTrack);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [exportState, setExportState] = useState<'idle' | 'working' | 'done'>('idle');
  const playerRef = useRef<AudioPlayer | null>(null);

  const stopAudio = useCallback(async () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch {}
      playerRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const playTrack = useCallback(
    async (track: Track) => {
      if (playingId === track.id) {
        await stopAudio();
        return;
      }

      await stopAudio();
      if (!track.previewUrl) return;

      try {
        await setAudioModeAsync({ playsInSilentMode: true });
        const player = createAudioPlayer(track.previewUrl);
        (player as any).addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            setPlayingId(null);
          }
        });
        playerRef.current = player;
        player.play();
        setPlayingId(track.id);
      } catch {
        setPlayingId(null);
      }
    },
    [playingId, stopAudio],
  );

  const handleExport = useCallback(async () => {
    if (likedTracks.length === 0 || exportState !== 'idle') return;

    setExportState('working');
    try {
      await exportToSpotify(likedTracks);
      setExportState('done');
    } catch (e: unknown) {
      setExportState('idle');
      Alert.alert('Export Failed', e instanceof Error ? e.message : 'Something went wrong');
    }
  }, [likedTracks, exportState]);

  const handleRemove = useCallback(
    (trackId: string) => {
      if (playingId === trackId) stopAudio();
      removeLikedTrack(trackId);
    },
    [playingId, stopAudio, removeLikedTrack],
  );

  const renderTrack = useCallback(
    ({ item }: { item: Track }) => {
      const isCurrentlyPlaying = playingId === item.id;
      const hasPreview = item.previewUrl !== null;

      return (
        <View style={styles.trackRow}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => playTrack(item)}
            disabled={!hasPreview}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.albumCover }} style={styles.thumbnail} />
            <View style={styles.playOverlay}>
              {hasPreview ? (
                <Ionicons
                  name={isCurrentlyPlaying ? 'pause' : 'play'}
                  size={16}
                  color={COLORS.text}
                />
              ) : (
                <Ionicons name="volume-mute" size={14} color={COLORS.textMuted} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>

          {isCurrentlyPlaying && (
            <View style={styles.eqBars}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.eqBar, { height: [8, 13, 6, 11][i] }]} />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.rowPlayBtn, isCurrentlyPlaying && styles.rowPlayBtnActive]}
            onPress={() => playTrack(item)}
            disabled={!hasPreview}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isCurrentlyPlaying ? 'pause' : 'play'}
              size={15}
              color={isCurrentlyPlaying ? COLORS.accentInk : COLORS.text}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [playingId, playTrack],
  );

  if (likedTracks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.eyebrow}>YOUR MATCHES</Text>
          <Text style={styles.title}>Liked</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={26} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No likes yet</Text>
          <Text style={styles.emptyHint}>
            Swipe right on Discover and your matches land here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{likedTracks.length} TRACKS YOU FELL FOR</Text>
            <Text style={styles.title}>Liked</Text>
          </View>
          <TouchableOpacity style={styles.shuffleBtn} activeOpacity={0.7}>
            <Ionicons name="sparkles-outline" size={19} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Playlist header card */}
      <View style={styles.playlistCard}>
        <View style={styles.coverStack}>
          {likedTracks.slice(0, 4).map((t, i) => (
            <Image
              key={t.id}
              source={{ uri: t.albumCover }}
              style={[styles.stackCover, { top: i * 4, left: i * 4, zIndex: 4 - i }]}
            />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.playlistTitle}>Your SoundMatch Mix</Text>
          <Text style={styles.playlistMeta}>{likedTracks.length} TRACKS</Text>
        </View>
      </View>

      {/* Export button */}
      <TouchableOpacity
        style={[
          styles.exportButton,
          exportState === 'done' && styles.exportDone,
        ]}
        onPress={handleExport}
        disabled={exportState !== 'idle'}
        activeOpacity={0.8}
      >
        {exportState === 'idle' && (
          <>
            <Ionicons name="musical-note" size={19} color={COLORS.spotifyInk} />
            <Text style={styles.exportText}>Export to Spotify</Text>
          </>
        )}
        {exportState === 'working' && (
          <>
            <ActivityIndicator color={COLORS.spotifyInk} size="small" />
            <Text style={styles.exportText}>Creating playlist…</Text>
          </>
        )}
        {exportState === 'done' && (
          <>
            <Ionicons name="checkmark" size={18} color={COLORS.spotify} />
            <Text style={styles.exportDoneText}>Saved · {likedTracks.length} tracks in Spotify</Text>
          </>
        )}
      </TouchableOpacity>

      <FlatList
        data={likedTracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 56,
  },
  headerSection: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eyebrow: {
    fontSize: 10.5,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
    marginBottom: 7,
  },
  title: {
    fontSize: 26,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  shuffleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    padding: 14,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  coverStack: {
    width: 76,
    height: 76,
    position: 'relative',
  },
  stackCover: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHover,
  },
  playlistTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  playlistMeta: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLORS.textMuted,
    marginTop: 7,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.spotify,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingVertical: 15,
    borderRadius: RADII.md,
    gap: 10,
  },
  exportDone: {
    backgroundColor: COLORS.surfaceHover,
  },
  exportText: {
    color: COLORS.spotifyInk,
    fontSize: 15,
    fontWeight: '700',
  },
  exportDoneText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: SPACING.xl,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 13,
  },
  playButton: {
    position: 'relative',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
  },
  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 1,
  },
  trackArtist: {
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  eqBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 13,
  },
  eqBar: {
    width: 2.5,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  rowPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceHover,
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowPlayBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: 'transparent',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.line,
    marginLeft: 70,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.line,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  emptyHint: {
    fontSize: 13.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
});
