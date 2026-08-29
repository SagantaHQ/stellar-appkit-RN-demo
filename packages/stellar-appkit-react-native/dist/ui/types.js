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
};
//# sourceMappingURL=types.js.map