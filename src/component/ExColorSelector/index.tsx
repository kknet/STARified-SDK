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
  TouchableHighlight,
  FlatList,
  ImageBackground
} from 'react-native';
import Carousel from '../../vendor/react-native-snap-carousel';
import Slider from 'react-native-slider';
import { Palette, IColor } from '../../Palette';
import { Background, BackgroundImageType } from '../../definition';
// TODO image crop picker
// import ImagePicker from 'react-native-image-crop-picker';
import { TakePictureResponse } from 'react-native-camera';

const stockArr = [
  require('../../../assets/stock/stock-1.jpg'),
  require('../../../assets/stock/stock-2.jpg'),
  require('../../../assets/stock/stock-3.jpg'),
  require('../../../assets/stock/stock-4.jpg'),
  require('../../../assets/stock/stock-5.jpg'),
  require('../../../assets/stock/stock-6.jpg'),
  require('../../../assets/stock/stock-7.jpg'),
  require('../../../assets/stock/stock-8.jpg'),
  require('../../../assets/stock/stock-9.jpg'),
  require('../../../assets/stock/stock-10.jpg'),
  require('../../../assets/stock/stock-11.jpg'),
  require('../../../assets/stock/solid-1.png'),
  require('../../../assets/stock/solid-2.png'),
  require('../../../assets/stock/solid-3.png'),
  require('../../../assets/stock/solid-4.png'),
  require('../../../assets/stock/solid-5.png')
];

export class ExColorSelector extends React.PureComponent<Props, State> {
  private slider: any = null;
  private carousel: any = null;

  public constructor(props: Props) {
    super(props);
    this.state = {
      data: this.props.data,
      step: Palette.colors.findIndex((item: IColor) => {
        return item.color === this.props.data.color;
      }),
      entries: [
        {
          name: 'Stock',
          screen: 'source.Stock',
          index: 0
        },
        {
          name: 'Solid',
          screen: 'source.solid',
          index: 1
        },
        {
          name: 'Library',
          screen: 'source.Library',
          index: 2
        }
      ],
      snapIdx: this.props.data.type,
      showColorBox: false,
      solidFade: new Animated.Value(this.props.data.type === 0 ? 1 : 0),
      stockFade: new Animated.Value(this.props.data.type === 1 ? 1 : 0)
    };
    this.dismiss = this.dismiss.bind(this);
    this.onClearColor = this.onClearColor.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.tapSliderHandler = this.tapSliderHandler.bind(this);
    this.onSnapItem = this.onSnapItem.bind(this);
    this.renderStockImage = this.renderStockImage.bind(this);
  }
  tapSliderHandler(evt) {
    this.setState({ showColorBox: true });
    this.slider.measure((fx, fy, width, height, px, py) => {
      let step = Math.floor((evt.nativeEvent.locationX - px - 16) / 8);
      step =
        step > Palette.colors.length - 1 ? Palette.colors.length - 1 : step;
      step = step < 0 ? 0 : step;

      let { data } = this.state;
      data.color = Palette.colors[step].color;

      this.setState({ step, data }, () => {
        this.props.onChangeData(data);
      });
    });
  }

