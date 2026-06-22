import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, SPACING, RADII } from '../constants/theme';
import {
  createAuthRequest,
  exchangeCode,
  fetchUserProfile,
  DISCOVERY,
} from '../services/spotify';
import type { AuthRequest } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<AuthRequest | null>(null);

  useEffect(() => {
    const req = createAuthRequest();
    req.makeAuthUrlAsync(DISCOVERY).then(() => setRequest(req));
  }, []);

  const handleLogin = async () => {
    if (!request) return;
    setLoading(true);
    setError(null);

    try {
      const result = await request.promptAsync(DISCOVERY);

      if (result.type === 'success' && result.params.code) {
        await exchangeCode(result.params.code, request);
        await fetchUserProfile();
      } else if (result.type === 'error') {
        setError(result.params.error_description ?? 'Authentication failed');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoIcon}>
          <View style={styles.eqBars}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.eqBar, { height: [14, 20, 12, 18][i] }]} />
            ))}
          </View>
        </View>
        <Text style={styles.logo}>
          SOUND<Text style={styles.logoAccent}>MATCH</Text>
        </Text>
        <Text style={styles.tagline}>
          Swipe through songs like you'd swipe through dates. Heart the ones you love — build a mix of perfect matches.
        </Text>
      </View>

      <View style={styles.bottom}>
        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, (!request || loading) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!request || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.spotifyInk} />
          ) : (
            <Text style={styles.buttonText}>Connect Spotify</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          We only access your public profile and playlists. Your credentials are
          never stored.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 140,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  eqBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 22,
  },
  eqBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.accentInk,
  },
  logo: {
    fontSize: 34,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: 0.3,
    marginBottom: 18,
  },
  logoAccent: {
    color: COLORS.accent,
  },
  tagline: {
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  bottom: {
    alignItems: 'center',
  },
  error: {
    color: COLORS.dislike,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.spotify,
    paddingVertical: 15,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.spotifyInk,
    fontSize: 15,
    fontWeight: '700',
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
