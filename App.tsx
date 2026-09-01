/**
 * App root.
 *
 * Layout notes:
 * - `GestureHandlerRootView` must wrap the app — @gorhom/bottom-sheet (which
 *   the AppKit modal uses) requires a gesture-handler root.
 * - In the default "bottomsheet" presentation the `AppKitModal` is
 *   intentionally mounted unconditionally: it renders null while closed, but
 *   staying mounted preserves its internal state (e.g. which mobile wallet
 *   you paired with via deep link), so the signing view can still offer
 *   "reopen wallet" after the sheet has been dismissed.
 * - In the "inline" presentation (web `mode="inline"` parity) the panel is
 *   embedded inside the HomeScreen scroll instead — no overlay at all — so
 *   the root renders nothing modal.
 * - `{albedoView}` renders the Albedo confirm WebView on demand,
 *   `{xbullView}` the xBull web wallet, and `{browserView}` the in-app web
 *   browser (explorer/install/docs links) — the bridges hand us ready-made
 *   screen elements; they must live at the app root so they can cover
 *   whatever is on screen.
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
  const { client, modalOpen, closeModal, albedoView, xbullView, browserView, theme, presentation, browser } = useAppKitDemo();
  return (
    <View style={[styles.root, { backgroundColor: theme.colorBg }]}>
      <StatusBar style={isDarkColor(theme.colorBg) ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <HomeScreen />
      </SafeAreaView>

      {/* Bottom-sheet presentation — always mounted, see the comment atop
          this file. The inline presentation renders inside HomeScreen. The
          browser prop makes explorer/install/footer links open in the
          in-app WebView instead of leaving the app. */}
      {presentation === 'bottomsheet' && (
        <AppKitModal
          client={client}
          open={modalOpen}
          onClose={closeModal}
          theme={theme}
          browser={browser}
        />
      )}

      {/* Albedo + xBull WebView screens, and the in-app web browser —
          all rendered on demand by their bridges/sessions. */}
      {albedoView}
      {xbullView}
      {browserView}
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