  onValueChange(step: number) {
    let { data } = this.state;
    data.color = Palette.colors[step].color;
    this.setState({ step, data });
  }
  onClearColor() {
    this.props.onClear();
    // let { data } = this.state;
    // data.color = 'transparent';
    // data.stockID = -1;
    //
    // this.setState({ data, step: -1 });
  }
  dismiss(): void {
    this.props.onDone(this.state.data);
  }
  public onSelectCategory(index: number): any {
    this.carousel.snapToItem(index, true);
  }
  renderItem({ item, index }: any): JSX.Element {
    return (
      <TouchableWithoutFeedback onPressIn={() => this.onSelectCategory(index)}>
        <View key={`snap${index}`} style={styles.cell}>
          <Text style={styles.textTitle}>{item.name}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  onSnapItem(snapIdx: number): void {
    let { data } = this.state;
    data.type = snapIdx;
    this.setState({ data, snapIdx }, this.animateFade);

    if (snapIdx === 2) {
      // TODO img-crop picker
      // ImagePicker.openPicker({
      //   width: 200,
      //   height: 200,
      //   includeBase64: true,
      //   includeExif: true,
      //   cropping: true
      // })
      //   .then((image: any) => {
      //     const response: TakePictureResponse = {
      //       width: windowSize.width,
      //       height: windowSize.width,
      //       uri: `data:${image.mime};base64,` + image.data,
      //       base64: image.data
      //     };
      //     let { data } = this.state;
      //     data.pictureUri = response.uri;
      //     this.setState({ data }, () => {
      //       this.props.onChangeData(data);
      //     });
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     this.carousel.snapToItem(0, true);
      //   });
    }
  }
  animateFade() {
    Animated.timing(this.state.stockFade, {
      toValue: this.state.snapIdx === 1 ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
    Animated.timing(this.state.solidFade, {
      toValue: this.state.snapIdx === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }
  renderStockImage({ item, index }: any): JSX.Element {
    const stockID = this.state.data.stockID;
    return (
      <TouchableHighlight
        key={`snap${index}`}
        onPress={() => this.onSelectStock(index)}
      >
        <ImageBackground
          source={item}
          style={styles.stockImage}
          resizeMode={'contain'}
        >
          {index === stockID && (
            <Image
              source={require('../../../assets/icon_checked.png')}
              style={styles.selected}
            />
          )}
        </ImageBackground>
      </TouchableHighlight>
    );
  }
  onSelectStock(stockID: number): void {
    let { data } = this.state;
    data.stockID = stockID;
    data.picureData = stockArr[stockID];
    //data.pictureUri = stockArr[stockID]
    this.setState({ data }, () => {
      this.props.onChangeData(this.state.data);
    });
    this.forceUpdate();
  }

  public render(): JSX.Element {
    const colorArry: IColor[] = Palette.colors;
    const { step, data, showColorBox } = this.state;
    const thumbColor = step === -1 ? 'transparent' : Palette.colors[step].color;
    return (
      <View style={styles.container}>
        <View style={styles.containerPannel}>
          {/* Carousel, clear + done */}
          <TouchableOpacity style={styles.clearBtn} onPress={this.onClearColor}>
            <Text style={styles.clearTxt}>Clear</Text>
          </TouchableOpacity>
          <View style={{ height: 50 }}>
            <Carousel
              ref={carousel => (this.carousel = carousel)}
              firstItem={data.type}
              data={this.state.entries}
              renderItem={this.renderItem.bind(this)}
              sliderWidth={windowSize.width}
              itemWidth={80}
              inactiveSlideScale={0.9}
              slideStyle={styles.slideStyle}
              onSnapToItem={this.onSnapItem}
            />
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={this.dismiss}>
            <Image source={require('../../../assets/icon_done.png')} />
          </TouchableOpacity>

          <View
            style={{
              width: '100%',
              height: windowSize.height - windowSize.width - 105,
              paddingTop: 5
            }}
            ref={ref => (this.slider = ref)}
          >
            <Animated.View
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: this.state.snapIdx === 0 ? 0 : 999,
                opacity: this.state.stockFade,
                transform: [
                  {
                    scale: this.state.stockFade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1]
                    })
                  }
                ]
              }}
              key={'Solid'}
            >
              {step !== -1 && showColorBox && (
                <Animated.View
                  style={[
                    styles.colorBlock,
                    {
                      backgroundColor: data.color,
                      transform: [
                        {
                          translateX: step * 8
                        }
                      ]
                    }
                  ]}
                />
              )}

              <View>
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
                  {/* Color picking component not working */}
                  {/* <TouchableOpacity
                    style={styles.colorPicker}
                    onPress={this.pickColor}
                  >
                    {(pickColor && (
                      <Image
                        source={require('../../../assets/colorpicker_enable.png')}
                      />
                    )) || (
                      <Image
                        source={require('../../../assets/colorpicker.png')}
                      />
                    )}
                  </TouchableOpacity> */}
                </View>
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
                      backgroundColor: thumbColor,
                      transform: [
                        {
                          translateX: (step - 2) * 8
                        }
                      ]
                    }
                  ]}
                />
                <TouchableWithoutFeedback
                  onPressIn={this.tapSliderHandler}
                  onPressOut={() => this.setState({ showColorBox: false })}
                >
                  <Slider
                    style={{
                      width: 8 * colorArry.length,
                      position: 'absolute',
                      top: -4
                    }}
                    onSlidingStart={() => this.setState({ showColorBox: true })}
                    onSlidingComplete={() =>
                      this.setState({ showColorBox: false }, () => {
                        this.props.onChangeData(this.state.data);
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
                    trackStyle={{
                      height: 24,
                      width: 8 * (colorArry.length - 1)
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
            </Animated.View>

            <Animated.View
              style={{
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: this.state.snapIdx === 1 ? 0 : 999,
                opacity: this.state.solidFade,
                transform: [
                  {
                    scale: this.state.solidFade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1]
                    })
                  }
                ]
              }}
              key={'Stock'}
            >
              <FlatList
                data={stockArr}
                numColumns={4}
                renderItem={this.renderStockImage}
                keyExtractor={item => item}
                extraData={this.state}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }
}
interface Props {
  data: Background;
  onChangeData: (data: Background) => void;
  onDone: (data: Background) => void;
  onClear: () => void;
}
interface State {
  data: Background;
  step: number;
  entries: { name: string; screen: string; index: number }[];
  showColorBox: boolean;
  solidFade: Animated.Value;
  stockFade: Animated.Value;
  snapIdx: number;
}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  container: {
    flexDirection: 'column'
  },
  containerPannel: {
    flexDirection: 'column',
    width: windowSize.width,
    height: windowSize.height - windowSize.width - 54,
    backgroundColor: Palette.bgColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  clearBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  doneBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 65,
    height: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  colorBar: {
    flexDirection: 'row',
    alignItems: 'center'
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
    top: 10,
    left: 5,
    height: 38,
    width: 38,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
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
  },
  slideStyle: {
    backgroundColor: 'transparent',
    height: 50
  },
  cell: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stockImage: {
    width: windowSize.width * 0.25,
    height: windowSize.width * 0.25,
    justifyContent: 'center'
  },
  selected: {
    alignSelf: 'center'
  },
  textTitle: { ...Palette.textMedium20, color: Palette.darkColor }
});
