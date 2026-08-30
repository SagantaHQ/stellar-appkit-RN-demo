/**
 * Small themed UI primitives for the demo chrome.
 *
 * Every component takes the currently selected `ConnectThemeRN` (the same
 * token object the modal uses), so the app background/cards/buttons restyle
 * together with the modal when you switch themes below.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { ConnectThemeRN } from '@saganta/stellar-appkit-react-native/ui';

export function shortAddress(address: string, edge = 6): string {
  if (address.length <= edge * 2 + 3) return address;
  return `${address.slice(0, edge)}…${address.slice(-edge)}`;
}

interface TextProps {
  theme: ConnectThemeRN;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  onPress?: () => void;
}

export function Title({ theme, children, style }: TextProps) {
  return <Text style={[{ color: theme.colorText, fontSize: 22, fontWeight: '700' }, style]}>{children}</Text>;
}

export function BodyText({ theme, children, style, numberOfLines }: TextProps) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ color: theme.colorText, fontSize: 15 }, style]}>
      {children}
    </Text>
  );
}

export function MutedText({ theme, children, style, numberOfLines, onPress }: TextProps) {
  return (
    <Text numberOfLines={numberOfLines} onPress={onPress} style={[{ color: theme.colorTextMuted, fontSize: 13 }, style]}>
      {children}
    </Text>
  );
}

export function MonoText({ theme, children, style, numberOfLines }: TextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      selectable
      style={[{ color: theme.colorText, fontSize: 12, fontFamily: 'monospace' }, style]}
    >
      {children}
    </Text>
  );
}

export function Card({
  theme,
  children,
  style,
}: {
  theme: ConnectThemeRN;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colorSurface,
          borderColor: theme.colorBorder,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: theme.radiusLg,
          padding: 16,
          gap: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Badge({
  theme,
  label,
  tone = 'accent',
}: {
  theme: ConnectThemeRN;
  label: string;
  tone?: 'accent' | 'muted' | 'danger';
}) {
  const palette =
    tone === 'danger'
      ? { bg: theme.colorDanger, fg: '#FFFFFF' }
      : tone === 'muted'
        ? { bg: theme.colorSurfaceHover, fg: theme.colorTextMuted }
        : { bg: theme.colorAccent, fg: theme.colorAccentText };
  return (
    <View style={{ backgroundColor: palette.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: palette.fg, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

type ButtonTone = 'primary' | 'secondary' | 'danger';

export function Button({
  theme,
  label,
  onPress,
  tone = 'primary',
  disabled,
  busy,
}: {
  theme: ConnectThemeRN;
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  busy?: boolean;
}) {
  const tones: Record<ButtonTone, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.colorAccent, fg: theme.colorAccentText, border: theme.colorAccent },
    secondary: {
      bg: theme.colorSurface,
      fg: theme.colorText,
      border: theme.colorBorder,
    },
    danger: { bg: 'transparent', fg: theme.colorDanger, border: theme.colorDanger },
  };
  const t = tones[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, busy }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed && tone === 'primary' ? t.border : t.bg,
          borderColor: t.border,
          borderWidth: tone === 'primary' ? 0 : StyleSheet.hairlineWidth,
          borderRadius: theme.radiusMd,
          paddingVertical: 13,
          paddingHorizontal: 16,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled || busy ? 0.55 : 1,
        },
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={t.fg} /> : null}
      <Text style={{ color: t.fg, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  theme,
  label,
  active,
  accent,
  onPress,
}: {
  theme: ConnectThemeRN;
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        backgroundColor: active ? theme.colorSurfaceHover : theme.colorSurface,
        borderColor: active ? accent : theme.colorBorder,
        borderWidth: StyleSheet.hairlineWidth * (active ? 2 : 1),
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent }} />
        <Text style={{ color: theme.colorText, fontSize: 13 }}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Banner({
  theme,
  children,
}: {
  theme: ConnectThemeRN;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.colorSurfaceHover,
        borderLeftWidth: 3,
        borderLeftColor: theme.colorAccent,
        borderRadius: theme.radiusSm,
        padding: 12,
        gap: 6,
      }}
    >
      {children}
    </View>
  );
}

/** Scrollable monospace block for signatures / XDR output. */
export function CodeBlock({
  theme,
  value,
}: {
  theme: ConnectThemeRN;
  value: string;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.colorBg,
        borderColor: theme.colorBorder,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: theme.radiusSm,
        padding: 10,
        maxHeight: 150,
      }}
    >
      <ScrollView nestedScrollEnabled>
        <MonoText theme={theme}>{value}</MonoText>
      </ScrollView>
    </View>
  );
}

export function Row({
  theme,
  label,
  value,
  danger,
}: {
  theme: ConnectThemeRN;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <MutedText theme={theme}>{label}</MutedText>
      <Text
        numberOfLines={1}
        ellipsizeMode="middle"
        style={{ color: danger ? theme.colorDanger : theme.colorText, fontSize: 13, flexShrink: 1, textAlign: 'right' }}
      >
        {value}
      </Text>
    </View>
  );
}

/** Themed label + single-line input (send-XLM recipient / amount fields). */
export function Field({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  mono,
  keyboardType,
}: {
  theme: ConnectThemeRN;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  mono?: boolean;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  return (
    <View style={{ gap: 6 }}>
      <MutedText theme={theme} style={{ fontWeight: '600' }}>
        {label}
      </MutedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colorTextMuted}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType={keyboardType ?? 'default'}
        style={{
          color: theme.colorText,
          fontSize: 14,
          fontFamily: mono ? 'monospace' : undefined,
          backgroundColor: theme.colorBg,
          borderColor: theme.colorBorder,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: theme.radiusSm,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />
    </View>
  );
}
