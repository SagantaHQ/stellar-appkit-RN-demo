import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * Feature parity with the web `<stellar-appkit-modal>` adapted to native
 * idioms (per ARCHITECTURE.md's RN plan):
 *
 * - Wallet list with live reachability states (WalletConnect pinned first)
 * - WalletConnect pairing view with the **mobile-first flow**: instead of
 *   leading with a QR code, registered deep-link wallets (Freighter) are
 *   offered first — tap one and we hand off to the wallet with the pairing
 *   URI embedded (`freighterwallet://wc?uri=...`), Solana-Mobile-Adapter
 *   style. QR remains the fallback for every other wallet.
 * - Connecting / signing views with the same animation timings as web
 *   v1.9.50 (2.5s breathe, 2s spinner, reduced-motion aware)
 * - Account view with share/disconnect
 * - Error view with retry
 *
 * Presentation: @gorhom/bottom-sheet with a backdrop, swipe-to-dismiss.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Linking, Platform, Pressable, Share, StyleSheet, Text, View, } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import QRCode from 'react-native-qrcode-svg';
import { t } from '@saganta/stellar-appkit';
import { listMobileWallets, buildWalletConnectDeepLink, buildOpenWalletAppLink } from '../deep-links.js';
import { useAppKit } from './useAppKit.js';
import { useBreathe, useReducedMotion, useSpinner } from './animations.js';
import { defaultTheme } from './theme.js';
export function AppKitModal({ client, open, onClose, theme = defaultTheme }) {
    const state = useAppKit(client);
    const reducedMotion = useReducedMotion();
    const [view, setView] = useState('list');
    const [walletRows, setWalletRows] = useState([]);
    const [loadingWallets, setLoadingWallets] = useState(false);
    const [wcUri, setWcUri] = useState(null);
    const [showQr, setShowQr] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [connectingWallet, setConnectingWallet] = useState(null);
    /** The mobile wallet the user paired with via deep link — re-openable for sign requests. */
    const pairedMobileWalletId = useRef(null);
    const sheetRef = useRef(null);
    const styles = useMemo(() => buildStyles(theme), [theme]);
    // --- wallet list loading ---------------------------------------------------
    const refreshWallets = useCallback(async () => {
        setLoadingWallets(true);
        try {
            // listReachability() resolves every connector's status in parallel and
            // pins WalletConnect to the top — exactly the ordering the web modal shows.
            setWalletRows(await client.registry.listReachability());
        }
        finally {
            setLoadingWallets(false);
        }
    }, [client]);
    useEffect(() => {
        if (open) {
            setView(client.session ? 'account' : 'list');
            setWcUri(null);
            setShowQr(false);
            setErrorText(null);
            void refreshWallets();
        }
    }, [open, client, client.session, refreshWallets]);
    // --- client event → view wiring ---------------------------------------------
    useEffect(() => {
        const offs = [
            client.on('statusChange', (status) => {
                if (status === 'connected') {
                    setView('account');
                }
                else if (status === 'error') {
                    setErrorText(null); // the error event carries the message
                    setView('error');
                }
            }),
            client.on('error', (err) => {
                setErrorText(err.message);
                setView('error');
            }),
        ];
        return () => offs.forEach((off) => off());
    }, [client]);
    // Signing view while sign requests are queued and not yet connected-only.
    useEffect(() => {
        if (state.pendingSignCount > 0 && state.status !== 'connected')
            return;
        if (state.pendingSignCount > 0 && view !== 'error') {
            setView('signing');
        }
        else if (state.pendingSignCount === 0 && view === 'signing') {
            setView(client.session ? 'account' : 'list');
        }
    }, [state.pendingSignCount, state.status, client.session, view]);
    // --- connect actions ---------------------------------------------------------
    const connectWallet = useCallback(async (walletId) => {
        const connector = client.registry.get(walletId);
        if (!connector)
            return;
        setConnectingWallet({ name: connector.meta.name, icon: connector.meta.icon ?? null });
        if (walletId === 'walletconnect') {
            // Mobile-first pairing: capture the URI, then let the user pick a
            // deep-link wallet or scan the QR. connect() resolves once the wallet
            // approves over the relay.
            const wc = client.registry.get('walletconnect');
            if (wc && typeof wc.setOnUri === 'function') {
                wc.setOnUri((uri) => setWcUri(uri));
            }
            setView('pairing');
            try {
                await client.connect('walletconnect');
            }
            catch {
                /* surfaced via the error event */
            }
            return;
        }
        setView('connecting');
        try {
            await client.connect(walletId);
        }
        catch {
            /* error event switches to the error view */
        }
    }, [client]);
    const openMobileWallet = useCallback(async (mobileWalletId) => {
        if (!wcUri)
            return;
        pairedMobileWalletId.current = mobileWalletId;
        try {
            await Linking.openURL(buildWalletConnectDeepLink(mobileWalletId, wcUri));
        }
        catch {
            setErrorText(`Could not open the wallet app. Is it installed?`);
            setView('error');
        }
    }, [wcUri]);
    const reopenPairedWallet = useCallback(async () => {
        const id = pairedMobileWalletId.current;
        if (!id)
            return;
        try {
            await Linking.openURL(buildOpenWalletAppLink(id));
        }
        catch {
            /* the wallet prompts manually */
        }
    }, []);
    const disconnect = useCallback(async () => {
        await client.disconnect();
        setView('list');
        void refreshWallets();
    }, [client, refreshWallets]);
    if (!open)
        return null;
    return (_jsx(BottomSheet, { ref: sheetRef, index: 0, snapPoints: ['82%'], enablePanDownToClose: true, onClose: onClose, backdropComponent: (props) => (_jsx(BottomSheetBackdrop, { ...props, disappearsOnIndex: -1, appearsOnIndex: 0, pressBehavior: "close", opacity: 0.6 })), backgroundStyle: { backgroundColor: theme.colorBg, borderTopLeftRadius: theme.radiusLg, borderTopRightRadius: theme.radiusLg }, handleIndicatorStyle: { backgroundColor: theme.colorTextMuted }, children: _jsxs(BottomSheetScrollView, { contentContainerStyle: styles.content, children: [view === 'list' && (_jsx(WalletListView, { styles: styles, theme: theme, loading: loadingWallets, rows: walletRows, onConnect: connectWallet, onInstall: (row) => {
                        const url = Platform.select({ ios: row.connector.meta.installUrl?.ios, android: row.connector.meta.installUrl?.android });
                        if (url)
                            void Linking.openURL(url);
                    } })), view === 'pairing' && (_jsx(PairingView, { styles: styles, theme: theme, uri: wcUri, showQr: showQr, onToggleQr: () => setShowQr((v) => !v), onOpenWallet: openMobileWallet, onShare: async () => {
                        if (wcUri)
                            await Share.share({ message: wcUri });
                    } })), (view === 'connecting' || view === 'signing') && (_jsx(ConnectingView, { styles: styles, theme: theme, reducedMotion: reducedMotion, walletName: connectingWallet?.name ?? state.walletName ?? t('wallet.fallback_your_wallet'), walletIcon: connectingWallet?.icon ?? state.walletIcon, subtitle: view === 'signing'
                        ? t('signing.subtitle')
                        : t('connecting.accept_request'), reopenWallet: view === 'signing' && pairedMobileWalletId.current ? reopenPairedWallet : undefined })), view === 'account' && state.session && (_jsx(AccountView, { styles: styles, theme: theme, address: state.session.address, walletName: state.walletName ?? t('wallet.fallback_name'), walletIcon: state.walletIcon, pendingSigns: state.pendingSignCount, onShare: async () => {
                        if (state.session)
                            await Share.share({ message: state.session.address });
                    }, onDisconnect: disconnect })), view === 'error' && (_jsx(ErrorView, { styles: styles, theme: theme, message: errorText ?? t('error.default_message'), onRetry: () => {
                        setErrorText(null);
                        setView('list');
                        void refreshWallets();
                    } }))] }) }));
}
// ---------------------------------------------------------------------------
// Wallet list
// ---------------------------------------------------------------------------
function WalletListView(props) {
    const { styles, theme, loading, rows, onConnect, onInstall } = props;
    if (loading && rows.length === 0) {
        return (_jsxs(View, { style: styles.centered, children: [_jsx(ActivityIndicator, { color: theme.colorAccent }), _jsx(Text, { style: styles.muted, children: t('wallet_list.loading') })] }));
    }
    return (_jsxs(View, { children: [_jsx(Text, { style: styles.title, children: t('title.connect_wallet') }), rows.map((row) => {
                const { connector, reachability } = row;
                const disabled = reachability === 'not-installed' || reachability === 'unavailable';
                return (_jsxs(Pressable, { style: ({ pressed }) => [styles.walletRow, pressed && { backgroundColor: theme.colorSurfaceHover }], disabled: disabled, onPress: () => onConnect(connector.id), children: [connector.meta.icon ? _jsx(Image, { source: { uri: connector.meta.icon }, style: styles.walletIcon }) : _jsx(View, { style: styles.walletIcon }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: connector.meta.name }), _jsx(Text, { style: styles.muted, children: connector.id === 'walletconnect'
                                        ? t('wallet_list.status.scan_qr')
                                        : reachability === 'locked'
                                            ? t('wallet_list.status.locked')
                                            : reachability === 'unavailable'
                                                ? t('wallet_list.status.unavailable')
                                                : t('wallet_list.status.installed') })] }), reachability === 'not-installed' && (_jsx(Pressable, { style: styles.installButton, onPress: () => onInstall(row), children: _jsx(Text, { style: styles.installText, children: t('wallet_list.install') }) }))] }, connector.id));
            })] }));
}
// ---------------------------------------------------------------------------
// WalletConnect pairing — deep-link wallets first, QR fallback
// ---------------------------------------------------------------------------
function PairingView(props) {
    const { styles, theme, uri, showQr, onToggleQr, onOpenWallet, onShare } = props;
    const mobileWallets = listMobileWallets();
    return (_jsxs(View, { children: [_jsx(Text, { style: styles.title, children: t('title.connect_wallet') }), !uri && (_jsxs(View, { style: styles.centered, children: [_jsx(ActivityIndicator, { color: theme.colorAccent }), _jsx(Text, { style: styles.muted, children: t('wc.generating_code') })] })), uri && (_jsxs(View, { children: [mobileWallets.map((wallet) => (_jsxs(Pressable, { style: ({ pressed }) => [styles.walletRow, pressed && { backgroundColor: theme.colorSurfaceHover }], onPress: () => onOpenWallet(wallet.id), children: [_jsx(Image, { source: { uri: wallet.icon }, style: styles.walletIcon }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: wallet.name }), _jsx(Text, { style: styles.muted, children: t('wc.open_in_wallet') })] })] }, wallet.id))), _jsxs(Pressable, { style: ({ pressed }) => [styles.walletRow, pressed && { backgroundColor: theme.colorSurfaceHover }], onPress: onToggleQr, children: [_jsx(View, { style: [styles.walletIcon, styles.qrPlaceholder], children: _jsx(Text, { style: styles.qrPlaceholderText, children: "QR" }) }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: t('wallet_list.status.scan_qr') }), _jsx(Text, { style: styles.muted, children: t('wc.scan_instructions') })] })] }), showQr && (_jsx(View, { style: styles.qrWrap, children: _jsx(QRCode, { value: uri, size: 200, backgroundColor: theme.colorBg, color: theme.colorText }) })), _jsx(Pressable, { style: styles.secondaryButton, onPress: onShare, children: _jsx(Text, { style: styles.secondaryButtonText, children: t('wc.copy_uri') }) })] }))] }));
}
// ---------------------------------------------------------------------------
// Connecting / signing — breathe + spinner, v1.9.50 timings
// ---------------------------------------------------------------------------
function ConnectingView(props) {
    const { styles, theme, reducedMotion, walletName, walletIcon, subtitle, reopenWallet } = props;
    const breathe = useBreathe(reducedMotion);
    const spinner = useSpinner(reducedMotion);
    const spin = spinner.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (_jsxs(View, { style: styles.centered, children: [_jsxs(View, { style: styles.animWrap, children: [_jsx(AnimatedBox, { scale: breathe, children: walletIcon ? (_jsx(Image, { source: { uri: walletIcon }, style: styles.animLogo })) : (_jsx(View, { style: [styles.animLogo, { backgroundColor: theme.colorSurface }] })) }), _jsx(AnimatedSpinner, { style: styles.animArc, rotate: spin, color: theme.colorAccent })] }), _jsx(Text, { style: styles.title, children: t('connecting.continue_in_wallet', { walletName }) }), _jsx(Text, { style: styles.muted, children: subtitle }), reopenWallet && (_jsx(Pressable, { style: styles.primaryButton, onPress: reopenWallet, children: _jsx(Text, { style: styles.primaryButtonText, children: t('wc.open_in_wallet') }) }))] }));
}
/** Small helpers so the Animated primitives live in one place. */
function AnimatedBox({ scale, children }) {
    return _jsx(Animated.View, { style: { transform: [{ scale }] }, children: children });
}
function AnimatedSpinner({ style, rotate, color }) {
    // A simple arc spinner: a bordered circle with one transparent quarter.
    return (_jsx(Animated.View, { style: [
            style,
            {
                transform: [{ rotate }],
                borderRadius: 999,
                borderWidth: 3,
                borderTopColor: 'transparent',
                borderLeftColor: 'transparent',
                borderRightColor: color,
                borderBottomColor: color,
            },
        ] }));
}
// ---------------------------------------------------------------------------
// Account view
// ---------------------------------------------------------------------------
function AccountView(props) {
    const { styles, theme, address, walletName, walletIcon, pendingSigns, onShare, onDisconnect } = props;
    const shortened = `${address.slice(0, 8)}…${address.slice(-8)}`;
    return (_jsxs(View, { children: [_jsx(Text, { style: styles.title, children: t('title.account') }), _jsxs(View, { style: styles.accountCard, children: [walletIcon ? _jsx(Image, { source: { uri: walletIcon }, style: styles.walletIcon }) : _jsx(View, { style: [styles.walletIcon, { backgroundColor: theme.colorAccent }] }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: walletName }), _jsx(Text, { style: [styles.muted, { fontFamily: undefined }], children: shortened }), pendingSigns > 0 && _jsx(Text, { style: styles.danger, children: t('connected.pending_signatures', { count: pendingSigns }) })] })] }), _jsx(Pressable, { style: styles.secondaryButton, onPress: onShare, children: _jsx(Text, { style: styles.secondaryButtonText, children: t('aria.click_to_copy') }) }), _jsx(Pressable, { style: styles.dangerButton, onPress: onDisconnect, children: _jsx(Text, { style: styles.dangerButtonText, children: t('action.disconnect') }) })] }));
}
// ---------------------------------------------------------------------------
// Error view
// ---------------------------------------------------------------------------
function ErrorView(props) {
    const { styles, theme, message, onRetry } = props;
    return (_jsxs(View, { style: styles.centered, children: [_jsx(Text, { style: [styles.title, { color: theme.colorDanger }], children: t('error.title') }), _jsx(Text, { style: styles.muted, children: message }), _jsx(Pressable, { style: styles.primaryButton, onPress: onRetry, children: _jsx(Text, { style: styles.primaryButtonText, children: t('action.try_again') }) })] }));
}
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
function buildStyles(theme) {
    return StyleSheet.create({
        content: { padding: 20, paddingBottom: 40, gap: 14 },
        centered: { alignItems: 'center', gap: 10, paddingVertical: 32 },
        title: { color: theme.colorText, fontSize: 18, fontWeight: '700' },
        muted: { color: theme.colorTextMuted, fontSize: 13 },
        walletRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.colorSurface,
            borderRadius: theme.radiusMd,
            padding: 14,
            opacity: 1,
        },
        walletIcon: { width: 40, height: 40, borderRadius: theme.radiusSm },
        walletMeta: { flex: 1, gap: 2 },
        walletName: { color: theme.colorText, fontSize: 15, fontWeight: '600' },
        installButton: {
            backgroundColor: theme.colorAccent,
            borderRadius: theme.radiusSm,
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        installText: { color: theme.colorAccentText, fontSize: 13, fontWeight: '600' },
        qrPlaceholder: {
            backgroundColor: theme.colorSurface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        qrPlaceholderText: { color: theme.colorTextMuted, fontSize: 12, fontWeight: '700' },
        qrWrap: {
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.colorSurface,
            borderRadius: theme.radiusMd,
        },
        animWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
        animLogo: { width: 56, height: 56, borderRadius: theme.radiusSm },
        animArc: { position: 'absolute', width: 88, height: 88 },
        primaryButton: {
            backgroundColor: theme.colorAccent,
            borderRadius: theme.radiusMd,
            paddingVertical: 14,
            paddingHorizontal: 20,
            alignItems: 'center',
            marginTop: 8,
            alignSelf: 'stretch',
        },
        primaryButtonText: { color: theme.colorAccentText, fontSize: 15, fontWeight: '700' },
        secondaryButton: {
            borderColor: theme.colorBorder,
            borderWidth: 1,
            borderRadius: theme.radiusMd,
            paddingVertical: 12,
            alignItems: 'center',
        },
        secondaryButtonText: { color: theme.colorText, fontSize: 14, fontWeight: '600' },
        dangerButton: {
            borderColor: theme.colorDanger,
            borderWidth: 1,
            borderRadius: theme.radiusMd,
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 4,
        },
        dangerButtonText: { color: theme.colorDanger, fontSize: 14, fontWeight: '600' },
        accountCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.colorSurface,
            borderRadius: theme.radiusMd,
            padding: 16,
        },
        danger: { color: theme.colorDanger, fontSize: 12, marginTop: 2 },
    });
}
//# sourceMappingURL=AppKitModal.js.map