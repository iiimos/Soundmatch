import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearSession } from '../services/spotify';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, RADII, FONTS } from '../constants/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[styles.toggle, on && styles.toggleOn]}
    >
      <View style={[styles.toggleThumb, on && styles.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const clearRecommendations = useStore((s) => s.clearRecommendations);
  const hidePreviewUnavailable = useStore((s) => s.hidePreviewUnavailable);
  const setHidePreviewUnavailable = useStore((s) => s.setHidePreviewUnavailable);

  const handleClearCache = () => {
    clearRecommendations();
    Alert.alert('Cache Cleared', 'Recommendation cache has been cleared.');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          onClose();
          await clearSession();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={17} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hide preview unavailable toggle */}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="volume-mute-outline" size={17} color={COLORS.accent} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Hide "Preview Unavailable"</Text>
              <Text style={styles.rowDesc}>Remove the badge from song cards</Text>
            </View>
            <Toggle
              on={hidePreviewUnavailable}
              onToggle={() => setHidePreviewUnavailable(!hidePreviewUnavailable)}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleClearCache} activeOpacity={0.7}>
            <View style={styles.rowIcon}>
              <Ionicons name="trash-outline" size={17} color={COLORS.accent} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Clear Cache</Text>
              <Text style={styles.rowDesc}>Reset recommendation stack</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(235, 66, 77, 0.14)' }]}>
              <Ionicons name="log-out-outline" size={17} color={COLORS.dislike} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: COLORS.dislike }]}>Sign Out</Text>
              <Text style={styles.rowDesc}>Disconnect your Spotify account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 4, 10, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  sheet: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.display,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 13,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 1,
  },
  rowDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.line,
  },
  toggle: {
    width: 46,
    height: 28,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surfaceHover,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: COLORS.accent,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
});
