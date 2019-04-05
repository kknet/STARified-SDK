import * as React from 'react';
import { Dimensions, ScaledSize, StyleSheet, View, Image } from 'react-native';
export class ColorCircle extends React.PureComponent<IProps, IState> {
  public carousel: any;

  public constructor(props: IProps) {
    super(props);
    this.state = {
      color: this.props.color
    };
  }

  componentWillReceiveProps(newProps: IProps): void {
    if (newProps.color !== this.state.color) {
      this.setState({ color: newProps.color });
    }
  }
  public render(): JSX.Element {
    const { color } = this.state;
    return (
      <View style={styles.container}>
        <Image
          source={require('../../../assets/color_circle.png')}
          style={{ alignSelf: 'center' }}
        />
        <View
          style={[
            styles.color,
            { backgroundColor: color ? color : 'transparent' }
          ]}
        />
      </View>
    );
  }
}
interface IProps {
  color: string;
}
interface IState {
  color: string;
}
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center'
  },
  color: {
    height: 42,
    width: 42,
    borderRadius: 21,
    position: 'absolute',
    alignSelf: 'center'
  }
});
