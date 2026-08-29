import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { ChevronLeftIcon, CloseIcon } from '../icons.js';
import { WalletIcon } from '../WalletIcon.js';
export function HeaderView(props) {
    const { styles, theme, showClose, onClose, onBack, backWalletName, connectedWalletName, connectedWalletIcon, connectedWalletKey, title, logo, } = props;
    const closeButton = showClose ? (_jsx(Pressable, { style: ({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed], onPress: onClose, accessibilityRole: "button", accessibilityLabel: t('aria.close_dialog'), hitSlop: 8, children: _jsx(CloseIcon, { color: theme.colorTextMuted, size: 16 }) })) : null;
    // Variant 1 — back arrow + centered wallet name + close
    // (web .header--connecting).
    if (backWalletName) {
        return (_jsxs(View, { style: [styles.header, styles.headerConnecting], children: [_jsx(Pressable, { style: ({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed], onPress: onBack, accessibilityRole: "button", accessibilityLabel: t('aria.back'), hitSlop: 8, children: _jsx(ChevronLeftIcon, { color: theme.colorTextMuted, size: 16 }) }), _jsx(Text, { style: styles.headerTitle, numberOfLines: 1, children: backWalletName }), closeButton ?? _jsx(View, { style: { width: 28 } })] }));
    }
    // Variant 2 — connected: wallet icon + wallet name (web swaps the app
    // brand for the wallet brand once a session exists).
    if (connectedWalletName) {
        return (_jsxs(View, { style: styles.header, children: [_jsxs(View, { style: styles.headerBrand, children: [_jsx(View, { style: styles.headerLogo, children: _jsx(WalletIcon, { source: connectedWalletIcon ?? null, walletKey: connectedWalletKey ?? null, fallbackLabel: connectedWalletName, size: 22, radius: 6 }) }), _jsx(Text, { style: [styles.headerTitle, styles.headerTitleLeft], numberOfLines: 1, children: connectedWalletName })] }), closeButton ?? _jsx(View, { style: { width: 28 } })] }));
    }
    // Variant 3 — default: optional app logo + title (left-aligned brand).
    return (_jsxs(View, { style: styles.header, children: [_jsxs(View, { style: styles.headerBrand, children: [logo ? _jsx(Image, { source: logo, style: styles.headerLogo }) : null, _jsx(Text, { style: [styles.headerTitle, styles.headerTitleLeft], numberOfLines: 1, children: title })] }), closeButton ?? _jsx(View, { style: { width: 28 } })] }));
}
//# sourceMappingURL=HeaderView.js.map