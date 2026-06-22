import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Track } from '../types';
import { COLORS, SPACING, RADII, FONTS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 380);
const CARD_HEIGHT = CARD_WIDTH * 1.35;

interface SongCardProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onInfoPress: () => void;
  hidePreviewUnavailable?: boolean;
}

export default function SongCard({
  track,
  isPlaying,
  onTogglePlay,
  onInfoPress,
  hidePreviewUnavailable = false,
}: SongCardProps) {
  const hasPreview = track.previewUrl !== null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: track.albumCover }} style={styles.albumArt} />

      <LinearGradient
        colors={['transparent', 'rgba(16,8,18,0.3)', 'rgba(16,8,18,0.88)']}
        locations={[0.3, 0.55, 1]}
        style={styles.gradient}
      />

      {/* Info button - top right, glassy */}
      <TouchableOpacity
        style={styles.infoButton}
        onPress={onInfoPress}
        activeOpacity={0.7}
      >
        <Ionicons name="information-circle-outline" size={22} color={COLORS.text} />
      </TouchableOpacity>

      {!hasPreview && !hidePreviewUnavailable && (
        <View style={styles.noPreviewBadge}>
          <Ionicons name="volume-mute" size={14} color={COLORS.text} />
          <Text style={styles.noPreviewText}>Preview Unavailable</Text>
        </View>
      )}

      <View style={styles.bottomContent}>
        {/* Tags */}
        {track.genres && track.genres.length > 0 && (
          <View style={styles.tagsRow}>
            {track.genres.slice(0, 2).map((genre) => (
              <View key={genre} style={styles.tag}>
                <Text style={styles.tagText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.songTitle} numberOfLines={2}>
            {track.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {track.artist}
          </Text>
          <Text style={styles.albumName} numberOfLines={1}>
            {track.albumName}
          </Text>
        </View>

        {/* Preview player bar */}
        {hasPreview && (
          <TouchableOpacity
            style={styles.playerBar}
            onPress={onTogglePlay}
            activeOpacity={0.7}
          >
            <View style={styles.playBtn}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={16}
                color={COLORS.accentInk}
                style={!isPlaying ? { marginLeft: 2 } : undefined}
              />
            </View>
            <Text style={styles.playerLabel}>
              {isPlaying ? '30-SEC PREVIEW' : 'TAP TO PREVIEW'}
            </Text>
            {isPlaying && (
              <View style={styles.eqBars}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.eqBar, { height: [8, 13, 6, 11][i] }]} />
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADII.card,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  albumArt: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  infoButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    backgroundColor: 'rgba(20, 14, 28, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  noPreviewBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 14, 28, 0.55)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.sm,
    gap: SPACING.xs,
  },
  noPreviewText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentLine,
  },
  tagText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.accent,
  },
  textContainer: {
    marginBottom: 14,
  },
  songTitle: {
    fontSize: 23,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: 0.2,
  },
  artistName: {
    fontSize: 14.5,
    fontFamily: FONTS.bodyMedium,
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 2,
  },
  albumName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADII.lg,
    padding: 13,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
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
});
