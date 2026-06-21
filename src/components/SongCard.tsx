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
import { COLORS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

interface SongCardProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onInfoPress: () => void;
}

export default function SongCard({
  track,
  isPlaying,
  onTogglePlay,
  onInfoPress,
}: SongCardProps) {
  const hasPreview = track.previewUrl !== null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: track.albumCover }} style={styles.albumArt} />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        locations={[0.3, 0.6, 1]}
        style={styles.gradient}
      />

      {!hasPreview && (
        <View style={styles.noPreviewBadge}>
          <Ionicons name="volume-mute" size={14} color={COLORS.text} />
          <Text style={styles.noPreviewText}>Preview Unavailable</Text>
        </View>
      )}

      <View style={styles.bottomContent}>
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

        <View style={styles.actions}>
          {hasPreview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onTogglePlay}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={44}
                color={COLORS.text}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onInfoPress}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={44} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
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
  noPreviewBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  songTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  albumName: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actions: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xs,
  },
});
