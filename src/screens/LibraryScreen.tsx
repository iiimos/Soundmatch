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
import { COLORS, SPACING } from '../constants/theme';

export default function LibraryScreen() {
  const likedTracks = useStore((s) => s.likedTracks);
  const removeLikedTrack = useStore((s) => s.removeLikedTrack);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
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
    if (likedTracks.length === 0) {
      Alert.alert('Nothing to export', 'Like some songs first by swiping right in Discover.');
      return;
    }

    setExporting(true);
    try {
      await exportToSpotify(likedTracks);
      Alert.alert(
        'Playlist Created!',
        `"Soundmatch Discoveries" with ${likedTracks.length} tracks has been added to your Spotify account.`,
      );
    } catch (e: unknown) {
      Alert.alert('Export Failed', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setExporting(false);
    }
  }, [likedTracks]);

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
                  size={20}
                  color={COLORS.text}
                />
              ) : (
                <Ionicons name="volume-mute" size={16} color={COLORS.textMuted} />
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

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      );
    },
    [playingId, playTrack, handleRemove],
  );

  if (likedTracks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="musical-notes-outline" size={64} color={COLORS.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptyHint}>
            Head to the Discover tab and swipe right on songs you love. They'll appear here
            instantly.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.trackCount}>
            {likedTracks.length} {likedTracks.length === 1 ? 'track' : 'tracks'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.8}
      >
        {exporting ? (
          <ActivityIndicator color={COLORS.text} size="small" />
        ) : (
          <>
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
            <Text style={styles.exportText}>Export to Spotify</Text>
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  trackCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    paddingVertical: 14,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  playButton: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  trackName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyHint: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
