import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { COLORS, RADII, FONTS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 380);
const DURATION = 30;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

interface MockPlayerProps {
  track: Track | null;
}

export default function MockPlayer({ track }: MockPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTrackId = useRef<string | null>(null);

  // Reset when track changes
  if (track?.id !== prevTrackId.current) {
    prevTrackId.current = track?.id ?? null;
    if (playing) {
      setPlaying(false);
    }
    if (elapsed !== 0) {
      setElapsed(0);
    }
  }

  useEffect(() => {
    if (playing) {
      const start = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const now = (Date.now() - start) / 1000;
        if (now >= DURATION) {
          setPlaying(false);
          setElapsed(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setElapsed(now);
        }
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (elapsed >= DURATION) setElapsed(0);
      setPlaying(true);
    }
  };

  const pct = (elapsed / DURATION) * 100;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.7}>
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={16}
            color={COLORS.accentInk}
            style={!playing ? { marginLeft: 2 } : undefined}
          />
        </TouchableOpacity>

        <View style={styles.trackInfo}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              {playing ? '30-SEC PREVIEW' : 'TAP TO PREVIEW'} · {fmt(elapsed)}
            </Text>
            <Text style={styles.duration}>0:30</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        {playing && (
          <View style={styles.eqBars}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.eqBar, { height: [8, 13, 6, 11][i] }]} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 12,
    marginTop: -14,
    zIndex: -1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderBottomLeftRadius: RADII.lg,
    borderBottomRightRadius: RADII.lg,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingTop: 22,
    paddingBottom: 14,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  duration: {
    fontSize: 11,
    fontFamily: FONTS.mono,
    letterSpacing: 0.4,
    color: COLORS.textMuted,
  },
  progressBg: {
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.lineStrong,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.accent,
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
