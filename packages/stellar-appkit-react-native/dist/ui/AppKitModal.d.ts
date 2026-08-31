/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * This file is the orchestrator only: it owns the view state machine
 * (list → connecting → account / error / signing / SIWS phases), the
 * connect actions and the deep-link handoff. Every screen is its own
 * file under ./views/:
 *
 *   views/HeaderView.tsx       — web .header (brand / connecting-back /
 *                                connected-wallet variants)
 *   views/WalletListView.tsx   — wallet picker (web-parity flat rows)
 *   views/WalletRowView.tsx    — one wallet row (.wallet-row port)
 *   views/ConnectingView.tsx   — connecting (+ error variant + animations)
 *   views/SigningView.tsx      — signing (+ error variant)
 *   views/SiwsView.tsx         — Sign-In With Stellar phases + error
 *   views/AccountView.tsx      — connected account
 *   views/ErrorView.tsx        — generic error + network mismatch
 *
 * UX parity with the web `<stellar-appkit-modal>` (ui-web connect-modal.ts):
 *
 * - **Transaction preview** — the modal installs itself as the client's
 *   `onPreviewTransaction` handler (same as the web modal), so every
 *   signTransaction()/signMessage() first shows the decoded preview
 *   (operations, risk flags, fee, source account) with Cancel + Sign /
 *   Approve. Approve → signing view; Cancel → back to the account view;
 *   "Try again" after a wallet rejection re-shows the approved preview.
 * - **Error routing** matches the web exactly: a failed connect stays on
 *   the connecting view (its error variant: wallet logo, danger subtitle,
 *   "Try again" pill); a rejected sign stays on the signing view (Cancel +
 *   Try again); NetworkMismatchError opens the wrong-network view;
 *   everything else opens the generic error state.
 * - **Connected view** — the full web account panel: deterministic avatar,
 *   tap-to-copy address, network pill, explorer link, overflow menu
 *   (Switch Wallet / Disconnect), pending-signature banner, XLM balance
 *   with skeleton + 10s silent polling, "Get Testnet funds" (friendbot)
 *   with the 3s funding banner, and the Recent Activity list.
 * - **i18n** — every string is `t()`-resolved and the sheet re-renders on
 *   `setLocale()` (all 25 core locales). `detectDeviceLocale()` /
 *   `applyDeviceLocale()` wire the device language at app init.
 * - **Back arrow** — while connecting (error or not), on SIWS errors and
 *   on signing errors the header shows the `.header--connecting` variant:
 *   back chevron + centered wallet name + close. Back cancels the state
 *   and returns to the wallet list.
 * - **SIWS** — when `client.siwsConfig` is set, the automatic sign-in
 *   flow runs right after a successful connect (checking → nonce →
 *   signing → verifying → account), with retry caps, per-step timeouts
 *   and disconnect-on-fail exactly like the web modal (useSiws.ts).
 * - **Inline mode** — `mode="inline"` renders the panel in place (web
 *   `mode="inline"`): bordered card, no overlay, no close button, always
 *   visible; `open`/`onClose` only apply to the bottom-sheet mode.
 * - **Footer** — "Powered by Stellar AppKit", pinned at the panel bottom
 *   like the web `.footer`.
 *
 * Mobile-native deviations (deliberate, documented in ARCHITECTURE.md):
 * - **Deep-link-only pairing**: on a phone the same device would have to
 *   scan a QR code, so the RN modal never renders one. Every wallet row
 *   embeds the WalletConnect pairing URI into the wallet's own deep link
 *   (`freighterwallet://wc-redirect/wc?uri=...`) and hands off to the OS,
 *   Solana-Mobile-Adapter style. "Copy pairing code" covers wallets with
 *   manual pairing fields.
 * - **True wallet names** — connecting/signing/SIWS views carry the
 *   wallet's own name and icon, never a generic "WalletConnect" label.
 * - **Auto-close on success** — when the operation the app requested
 *   completes successfully (a connect settles — including the return from
 *   the wallet app's approval screen — or the sign queue drains cleanly),
 *   the sheet dismisses itself after a short confirmation flash. The
 *   mobile deep-link pattern: the user just confirmed in the wallet, the
 *   round trip is done. The web modal instead stays open on the account
 *   view; RN deviates on purpose (documented in ARCHITECTURE.md). Success
 *   is the ONLY trigger — never fires on errors/rejections (web parity:
 *   the user reads the result and acts on it); opt out with
 *   `autoCloseOnComplete={false}`. See ui/auto-close.ts.
 * - **Deferred WC warm-up** — the WalletConnect SignClient is pre-warmed
 *   at modal mount (app start for always-mounted modals) AND on every
 *   open, both deferred ~150ms: the SDK's module-tree evaluation blocks
 *   the JS thread for seconds on debug builds, and firing it in the open
 *   tick would freeze the sheet's layout/entrance animation — the tap
 *   would look dead for 5-10 seconds. See ui/warm-up.ts.
 * - **Auto-open the wallet on sign** (`autoOpenWalletOnSign`, default on)
 *   — once the user CONSENTS (taps Sign/Approve in the app's preview
 *   modal) and the WalletConnect request is actually on the wire, the
 *   paired wallet app opens by itself, MWA-style: the user lands straight
 *   in the wallet's pending prompt instead of tapping "Open in wallet
 *   app". Never fires before consent — the trigger is the connector's
 *   post-preview dispatch notification, not the sign queue — and a
 *   request that settles (fails or completes) within the short settle
 *   window cancels the handoff. Only while the app is foregrounded and
 *   only when a target is derivable — the connect-time pick, or the
 *   wallet the restored session's peer metadata points back to after a
 *   cold restart. Failures are silent; the manual button remains.
 * - **Wallet-side disconnects propagate** — when the user disconnects
 *   INSIDE the wallet, session_delete arrives over the relay (typically
 *   on the next foregrounding, when the transport restart re-delivers
 *   queued messages), core reconciles its session map, and the modal
 *   flips off the account view exactly as if the app had disconnected.
 *   No zombie "connected" UI for a session the wallet already killed.
 *
 * Presentation: @gorhom/bottom-sheet with a backdrop + swipe-to-dismiss
 * (default), or the inline panel. Icons render through `<WalletIcon>` —
 * zero native image dependencies; the spinner is the pure-View squircle
 * arc port (SquircleArc), no react-native-svg anywhere.
 */
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { StellarAppKit } from '@saganta/stellar-appkit';
import type { ThemedBrowserSession } from '../browser/inapp-browser.js';
import { type ConnectThemeRN } from './theme.js';
export interface AppKitModalProps {
    client: StellarAppKit;
    /**
     * Bottom-sheet mode only: whether the sheet is presented. Ignored in
     * inline mode (the panel is always rendered, like the web's
     * `mode="inline"` whose open() is a no-op).
     */
    open: boolean;
    onClose: () => void;
    theme?: ConnectThemeRN;
    /**
     * Presentation mode — web parity:
     * - 'bottomsheet' (default): the @gorhom/bottom-sheet overlay
     * - 'inline': the panel renders in place, bordered, always visible
     */
    mode?: 'bottomsheet' | 'inline';
    /** Header title override (web `title` attribute). Defaults to the localized view title. */
    title?: string;
    /** Header logo (web `logo-src` attribute). 22×22, radius 6. */
    logo?: ImageSourcePropType;
    /**
     * Themed in-app browser for plain http(s) handoffs — explorer links,
     * wallet install pages and the footer link open in a themed Chrome
     * Custom Tab / SFSafariViewController (modal pageSheet on iOS) instead
     * of bouncing the user out to the external browser. Wallet deep links
     * (custom schemes) always go through `Linking` — Custom Tabs only
     * handle web URLs. Optional: without it every URL opens via `Linking`
     * exactly as before.
     *
     * Build one with `createThemedBrowserSession({ reborn, expo }, { theme })`
     * — see browser/inapp-browser.ts for the preference chain and why
     * passkey-needing web wallets must use this surface instead of a WebView.
     */
    browser?: ThemedBrowserSession;
    /**
     * Bottom-sheet mode only (default true): when an operation the app
     * requested completes SUCCESSFULLY — a connect settles (deep-link
     * handoff included, SIWS run to its end) or the sign queue drains
     * cleanly — the sheet closes itself after a short confirmation flash
     * instead of parking on the account view until the user dismisses it.
     * Success is the only trigger: failures and rejections never auto-close
     * (web parity: the user reads the result and acts on it), inline panels
     * are exempt (no sheet to close), and reopening the modal for account
     * management never self-closes. See ui/auto-close.ts.
     */
    autoCloseOnComplete?: boolean;
    /**
     * Default true: once the user CONSENTS to a wallet-side request — taps
     * Sign/Approve in the app's preview modal (a SIWS prompt or a
     * "Try again" re-approval included) — and the WalletConnect request is
     * dispatched to the relay, the paired wallet app is opened
     * automatically (MWA-style: the user lands straight in the wallet's
     * pending prompt instead of tapping "Open in wallet app" by hand). The
     * wallet is NEVER opened before the consent: the trigger is the
     * connector's dispatch notification (fired after the preview gate and
     * after its pre-checks), not the sign queue, which starts counting the
     * moment the app calls signTransaction(). A request that settles
     * within the short settle window — a fast failure (dead session) or an
     * instant answer — cancels the handoff: there is nothing waiting in
     * the wallet to switch to. Only fires while the app is foregrounded
     * and only when a target is derivable: the wallet the user picked
     * during connect, or the wallet the restored session's peer metadata
     * points back to after a cold restart. The short settle delay lets the
     * request reach the relay before the app backgrounds; failures are
     * silent (the manual button on the signing view remains as the
     * fallback). Set false to keep the fully-manual handoff (the button
     * only).
     */
    autoOpenWalletOnSign?: boolean;
}
export declare function AppKitModal({ client, open, onClose, theme, mode, title, logo, browser, autoCloseOnComplete, autoOpenWalletOnSign, }: AppKitModalProps): React.JSX.Element | null;
//# sourceMappingURL=AppKitModal.d.ts.map