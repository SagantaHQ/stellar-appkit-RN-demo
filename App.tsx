/**
 * App root.
 *
 * Layout notes:
 * - `GestureHandlerRootView` must wrap the app — @gorhom/bottom-sheet (which
 *   the AppKit modal uses) requires a gesture-handler root.
 * - The `AppKitModal` is intentionally mounted unconditionally: it renders
 *   null while closed, but staying mounted preserves its internal state
 *   (e.g. which mobile wallet you paired with via deep link), so the signing
 *   view can still offer "reopen wallet" after the sheet has been dismissed.
 * - `{albedoView}` renders the Albedo confirm WebView on demand — the bridge
 *   hands us a ready-made screen element; it must live at the app root so it
 *   can cover whatever is on screen.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppKitModal } from '@saganta/stellar-appkit-react-native/ui';
import { AppKitProvider, useAppKitDemo } from './src/appkit';
import { HomeScreen } from './src/screens/HomeScreen';

/** Light status-bar content on dark backgrounds, dark on light. */
function isDarkColor(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return true;
  const n = Number.parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  // Perceived luminance (Rec. 601) — dark theme below ~0.4.
  return 0.299 * r + 0.587 * g + 0.114 * b < 102;
}

function Root() {
  const { client, modalOpen, closeModal, albedoView, theme } = useAppKitDemo();
  return (
    <View style={[styles.root, { backgroundColor: theme.colorBg }]}>
      <StatusBar style={isDarkColor(theme.colorBg) ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <HomeScreen />
      </SafeAreaView>

      {/* Always mounted — see the comment atop this file. */}
      <AppKitModal client={client} open={modalOpen} onClose={closeModal} theme={theme} />

      {/* Albedo WebView screen (rendered on demand by the bridge). */}
      {albedoView}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppKitProvider>
          <Root />
        </AppKitProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
});
