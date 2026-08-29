import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, Text, View } from 'react-native';
import { WalletIcon } from '../WalletIcon.js';
import { t } from '@saganta/stellar-appkit';
export function WalletRowView(props) {
    const { styles, theme, icon, walletKey, name, onPress, disabled, dimmed, status, onInstall } = props;
    return (_jsxs(Pressable, { style: ({ pressed }) => [
            styles.walletRow,
            dimmed && styles.walletRowDimmed,
            pressed && !disabled && { backgroundColor: theme.colorSurfaceHover },
        ], onPress: onPress, disabled: disabled, accessibilityRole: "button", accessibilityLabel: name, children: [_jsx(View, { style: styles.walletTile, children: _jsx(WalletIcon, { source: icon, walletKey: walletKey, fallbackLabel: name, size: 40, radius: 16 }) }), _jsx(Text, { style: styles.walletName, numberOfLines: 1, children: name }), status?.kind === 'installed' && _jsx(InstalledBadge, { styles: styles }), status?.kind === 'muted' && _jsx(Text, { style: styles.statusMuted, children: status.text }), status?.kind === 'install' && (_jsx(Pressable, { style: ({ pressed }) => [styles.installButton, pressed && styles.installButtonPressed], onPress: onInstall, accessibilityRole: "button", accessibilityLabel: t('wallet_list.install'), children: _jsx(Text, { style: styles.installText, children: t('wallet_list.install') }) }))] }));
}
/** `.wallet-sub--installed` — outline pill + accent dot, web parity. */
function InstalledBadge({ styles }) {
    return (_jsxs(View, { style: styles.statusBadge, children: [_jsx(View, { style: styles.statusDot }), _jsx(Text, { style: styles.statusBadgeText, children: t('wallet_list.status.installed') })] }));
}
//# sourceMappingURL=WalletRowView.js.map