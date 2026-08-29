import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { listAdditionalMobileWallets, listFeaturedMobileWallets, } from '../../deep-links.js';
import { WalletRowView } from './WalletRowView.js';
export function WalletListView(props) {
    const { styles, theme, loading, rows, showMobileWallets, showMore, onToggleMore, onConnectMobile, onConnectConnector, onInstall } = props;
    const featured = showMobileWallets ? listFeaturedMobileWallets() : [];
    const additional = showMobileWallets ? listAdditionalMobileWallets() : [];
    // The WalletConnect connector has no row of its own — the named mobile
    // wallets above ARE its pairing surface (deep link only, no QR).
    const directRows = rows.filter((row) => row.connector.id !== 'walletconnect');
    if (loading && rows.length === 0) {
        return (_jsxs(View, { style: styles.listLoading, children: [_jsx(ActivityIndicator, { color: theme.colorAccent }), _jsx(Text, { style: styles.listLoadingText, children: t('wallet_list.loading') })] }));
    }
    return (_jsxs(View, { style: styles.sections, children: [featured.length > 0 && (_jsx(Text, { style: styles.sectionTitle, accessibilityRole: "header", children: t('wallet_list.section_stellar') })), featured.map((wallet) => (_jsx(WalletRowView, { styles: styles, theme: theme, icon: wallet.icon, walletKey: wallet.id, name: wallet.name, status: { kind: 'muted', text: t('wc.open_in_wallet') }, onPress: () => onConnectMobile(wallet) }, wallet.id))), directRows.map((row) => {
                const { connector, reachability } = row;
                // The web status matrix: not-installed → Install pill (row still
                // full-opacity), locked/unavailable → muted text, else → Installed badge.
                const status = reachability === 'not-installed'
                    ? { kind: 'install' }
                    : reachability === 'locked'
                        ? { kind: 'muted', text: t('wallet_list.status.locked') }
                        : reachability === 'unavailable'
                            ? { kind: 'muted', text: t('wallet_list.status.unavailable') }
                            : { kind: 'installed' };
                return (_jsx(WalletRowView, { styles: styles, theme: theme, icon: connector.meta.icon ?? null, walletKey: connector.id, name: connector.meta.name, status: status, dimmed: reachability === 'unavailable', disabled: reachability === 'not-installed' || reachability === 'unavailable', onPress: () => onConnectConnector(connector.id), onInstall: () => onInstall(row) }, connector.id));
            }), additional.length > 0 && (_jsxs(View, { children: [_jsxs(Pressable, { style: ({ pressed }) => [styles.moreHeader, pressed && { opacity: 0.6 }], onPress: onToggleMore, accessibilityRole: "button", accessibilityLabel: t('wallet_list.more_wallets', { count: additional.length }), accessibilityState: { expanded: showMore }, children: [_jsx(Text, { style: styles.sectionTitle, children: t('wallet_list.more_wallets', { count: additional.length }) }), _jsx(Text, { style: [styles.moreChevron, showMore && styles.moreChevronOpen], children: "\u203A" })] }), showMore &&
                        additional.map((wallet) => (_jsx(WalletRowView, { styles: styles, theme: theme, icon: wallet.icon, walletKey: wallet.id, name: wallet.name, status: { kind: 'muted', text: t('wc.open_in_wallet') }, onPress: () => onConnectMobile(wallet) }, wallet.id)))] }))] }));
}
//# sourceMappingURL=WalletListView.js.map