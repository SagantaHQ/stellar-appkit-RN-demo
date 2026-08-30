import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Animated, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { useBreathe, useEntranceStagger } from '../animations.js';
import { SquircleArc } from '../SquircleArc.js';
import { CircleXIcon, RetryIcon } from '../icons.js';
import { WalletIcon } from '../WalletIcon.js';
import { SQUIRCLE_SPEC } from '../squircle-track.js';
export function SigningView(props) {
    const { styles, theme, reducedMotion, walletName, walletIcon, walletKey, error, onRetry, onCancel, onOpenWallet } = props;
    const hasError = error !== null;
    const breathe = useBreathe(reducedMotion);
    const entrance = useEntranceStagger(hasError || !onOpenWallet ? 3 : 4, reducedMotion);
    if (hasError) {
        return (_jsxs(View, { style: styles.connectingView, children: [_jsx(Animated.View, { style: [styles.signingErrorIcon, { opacity: entrance[0].opacity }], children: _jsx(CircleXIcon, { color: theme.colorDanger, size: 40 }) }), _jsx(Animated.View, { style: { opacity: entrance[1].opacity, transform: [{ translateY: entrance[1].translateY }] }, children: _jsx(Text, { style: styles.connectingTitle, children: t('signing.error_title') }) }), _jsxs(Animated.View, { style: { opacity: entrance[2].opacity, transform: [{ translateY: entrance[2].translateY }] }, children: [_jsx(Text, { style: [styles.connectingSubtitle, styles.connectingSubtitleError], children: error }), _jsxs(View, { style: styles.signingActions, children: [_jsx(Pressable, { style: ({ pressed }) => [styles.ghostPill, pressed && styles.ghostPillPressed], onPress: onCancel, accessibilityRole: "button", children: _jsx(Text, { style: styles.ghostPillText, children: t('action.cancel') }) }), _jsxs(Pressable, { style: ({ pressed }) => [styles.retryPill, pressed && styles.retryPillPressed], onPress: onRetry, accessibilityRole: "button", accessibilityLabel: t('action.try_again'), children: [_jsx(RetryIcon, { color: theme.colorText, size: 14 }), _jsx(Text, { style: styles.retryPillText, children: t('action.try_again') })] })] })] })] }));
    }
    return (_jsxs(View, { style: styles.connectingView, children: [_jsxs(Animated.View, { style: [
                    styles.logoWrap,
                    { opacity: entrance[0].opacity, transform: [{ translateY: entrance[0].translateY }, { scale: breathe }] },
                ], children: [_jsx(View, { style: { position: 'absolute' }, children: _jsx(SquircleArc, { color: theme.colorAccent, size: SQUIRCLE_SPEC.box, strokeWidth: SQUIRCLE_SPEC.strokeWidth, durationMs: SQUIRCLE_SPEC.signingDurationMs }) }), _jsx(View, { style: styles.connectingLogo, children: _jsx(WalletIcon, { source: walletIcon, walletKey: walletKey, fallbackLabel: walletName, size: 56, radius: 22 }) })] }), _jsx(Animated.View, { style: { opacity: entrance[1].opacity, transform: [{ translateY: entrance[1].translateY }] }, children: _jsx(Text, { style: styles.connectingTitle, children: t('signing.continue_in_wallet', { walletName }) }) }), _jsx(Animated.View, { style: { opacity: entrance[2].opacity, transform: [{ translateY: entrance[2].translateY }] }, children: _jsx(Text, { style: styles.connectingSubtitle, children: t('signing.subtitle') }) }), onOpenWallet && (_jsx(Animated.View, { style: { opacity: entrance[3].opacity, transform: [{ translateY: entrance[3].translateY }] }, children: _jsx(Pressable, { style: ({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed], onPress: onOpenWallet, accessibilityRole: "button", children: _jsx(Text, { style: styles.primaryButtonText, children: t('wc.open_in_wallet') }) }) }))] }));
}
//# sourceMappingURL=SigningView.js.map