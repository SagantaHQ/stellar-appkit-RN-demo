/**
 * Clipboard access for React Native with zero extra dependencies.
 *
 * The web modal copies via `navigator.clipboard`; React Native has no
 * equivalent in core that isn't deprecated — but the deprecated one
 * (`Clipboard` from react-native core) is still present in every shipping
 * RN release and is the only dependency-free one-tap copy on the platform.
 *
 * `copyText()` therefore tries, in order:
 *
 *   1. core `Clipboard.setString` — one tap, no share-sheet detour;
 *   2. the share sheet (`Share.share`) — offers Copy on both platforms;
 *   3. nothing — never rejects; the text stays on screen either way.
 *
 * The core module is reached through an optional structural cast so this
 * compiles (and gracefully skips to the share sheet) even against future
 * RN type declarations that dropped the deprecated export.
 */
/** How the copy landed — callers can adapt their feedback. */
export type CopyOutcome = 'clipboard' | 'share' | 'failed';
/** Copies `text` — one-tap core clipboard, share-sheet fallback, never rejects. */
export declare function copyText(text: string): Promise<CopyOutcome>;
//# sourceMappingURL=clipboard.d.ts.map