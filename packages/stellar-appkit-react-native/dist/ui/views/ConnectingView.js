import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Animated, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { useBreathe, useSpinner } from '../animations.js';
import { WalletIcon } from '../WalletIcon.js';
export function ConnectingView(props) {
    const { styles, theme, reducedMotion, walletName, walletIcon, walletKey, subtitle, openFailed, failedWalletName, onInstallFailedWallet, onShareUri, reopenWallet, } = props;
    const breathe = useBreathe(reducedMotion);
    const spinner = useSpinner(reducedMotion);
    const spin = spinner.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (_jsxs(View, { style: styles.centered, children: [_jsxs(View, { style: styles.animWrap, children: [_jsx(AnimatedBox, { scale: breathe, children: _jsx(View, { style: styles.animLogoWrap, children: _jsx(WalletIcon, { source: walletIcon, walletKey: walletKey, fallbackLabel: walletName, size: 64, radius: 22 }) }) }), _jsx(AnimatedSpinner, { style: styles.animArc, rotate: spin, color: theme.colorAccent })] }), _jsx(Text, { style: styles.title, children: t('connecting.continue_in_wallet', { walletName }) }), _jsx(Text, { style: styles.muted, children: subtitle }), openFailed && (_jsxs(View, { style: styles.openFailedCard, children: [_jsx(Text, { style: styles.openFailedText, children: t('wc.open_failed', { walletName: failedWalletName ?? walletName }) }), _jsx(Pressable, { style: ({ pressed }) => [styles.installButton, pressed && styles.installButtonPressed], onPress: onInstallFailedWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.installText, children: t('wallet_list.install') }) }), onShareUri && (_jsx(Pressable, { style: styles.textButton, onPress: onShareUri, accessibilityRole: "button", children: _jsx(Text, { style: styles.textButtonText, children: t('wc.copy_pairing_code') }) }))] })), !openFailed && reopenWallet && (_jsx(Pressable, { style: ({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed], onPress: reopenWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.primaryButtonText, children: t('wc.open_in_wallet') }) })), !openFailed && onShareUri && (_jsx(Pressable, { style: styles.textButton, onPress: onShareUri, accessibilityRole: "button", children: _jsx(Text, { style: styles.textButtonText, children: t('wc.copy_pairing_code') }) }))] }));
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
//# sourceMappingURL=ConnectingView.js.map