/**
 * Shared types for the React Native modal UI.
 *
 * Extracted from AppKitModal.tsx so each view file (./views/*) and the
 * orchestrator (./AppKitModal.tsx) can import them without a circular
 * dependency on the component file.
 */
/** i18n key for each view's sheet-header title (connecting/signing keep the wallet name). */
export const VIEW_TITLES = {
    list: 'title.connect_wallet',
    account: 'title.account',
    error: 'error.title',
    'network-mismatch': 'title.wrong_network',
    'siws-checking': 'siws.title',
    'siws-nonce': 'siws.title',
    'siws-signing': 'siws.title',
    'siws-verifying': 'siws.title',
    'siws-error': 'siws.error_title',
};
/** SIWS phases share one component + one title. */
export const SIWS_PHASES = [
    'siws-checking',
    'siws-nonce',
    'siws-signing',
    'siws-verifying',
];
/** Which views use the web `.header--connecting` (back arrow + wallet name + close). */
export function usesBackHeader(view, hasError) {
    return (view === 'connecting' ||
        view === 'network-mismatch' ||
        view === 'siws-error' ||
        (view === 'signing' && hasError) ||
        (view === 'error' && hasError));
}
//# sourceMappingURL=types.js.map