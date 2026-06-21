import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { Track } from '../types';
import TinderCard from './TinderCard';
import SongCard from './SongCard';
import ArtistInfoModal from './ArtistInfoModal';
import { COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.35;
const MAX_VISIBLE = 3;

interface CardStackProps {
  tracks: Track[];
  onSwipeRight: (track: Track) => void;
  onSwipeLeft: (track: Track) => void;
  onNearEnd: () => void;
  isFocused: boolean;
}

export default function CardStack({
  tracks,
  onSwipeRight,
  onSwipeLeft,
  onNearEnd,
  isFocused,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const currentTrack = tracks[currentIndex] ?? null;

  const stopAudio = useCallback(async () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch {}
      playerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(
    async (previewUrl: string) => {
      await stopAudio();
      try {
        await setAudioModeAsync({ playsInSilentMode: true });
        const player = createAudioPlayer(previewUrl);
        (player as any).addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
        playerRef.current = player;
        player.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    },
    [stopAudio],
  );

  useEffect(() => {
    if (!isFocused) {
      stopAudio();
      return;
    }
    if (currentTrack?.previewUrl) {
      playAudio(currentTrack.previewUrl);
    } else {
      stopAudio();
    }
  }, [currentIndex, isFocused, currentTrack?.previewUrl, playAudio, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  useEffect(() => {
    if (tracks.length > 0 && currentIndex >= tracks.length - 5) {
      onNearEnd();
    }
  }, [currentIndex, tracks.length, onNearEnd]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const track = tracks[currentIndexRef.current];
      if (!track) return;

      if (direction === 'right') {
        onSwipeRight(track);
      } else {
        onSwipeLeft(track);
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [tracks, onSwipeRight, onSwipeLeft],
  );

  const togglePlay = useCallback(async () => {
    if (!currentTrack?.previewUrl) return;

    if (isPlaying && playerRef.current) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else if (playerRef.current) {
      playerRef.current.play();
      setIsPlaying(true);
    } else {
      await playAudio(currentTrack.previewUrl);
    }
  }, [currentTrack, isPlaying, playAudio]);

  const visibleTracks = tracks.slice(currentIndex, currentIndex + MAX_VISIBLE);

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {visibleTracks
          .map((track, i) => {
            const isTop = i === 0;
            const scale = 1 - i * 0.04;
            const translateY = i * 10;

            return (
              <View
                key={track.id}
                style={[
                  styles.cardWrapper,
                  {
                    zIndex: MAX_VISIBLE - i,
                    transform: isTop ? [] : [{ scale }, { translateY }],
                  },
                ]}
                pointerEvents={isTop ? 'auto' : 'none'}
              >
                <TinderCard
                  enabled={isTop}
                  onSwipeRight={() => handleSwipe('right')}
                  onSwipeLeft={() => handleSwipe('left')}
                >
                  <SongCard
                    track={track}
                    isPlaying={isTop && isPlaying}
                    onTogglePlay={isTop ? togglePlay : () => {}}
                    onInfoPress={isTop ? () => setModalTrack(track) : () => {}}
                  />
                </TinderCard>
              </View>
            );
          })
          .reverse()}
      </View>

      <ArtistInfoModal
        visible={modalTrack !== null}
        track={modalTrack}
        onClose={() => setModalTrack(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardWrapper: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
});
