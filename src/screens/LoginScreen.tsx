import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, SPACING } from '../constants/theme';
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
        <Text style={styles.logo}>Soundmatch</Text>
        <Text style={styles.tagline}>Swipe. Discover. Listen.</Text>
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
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.buttonText}>Connect with Spotify</Text>
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
    paddingTop: 120,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
