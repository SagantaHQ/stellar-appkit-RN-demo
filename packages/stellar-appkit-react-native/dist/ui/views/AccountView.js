import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AccountView — the connected state, a 1:1 port of the web modal's
 * `renderConnected()` (ui-web connect-modal.ts):
 *
 *   [gradient avatar] GABC…XYZW ⧉        ⋯     ← header row (tap = copy)
 *                     ● testnet  ↗              ← network pill + explorer
 *   ┌ overflow menu: Switch Wallet / Disconnect ┐ (under ⋯)
 *   [◌ pending signatures banner — only while signing]
 *   XLM BALANCE
 *   123.45 XLM                ← 32/700 mono, skeleton while loading
 *   [Get Testnet funds]       ← TESTNET only (friendbot)
 *   Funding requested — …     ← 3s banner after the tap
 *   RECENT ACTIVITY
 *   ✓ payment    Aug 30    -1.00 XLM ↗
 *   ✗ …
 *
 * Deviations (mobile-native, documented in ARCHITECTURE.md):
 * - The avatar is a solid deterministic color instead of a CSS linear
 *   gradient (RN has no zero-dep gradient) — same address-hash hue logic.
 * - Copy uses the OS share sheet (RN has no universal clipboard API in core)
 *   with the same check-glyph feedback; explorer links open via Linking.
 * - The overflow menu is a modal-safe inline card (no absolute positioning
 *   inside the scrollable sheet).
 */
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { CopyIcon, CheckIcon, ExternalLinkIcon, MoreDotsIcon, WalletGlyphIcon, LogOutIcon } from '../icons.js';
import { avatarColorsFromAddress, truncateAddress } from '../accountData.js';
/** Web `.balance-skeleton` shimmer — RN pulses the placeholder's opacity. */
function SkeletonBar({ styles }) {
    const opacity = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.5, duration: 750, useNativeDriver: true }),
        ]));
        loop.start();
        return () => loop.stop();
    }, [opacity]);
    return _jsx(Animated.View, { style: [styles.balanceSkeleton, { opacity }] });
}
export function AccountView(props) {
    const { styles, theme, address, network, pendingSigns, balance, history, balanceLoading, fundsRequested, copied, onCopyAddress, onOpenExplorer, onGetFunds, onSwitchWallet, onDisconnect, onTxPress, } = props;
    const [overflowOpen, setOverflowOpen] = useState(false);
    // Web network pill: amber on every non-PUBLIC network, green on PUBLIC.
    const isTestnet = network !== 'PUBLIC';
    const networkColor = isTestnet ? '#f59e0b' : '#6EE7B7';
    const avatar = avatarColorsFromAddress(address);
    // Root = web .account (gap 20, padding-top 6): the vertical rhythm that
    // keeps header / pending banner / balance / history evenly 20px apart —
    // previously missing, which crushed the blocks together (the header sat
    // ~2px above the balance label). See styles.ts `account`.
    return (_jsxs(View, { style: styles.account, children: [_jsxs(View, { style: styles.accountHeader, children: [_jsx(View, { style: [styles.accountAvatar, { backgroundColor: avatar.backgroundColor }] }), _jsxs(View, { style: styles.accountInfo, children: [_jsxs(Pressable, { style: ({ pressed }) => [styles.accountAddressRow, pressed && { opacity: 0.7 }], onPress: onCopyAddress, accessibilityRole: "button", accessibilityLabel: t('aria.click_to_copy'), children: [_jsx(Text, { style: styles.accountAddress, children: truncateAddress(address) }), _jsx(View, { style: styles.accountCopyIcon, children: copied ? _jsx(CheckIcon, { color: theme.colorAccent, size: 14 }) : _jsx(CopyIcon, { color: theme.colorTextMuted, size: 14 }) })] }), _jsxs(View, { style: styles.accountMeta, children: [_jsxs(View, { style: styles.networkPill, children: [_jsx(View, { style: [styles.networkDot, { backgroundColor: networkColor }] }), _jsx(Text, { style: styles.networkPillText, children: network.toLowerCase() })] }), _jsx(Pressable, { style: ({ pressed }) => [styles.explorerButton, pressed && { opacity: 1 }], onPress: onOpenExplorer, accessibilityRole: "link", accessibilityLabel: t('aria.view_on_explorer'), hitSlop: 6, children: _jsx(ExternalLinkIcon, { color: theme.colorTextMuted, size: 14 }) })] })] }), _jsx(Pressable, { style: ({ pressed }) => [
                            { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
                            pressed && { opacity: 0.6 },
                        ], onPress: () => setOverflowOpen((v) => !v), accessibilityRole: "button", accessibilityLabel: t('aria.more_options'), accessibilityState: { expanded: overflowOpen }, hitSlop: 6, children: _jsx(MoreDotsIcon, { color: theme.colorTextMuted, size: 16 }) })] }), overflowOpen && (_jsxs(View, { style: styles.overflowMenu, children: [_jsxs(Pressable, { style: ({ pressed }) => [styles.overflowItem, pressed && styles.overflowItemPressed], onPress: () => {
                            setOverflowOpen(false);
                            onSwitchWallet();
                        }, accessibilityRole: "button", children: [_jsx(WalletGlyphIcon, { color: theme.colorTextMuted, size: 18 }), _jsx(Text, { style: styles.overflowItemText, children: t('action.switch_wallet') })] }), _jsxs(Pressable, { style: ({ pressed }) => [styles.overflowItem, pressed && styles.overflowItemPressed], onPress: () => {
                            setOverflowOpen(false);
                            onDisconnect();
                        }, accessibilityRole: "button", children: [_jsx(LogOutIcon, { color: "#ef4444", size: 18 }), _jsx(Text, { style: [styles.overflowItemText, styles.overflowDangerText], children: t('action.disconnect') })] })] })), pendingSigns > 0 && (_jsxs(View, { style: styles.pendingBanner, children: [_jsx(ActivityIndicator, { color: theme.colorAccent, size: "small" }), _jsx(Text, { style: styles.pendingBannerText, children: t('connected.pending_signatures', { count: pendingSigns }) })] })), _jsxs(View, { style: styles.balanceSection, children: [_jsx(Text, { style: styles.balanceLabel, children: t('connected.balance_label') }), _jsx(View, { style: styles.balanceAmount, children: balance ? (_jsxs(_Fragment, { children: [_jsx(Text, { style: styles.balanceValue, children: balance }), _jsx(Text, { style: styles.balanceUnit, children: t('connected.balance_unit') })] })) : balanceLoading ? (_jsx(SkeletonBar, { styles: styles })) : (_jsx(Text, { style: styles.balanceValue, children: "0.00" })) }), network === 'TESTNET' &&
                        (fundsRequested ? (_jsx(View, { style: styles.fundsBanner, children: _jsx(Text, { style: styles.fundsBannerText, children: t('connected.funds_requested') }) })) : (_jsx(Pressable, { style: ({ pressed }) => [styles.friendbotButton, pressed && styles.friendbotButtonPressed], onPress: onGetFunds, accessibilityRole: "button", children: _jsx(Text, { style: styles.friendbotButtonText, children: t('connected.get_testnet_funds') }) })))] }), _jsxs(View, { style: styles.txHistory, children: [_jsx(Text, { style: styles.txHeader, children: t('connected.recent_activity') }), history.length > 0 ? (history.map((tx) => (_jsxs(Pressable, { style: ({ pressed }) => [styles.txRow, pressed && { backgroundColor: theme.colorSurfaceHover }], onPress: () => onTxPress(tx), accessibilityRole: "button", children: [_jsx(View, { style: [styles.txIcon, tx.success ? styles.txIconSuccess : styles.txIconFailed], children: _jsx(Text, { style: tx.success ? styles.txIconTextSuccess : styles.txIconTextFailed, children: tx.success ? '✓' : '✗' }) }), _jsxs(View, { style: styles.txInfo, children: [_jsx(Text, { style: styles.txType, numberOfLines: 1, children: tx.type }), tx.date ? _jsx(Text, { style: styles.txDate, children: tx.date }) : null] }), _jsxs(Text, { style: [styles.txAmount, tx.amount.startsWith('-') ? styles.txAmountOut : styles.txAmountIn], children: [tx.amount, " ", tx.asset] }), _jsx(ExternalLinkIcon, { color: theme.colorTextMuted, size: 14 })] }, tx.hash)))) : (_jsx(Text, { style: styles.txEmpty, children: t('connected.no_transactions') }))] })] }));
}
//# sourceMappingURL=AccountView.js.map