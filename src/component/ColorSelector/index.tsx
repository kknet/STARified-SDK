import * as React from 'react';
import {
  Animated,
  Dimensions,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  ImageBackground
} from 'react-native';
import Slider from 'react-native-slider';
import LinearGradient from 'react-native-linear-gradient';
import hexRgb from 'hex-rgb';

import { Palette, IColor } from '../../Palette';

export class ColorSelector extends React.PureComponent<Props, State> {
  private slider: any = null;
  private opSlider: any = null;
  private colorRef: any = null;

  public constructor(props: Props) {
    super(props);

    // color will be passe with alpha component, but we have "rgba" in palette with alpa set to 80
    const rgbColor = props.color
      ? (props.color.substr(0, 7) + '80').toUpperCase()
      : '';

    const stepOpacity = hexRgb(this.props.color).alpha * 255;
    this.state = {
      selectedColor: this.props.color,
      step: Palette.colorsAlpha.findIndex((item: IColor) => {
        return item.color === rgbColor;
      }),
      stepOpacity: stepOpacity,
      showColorBox: false
    };
    this.dismiss = this.dismiss.bind(this);
    this.hideComponent = this.hideComponent.bind(this);
    this.onClearColor = this.onClearColor.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onOpValueChange = this.onOpValueChange.bind(this);
    this.tapSliderHandler = this.tapSliderHandler.bind(this);
    this.tapOpacitySliderHandler = this.tapOpacitySliderHandler.bind(this);
  }

  rgba2hex(r, g, b, a): string {
    if (r > 255 || g > 255 || b > 255 || a > 255)
      throw 'Invalid color component';
    return (
      (256 + r).toString(16).substr(1) +
      (((1 << 24) + (g << 16)) | (b << 8) | a).toString(16).substr(1)
    );
  }
  tapSliderHandler(evt) {
    this.setState({ showColorBox: true });
    this.slider.measure((fx, fy, width, height, px, py) => {
      let step = Math.floor(evt.nativeEvent.locationX / 8);
      step =
        step > Palette.colors.length - 1 ? Palette.colors.length - 1 : step;
      step = step < 0 ? 0 : step;
      this.setState(
        {
          step,
          selectedColor: this.props.enableOpacity
            ? Palette.colorsAlpha[step].color
            : Palette.colors[step].color,
          stepOpacity: 128
        },
        () => {
          this.props.onColor(this.state.selectedColor);
        }
      );
    });
  }

  tapOpacitySliderHandler(evt) {
    this.setState({ showColorBox: true });
    this.opSlider.measure(
      (fx, fy, width, height, px, py) => {
        let step = Math.floor((evt.nativeEvent.locationX - px) / 8);
        step =
          step > Palette.colors.length - 1 ? Palette.colors.length - 1 : step;
        step = step < 0 ? 0 : step;
      },
      () => {
        this.props.onColor(this.state.selectedColor);
      }
    );
  }

