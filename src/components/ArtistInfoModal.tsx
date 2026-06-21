import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { fetchTrackArtistId, fetchArtistDetails } from '../services/spotify';
import { COLORS, SPACING } from '../constants/theme';

interface ArtistInfoModalProps {
  visible: boolean;
  track: Track | null;
  onClose: () => void;
}

interface ArtistInfo {
  genres: string[];
  followers: number;
  imageUrl: string | null;
}

export default function ArtistInfoModal({ visible, track, onClose }: ArtistInfoModalProps) {
  const [loading, setLoading] = useState(false);
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null);

  useEffect(() => {
    if (!visible || !track) {
      setArtistInfo(null);
      return;
    }

    setLoading(true);
    fetchTrackArtistId(track.id)
      .then((artistId) => {
        if (artistId) return fetchArtistDetails(artistId);
        return null;
      })
      .then((info) => {
        if (info) setArtistInfo(info);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, track]);

  if (!track) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                {artistInfo?.imageUrl ? (
                  <Image source={{ uri: artistInfo.imageUrl }} style={styles.artistImage} />
                ) : (
                  <View style={[styles.artistImage, styles.artistPlaceholder]}>
                    <Ionicons name="person" size={40} color={COLORS.textMuted} />
                  </View>
                )}
                <View style={styles.headerText}>
                  <Text style={styles.artistName}>{track.artist}</Text>
                  {artistInfo && (
                    <Text style={styles.followers}>
                      {artistInfo.followers.toLocaleString()} followers
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.trackSection}>
                <Text style={styles.sectionTitle}>Track</Text>
                <Text style={styles.trackName}>{track.name}</Text>
                <Text style={styles.albumLabel}>
                  from <Text style={styles.albumValue}>{track.albumName}</Text>
                </Text>
              </View>

              {artistInfo && artistInfo.genres.length > 0 && (
                <View style={styles.genreSection}>
                  <Text style={styles.sectionTitle}>Genres</Text>
                  <View style={styles.genreRow}>
                    {artistInfo.genres.slice(0, 6).map((genre) => (
                      <View key={genre} style={styles.genreChip}>
                        <Text style={styles.genreText}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    minHeight: 350,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.xs,
  },
  loader: {
    marginTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  artistImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: SPACING.md,
  },
  artistPlaceholder: {
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  artistName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  followers: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  trackSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  trackName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  albumLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  albumValue: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  genreSection: {
    marginBottom: SPACING.lg,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  genreChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
});
