/**
 * HomeScreen — the demo itself.
 *
 * One card per capability, mirroring the web demo suite:
 *   1. Connect / session  — open the AppKit modal (bottom sheet or inline):
 *                           21 deep-link mobile wallets, Albedo + xBull via
 *                           WebView, live TESTNET balance.
 *   2. Language           — all 25 core locales, live-switched (the modal,
 *                           preview, account view and SIWS screens all
 *                           translate instantly; the device language is the
 *                           default at startup).
 *   3. Sign               — signMessage() and signTransaction(). Both now go
 *                           through the modal's transaction PREVIEW first —
 *                           decoded operations, risk flags, fee — exactly
 *                           like the web SDK, then the wallet prompt.
 *   4. Send XLM           — build → preview → sign → SUBMIT to Testnet. The
 *                           recipient really receives the XLM.
 *   5. SIWS               — Sign-In With Stellar: connect + sign-in + real
 *                           signature verification (the siws-verify package
 *                           runs as an on-device "server"), session status.
 *   6. Testnet funds      — friendbot faucet + balance refresh.
 *   7. Theme              — all 10 modal themes, live-switched.
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
import type { SiwsSession } from '@saganta/stellar-appkit-react-native';
import { DEMO_MESSAGE, DEMO_PAYMENT_AMOUNT, DOCS_URL, LIBRARY_URL } from '../constants';
import { LOCALES, THEMES, useAppKitDemo } from '../appkit';
import {
  Badge,
  Banner,
  BodyText,
  Button,
  Card,
  Chip,
  CodeBlock,
  Field,
  MutedText,
  MonoText,
  Row,
  Title,
  shortAddress,
} from '../components/ui';
import {
  buildPaymentXdr,
  buildSelfPaymentXdr,
  fetchAccountInfo,
  fundTestnetAccount,
  submitSignedTx,
} from '../stellar';

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
    locale,
    setAppLocale,
    siwsEnabled,
    setSiwsEnabled,
    autoCloseOnComplete,
    setAutoCloseOnComplete,
    browser,
  } = useAppKitDemo();
  const state = useAppKit(client);

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [signOutput, setSignOutput] = useState<SignOutput | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'message' | 'transaction' | null>(null);

  // Send-XLM example state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('1');
  const [sendBusy, setSendBusy] = useState<'building' | 'signing' | 'submitting' | null>(null);
  const [sendResult, setSendResult] = useState<{ hash: string; explorerUrl: string } | null>(null);

  // SIWS state
  const [siwsSession, setSiwsSession] = useState<SiwsSession | null>(null);
  const [fundBusy, setFundBusy] = useState(false);
  const [fundMessage, setFundMessage] = useState<string | null>(null);
  const wasPending = useRef(false);

  // In-app browser detection state (the card shows which surface won).
  const [chromeTabs, setChromeTabs] = useState<boolean | null>(null);

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

  // -------------------------------------------------- signing UX wiring --
  // When a sign request enters the queue, re-open the modal so the user sees
  // the PREVIEW (decoded operations + fee) — approve it and the signing view
  // takes over; for deep-link pairings it also offers "reopen wallet".
  useEffect(() => {
    const pending = state.pendingSignCount > 0;
    if (pending && !wasPending.current) {
      setSignOutput(null);
      setActionError(null);
      openModal();
    }
    wasPending.current = pending;
  }, [state.pendingSignCount, openModal]);

  // ------------------------------------------------------------- SIWS state --
  useEffect(() => {
    const update = () => setSiwsSession(client.siwsSession);
    update();
    const off = client.on('siwsSessionChange', update);
    return off;
  }, [client]);

  // ------------------------------------------------- in-app browser detection --
  // Which system surface won on this device: reborn's Chrome Tab when the
  // native module exists (dev-client / EAS builds), expo-web-browser's
  // Custom Tabs in Expo Go, external browser as the last resort.
  useEffect(() => {
    let alive = true;
    browser
      .isChromeTabsAvailable()
      .then((available) => {
        if (alive) setChromeTabs(available);
      })
      .catch(() => {
        if (alive) setChromeTabs(false);
      });
    return () => {
      alive = false;
    };
  }, [browser]);

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

  // Send XLM — the web demo's send-xlm flow on RN: build the payment, sign it
  // through the modal's preview, then submit the signed envelope to Horizon.
  const sendXlmDemo = useCallback(async () => {
    if (!state.session) return;
    setSendBusy('building');
    setActionError(null);
    setSendResult(null);
    try {
      const info = await fetchAccountInfo(state.session.address);
      const target = recipient.trim() || state.session.address;
      const xdr = await buildPaymentXdr(info.address, info.sequence, target, amount.trim());

      setSendBusy('signing');
      const signed = await client.signTransaction(xdr);

      setSendBusy('submitting');
      const result = await submitSignedTx(signed.signedTxXdr);
      setSendResult(result);
      void loadBalance();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSendBusy(null);
    }
  }, [client, state.session, recipient, amount, loadBalance]);

  const fundDemo = useCallback(async () => {
    if (!state.session) return;
    setFundBusy(true);
    setFundMessage(null);
    try {
      await fundTestnetAccount(state.session.address);
      setFundMessage('Funding requested — the balance updates within a few seconds.');
      setTimeout(() => void loadBalance(), 2000);
      setTimeout(() => void loadBalance(), 5000);
    } catch (err) {
      setFundMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setFundBusy(false);
    }
  }, [state.session, loadBalance]);

  const siwsSignOut = useCallback(async () => {
    await client.signOut();
    setSiwsSession(null);
  }, [client]);

  const disconnect = useCallback(async () => {
    setSignOutput(null);
    setBalance(null);
    setBalanceError(null);
    setActionError(null);
    setSendResult(null);
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
            The demo runs end-to-end with Albedo and xBull right now. To pair Freighter, LOBSTR, HOT Wallet or
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

      {/* auto-minimize — the sheet dismisses itself when the operation completes */}
      <Card theme={theme}>
        <BodyText theme={theme} style={{ fontWeight: '700' }}>
          Auto-minimize on completion
        </BodyText>
        <MutedText theme={theme}>
          The mobile deep-link pattern: approve in the wallet app (connect or signing), return, and after a
          short “connected” flash the sheet dismisses itself — focus lands back on this screen, no extra
          tap. Rejections and errors never auto-close (you still get the retry pill), and reopening the
          modal for account management never dismisses it. Toggle off for the web modal&apos;s behavior —
          the account view stays open until you close it.
        </MutedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
          <Chip
            theme={theme}
            label="Auto-minimize"
            active={autoCloseOnComplete}
            accent={theme.colorAccent}
            onPress={() => setAutoCloseOnComplete(!autoCloseOnComplete)}
          />
        </View>
      </Card>

      {/* inline presentation — the modal embedded in the page (web mode="inline") */}
      {presentation === 'inline' && (
        <AppKitModal
          client={client}
          mode="inline"
          open
          onClose={() => {}}
          theme={theme}
          browser={browser}
          autoCloseOnComplete={autoCloseOnComplete}
        />
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
            HOT Wallet and Scopuly open straight from deep links, other wallets pair by QR, and Albedo + xBull
            run in an in-app WebView.
          </MutedText>
          <Button theme={theme} label="Connect Wallet" onPress={openModal} />
        </Card>
      )}

      {/* language — every locale the core i18n module ships */}
      <Card theme={theme}>
        <BodyText theme={theme} style={{ fontWeight: '700' }}>
          Language
        </BodyText>
        <MutedText theme={theme}>
          All 25 translations from the core i18n module — the modal (wallet list, preview, account view,
          SIWS screens) switches instantly, exactly like the web SDK. Your device language is applied at
          startup.
        </MutedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
          {LOCALES.map((option) => (
            <Chip
              key={option.code}
              theme={theme}
              label={option.label}
              active={locale === option.code}
              accent={theme.colorAccent}
              onPress={() => void setAppLocale(option.code)}
            />
          ))}
        </View>
      </Card>

      {/* signing demos — both flow through the modal's transaction preview */}
      {connected && (
        <Card theme={theme}>
          <BodyText theme={theme} style={{ fontWeight: '700' }}>
            Sign
          </BodyText>
          <MutedText theme={theme}>
            Both actions open the modal&apos;s preview first — decoded operations, risk flags and the fee,
            just like the web SDK. Approve it and your wallet asks for the signature.
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

      {/* send XLM — build, preview, sign, SUBMIT to Testnet */}
      {connected && (
        <Card theme={theme}>
          <BodyText theme={theme} style={{ fontWeight: '700' }}>
            Send XLM (sign + submit)
          </BodyText>
          <MutedText theme={theme}>
            Builds a real payment, signs it through the modal preview, then submits it to Horizon Testnet —
            the recipient actually receives the XLM. Empty recipient = send to yourself. Need funds? Use
            the faucet below.
          </MutedText>
          <Field
            theme={theme}
            label={`Recipient (defaults to yourself)`}
            value={recipient}
            onChangeText={setRecipient}
            placeholder={`G… (your address)`}
            mono
          />
          <Field
            theme={theme}
            label="Amount (XLM)"
            value={amount}
            onChangeText={setAmount}
            placeholder="1"
            keyboardType="decimal-pad"
          />
          <Button
            theme={theme}
            label={
              sendBusy === 'building'
                ? 'Loading account…'
                : sendBusy === 'signing'
                  ? 'Check the preview / your wallet…'
                  : sendBusy === 'submitting'
                    ? 'Submitting to Testnet…'
                    : 'Send XLM'
            }
            busy={sendBusy !== null}
            disabled={busy !== null}
            onPress={sendXlmDemo}
          />
          {sendResult ? (
            <View style={{ gap: 6 }}>
              <MutedText theme={theme}>Transaction submitted</MutedText>
              <MonoText theme={theme}>{sendResult.hash}</MonoText>
              <MutedText
                theme={theme}
                style={{ color: theme.colorAccent, fontWeight: '600' }}
                onPress={() => void Linking.openURL(sendResult.explorerUrl)}
              >
                View on the explorer →
              </MutedText>
            </View>
          ) : null}
        </Card>
      )}

      {/* SIWS — Sign-In With Stellar */}
      <Card theme={theme}>
        <BodyText theme={theme} style={{ fontWeight: '700' }}>
          SIWS — Sign-In With Stellar
        </BodyText>
        <MutedText theme={theme}>
          Wallet-based sign-in: after connecting, the modal runs the sign-in flow (checking session → nonce
          → approve in wallet → verifying) and the signature is verified with the real{' '}
          <MonoText theme={theme}>siws-verify</MonoText> package running as an on-device server. Production
          apps move session/nonce/verify to a backend.
        </MutedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
          <Chip
            theme={theme}
            label="SIWS enabled"
            active={siwsEnabled}
            accent={theme.colorAccent}
            onPress={() => setSiwsEnabled(!siwsEnabled)}
          />
        </View>
        {siwsEnabled ? (
          connected ? (
            siwsSession ? (
              <View style={{ gap: 6 }}>
                <Row theme={theme} label="Signed in as" value={shortAddress(siwsSession.address, 8)} />
                <Row
                  theme={theme}
                  label="Session expires"
                  value={new Date(siwsSession.expiry).toLocaleTimeString('en-US')}
                  danger={siwsSession.expiry < Date.now()}
                />
                <Button theme={theme} label="Sign out" tone="danger" onPress={siwsSignOut} />
              </View>
            ) : (
              <MutedText theme={theme}>
                Not signed in yet — open the modal and reconnect (or disconnect and connect again) to run
                the sign-in flow.
              </MutedText>
            )
          ) : (
            <MutedText theme={theme}>Connect a wallet to sign in.</MutedText>
          )
        ) : null}
      </Card>

      {/* in-app browser — themed Chrome Custom Tab / SFSafariViewController */}
      <Card theme={theme}>
        <BodyText theme={theme} style={{ fontWeight: '700' }}>
          In-app browser
        </BodyText>
        <MutedText theme={theme}>
          Web links (explorer, wallet install pages, the modal footer) open in a themed Chrome Custom Tab /
          SFSafariViewController instead of the heavy WebView — the system browser supports passkeys, which
          the WebView cannot, and shares the browser&apos;s wallet session. Preference chain:
          react-native-inappbrowser-reborn (dev-client / EAS builds) → expo-web-browser (Expo Go) → external
          browser. Albedo and xBull still use the in-app WebView because their popups talk postMessage to the
          opener window — a Custom Tab has no such channel back into the app.
        </MutedText>
        <Row
          theme={theme}
          label="Preferred surface"
          value={browser.surface === 'reborn' ? 'inappbrowser-reborn' : browser.surface === 'expo' ? 'expo-web-browser' : 'external browser'}
        />
        <Row
          theme={theme}
          label="Chrome Custom Tabs"
          value={chromeTabs === null ? 'detecting…' : chromeTabs ? 'available' : 'not detected'}
          danger={chromeTabs === false}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              theme={theme}
              label="Open the docs (themed)"
              tone="secondary"
              onPress={() => void browser.open(DOCS_URL)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              theme={theme}
              label="Open on GitHub"
              tone="secondary"
              onPress={() => void browser.open(LIBRARY_URL)}
            />
          </View>
        </View>
        <MutedText theme={theme}>
          Also try the explorer links inside the modal&apos;s account view — they use the same themed tab, and
          switching the theme below restyles it live.
        </MutedText>
      </Card>

      {/* testnet funds — friendbot faucet */}
      {connected && (
        <Card theme={theme}>
          <BodyText theme={theme} style={{ fontWeight: '700' }}>
            Testnet funds
          </BodyText>
          <MutedText theme={theme}>
            The friendbot faucet credits your address with 10,000 test XLM — the same button the modal&apos;s
            account view shows (Get Testnet funds). One tap per account.
          </MutedText>
          <Button theme={theme} label="Get Testnet funds" tone="secondary" busy={fundBusy} onPress={fundDemo} />
          {fundMessage ? <MutedText theme={theme}>{fundMessage}</MutedText> : null}
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
            onPress={() => void browser.open(LIBRARY_URL)}
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
