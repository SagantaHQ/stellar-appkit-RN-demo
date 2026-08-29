/**
 * Shared stylesheet for the React Native modal — a port of ui-web's modal CSS
 * (styles.ts in packages/ui-web), view for view:
 *
 * - wallet rows are flat, individually rounded rectangles (`.wallet-row`),
 *   NOT cards with hairline separators — press highlights the row itself
 * - the 40dp wallet tile is a border-less squircle with a soft drop shadow
 *   (`.wallet-tile`) — the logo fills it edge-to-edge
 * - "Installed" is an outline badge with a 6dp accent dot (`.wallet-sub--installed`)
 * - not-installed wallets keep full opacity and carry an accent "Install"
 *   button on the right (`.wallet-install-btn`)
 * - unavailable wallets dim to 0.55 (`.wallet-row[data-unavailable]`)
 *
 * Every view imports `buildStyles(theme)` output through the orchestrator's
 * `useMemo`, so a custom theme restyles the whole sheet consistently.
 *
 * This module intentionally imports ONLY `Platform`/`StyleSheet` from
 * react-native — it stays importable in bun tests via a light react-native
 * mock (see tests/ui-styles.test.ts), which pins the web-parity values.
 */
import type { ConnectThemeRN } from './theme.js';
export declare function buildStyles(theme: ConnectThemeRN): {
    content: {
        paddingHorizontal: number;
        paddingTop: number;
        paddingBottom: number;
        gap: number;
    };
    sections: {
        gap: number;
    };
    header: {
        flexDirection: "row";
        alignItems: "center";
        justifyContent: "space-between";
        paddingHorizontal: number;
        paddingVertical: number;
        borderBottomWidth: number;
        borderBottomColor: string;
        minHeight: number;
    };
    headerTitle: {
        color: string;
        fontSize: number;
        fontWeight: "700";
        flex: number;
        textAlign: "center";
    };
    headerButton: {
        width: number;
        height: number;
        borderRadius: number;
        alignItems: "center";
        justifyContent: "center";
        backgroundColor: string;
    };
    headerButtonPressed: {
        opacity: number;
    };
    headerButtonSpacer: {
        width: number;
    };
    headerButtonGlyph: {
        color: string;
        fontSize: number;
        fontWeight: "600";
        lineHeight: number;
        marginTop: number;
    };
    centered: {
        alignItems: "center";
        gap: number;
        paddingVertical: number;
    };
    title: {
        color: string;
        fontSize: number;
        fontWeight: "700";
        textAlign: "center";
    };
    muted: {
        color: string;
        fontSize: number;
    };
    listLoading: {
        alignItems: "center";
        gap: number;
        paddingVertical: number;
    };
    listLoadingText: {
        color: string;
        fontSize: number;
    };
    walletRow: {
        flexDirection: "row";
        alignItems: "center";
        gap: number;
        paddingVertical: number;
        paddingHorizontal: number;
        borderRadius: number;
    };
    walletRowDimmed: {
        opacity: number;
    };
    walletTile: {
        width: number;
        height: number;
        borderRadius: number;
        backgroundColor: string;
        overflow: "hidden";
        shadowColor: string;
        shadowOffset: {
            width: number;
            height: number;
        };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
    walletName: {
        color: string;
        fontSize: number;
        fontWeight: "500";
        flex: number;
    };
    statusBadge: {
        flexDirection: "row";
        alignItems: "center";
        gap: number;
        paddingHorizontal: number;
        paddingVertical: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
    };
    statusBadgeText: {
        color: string;
        fontFamily: string | undefined;
        fontSize: number;
        fontWeight: "600";
        letterSpacing: number;
        textTransform: "uppercase";
    };
    statusDot: {
        width: number;
        height: number;
        borderRadius: number;
        backgroundColor: string;
    };
    statusMuted: {
        color: string;
        fontSize: number;
    };
    installButton: {
        backgroundColor: string;
        borderRadius: number;
        paddingHorizontal: number;
        paddingVertical: number;
    };
    installButtonPressed: {
        opacity: number;
    };
    installText: {
        color: string;
        fontSize: number;
        fontWeight: "600";
    };
    sectionTitle: {
        color: string;
        fontSize: number;
        fontWeight: "700";
        letterSpacing: number;
        textTransform: "uppercase";
        paddingTop: number;
        paddingHorizontal: number;
    };
    moreHeader: {
        flexDirection: "row";
        alignItems: "center";
        justifyContent: "space-between";
        paddingVertical: number;
        paddingHorizontal: number;
        borderRadius: number;
    };
    moreChevron: {
        color: string;
        fontSize: number;
        fontWeight: "600";
        transform: {
            rotate: string;
        }[];
    };
    moreChevronOpen: {
        transform: {
            rotate: string;
        }[];
    };
    animWrap: {
        width: number;
        height: number;
        alignItems: "center";
        justifyContent: "center";
        marginVertical: number;
    };
    animLogoWrap: {
        borderRadius: number;
        overflow: "hidden";
    };
    animArc: {
        position: "absolute";
        width: number;
        height: number;
    };
    openFailedCard: {
        alignItems: "center";
        gap: number;
        backgroundColor: string;
        borderRadius: number;
        padding: number;
        marginTop: number;
        alignSelf: "stretch";
    };
    openFailedText: {
        color: string;
        fontSize: number;
        textAlign: "center";
    };
    primaryButton: {
        backgroundColor: string;
        borderRadius: number;
        paddingVertical: number;
        paddingHorizontal: number;
        alignItems: "center";
        marginTop: number;
        alignSelf: "stretch";
    };
    primaryButtonPressed: {
        opacity: number;
    };
    primaryButtonText: {
        color: string;
        fontSize: number;
        fontWeight: "700";
    };
    secondaryButton: {
        borderColor: string;
        borderWidth: number;
        borderRadius: number;
        paddingVertical: number;
        alignItems: "center";
        marginTop: number;
    };
    secondaryButtonPressed: {
        opacity: number;
    };
    secondaryButtonText: {
        color: string;
        fontSize: number;
        fontWeight: "600";
    };
    dangerButton: {
        borderColor: string;
        borderWidth: number;
        borderRadius: number;
        paddingVertical: number;
        alignItems: "center";
        marginTop: number;
    };
    dangerButtonPressed: {
        opacity: number;
    };
    dangerButtonText: {
        color: string;
        fontSize: number;
        fontWeight: "600";
    };
    textButton: {
        paddingVertical: number;
        marginTop: number;
    };
    textButtonText: {
        color: string;
        fontSize: number;
        fontWeight: "600";
    };
    accountCard: {
        flexDirection: "row";
        alignItems: "center";
        gap: number;
        backgroundColor: string;
        borderRadius: number;
        padding: number;
    };
    walletMeta: {
        flex: number;
        gap: number;
    };
    addressText: {
        color: string;
        fontSize: number;
        letterSpacing: number;
    };
    danger: {
        color: string;
        fontSize: number;
        marginTop: number;
    };
    errorBadge: {
        width: number;
        height: number;
        borderRadius: number;
        borderWidth: number;
        alignItems: "center";
        justifyContent: "center";
        marginBottom: number;
    };
    errorBadgeText: {
        fontSize: number;
        fontWeight: "800";
    };
};
export type AppKitStyles = ReturnType<typeof buildStyles>;
//# sourceMappingURL=styles.d.ts.map