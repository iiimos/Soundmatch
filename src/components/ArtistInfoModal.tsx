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
import { COLORS, SPACING, RADII } from '../constants/theme';

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
          {/* Grabber */}
          <View style={styles.grabber} />

          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerEyebrow}>TRACK INFO</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={17} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Track header */}
              <View style={styles.trackHeader}>
                {track.albumCover ? (
                  <Image source={{ uri: track.albumCover }} style={styles.coverArt} />
                ) : (
                  <View style={[styles.coverArt, styles.coverPlaceholder]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackTitle}>{track.name}</Text>
                  <Text style={styles.trackArtist}>{track.artist}</Text>
                </View>
              </View>

              {/* Album info */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionEyebrow}>RELEASE</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>ALBUM</Text>
                  <Text style={styles.detailValue}>{track.albumName}</Text>
                </View>
              </View>

              {/* Genres */}
              {artistInfo && artistInfo.genres.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionEyebrow}>GENRE & MOOD</Text>
                  <View style={styles.genreRow}>
                    {artistInfo.genres.slice(0, 6).map((genre, i) => (
                      <View key={genre} style={[styles.genreChip, i === 0 && styles.genreChipAccent]}>
                        <Text style={[styles.genreText, i === 0 && styles.genreTextAccent]}>{genre}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Artist */}
              {artistInfo && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionEyebrow}>ABOUT THE ARTIST</Text>
                  <View style={styles.artistRow}>
                    {artistInfo.imageUrl ? (
                      <Image source={{ uri: artistInfo.imageUrl }} style={styles.artistImage} />
                    ) : (
                      <View style={[styles.artistImage, styles.artistPlaceholder]}>
                        <Ionicons name="person" size={20} color={COLORS.textMuted} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.artistName}>{track.artist}</Text>
                      <Text style={styles.followers}>
                        {artistInfo.followers.toLocaleString()} followers
                      </Text>
                    </View>
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
    backgroundColor: 'rgba(6, 4, 10, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: 350,
    maxHeight: '90%',
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
    marginBottom: 18,
  },
  headerEyebrow: {
    fontSize: 10.5,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 80,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 22,
  },
  coverArt: {
    width: 84,
    height: 84,
    borderRadius: RADII.lg,
  },
  coverPlaceholder: {
    backgroundColor: COLORS.surfaceHover,
  },
  trackTitle: {
    fontSize: 21,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  trackArtist: {
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    letterSpacing: 2.2,
    color: COLORS.textMuted,
    marginBottom: 11,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  detailKey: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surfaceHover,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  genreChipAccent: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentLine,
  },
  genreText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  genreTextAccent: {
    color: COLORS.accent,
  },
  artistRow: {
    flexDirection: 'row',
    gap: 14,
  },
  artistImage: {
    width: 64,
    height: 64,
    borderRadius: RADII.lg,
  },
  artistPlaceholder: {
    backgroundColor: COLORS.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  followers: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
  },
});
