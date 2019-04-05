import * as React from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  View,
  Text
} from 'react-native';
import { Palette } from '../../Palette';

export class EraseCircle extends React.PureComponent<IProps, IState> {
  private clearTimeOut: any = null;
  public constructor(props: IProps) {
    super(props);
    this.state = {
      enable: this.props.enable,
      fadeIn: new Animated.Value(0)
    };
    this.onValueChange = this.onValueChange.bind(this);
  }
  onValueChange(): void {
    var { enable } = this.state;
    if (!enable) {
      this.setState({ enable: !enable });
      this.props.onChange(!enable);
    }
  }
  componentWillReceiveProps(newProps: IProps): void {
    if (newProps.enable !== this.state.enable) {
      this.setState({ enable: newProps.enable });
      if (newProps.enable) {
        this.blinkIn();
      } else {
        this.blinkOut();
      }
    }
  }

  blinkIn(): void {
    Animated.timing(this.state.fadeIn, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    this.clearTimeOut = setTimeout(() => {
      this.blinkOut();
    }, 2000);
  }

  blinkOut(): void {
    Animated.timing(this.state.fadeIn, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();

    if (this.clearTimeOut) {
      clearTimeout(this.clearTimeOut);
    }
  }

  public render(): JSX.Element {
    const { enable } = this.state;
    return (
      <View>
        <Animated.View
          style={[
            styles.hintContainer,
            {
              opacity: this.state.fadeIn
            }
          ]}
        >
          <Text style={styles.textStyle}>Erase</Text>
        </Animated.View>
        <TouchableOpacity style={styles.container} onPress={this.onValueChange}>
          {(enable && (
            <Image
              source={require('../../../assets/icon_erase_active.png')}
              style={{ alignSelf: 'center' }}
            />
          )) || (
            <Image
              source={require('../../../assets/icon_erase.png')}
              style={{ alignSelf: 'center' }}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  }
}
interface IProps {
  enable: boolean;
  onChange: (enable: boolean) => void;
}
interface IState {
  enable: boolean;
  fadeIn: Animated.Value;
}
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10
  },
  hintContainer: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center'
  },
  textStyle: {
    ...Palette.textMedium17,
    color: 'black'
  }
});
