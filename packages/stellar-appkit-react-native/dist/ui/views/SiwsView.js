import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Animated, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { useBreathe, useEntranceStagger } from '../animations.js';
import { SquircleArc } from '../SquircleArc.js';
import { RetryIcon } from '../icons.js';
import { WalletIcon } from '../WalletIcon.js';
import { SQUIRCLE_SPEC } from '../squircle-track.js';
export function SiwsView(props) {
    const { styles, theme, reducedMotion, walletName, walletIcon, walletKey, phase, error, walletConnected, onCancel, onRetry } = props;
    const isError = phase === 'siws-error';
    const breathe = useBreathe(reducedMotion);
    const entrance = useEntranceStagger(4, reducedMotion);
    const subtitle = phase === 'siws-checking'
        ? t('siws.phase.checking_session')
        : phase === 'siws-nonce'
            ? t('siws.phase.fetching_nonce')
            : phase === 'siws-signing'
                ? t('siws.phase.approve_in_wallet', { walletName })
                : phase === 'siws-verifying'
                    ? t('siws.phase.verifying')
                    : (error ?? t('siws.error_default'));
    return (_jsxs(View, { style: styles.connectingView, children: [_jsxs(Animated.View, { style: [
                    styles.logoWrap,
                    isError && styles.logoWrapError,
                    { opacity: entrance[0].opacity, transform: [{ translateY: entrance[0].translateY }, { scale: isError ? 1 : breathe }] },
                ], children: [!isError && (_jsx(View, { style: { position: 'absolute' }, children: _jsx(SquircleArc, { color: theme.colorAccent, size: SQUIRCLE_SPEC.box, strokeWidth: SQUIRCLE_SPEC.strokeWidth, durationMs: reducedMotion ? SQUIRCLE_SPEC.connectingReducedMotionDurationMs : SQUIRCLE_SPEC.connectingDurationMs }) })), _jsx(View, { style: styles.connectingLogo, children: _jsx(WalletIcon, { source: walletIcon, walletKey: walletKey, fallbackLabel: walletName, size: 56, radius: 22 }) })] }), _jsx(Animated.View, { style: { opacity: entrance[1].opacity, transform: [{ translateY: entrance[1].translateY }] }, children: _jsx(Text, { style: styles.connectingTitle, children: isError ? t('siws.error_title') : t('siws.title') }) }), _jsx(Animated.View, { style: { opacity: entrance[2].opacity, transform: [{ translateY: entrance[2].translateY }] }, children: _jsx(Text, { style: [styles.connectingSubtitle, isError && styles.connectingSubtitleError], children: subtitle }) }), _jsx(Animated.View, { style: { opacity: entrance[3].opacity, transform: [{ translateY: entrance[3].translateY }] }, children: isError ? (_jsxs(Pressable, { style: ({ pressed }) => [styles.retryPill, pressed && styles.retryPillPressed], onPress: onRetry, accessibilityRole: "button", accessibilityLabel: walletConnected ? t('action.try_again') : t('siws.connect_wallet'), children: [_jsx(RetryIcon, { color: theme.colorText, size: 14 }), _jsx(Text, { style: styles.retryPillText, children: walletConnected ? t('action.try_again') : t('siws.connect_wallet') })] })) : (_jsx(Pressable, { style: ({ pressed }) => [styles.ghostPill, pressed && styles.ghostPillPressed], onPress: onCancel, accessibilityRole: "button", children: _jsx(Text, { style: styles.ghostPillText, children: t('action.cancel') }) })) })] }));
}
//# sourceMappingURL=SiwsView.js.map