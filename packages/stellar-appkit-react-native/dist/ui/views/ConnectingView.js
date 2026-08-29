import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Animated, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { useBreathe, useEntranceStagger } from '../animations.js';
import { SquircleArc } from '../SquircleArc.js';
import { RetryIcon } from '../icons.js';
import { WalletIcon } from '../WalletIcon.js';
import { SQUIRCLE_SPEC } from '../squircle-track.js';
export function ConnectingView(props) {
    const { styles, theme, reducedMotion, walletName, walletIcon, walletKey, subtitle, error, openFailed, failedWalletName, onInstallFailedWallet, onRetryConnect, onShareUri, reopenWallet, } = props;
    const breathe = useBreathe(reducedMotion);
    // The stagger covers the web children: logo-wrap, title, subtitle, retry.
    // The deep-link extras ride the last slot like web's nth-child(n+5).
    const entrance = useEntranceStagger(4, reducedMotion);
    return (_jsxs(View, { style: styles.connectingView, children: [_jsxs(Animated.View, { style: [
                    styles.logoWrap,
                    error && styles.logoWrapError,
                    {
                        opacity: entrance[0].opacity,
                        transform: [{ translateY: entrance[0].translateY }, { scale: error ? 1 : breathe }],
                    },
                ], children: [!error && (_jsx(View, { style: { position: 'absolute' }, children: _jsx(SquircleArc, { color: theme.colorAccent, size: SQUIRCLE_SPEC.box, strokeWidth: SQUIRCLE_SPEC.strokeWidth, durationMs: reducedMotion ? SQUIRCLE_SPEC.connectingReducedMotionDurationMs : SQUIRCLE_SPEC.connectingDurationMs }) })), _jsx(View, { style: styles.connectingLogo, children: _jsx(WalletIcon, { source: walletIcon, walletKey: walletKey, fallbackLabel: walletName, size: 56, radius: 22 }) })] }), _jsx(Animated.View, { style: { opacity: entrance[1].opacity, transform: [{ translateY: entrance[1].translateY }] }, children: _jsx(Text, { style: styles.connectingTitle, children: t('connecting.continue_in_wallet', { walletName }) }) }), _jsx(Animated.View, { style: { opacity: entrance[2].opacity, transform: [{ translateY: entrance[2].translateY }] }, children: _jsx(Text, { style: [styles.connectingSubtitle, error && styles.connectingSubtitleError], children: subtitle }) }), error && (_jsx(Animated.View, { style: { opacity: entrance[3].opacity, transform: [{ translateY: entrance[3].translateY }] }, children: _jsxs(Pressable, { style: ({ pressed }) => [styles.retryPill, pressed && styles.retryPillPressed], onPress: onRetryConnect, accessibilityRole: "button", accessibilityLabel: t('action.try_again'), children: [_jsx(RetryIcon, { color: theme.colorText, size: 14 }), _jsx(Text, { style: styles.retryPillText, children: t('action.try_again') })] }) })), openFailed && (_jsxs(View, { style: styles.openFailedCard, children: [_jsx(Text, { style: styles.openFailedText, children: t('wc.open_failed', { walletName: failedWalletName ?? walletName }) }), _jsx(Pressable, { style: ({ pressed }) => [styles.installButton, pressed && styles.installButtonPressed], onPress: onInstallFailedWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.installText, children: t('wallet_list.install') }) }), onShareUri && (_jsx(Pressable, { style: styles.textButton, onPress: onShareUri, accessibilityRole: "button", children: _jsx(Text, { style: styles.textButtonText, children: t('wc.copy_pairing_code') }) }))] })), !openFailed && reopenWallet && (_jsx(Pressable, { style: ({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed], onPress: reopenWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.primaryButtonText, children: t('wc.open_in_wallet') }) })), !openFailed && onShareUri && (_jsx(Pressable, { style: styles.textButton, onPress: onShareUri, accessibilityRole: "button", children: _jsx(Text, { style: styles.textButtonText, children: t('wc.copy_pairing_code') }) }))] }));
}
//# sourceMappingURL=ConnectingView.js.map