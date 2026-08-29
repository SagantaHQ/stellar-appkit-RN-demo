import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
export function ErrorView(props) {
    const { styles, theme, message, onRetry } = props;
    return (_jsxs(View, { style: styles.centered, children: [_jsx(View, { style: [styles.errorBadge, { borderColor: theme.colorDanger }], children: _jsx(Text, { style: [styles.errorBadgeText, { color: theme.colorDanger }], children: "!" }) }), _jsx(Text, { style: styles.title, children: t('error.title') }), _jsx(Text, { style: styles.muted, children: message }), _jsx(Pressable, { style: ({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed], onPress: onRetry, accessibilityRole: "button", children: _jsx(Text, { style: styles.primaryButtonText, children: t('action.try_again') }) })] }));
}
//# sourceMappingURL=ErrorView.js.map