import { useState } from 'react';
import { View } from 'react-native';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useAuth } from '../store/auth';

const SLIDES = [
  {
    icon: 'mic',
    title: 'Asisten Suara',
    desc: 'Bicara, JarvisKu mendengar. Semua lewat suara, tanpa mengetik.',
  },
  {
    icon: 'zap',
    title: 'Balas Otomatis',
    desc: 'Saat sibuk atau AFK, JarvisKu membalas pesan untukmu.',
  },
  {
    icon: 'moon',
    title: 'Selalu Ada',
    desc: 'Dark mode, cepat, dan siap dipakai sambil berjalan.',
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useAuth();
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <Screen>
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-24 h-24 rounded-3xl bg-primary/20 items-center justify-center mb-8">
          <Icon name={slide.icon} size={48} color="#4F46E5" />
        </View>
        <Text variant="title" className="text-center mb-3">{slide.title}</Text>
        <Text variant="body" color="secondary" className="text-center leading-6">{slide.desc}</Text>

        <View className="flex-row gap-2 mt-8 mb-10">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === index ? 'w-6 bg-primary' : 'w-2 bg-border'}`}
            />
          ))}
        </View>

        <View className="w-full gap-3">
          <Button
            title={last ? 'Mulai' : 'Lanjut'}
            onPress={() => (last ? completeOnboarding() : setIndex(index + 1))}
          />
          {!last ? (
            <Button title="Lewati" variant="ghost" onPress={() => completeOnboarding()} />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
