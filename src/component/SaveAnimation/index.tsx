import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  View,
  Text,
  Animated,
  Image
} from 'react-native';
import { Palette } from '../../Palette';
export class SaveAnimation extends React.PureComponent<IProps, IState> {
  private containerRef: any = null;
  private clearTimeOut: any = null;
  public constructor(props: IProps) {
    super(props);
    this.state = {
      start: this.props.start,
      done: this.props.done,
      zoomIn: new Animated.Value(0),
      fadeIn: new Animated.Value(0),
      rotation: new Animated.Value(0),
      saveScale: new Animated.Value(0),
      saveTxtFade: new Animated.Value(0),
      saveFade: new Animated.Value(0)
    };
    this.resetAnimation = this.resetAnimation.bind(this);
  }

  public componentWillReceiveProps(newProps: IProps): void {
    if (newProps.start !== this.state.start) {
      this.setState({ start: newProps.start });
      if (newProps.start) {
        Animated.sequence([
          Animated.timing(this.state.zoomIn, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(this.state.fadeIn, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          })
        ]).start(() => {
          Animated.loop(
            Animated.timing(this.state.rotation, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            })
          ).start();
        });
      }
    }
    if (newProps.done !== this.state.done) {
      this.setState({ done: newProps.done });
      if (newProps.done) {
        this.state.rotation.stopAnimation();
        Animated.sequence([
          Animated.timing(this.state.fadeIn, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(this.state.zoomIn, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          })
        ]).start();
        this.clearTimeOut = setTimeout(() => {
          this.state.saveFade.setValue(1);
          Animated.sequence([
            Animated.timing(this.state.saveScale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true
            }),
            Animated.timing(this.state.saveTxtFade, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true
            })
          ]).start(() => {
            Animated.timing(this.state.saveFade, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true
            }).start(() => {
              //this.containerRef.setNativeProps({ zIndex: -999 });
              this.props.onDone();
              this.resetAnimation();
            });
          });
        }, 310);
      }
    }
  }
  public resetAnimation(): void {
    clearTimeout(this.clearTimeOut);
    this.state.zoomIn.setValue(0);
    this.state.fadeIn.setValue(0);
    this.state.rotation.setValue(0);
    this.state.saveScale.setValue(0);
    this.state.saveTxtFade.setValue(0);
    this.state.saveFade.setValue(0);
  }
  public componentDidMount(): void {}
  public render(): JSX.Element {
    const { start, done } = this.state;
    return (
      <View
        ref={ref => (this.containerRef = ref)}
        style={[
          styles.container,
          {
            zIndex: start ? 999 : -999
          }
        ]}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: windowSize.width / 2,
            alignSelf: 'center',
            width: 48,
            height: 48,
            borderRadius: 25,
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(36,36,36,0.4)',
            transform: [
              {
                rotate: this.state.rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              },
              {
                scale: this.state.zoomIn
              }
            ]
          }}
        >
          <Animated.Image
            style={[
              styles.progress,
              {
                opacity: this.state.fadeIn
              }
            ]}
            source={require('../../../assets/save_refresh.png')}
            resizeMode={'center'}
          />
        </Animated.View>
        <Animated.View
          style={{
            flexDirection: 'row',
            width: 120,
            height: 48,
            borderRadius: 100,
            justifyContent: 'center',
            backgroundColor: 'rgba(36,36,36,0.4)',
            position: 'absolute',
            top: windowSize.width / 2,
            alignSelf: 'center',
            alignContent: 'center',
            alignItems: 'center',
            transform: [
              {
                scaleX: this.state.saveScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1]
                })
              }
            ],
            opacity: this.state.saveFade
          }}
        >
          <Image
            source={require('../../../assets/icon_check.png')}
            style={{ height: 18, width: 25 }}
          />
          <Animated.View
            style={{
              opacity: this.state.saveTxtFade
            }}
          >
            <Text style={styles.saveTxt}>Saved</Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}
interface IProps {
  start: boolean;
  done: boolean;
  onDone: () => void;
}
interface IState {
  start: boolean;
  done: boolean;
  zoomIn: Animated.Value;
  fadeIn: Animated.Value;
  rotation: Animated.Value;
  saveScale: Animated.Value;
  saveTxtFade: Animated.Value;
  saveFade: Animated.Value;
}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: windowSize.width,
    height: windowSize.height,
    backgroundColor: Palette.bgColorTransparent,
    zIndex: -999
  },
  progress: {
    width: 30,
    height: 30
  },
  saveTxt: {
    ...Palette.textMedium20,
    color: Palette.whiteTextPrimary,
    paddingLeft: 5
  }
});