  onOpValueChange(step: number) {
    let rgba = hexRgb(this.state.selectedColor);
    let color = this.rgba2hex(rgba.red, rgba.green, rgba.blue, step);
    this.setState({ selectedColor: '#' + color, stepOpacity: step });
  }
  onValueChange(step: number) {
    this.setState({
      step,
      selectedColor: this.props.enableOpacity
        ? Palette.colorsAlpha[step].color
        : Palette.colors[step].color,
      stepOpacity: 128
    });
  }
  onClearColor() {
    this.props.onClear();
    // this.setState({ selectedColor: 'transparent', step: -1 });
  }
  dismiss(): void {
    this.hideComponent();
    if (this.props.onColor) {
      this.props.onColor(this.state.selectedColor);
    }
    if (this.props.onDone) {
      this.props.onDone(this.state.selectedColor);
    }
  }
  hideComponent(): void {}
  componentDidMount(): void {}
  public render(): JSX.Element {
    const colorArry: IColor[] = Palette.colors;
    const { step, selectedColor, stepOpacity, showColorBox } = this.state;
    const thumbColor = step === -1 ? 'transparent' : Palette.colors[step].color;
    return (
      <View style={styles.container}>
        <View style={styles.containerPannel} pointerEvents="box-none">
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={this.onClearColor}
            >
              <Text style={styles.clearTxt}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={this.dismiss}>
              <Image source={require('../../../assets/icon_done.png')} />
            </TouchableOpacity>
          </View>
          <View
            pointerEvents="box-none"
            style={{
              height: 200,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {step !== -1 && showColorBox && (
              <Animated.View
                style={[
                  styles.colorBlock,
                  {
                    backgroundColor: selectedColor,
                    transform: [
                      {
                        translateX: step * 8
                      }
                    ]
                  }
                ]}
              />
            )}

            <View
              ref={ref => (this.slider = ref)}
              style={{ flexDirection: 'column' }}
            >
              <View style={styles.colorBar}>
                {colorArry.map((item: IColor, index: number) => {
                  return (
                    <View
                      key={`color_${index}`}
                      style={[
                        styles.colorBarItem,
                        { backgroundColor: item.color }
                      ]}
                    />
                  );
                })}

                <Animated.View
                  style={[
                    styles.colorOutline,
                    {
                      transform: [
                        {
                          translateX: (step - 2) * 8
                        }
                      ]
                    }
                  ]}
                />
                <Animated.View
                  style={[
                    styles.colorThumb,
                    {
                      backgroundColor: selectedColor,
                      transform: [
                        {
                          translateX: (step - 2) * 8
                        }
                      ]
                    }
                  ]}
                />
                {/* Color picker components not works*/}
                {/* <TouchableOpacity
                style={styles.colorPicker}
                onPress={this.pickColor}
              >
                {(pickColor && (
                  <Image
                    source={require('../../../assets/colorpicker_enable.png')}
                  />
                )) || (
                  <Image source={require('../../../assets/colorpicker.png')} />
                )}
              </TouchableOpacity> */}
              </View>

              <TouchableWithoutFeedback
                onPressIn={this.tapSliderHandler}
                onPressOut={() => this.setState({ showColorBox: false })}
              >
                <Slider
                  ref={ref => (this.colorRef = ref)}
                  style={{
                    width: 8 * colorArry.length,
                    position: 'absolute',
                    top: -4
                  }}
                  onSlidingStart={() => this.setState({ showColorBox: true })}
                  onSlidingComplete={() =>
                    this.setState({ showColorBox: false }, () => {
                      this.props.onColor(this.state.selectedColor);
                    })
                  }
                  animateTransitions
                  animationType={'spring'}
                  value={step}
                  minimumValue={0}
                  maximumValue={colorArry.length - 1}
                  step={1}
                  onValueChange={this.onValueChange}
                  minimumTrackTintColor={'transparent'}
                  maximumTrackTintColor={'transparent'}
                  thumbStyle={{ backgroundColor: 'transparent' }}
                  trackStyle={{ height: 24, width: 8 * (colorArry.length - 1) }}
                  thumbTouchSize={{ height: 38, width: 38 }}
                />
              </TouchableWithoutFeedback>
            </View>

            {this.props.enableOpacity && (
              <View
                ref={ref => (this.opSlider = ref)}
                style={{
                  flexDirection: 'column',
                  paddingTop: 20,
                  alignItems: 'center'
                }}
              >
                <ImageBackground
                  source={require('../../../assets/alpha-back.png')}
                  style={styles.opacityBar}
                  resizeMode={'contain'}
                >
                  <LinearGradient
                    colors={['transparent', thumbColor]}
                    style={styles.linearGradient}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ x: 1.0, y: 1.0 }}
                  >
                    <View
                      style={{ width: 8 * colorArry.length + 32, height: 26 }}
                    />
                  </LinearGradient>
                </ImageBackground>

                <TouchableWithoutFeedback
                  onPressIn={this.tapOpacitySliderHandler}
                  onPressOut={() => this.setState({ showColorBox: false })}
                >
                  <Slider
                    style={{
                      width: 8 * colorArry.length + 32,
                      position: 'absolute',
                      top: 13
                    }}
                    onSlidingStart={() => this.setState({ showColorBox: true })}
                    onSlidingComplete={() =>
                      this.setState({ showColorBox: false }, () => {
                        this.props.onColor(this.state.selectedColor);
                      })
                    }
                    animateTransitions
                    animationType={'spring'}
                    value={stepOpacity}
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    onValueChange={this.onOpValueChange}
                    minimumTrackTintColor={'transparent'}
                    maximumTrackTintColor={'transparent'}
                    thumbStyle={[
                      styles.colorOpThumb,
                      {
                        backgroundColor: this.state.selectedColor,
                        borderWidth: 1,
                        borderColor: thumbColor
                      }
                    ]}
                    trackStyle={{
                      height: 24,
                      width: 8 * (colorArry.length - 1)
                    }}
                    thumbTouchSize={{ height: 40, width: 50 }}
                  />
                </TouchableWithoutFeedback>
              </View>
            )}
          </View>

          <View style={{ flex: 1 }} />
        </View>
      </View>
    );
  }
}
interface Props {
  onColor: (color: string) => void;
  onDone: (color: string) => void;
  onClear: () => void;
  color: string;
  enableOpacity?: boolean;
}
interface State {
  selectedColor: string;
  step: number;
  stepOpacity: number;
  showColorBox: boolean;
}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  containerPannel: {
    flexDirection: 'column',
    width: windowSize.width,
    flex: 1,
    // height: windowSize.height - windowSize.width - 54,
    backgroundColor: Palette.bgColor,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 10
  },
  clearBtn: {
    position: 'absolute',
    top: 15,
    left: 15
  },
  doneBtn: {
    position: 'absolute',
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    right: 5
  },
  colorBar: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  opacityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center'
  },
  colorBarItem: {
    width: 8,
    height: 24
  },
  clearTxt: {
    ...Palette.textBold17,
    color: Palette.darkText
  },
  colorPicker: {
    paddingLeft: 5
  },
  colorBlock: {
    position: 'absolute',
    top: 20,
    left: 0,
    height: 38,
    width: 38,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2
  },
  colorOpThumb: {
    height: 34,
    width: 8,
    borderWidth: 2,
    borderRadius: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2
  },
  colorThumb: {
    position: 'absolute',
    top: 7,
    left: 11,
    height: 18,
    width: 18,
    borderRadius: 9
  },
  colorOutline: {
    position: 'absolute',
    top: -4,
    left: 0,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(192,192,192, 0.5)',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2
  }
});
