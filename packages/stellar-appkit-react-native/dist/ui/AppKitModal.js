import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * Feature parity with the web `<stellar-appkit-modal>` adapted to native
 * idioms (per ARCHITECTURE.md's RN plan):
 *
 * - **Deep-link-only pairing**: on a phone the same device would have to
 *   scan a QR code, so the RN modal never renders one. Every wallet row
 *   embeds the WalletConnect pairing URI into the wallet's own deep link
 *   (`freighterwallet://wc?uri=...`) and hands off to the OS,
 *   Solana-Mobile-Adapter style.
 * - **Sectioned wallet list**: the featured Stellar-first wallets (Freighter,
 *   LOBSTR, HOT Wallet, Scopuly) plus the registered connectors (Albedo
 *   WebView, …) come first; every other WalletConnect-registered mobile
 *   wallet (SafePal, Blockchain.com, Arculus, Atomic Wallet, …) collapses
 *   under a "More wallets" expander so the sheet stays scannable.
 * - **True wallet names** — the connecting view, account view and
 *   sign-request prompts carry the wallet's own name and icon, never a
 *   generic "WalletConnect" label.
 * - **Copy pairing code** — when a deep link can't open the wallet, the
 *   pairing URI can still be shared/copied so wallets with manual pairing
 *   fields can complete the handshake.
 * - Connecting / signing views with the same animation timings as web
 *   v1.9.50 (2.5s breathe, 2s spinner, reduced-motion aware).
 * - Account view with share/disconnect. Error view with retry.
 *
 * Icons render through `<WalletIcon>` — zero native image dependencies:
 * wallet logos are pre-rasterized as compressed palette PNGs (with alpha)
 * in deep-links.ts and wallet-icons.ts, raster sources render natively, WC
 * peers match by name, and everything else gets a branded letter avatar.
 *
 * Presentation: @gorhom/bottom-sheet with a backdrop, swipe-to-dismiss.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Linking, Platform, Pressable, Share, StyleSheet, Text, View, } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { t } from '@saganta/stellar-appkit';
