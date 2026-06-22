import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { fetchRecommendations } from '../services/spotify';
import { Track } from '../types';
import CardStack from '../components/CardStack';
import SeedFilterModal from '../components/SeedFilterModal';
import { COLORS, SPACING, RADII, FONTS } from '../constants/theme';

export default function DiscoverScreen() {
  const isFocused = useIsFocused();
  const recommendations = useStore((s) => s.recommendations);
  const setRecommendations = useStore((s) => s.setRecommendations);
  const addLikedTrack = useStore((s) => s.addLikedTrack);
  const addDislikedTrackId = useStore((s) => s.addDislikedTrackId);
  const tasteProfile = useStore((s) => s.tasteProfile);
  const tasteVersion = useStore((s) => s.tasteVersion);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const fetchingRef = useRef(false);
  const lastTasteVersionRef = useRef(tasteVersion);

  const loadRecommendations = useCallback(async (append: boolean = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const tracks = await fetchRecommendations({
        seedGenres: tasteProfile.seedGenres,
        seedTrackIds: tasteProfile.seedTrackIds,
        seedArtistIds: tasteProfile.seedArtistIds,
      });
      console.log('[Soundmatch] Discover loaded', tracks.length, 'tracks');
      if (append) {
        setRecommendations([...useStore.getState().recommendations, ...tracks]);
      } else {
        setRecommendations(tracks);
      }
    } catch (e: unknown) {
      console.log('[Soundmatch] Discover error', e);
      setError(e instanceof Error ? e.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [tasteProfile, setRecommendations]);

  useEffect(() => {
    if (recommendations.length === 0) {
      loadRecommendations(false);
    }
  }, []);

  useEffect(() => {
    if (tasteVersion !== lastTasteVersionRef.current) {
      lastTasteVersionRef.current = tasteVersion;
      loadRecommendations(false);
    }
  }, [tasteVersion, loadRecommendations]);

  const handleSwipeRight = useCallback(
    (track: Track) => {
      addLikedTrack(track);
    },
    [addLikedTrack],
  );

  const handleSwipeLeft = useCallback(
    (track: Track) => {
      addDislikedTrackId(track.id);
    },
    [addDislikedTrackId],
  );

  const handleNearEnd = useCallback(() => {
    loadRecommendations(true);
  }, [loadRecommendations]);

  if (loading && recommendations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Finding music for you...</Text>
      </View>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadRecommendations(false)}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TUNED TO YOUR LISTENING</Text>
          <Text style={styles.title}>Discover</Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.7}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <CardStack
        tracks={recommendations}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        onNearEnd={handleNearEnd}
        isFocused={isFocused}
      />

      <SeedFilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 10,
    paddingHorizontal: 18,
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
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.lineStrong,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.md,
  },
  errorText: {
    color: COLORS.dislike,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
