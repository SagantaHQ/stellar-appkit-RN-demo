import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { WalletIcon } from '../WalletIcon.js';
export function AccountView(props) {
    const { styles, theme, address, walletName, walletIcon, pendingSigns, onShare, onDisconnect } = props;
    const shortened = `${address.slice(0, 8)}…${address.slice(-8)}`;
    return (_jsxs(View, { children: [_jsxs(View, { style: styles.accountCard, children: [_jsx(WalletIcon, { source: walletIcon, fallbackLabel: walletName, size: 48, radius: theme.radiusMd }), _jsxs(View, { style: styles.walletMeta, children: [_jsx(Text, { style: styles.walletName, children: walletName }), _jsx(Text, { style: styles.addressText, children: shortened }), pendingSigns > 0 && _jsx(Text, { style: styles.danger, children: t('connected.pending_signatures', { count: pendingSigns }) })] })] }), _jsx(Pressable, { style: ({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed], onPress: onShare, accessibilityRole: "button", children: _jsx(Text, { style: styles.secondaryButtonText, children: t('aria.click_to_copy') }) }), _jsx(Pressable, { style: ({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed], onPress: onDisconnect, accessibilityRole: "button", children: _jsx(Text, { style: styles.dangerButtonText, children: t('action.disconnect') }) })] }));
}
//# sourceMappingURL=AccountView.js.map