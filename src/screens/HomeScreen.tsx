/**
 * HomeScreen — the demo itself.
 *
 * Shows the four things every Stellar AppKit RN integration needs:
 *   1. Connect   — open the AppKit modal (bottom sheet): named mobile wallets
 *                  via deep link (21 built-in, deep-link only — no QR on a
 *                  phone), Albedo via WebView.
 *   2. Session   — address, wallet, network, live TESTNET balance (Horizon).
 *   3. Sign      — signMessage() and signTransaction() through whichever wallet
 *                  is connected; results rendered as XDR / signature blocks.
 *   4. Theme     — all 10 modal themes, live-switched, also restyling this screen.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useAppKit, WalletIcon, AppKitModal } from '@saganta/stellar-appkit-react-native/ui';
import { DEMO_MESSAGE, DEMO_PAYMENT_AMOUNT } from '../constants';
import { THEMES, useAppKitDemo } from '../appkit';
import {
  Badge,
  Banner,
  BodyText,
  Button,
  Card,
  Chip,
  CodeBlock,
  MutedText,
  MonoText,
  Row,
  Title,
  shortAddress,
} from '../components/ui';
import { buildSelfPaymentXdr, fetchAccountInfo } from '../stellar';

interface SignOutput {
  title: string;
  lines: { label: string; value: string; mono?: boolean }[];
}

export function HomeScreen() {
  const {
    client,
    openModal,
    theme,
    themeId,
    setThemeId,
    walletConnectConfigured,
    presentation,
    setPresentation,
  } = useAppKitDemo();
  const state = useAppKit(client);

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [signOutput, setSignOutput] = useState<SignOutput | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'message' | 'transaction' | null>(null);
  const wasPending = useRef(false);

  const connected = state.status === 'connected' && state.session != null;

  // ---------------------------------------------------------------- balance --
  const loadBalance = useCallback(async () => {
    if (!state.session) return;
    setBalanceError(null);
    try {
      const info = await fetchAccountInfo(state.session.address);
      setBalance(`${Number(info.nativeBalance).toLocaleString('en-US')} XLM`);
    } catch (err) {
      setBalance(null);
      setBalanceError(err instanceof Error ? err.message : String(err));
    }
  }, [state.session]);

  useEffect(() => {
    if (connected) void loadBalance();
  }, [connected, loadBalance]);

  // ----------------------------------------------------- signing UX wiring --
  // When a sign request enters the queue, re-open the modal so the user sees
  // the signing view (and, for deep-link pairings, the "reopen wallet" button).
  useEffect(() => {
    const pending = state.pendingSignCount > 0;
    if (pending && !wasPending.current) {
      setSignOutput(null);
      setActionError(null);
      openModal();
    }
    wasPending.current = pending;
  }, [state.pendingSignCount, openModal]);

  // ------------------------------------------------------------- actions ----
  const signMessageDemo = useCallback(async () => {
    if (!connected) return;
    setBusy('message');
    setActionError(null);
    try {
      const result = await client.signMessage(DEMO_MESSAGE);
      setSignOutput({
        title: 'Message signed',
        lines: [
          { label: 'signer', value: shortAddress(result.signerAddress, 10) },
          { label: 'signature', value: result.signedMessage, mono: true },
          ...(result.signedData ? [{ label: 'signedData (base64)', value: result.signedData, mono: true }] : []),
        ],
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }, [client, connected]);

  const signTransactionDemo = useCallback(async () => {
    if (!state.session) return;
    setBusy('transaction');
    setActionError(null);
    try {
      const info = await fetchAccountInfo(state.session.address);
      const xdr = await buildSelfPaymentXdr(info.address, info.sequence);
      const result = await client.signTransaction(xdr);
      setSignOutput({
        title: `Payment signed (${DEMO_PAYMENT_AMOUNT} XLM to yourself)`,
        lines: [
          { label: 'signer', value: shortAddress(result.signerAddress, 10) },
          { label: 'signed XDR', value: result.signedTxXdr, mono: true },
        ],
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }, [client, state.session]);

  const disconnect = useCallback(async () => {
    setSignOutput(null);
    setBalance(null);
    setBalanceError(null);
    setActionError(null);
    await client.disconnect();
  }, [client]);

  // ---------------------------------------------------------------- render --
  return (
    <ScrollView
      style={{ backgroundColor: theme.colorBg, flex: 1 }}
      contentContainerStyle={styles.content}
      refreshControl={
        connected ? (
          <RefreshControl
            refreshing={false}
            onRefresh={loadBalance}
            tintColor={theme.colorAccent}
          />
        ) : undefined
      }
    >
      {/* header */}
      <View style={styles.header}>
        <View>
          <Title theme={theme}>Stellar AppKit</Title>
          <MutedText theme={theme}>React Native · Expo Go demo</MutedText>
        </View>
        <Badge theme={theme} label="TESTNET" />
      </View>

      {/* WalletConnect setup hint */}
      {!walletConnectConfigured && (
        <Banner theme={theme}>
          <BodyText theme={theme} style={{ fontWeight: '600' }}>
            WalletConnect pairing is not configured
          </BodyText>
          <MutedText theme={theme}>
            The demo runs end-to-end with Albedo right now. To pair Freighter, LOBSTR, HOT Wallet or
            Scopuly over the WalletConnect relay, put a free project id from cloud.walletconnect.com into{' '}
            <MonoText theme={theme}>EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID</MonoText> (.env) and restart the
            dev server.
          </MutedText>
        </Banner>
      )}

      {/* modal presentation — bottom sheet or the embedded inline panel */}
      <Card theme={theme}>
        <BodyText theme={theme} style={{ fontWeight: '700' }}>
          Modal presentation
        </BodyText>
        <MutedText theme={theme}>
          The same modal, two presentations (like the web SDK): a bottom sheet over your screen, or an
          inline panel embedded in the page for users who dislike sheets.
        </MutedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
          <Chip
            theme={theme}
            label="Bottom sheet"
            active={presentation === 'bottomsheet'}
            accent={theme.colorAccent}
            onPress={() => setPresentation('bottomsheet')}
          />
          <Chip
            theme={theme}
            label="Inline panel"
            active={presentation === 'inline'}
            accent={theme.colorAccent}
            onPress={() => setPresentation('inline')}
          />
        </View>
      </Card>

      {/* inline presentation — the modal embedded in the page (web mode="inline") */}
      {presentation === 'inline' && (
        <AppKitModal client={client} mode="inline" open onClose={() => {}} theme={theme} />
      )}

      {/* session / connect */}
      {connected && state.session ? (
        <Card theme={theme}>
          <View style={styles.walletRow}>
            <WalletIcon
              source={state.walletIcon}
              fallbackLabel={state.walletName ?? 'Wallet'}
              size={44}
              radius={12}
            />
            <View style={{ flexShrink: 1 }}>
              <BodyText theme={theme} style={{ fontWeight: '700' }}>
                {state.walletName ?? 'Wallet'}
              </BodyText>
              <MonoText theme={theme} numberOfLines={1}>
                {state.session.address}
              </MonoText>
            </View>
          </View>
          <Row theme={theme} label="Network" value="TESTNET" />
          <Row theme={theme} label="Balance" value={balance ?? (balanceError ? 'unavailable' : '…')} danger={!!balanceError} />
          {balanceError ? <MutedText theme={theme}>{balanceError}</MutedText> : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button theme={theme} label="Manage" tone="secondary" onPress={openModal} />
            </View>
            <View style={{ flex: 1 }}>
              <Button theme={theme} label="Disconnect" tone="danger" onPress={disconnect} />
            </View>
          </View>
        </Card>
      ) : (
        <Card theme={theme}>
          <BodyText theme={theme} style={{ fontWeight: '700' }}>
            No wallet connected
          </BodyText>
          <MutedText theme={theme}>
            Tap connect to open the AppKit bottom sheet. With WalletConnect configured: Freighter, LOBSTR,
            HOT Wallet and Scopuly open straight from deep links, other wallets pair by QR, and Albedo runs
            in an in-app WebView.
          </MutedText>
          <Button theme={theme} label="Connect Wallet" onPress={openModal} />
        </Card>
      )}

      {/* signing demos */}
      {connected && (
        <Card theme={theme}>
          <BodyText theme={theme} style={{ fontWeight: '700' }}>
            Try it
          </BodyText>
          <MutedText theme={theme}>
            Both actions route through AppKit&apos;s sign queue — the wallet you connected with will ask
            you to approve. For deep-link pairings, the modal offers to reopen the wallet app.
          </MutedText>
          <Button
            theme={theme}
            label="Sign a message"
            busy={busy === 'message'}
            disabled={busy === 'transaction'}
            onPress={signMessageDemo}
          />
          <Button
            theme={theme}
            label={`Sign a ${DEMO_PAYMENT_AMOUNT} XLM self-payment`}
            tone="secondary"
            busy={busy === 'transaction'}
            disabled={busy === 'message'}
            onPress={signTransactionDemo}
          />
          {actionError ? (
            <Card theme={theme} style={{ backgroundColor: 'transparent', borderColor: theme.colorDanger }}>
              <MutedText theme={theme}>Sign failed</MutedText>
              <MonoText theme={theme}>{actionError}</MonoText>
            </Card>
          ) : null}
          {signOutput ? (
            <View style={{ gap: 8 }}>
              <MutedText theme={theme}>{signOutput.title}</MutedText>
              {signOutput.lines.map((line) => (
                <View key={line.label} style={{ gap: 4 }}>
                  <MutedText theme={theme}>{line.label}</MutedText>
                  <CodeBlock theme={theme} value={line.value} />
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      )}

      {/* theme picker */}
      <Card theme={theme}>
        <BodyText theme={theme} style={{ fontWeight: '700' }}>
          Modal theme
        </BodyText>
        <MutedText theme={theme}>
          The same 10 themes as the web SDK — switching here restyles the modal and this screen.
        </MutedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
          {THEMES.map((option) => (
            <Chip
              key={option.id}
              theme={theme}
              label={option.label}
              active={option.id === themeId}
              accent={option.value.colorAccent}
              onPress={() => setThemeId(option.id)}
            />
          ))}
        </View>
      </Card>

      {/* footer */}
      <Card theme={theme} style={{ gap: 6 }}>
        <MutedText theme={theme}>
          @saganta/stellar-appkit-react-native · from npm
        </MutedText>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <MutedText
            theme={theme}
            style={{ color: theme.colorAccent }}
            onPress={() => void Linking.openURL('https://github.com/SagantaHQ/stellar-appkit')}
          >
            Library
          </MutedText>
          <MutedText
            theme={theme}
            style={{ color: theme.colorAccent }}
            onPress={() => void Linking.openURL('https://github.com/SagantaHQ/stellar-appkit-RN-demo')}
          >
            Demo source
          </MutedText>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingTop: 24,
    gap: 14,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