import { buildWalletConnectDeepLink, buildWalletConnectUniversalLink, buildOpenWalletAppLink, getMobileWallet, listAdditionalMobileWallets, listFeaturedMobileWallets, } from '../deep-links.js';
import { useAppKit } from './useAppKit.js';
import { useBreathe, useReducedMotion, useSpinner } from './animations.js';
import { WalletIcon } from './WalletIcon.js';
import { defaultTheme } from './theme.js';
const VIEW_TITLES = {
    list: 'title.connect_wallet',
    account: 'title.account',
    error: 'error.title',
};
export function AppKitModal({ client, open, onClose, theme = defaultTheme }) {
    const state = useAppKit(client);
    const reducedMotion = useReducedMotion();
    const [view, setView] = useState('list');
    const [walletRows, setWalletRows] = useState([]);
    const [loadingWallets, setLoadingWallets] = useState(false);
    const [wcUri, setWcUri] = useState(null);
    const [showMoreWallets, setShowMoreWallets] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [connectingWallet, setConnectingWallet] = useState(null);
    /**
     * When the user picked a named mobile wallet (Freighter, LOBSTR, HOT,
     * Scopuly, SafePal, …) — its registry id. Drives the deep-link handoff,
     * the "open the wallet again" affordance for sign requests, and the
     * account view's fallback branding when the wallet doesn't send peer
     * metadata.
     */
    const pairedMobileWalletId = useRef(null);
    /** Set when neither the wallet's scheme nor universal link could open. */
    const [openFailed, setOpenFailed] = useState(false);
    const sheetRef = useRef(null);
    const styles = useMemo(() => buildStyles(theme), [theme]);
    // The WalletConnect connector — present whenever the app configured a
    // projectId. Named mobile wallets pair through it, so they're hidden
    // when it isn't registered.
    const wcConnector = useMemo(() => client.registry.get('walletconnect'), [client]);
    // --- wallet list loading ---------------------------------------------------
    const refreshWallets = useCallback(async () => {
        setLoadingWallets(true);
        try {
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
            setShowMoreWallets(false);
            setErrorText(null);
            setOpenFailed(false);
            setConnectingWallet(null);
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
    // --- deep-link handoff -------------------------------------------------------
    /**
     * Opens the wallet with the WC pairing URI embedded. Fallback chain:
     * native scheme link → registered universal link → give up (the caller
     * shows the "not installed" hint with a store button).
     */
    const openWalletDeepLink = useCallback(async (walletId, uri) => {
        try {
            await Linking.openURL(buildWalletConnectDeepLink(walletId, uri));
            return true;
        }
        catch {
            // Native scheme didn't resolve — the wallet may not be installed, or
            // the device may prefer universal links. Try the registered
            // https universal link (works even when the scheme isn't allowed).
            const universal = buildWalletConnectUniversalLink(walletId, uri);
            if (universal) {
                try {
                    await Linking.openURL(universal);
                    return true;
                }
                catch {
                    // fall through
                }
            }
            return false;
        }
    }, []);
    // --- connect actions ---------------------------------------------------------
    /**
     * Connects a named mobile wallet (featured or under "More wallets"):
     * start the WalletConnect pairing, and the moment the relay hands us the
     * URI, deep-link straight into the wallet app. The whole flow is branded
     * with the wallet's own name and icon.
     */
    const connectMobileWallet = useCallback(async (wallet) => {
        if (!wcConnector)
            return;
        pairedMobileWalletId.current = wallet.id;
        setConnectingWallet({ name: wallet.name, icon: wallet.icon, key: wallet.id });
        setOpenFailed(false);
        setView('connecting');
        const wc = wcConnector;
        if (typeof wc.setOnUri === 'function') {
            wc.setOnUri((uri) => {
                setWcUri(uri);
                void openWalletDeepLink(wallet.id, uri).then((ok) => setOpenFailed(!ok));
            });
        }
        try {
            await client.connect('walletconnect');
        }
        catch {
            /* surfaced via the error event */
        }
    }, [client, wcConnector, openWalletDeepLink]);
    /** Connects a registered connector directly (Albedo WebView, …). */
    const connectConnector = useCallback(async (walletId) => {
        const connector = client.registry.get(walletId);
        if (!connector)
            return;
        setConnectingWallet({ name: connector.meta.name, icon: connector.meta.icon ?? null, key: walletId });
        setOpenFailed(false);
        setView('connecting');
        try {
            await client.connect(walletId);
        }
        catch {
            /* error event switches to the error view */
        }
    }, [client]);
    /** Re-opens the paired wallet app (sign-request handoff). */
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
    /** Re-fires the deep link on the connecting view ("open again"). */
    const retryOpenWallet = useCallback(async () => {
        const id = pairedMobileWalletId.current;
        if (!id || !wcUri)
            return;
        const ok = await openWalletDeepLink(id, wcUri);
        setOpenFailed(!ok);
    }, [wcUri, openWalletDeepLink]);
    /** Shares the raw pairing URI — for wallets with a manual "paste code" field. */
    const sharePairingUri = useCallback(async () => {
        if (wcUri)
            await Share.share({ message: wcUri });
    }, [wcUri]);
    const disconnect = useCallback(async () => {
        await client.disconnect();
        pairedMobileWalletId.current = null;
        setView('list');
        void refreshWallets();
    }, [client, refreshWallets]);
    if (!open)
        return null;
    const titleKey = VIEW_TITLES[view];
    return (_jsxs(BottomSheet, { ref: sheetRef, index: 0, snapPoints: ['82%'], enablePanDownToClose: true, onClose: onClose, backdropComponent: (props) => (_jsx(BottomSheetBackdrop, { ...props, disappearsOnIndex: -1, appearsOnIndex: 0, pressBehavior: "close", opacity: 0.6 })), backgroundStyle: { backgroundColor: theme.colorBg, borderTopLeftRadius: theme.radiusLg, borderTopRightRadius: theme.radiusLg }, handleIndicatorStyle: { backgroundColor: theme.colorTextMuted }, children: [_jsxs(View, { style: styles.header, children: [_jsx(View, { style: styles.headerButtonSpacer }), titleKey ? _jsx(Text, { style: styles.headerTitle, children: t(titleKey) }) : _jsx(View, {}), _jsx(Pressable, { style: ({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed], onPress: onClose, accessibilityRole: "button", accessibilityLabel: t('aria.close_dialog'), hitSlop: 8, children: _jsx(Text, { style: styles.headerButtonGlyph, children: "\u00D7" }) })] }), _jsxs(BottomSheetScrollView, { contentContainerStyle: styles.content, children: [view === 'list' && (_jsx(WalletListView, { styles: styles, theme: theme, loading: loadingWallets, rows: walletRows, showMobileWallets: Boolean(wcConnector), showMore: showMoreWallets, onToggleMore: () => setShowMoreWallets((v) => !v), onConnectMobile: connectMobileWallet, onConnectConnector: connectConnector, onInstall: (row) => {
                            const url = Platform.select({
                                ios: row.connector.meta.installUrl?.ios,
                                android: row.connector.meta.installUrl?.android,
                            });
                            if (url)
                                void Linking.openURL(url);
                        } })), (view === 'connecting' || view === 'signing') && (_jsx(ConnectingView, { styles: styles, theme: theme, reducedMotion: reducedMotion, walletName: connectingWallet?.name ?? state.walletName ?? t('wallet.fallback_your_wallet'), walletIcon: connectingWallet?.icon ?? state.walletIcon, walletKey: connectingWallet?.key ?? null, subtitle: view === 'signing'
                            ? t('signing.subtitle')
                            : t('connecting.accept_request'), openFailed: openFailed, failedWalletName: pairedMobileWalletId.current ? getMobileWallet(pairedMobileWalletId.current)?.name : undefined, onInstallFailedWallet: () => {
                            const wallet = pairedMobileWalletId.current ? getMobileWallet(pairedMobileWalletId.current) : undefined;
                            const url = wallet && Platform.select({ ios: wallet.installUrl.ios, android: wallet.installUrl.android });
                            if (url)
                                void Linking.openURL(url);
                        }, onRetryOpen: retryOpenWallet, onShareUri: wcUri && pairedMobileWalletId.current ? sharePairingUri : undefined, reopenWallet: view === 'signing' && pairedMobileWalletId.current
                            ? reopenPairedWallet
                            : pairedMobileWalletId.current && view === 'connecting'
                                ? retryOpenWallet
                                : undefined })), view === 'account' && state.session && (_jsx(AccountView, { styles: styles, theme: theme, address: state.session.address, walletName: state.walletName ?? t('wallet.fallback_name'), walletIcon: state.walletIcon, pendingSigns: state.pendingSignCount, onShare: async () => {
                            if (state.session)
                                await Share.share({ message: state.session.address });
                        }, onDisconnect: disconnect })), view === 'error' && (_jsx(ErrorView, { styles: styles, theme: theme, message: errorText ?? t('error.default_message'), onRetry: () => {
                            setErrorText(null);
                            setView('list');
                            void refreshWallets();
                        } }))] })] }));
}
// ---------------------------------------------------------------------------
// Wallet list — featured Stellar wallets + connectors in a card, every other
// WC-registered mobile wallet collapsed under "More wallets"
// ---------------------------------------------------------------------------
function WalletListView(props) {
    const { styles, theme, loading, rows, showMobileWallets, showMore, onToggleMore, onConnectMobile, onConnectConnector, onInstall, } = props;
    const featured = showMobileWallets ? listFeaturedMobileWallets() : [];
    const additional = showMobileWallets ? listAdditionalMobileWallets() : [];
    // The WalletConnect connector has no row of its own — the named mobile
    // wallets above ARE its pairing surface (deep link only, no QR).
    const directRows = rows.filter((row) => row.connector.id !== 'walletconnect');
    if (loading && rows.length === 0) {
        return (_jsxs(View, { style: styles.centered, children: [_jsx(ActivityIndicator, { color: theme.colorAccent }), _jsx(Text, { style: styles.muted, children: t('wallet_list.loading') })] }));
    }
    const hasPrimarySection = featured.length > 0 || directRows.length > 0;
    return (_jsxs(View, { style: styles.sections, children: [hasPrimarySection && (_jsxs(View, { children: [_jsx(Text, { style: styles.sectionTitle, accessibilityRole: "header", children: t('wallet_list.section_stellar') }), _jsxs(View, { style: styles.sectionCard, children: [featured.map((wallet, i) => (_jsx(WalletRowView, { styles: styles, theme: theme, icon: wallet.icon, walletKey: wallet.id, name: wallet.name, subtitle: t('wc.open_in_wallet'), onPress: () => onConnectMobile(wallet), last: i === featured.length - 1 && directRows.length === 0 }, wallet.id))), directRows.map((row, i) => {
                                const { connector, reachability } = row;
                                const disabled = reachability === 'not-installed' || reachability === 'unavailable';
                                return (_jsx(WalletRowView, { styles: styles, theme: theme, icon: connector.meta.icon ?? null, walletKey: connector.id, name: connector.meta.name, subtitle: reachability === 'locked'
                                        ? t('wallet_list.status.locked')
                                        : reachability === 'unavailable'
                                            ? t('wallet_list.status.unavailable')
                                            : t('wallet_list.status.installed'), disabled: disabled, onPress: () => onConnectConnector(connector.id), badge: reachability === 'not-installed' ? (_jsx(Pressable, { style: ({ pressed }) => [styles.installButton, pressed && styles.installButtonPressed], onPress: () => onInstall(row), accessibilityRole: "button", children: _jsx(Text, { style: styles.installText, children: t('wallet_list.install') }) })) : undefined, last: i === directRows.length - 1 }, connector.id));
                            })] })] })), additional.length > 0 && (_jsxs(View, { children: [_jsxs(Pressable, { style: ({ pressed }) => [styles.moreHeader, pressed && { opacity: 0.6 }], onPress: onToggleMore, accessibilityRole: "button", accessibilityLabel: t('wallet_list.more_wallets', { count: additional.length }), accessibilityState: { expanded: showMore }, children: [_jsx(Text, { style: styles.sectionTitle, children: t('wallet_list.more_wallets', { count: additional.length }) }), _jsx(Text, { style: [styles.moreChevron, showMore && styles.moreChevronOpen], children: "\u203A" })] }), showMore && (_jsx(View, { style: styles.sectionCard, children: additional.map((wallet, i) => (_jsx(WalletRowView, { styles: styles, theme: theme, icon: wallet.icon, walletKey: wallet.id, name: wallet.name, subtitle: t('wc.open_in_wallet'), onPress: () => onConnectMobile(wallet), last: i === additional.length - 1 }, wallet.id))) }))] }))] }));
}
function WalletRowView(props) {
    const { styles, theme, icon, walletKey, name, subtitle, onPress, disabled, badge, last } = props;
    return (_jsxs(Pressable, { style: ({ pressed }) => [styles.walletRow, !last && styles.walletRowBorder, pressed && { backgroundColor: theme.colorSurfaceHover }], onPress: onPress, disabled: disabled, accessibilityRole: "button", accessibilityLabel: name, children: [_jsx(WalletIcon, { source: icon, walletKey: walletKey, fallbackLabel: name, size: 44, radius: theme.radiusSm }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: name }), _jsx(Text, { style: styles.muted, children: subtitle })] }), badge ?? (_jsx(Text, { style: styles.chevron, children: "\u203A" }))] }));
}
// ---------------------------------------------------------------------------
// Connecting / signing — breathe + spinner, v1.9.50 timings, wallet-branded
// ---------------------------------------------------------------------------
function ConnectingView(props) {
    const { styles, theme, reducedMotion, walletName, walletIcon, walletKey, subtitle, openFailed, failedWalletName, onInstallFailedWallet, onShareUri, reopenWallet, } = props;
    const breathe = useBreathe(reducedMotion);
    const spinner = useSpinner(reducedMotion);
    const spin = spinner.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (_jsxs(View, { style: styles.centered, children: [_jsxs(View, { style: styles.animWrap, children: [_jsx(AnimatedBox, { scale: breathe, children: _jsx(View, { style: styles.animLogoWrap, children: _jsx(WalletIcon, { source: walletIcon, walletKey: walletKey, fallbackLabel: walletName, size: 64, radius: theme.radiusLg }) }) }), _jsx(AnimatedSpinner, { style: styles.animArc, rotate: spin, color: theme.colorAccent })] }), _jsx(Text, { style: styles.title, children: t('connecting.continue_in_wallet', { walletName }) }), _jsx(Text, { style: styles.muted, children: subtitle }), openFailed && (_jsxs(View, { style: styles.openFailedCard, children: [_jsx(Text, { style: styles.openFailedText, children: t('wc.open_failed', { walletName: failedWalletName ?? walletName }) }), _jsx(Pressable, { style: ({ pressed }) => [styles.installButton, pressed && styles.installButtonPressed], onPress: onInstallFailedWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.installText, children: t('wallet_list.install') }) }), onShareUri && (_jsx(Pressable, { style: styles.textButton, onPress: onShareUri, accessibilityRole: "button", children: _jsx(Text, { style: styles.textButtonText, children: t('wc.copy_pairing_code') }) }))] })), !openFailed && reopenWallet && (_jsx(Pressable, { style: ({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed], onPress: reopenWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.primaryButtonText, children: t('wc.open_in_wallet') }) })), !openFailed && onShareUri && (_jsx(Pressable, { style: styles.textButton, onPress: onShareUri, accessibilityRole: "button", children: _jsx(Text, { style: styles.textButtonText, children: t('wc.copy_pairing_code') }) }))] }));
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
    return (_jsxs(View, { children: [_jsxs(View, { style: styles.accountCard, children: [_jsx(WalletIcon, { source: walletIcon, fallbackLabel: walletName, size: 48, radius: theme.radiusMd }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: walletName }), _jsx(Text, { style: styles.addressText, children: shortened }), pendingSigns > 0 && _jsx(Text, { style: styles.danger, children: t('connected.pending_signatures', { count: pendingSigns }) })] })] }), _jsx(Pressable, { style: ({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed], onPress: onShare, accessibilityRole: "button", children: _jsx(Text, { style: styles.secondaryButtonText, children: t('aria.click_to_copy') }) }), _jsx(Pressable, { style: ({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed], onPress: onDisconnect, accessibilityRole: "button", children: _jsx(Text, { style: styles.dangerButtonText, children: t('action.disconnect') }) })] }));
}
// ---------------------------------------------------------------------------
// Error view
// ---------------------------------------------------------------------------
function ErrorView(props) {
    const { styles, theme, message, onRetry } = props;
    return (_jsxs(View, { style: styles.centered, children: [_jsx(View, { style: [styles.errorBadge, { borderColor: theme.colorDanger }], children: _jsx(Text, { style: [styles.errorBadgeText, { color: theme.colorDanger }], children: "!" }) }), _jsx(Text, { style: styles.title, children: t('error.title') }), _jsx(Text, { style: styles.muted, children: message }), _jsx(Pressable, { style: ({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed], onPress: onRetry, accessibilityRole: "button", children: _jsx(Text, { style: styles.primaryButtonText, children: t('action.try_again') }) })] }));
}
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
function buildStyles(theme) {
    return StyleSheet.create({
        content: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
        sections: { gap: 18, paddingTop: 6 },
        // Header
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colorBorder,
            minHeight: 48,
        },
        headerTitle: { color: theme.colorText, fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
        headerButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colorSurface,
        },
        headerButtonPressed: { opacity: 0.6 },
        headerButtonSpacer: { width: 36 },
        headerButtonGlyph: { color: theme.colorText, fontSize: 22, fontWeight: '600', lineHeight: 24, marginTop: -2 },
        centered: { alignItems: 'center', gap: 10, paddingVertical: 28 },
        title: { color: theme.colorText, fontSize: 18, fontWeight: '700', textAlign: 'center' },
        muted: { color: theme.colorTextMuted, fontSize: 13 },
        // Sectioned wallet list — cards with hairline-separated rows
        sectionTitle: {
            color: theme.colorTextMuted,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
        },
        sectionCard: {
            backgroundColor: theme.colorSurface,
            borderRadius: theme.radiusMd,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colorBorder,
            overflow: 'hidden',
            marginTop: 8,
        },
        moreHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            paddingHorizontal: 4,
        },
        moreChevron: { color: theme.colorTextMuted, fontSize: 20, fontWeight: '600', transform: [{ rotate: '90deg' }] },
        moreChevronOpen: { transform: [{ rotate: '-90deg' }] },
        walletRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 12,
            paddingHorizontal: 12,
        },
        walletRowBorder: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colorBorder,
        },
        walletMeta: { flex: 1, gap: 2 },
        walletName: { color: theme.colorText, fontSize: 15, fontWeight: '600' },
        addressText: { color: theme.colorTextMuted, fontSize: 13, letterSpacing: 0.3 },
        chevron: { color: theme.colorTextMuted, fontSize: 22, fontWeight: '500' },
        installButton: {
            backgroundColor: theme.colorAccent,
            borderRadius: theme.radiusSm,
            paddingHorizontal: 14,
            paddingVertical: 7,
        },
        installButtonPressed: { opacity: 0.7 },
        installText: { color: theme.colorAccentText, fontSize: 13, fontWeight: '700' },
        animWrap: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
        animLogoWrap: { borderRadius: theme.radiusLg, overflow: 'hidden' },
        animArc: { position: 'absolute', width: 96, height: 96 },
        openFailedCard: {
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.colorSurface,
            borderRadius: theme.radiusMd,
            padding: 16,
            marginTop: 8,
            alignSelf: 'stretch',
        },
        openFailedText: { color: theme.colorText, fontSize: 14, textAlign: 'center' },
        primaryButton: {
            backgroundColor: theme.colorAccent,
            borderRadius: theme.radiusMd,
            paddingVertical: 14,
            paddingHorizontal: 20,
            alignItems: 'center',
            marginTop: 8,
            alignSelf: 'stretch',
        },
        primaryButtonPressed: { opacity: 0.8 },
        primaryButtonText: { color: theme.colorAccentText, fontSize: 15, fontWeight: '700' },
        secondaryButton: {
            borderColor: theme.colorBorder,
            borderWidth: 1,
            borderRadius: theme.radiusMd,
            paddingVertical: 13,
            alignItems: 'center',
            marginTop: 4,
        },
        secondaryButtonPressed: { opacity: 0.6 },
        secondaryButtonText: { color: theme.colorText, fontSize: 14, fontWeight: '600' },
        dangerButton: {
            borderColor: theme.colorDanger,
            borderWidth: 1,
            borderRadius: theme.radiusMd,
            paddingVertical: 13,
            alignItems: 'center',
            marginTop: 4,
        },
        dangerButtonPressed: { opacity: 0.6 },
        dangerButtonText: { color: theme.colorDanger, fontSize: 14, fontWeight: '600' },
        textButton: { paddingVertical: 8, marginTop: 2 },
        textButtonText: { color: theme.colorAccent, fontSize: 14, fontWeight: '600' },
        accountCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: theme.colorSurface,
            borderRadius: theme.radiusMd,
            padding: 16,
        },
        danger: { color: theme.colorDanger, fontSize: 12, marginTop: 2 },
        errorBadge: {
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
        },
        errorBadgeText: { fontSize: 28, fontWeight: '800' },
    });
}
//# sourceMappingURL=AppKitModal.js.map