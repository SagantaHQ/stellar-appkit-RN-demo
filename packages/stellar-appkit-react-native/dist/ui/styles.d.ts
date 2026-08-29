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
 * - the header is the web `.header` (16/18/8 padding, 15/600 title, 28×28
 *   icon buttons) with the `.header--connecting` back-arrow variant
 * - connecting/signing/SIWS views use the web `.connecting-view` metrics
 *   (88×88 logo wrap, 56×56 squircle logo, 17/600 title, 14/1.5 muted
 *   subtitle capped at 280 wide, 999-radius retry pill)
 * - the panel footer is the web `.footer` ("Powered by Stellar AppKit")
 * - inline mode renders the web `.inline-root .panel`: radiusLg corners,
 *   1px colorBorder outline, no overlay/handle/close button
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
        gap: number;
        paddingHorizontal: number;
        paddingTop: number;
        paddingBottom: number;
        minHeight: number;
    };
    headerBrand: {
        flexDirection: "row";
        alignItems: "center";
        gap: number;
        flex: number;
        minWidth: number;
    };
    headerLogo: {
        width: number;
        height: number;
        borderRadius: number;
    };
    headerTitle: {
        color: string;
        fontSize: number;
        fontWeight: "600";
        letterSpacing: number;
        flex: number;
        textAlign: "center";
    };
    headerTitleLeft: {
        textAlign: "left";
        flex: number;
    };
    headerButton: {
        width: number;
        height: number;
        borderRadius: number;
        alignItems: "center";
        justifyContent: "center";
    };
    headerButtonPressed: {
        backgroundColor: string;
        opacity: number;
    };
    headerConnecting: {
        justifyContent: "space-between";
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
    connectingView: {
        alignItems: "center";
        paddingHorizontal: number;
        paddingTop: number;
        paddingBottom: number;
    };
    logoWrap: {
        width: number;
        height: number;
        marginBottom: number;
        alignItems: "center";
        justifyContent: "center";
    };
    connectingLogo: {
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
    logoWrapError: {
        marginBottom: number;
    };
    connectingTitle: {
        color: string;
        fontSize: number;
        fontWeight: "600";
        letterSpacing: number;
        lineHeight: number;
        textAlign: "center";
        marginBottom: number;
    };
    connectingSubtitle: {
        color: string;
        fontSize: number;
        lineHeight: number;
        textAlign: "center";
        maxWidth: number;
        marginBottom: number;
    };
    connectingSubtitleError: {
        color: string;
        marginBottom: number;
    };
    retryPill: {
        flexDirection: "row";
        alignItems: "center";
        gap: number;
        paddingHorizontal: number;
        paddingVertical: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
    };
    retryPillPressed: {
        backgroundColor: string;
        transform: {
            scale: number;
        }[];
    };
    retryPillText: {
        color: string;
        fontSize: number;
        fontWeight: "500";
    };
    ghostPill: {
        flexDirection: "row";
        alignItems: "center";
        gap: number;
        paddingHorizontal: number;
        paddingVertical: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
    };
    ghostPillPressed: {
        backgroundColor: string;
        transform: {
            scale: number;
        }[];
    };
    ghostPillText: {
        color: string;
        fontSize: number;
        fontWeight: "500";
    };
    signingErrorIcon: {
        marginBottom: number;
    };
    signingActions: {
        flexDirection: "row";
        gap: number;
        justifyContent: "center";
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
    errorState: {
        alignItems: "center";
        gap: number;
        paddingVertical: number;
        paddingHorizontal: number;
    };
    errorStateIcon: {
        marginBottom: number;
    };
    errorStateTitle: {
        color: string;
        fontSize: number;
        fontWeight: "600";
        textAlign: "center";
    };
    errorStateMessage: {
        color: string;
        fontSize: number;
        lineHeight: number;
        textAlign: "center";
    };
    errorStateStrong: {
        color: string;
        fontWeight: "700";
    };
    btn: {
        paddingHorizontal: number;
        paddingVertical: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
        marginTop: number;
    };
    btnPressed: {
        backgroundColor: string;
        opacity: number;
    };
    btnText: {
        color: string;
        fontSize: number;
        fontWeight: "500";
        textAlign: "center";
    };
    footer: {
        flexDirection: "row";
        justifyContent: "center";
        alignItems: "center";
        gap: number;
        paddingVertical: number;
        paddingHorizontal: number;
        borderTopWidth: number;
        borderTopColor: string;
    };
    footerText: {
        color: string;
        fontSize: number;
    };
    footerLink: {
        color: string;
        fontSize: number;
        fontWeight: "500";
    };
    inlinePanel: {
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
        backgroundColor: string;
        overflow: "hidden";
        alignSelf: "stretch";
    };
    inlineBody: {
        maxHeight: number;
    };
};
export type AppKitStyles = ReturnType<typeof buildStyles>;
//# sourceMappingURL=styles.d.ts.map