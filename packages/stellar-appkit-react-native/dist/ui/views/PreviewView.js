import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Animated, Image, Pressable, Text, View } from 'react-native';
import { t } from '@saganta/stellar-appkit';
import { useEntranceStagger } from '../animations.js';
import { CopyIcon, CheckIcon } from '../icons.js';
import { WalletIcon } from '../WalletIcon.js';
import { truncateAddress } from '../accountData.js';
/** Web riskFlagHtml: one bordered flag per risk, tinted by severity. */
function RiskFlagView({ styles, flag }) {
    const variant = flag.severity === 'danger' ? styles.riskDanger : flag.severity === 'warning' ? styles.riskWarning : styles.riskInfo;
    return (_jsx(View, { style: [styles.riskFlag, variant], children: _jsx(Text, { style: styles.riskFlagText, children: flag.message }) }));
}
export function PreviewView(props) {
    const { styles, theme, reducedMotion, preview, walletName, walletIcon, walletKey, appName, appLogo, onApprove, onReject, onCopyAddress, copied } = props;
    // Web: `preview.operations.length === 1 && operations[0]?.type === 'signMessage'`
    // decides the copy set — "Sign" for messages/SIWS, "Approve" for transactions.
    const isMessageSign = preview.operations.length === 1 && preview.operations[0]?.type === 'signMessage';
    const actionLabel = isMessageSign ? t('action.sign') : t('action.approve');
    const titleText = isMessageSign ? t('preview.title.sign_message') : t('preview.title.review_transaction');
    const subtitleText = isMessageSign
        ? t('preview.subtitle.sign_message', { walletName })
        : t('preview.subtitle.review_transaction', { walletName });
    // Web fee display: prefer the detailed XLM estimate, else stroops.
    const feeText = preview.feeEstimate
        ? `${preview.feeEstimate.totalFeeXlm} XLM`
        : `${preview.fee} stroops`;
    // Stagger: thumbs, title, subtitle, ops, meta, actions — web `.preview > *`
    // staggers every direct child 60ms apart (nth-child 1..7 delays).
    const entrance = useEntranceStagger(6, reducedMotion, { stepMs: 60, maxDelaySteps: 6 });
    const appThumb = appLogo ? (_jsx(Image, { source: appLogo, style: styles.previewThumbImg, resizeMode: "contain" })) : (_jsx(Text, { style: styles.previewThumbLetter, children: appName.charAt(0).toUpperCase() }));
    const walletThumb = walletIcon || walletKey ? (_jsx(WalletIcon, { source: walletIcon, walletKey: walletKey, fallbackLabel: walletName, size: 36, radius: 8 })) : (_jsx(Text, { style: styles.previewThumbLetter, children: walletName.charAt(0).toUpperCase() }));
    return (_jsxs(View, { style: styles.preview, children: [_jsx(AnimatedBlock, { entrance: entrance[0], children: _jsxs(View, { style: styles.previewThumbs, children: [_jsx(View, { style: styles.previewThumb, children: appThumb }), _jsx(View, { style: styles.previewThumbConnector }), _jsx(View, { style: styles.previewThumb, children: walletThumb })] }) }), _jsx(AnimatedBlock, { entrance: entrance[1], children: _jsx(Text, { style: styles.previewTitle, children: titleText }) }), _jsx(AnimatedBlock, { entrance: entrance[2], children: _jsx(Text, { style: styles.previewSubtitle, children: subtitleText }) }), preview.operations.length > 0 && (_jsx(AnimatedBlock, { entrance: entrance[3], stretch: true, children: _jsx(View, { style: styles.previewOps, children: preview.operations.map((op, i) => (_jsxs(View, { style: styles.previewOp, children: [_jsx(Text, { style: styles.previewOpSummary, children: op.summary }), op.riskFlags.map((flag, j) => (_jsx(RiskFlagView, { styles: styles, flag: flag }, j)))] }, i))) }) })), preview.riskFlags.length > 0 && (_jsx(AnimatedBlock, { entrance: entrance[3], stretch: true, children: _jsx(View, { style: styles.previewOps, children: _jsx(View, { style: styles.previewOp, children: preview.riskFlags.map((flag, j) => (_jsx(RiskFlagView, { styles: styles, flag: flag }, j))) }) }) })), _jsx(AnimatedBlock, { entrance: entrance[4], stretch: true, children: _jsxs(View, { style: styles.previewMeta, children: [_jsxs(Pressable, { style: ({ pressed }) => [styles.previewMetaItem, pressed && { opacity: 0.6 }], onPress: onCopyAddress, accessibilityRole: "button", accessibilityLabel: t('aria.copy_address'), hitSlop: 6, children: [_jsx(Text, { style: styles.previewMetaText, children: t('preview.from_account', { address: truncateAddress(preview.sourceAccount) }) }), copied ? (_jsx(CheckIcon, { color: theme.colorAccent, size: 14 })) : (_jsx(CopyIcon, { color: theme.colorTextMuted, size: 14 }))] }), _jsx(Text, { style: [styles.previewMetaText, styles.previewFee], children: feeText })] }) }), _jsx(AnimatedBlock, { entrance: entrance[5], stretch: true, children: _jsxs(View, { style: styles.previewActions, children: [_jsx(Pressable, { style: ({ pressed }) => [styles.previewBtnCancel, pressed && styles.previewBtnCancelPressed], onPress: onReject, accessibilityRole: "button", children: _jsx(Text, { style: styles.previewBtnCancelText, children: t('action.cancel') }) }), _jsx(Pressable, { style: ({ pressed }) => [styles.previewBtnApprove, pressed && styles.previewBtnApprovePressed], onPress: onApprove, accessibilityRole: "button", children: _jsx(Text, { style: styles.previewBtnApproveText, children: actionLabel }) })] }) })] }));
}
/** One staggered child — web `.preview > *` fade + slide; `stretch` opts the
 * block into `alignSelf: 'stretch'` (ops/meta/actions span the panel). */
function AnimatedBlock({ entrance, children, stretch, }) {
    return (_jsx(Animated.View, { style: [stretch && { alignSelf: 'stretch' }, { opacity: entrance.opacity, transform: [{ translateY: entrance.translateY }] }], children: children }));
}
//# sourceMappingURL=PreviewView.js.map