import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { fetchRecommendations } from '../services/spotify';
import { Track } from '../types';
import CardStack from '../components/CardStack';
import { COLORS, SPACING } from '../constants/theme';

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
      if (append) {
        setRecommendations([...useStore.getState().recommendations, ...tracks]);
      } else {
        setRecommendations(tracks);
      }
    } catch (e: unknown) {
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding music for you...</Text>
      </View>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={() => loadRecommendations(false)}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Swipe to discover new music</Text>
      </View>

      <CardStack
        tracks={recommendations}
        onSwipeRight={handleSwipeRight}
        onSwipeLeft={handleSwipeLeft}
        onNearEnd={handleNearEnd}
        isFocused={isFocused}
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
    paddingTop: 60,
    paddingBottom: SPACING.md,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
