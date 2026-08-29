import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { AlertCircleIcon } from '../icons.js';
export function ErrorView(props) {
    const { styles, theme, message, onRetry } = props;
    return (_jsxs(View, { style: styles.errorState, children: [_jsx(AlertCircleIcon, { color: theme.colorDanger, size: 28 }), _jsx(Text, { style: styles.errorStateTitle, children: t('error.title') }), _jsx(Text, { style: styles.errorStateMessage, children: message }), _jsx(Pressable, { style: ({ pressed }) => [styles.btn, pressed && styles.btnPressed], onPress: onRetry, accessibilityRole: "button", accessibilityLabel: t('action.try_again'), children: _jsx(Text, { style: styles.btnText, children: t('action.try_again') }) })] }));
}
/**
 * NetworkMismatchView — web renderNetworkMismatch(): same .error-state
 * layout with the wrong-network copy and a bold actual/expected pair.
 */
export function NetworkMismatchView(props) {
    const { styles, theme, actualNetwork, expectedNetwork, onRetry } = props;
    const hasDetail = Boolean(actualNetwork && expectedNetwork);
    return (_jsxs(View, { style: styles.errorState, children: [_jsx(AlertCircleIcon, { color: theme.colorDanger, size: 28 }), _jsx(Text, { style: styles.errorStateTitle, children: t('network_mismatch.title') }), hasDetail ? (_jsx(Text, { style: styles.errorStateMessage, children: t('network_mismatch.detail', { actualNetwork, expectedNetwork: expectedNetwork ?? '' }) })) : (_jsx(Text, { style: styles.errorStateMessage, children: t('network_mismatch.detail_fallback') })), _jsx(Text, { style: styles.errorStateMessage, children: t('network_mismatch.action_hint') }), _jsx(Pressable, { style: ({ pressed }) => [styles.btn, pressed && styles.btnPressed], onPress: onRetry, accessibilityRole: "button", accessibilityLabel: t('action.try_again'), children: _jsx(Text, { style: styles.btnText, children: t('action.try_again') }) })] }));
}
//# sourceMappingURL=ErrorView.js.map