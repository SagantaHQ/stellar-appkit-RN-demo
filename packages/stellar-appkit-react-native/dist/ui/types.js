/**
 * Shared types for the React Native modal UI.
 *
 * Extracted from AppKitModal.tsx so each view file (./views/*) and the
 * orchestrator (./AppKitModal.tsx) can import them without a circular
 * dependency on the component file.
 */
/** i18n key for each view's sheet-header title (connecting/signing/preview
 * keep their own in-view titles — web shows the wallet name / preview title). */
export const VIEW_TITLES = {
    list: 'title.connect_wallet',
    account: 'title.account',
    preview: 'title.review_transaction',
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
/**
 * Decides which view the modal lands on when it (re-)opens.
 *
 * Web `open()` parity (ui-web connect-modal.ts):
 *
 * ```ts
 * if (!this.pendingPreview && !this.pendingAccountPicker) {
 *   this.view = this._client.session ? 'connected' : 'wallet-list';
 * }
 * ```
 *
 * A sign request awaiting the user's decision owns the view — the modal is
 * often opening *because* the sign arrived (apps auto-open on
 * `pendingSignCount > 0`), so resetting to the account view would orphan the
 * pending preview and hang the sign queue forever. The two RN extensions are
 * the same principle for flows the web only ever runs with the modal open:
 *
 * - **Sign queue in flight** (preview already approved, `skipPreview`, or the
 *   app installed its own instant-approve preview handler) → re-enter the
 *   signing view, which tells the user where the request is waiting.
 * - **SIWS mid-flow** → restore the active phase (RN can restore a session
 *   from storage at app start with the sheet closed; the web never faces
 *   that because connecting always happens inside the modal).
 */
export function resolveViewOnOpen(opts) {
    if (opts.pendingPreview)
        return 'preview';
    if (opts.pendingSignCount > 0 && !opts.siwsBusy)
        return 'signing';
    if (opts.siwsBusy && opts.siwsPhase && opts.siwsPhase.startsWith('siws-')) {
        return opts.siwsPhase;
    }
    return opts.hasSession ? 'account' : 'list';
}
//# sourceMappingURL=types.js.map