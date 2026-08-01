import TestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import Button from '../components/ui/Button';

describe('UI primitives', () => {
  it('renders Button with title', () => {
    const tree = TestRenderer.create(<Button title="Simpan" />);
    const texts = tree.root.findAll((n) => n.type === Text && n.props.children === 'Simpan');
    expect(texts.length).toBeGreaterThan(0);
  });

  it('marks Pressable disabled when Button disabled', () => {
    const onPress = jest.fn();
    const tree = TestRenderer.create(<Button title="Kirim" disabled onPress={onPress} />);
    const pressable = tree.root.find((n) => n.props.onPress === onPress);
    expect(pressable.props.disabled).toBe(true);
  });

  it('renders a Text node', () => {
    const tree = TestRenderer.create(<Text>Halo JarvisKu</Text>);
    const text = tree.root.find((n) => n.type === Text && n.props.children === 'Halo JarvisKu');
    expect(text).toBeTruthy();
  });
});
