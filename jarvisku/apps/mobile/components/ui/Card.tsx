import { View, ViewProps } from 'react-native';

/** Glassy dark card: subtle border + soft shadow. */
export default function Card({ className = '', style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      className={`bg-card rounded-3xl border border-border p-4 ${className}`}
      style={[
        { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
        style,
      ]}
    />
  );
}
