import * as React from 'react';
import {
  Alert,
  Dimensions,
  ScaledSize,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableWithoutFeedback,
  CameraRoll,
  NativeModules,
  findNodeHandle
} from 'react-native';

import { DesignPreview } from '../../component';

import Bluebird from 'bluebird';

import { OutlineStrokeDrawing } from '..';

import { Palette } from '../../Palette';
import {
  BackgroundLayers,
  ForegroundLayers,
  Design,
  Source
} from '../../definition';
import Modal from 'react-native-modal';
import Swiper from './../../vendor/Swiper';
import Animation from 'lottie-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { captureRef } from 'react-native-view-shot';
import hexRgb from 'hex-rgb';
import { getPathInDocuments } from './../../fs';

// Manager for posting notifications to NSNotificationCenter
var NotificationManager = require('react-native').NativeModules
  .NotificationManager;

export class Preview extends React.PureComponent<Props, State> {
  public animationRefs: any[];

  public rootRef: any;

  public player: any;

  public constructor(props: Props) {
    super(props);
    this.state = {
      animations: [],
      sourceData: this.props.sourceData, // 0 => Photo, 1 => Video
      designOption: this.props.designOption,
      selectedDesign: this.props.selectedDesign,
      showTutorial: false,
      showRealOutlineStrokeDrawing: this.props.showRealOutlineStrokeDrawing,
      replacedLayers: false,
      currentPreviewIdx: 1,
      showPreview: false,
      previewUrl: ''
    };
    this.renderPagination = this.renderPagination.bind(this);
    this.onSwipePreview = this.onSwipePreview.bind(this);
    this.onEndPreview = this.onEndPreview.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { props } = this;

    if (
      props.selectedDesign &&
      props.selectedDesign !== this.state.selectedDesign
    ) {
      this.loadDesignFiles();
    }

    if (!props.selectedDesign && this.state.selectedDesign) {
      this.setState({
        animations: [],
        selectedDesign: null,
        replacedLayers: false
      });
    }

    // user changes design color, let play it one more time
    if (
      props.sourceData.lottieColor &&
      props.selectedDesign &&
      props.sourceData.lottieColor !== prevProps.sourceData.lottieColor
    ) {
      if (this.state.animations.length > 0) {
        this.state.animations.forEach(a => this.prepareLottieLayers(a));
        this.setState(
          {
            animations: [...this.state.animations]
          },
          () => {
            this.playAnimation(this.state.currentPreviewIdx - 1);
          }
        );
      }
    }
  }

  componentDidMount() {
    this.playAnimation(0);
  }

  loadDesignFiles() {
    const design = this.props.selectedDesign;
    const files = design.files.sort((a, b) => {
      if (a.file > b.file) {
        return 1;
      }
      if (a.file < b.file) {
        return -1;
      }
      // a должно быть равным b
      return 0;
    });
    Bluebird.map(files, file => {
      return RNFetchBlob.fs.readFile(getPathInDocuments(file.localPath));
    }).then(files => {
      const animations = files.map(f => JSON.parse(f));
      animations.forEach(a => this.prepareLottieLayers(a));
      this.setState({ animations, selectedDesign: design }, () => {
        this.playAnimation(0);
      });
    });
  }

  playAnimation(index: number) {
    if (!this.animationRefs || !this.animationRefs[index]) {
      return;
    }
    // TODO remove this
    // this.setLottieColor(index);
    this.animationRefs[index].play();
  }

  setLottieColor(index) {
    if (this.props.sourceData.lottieColor) {
      const color = this.props.sourceData.lottieColor;
      const colors = hexRgb(color);
      // keep /255 - it's required by ios API
      this.animationRefs[index].replaceColor(
        colors.red / 255.0,
        colors.green / 255.0,
        colors.blue / 255.0
      );
    }
  }

  // this method called on instance "ref" on show preview
  // probably should be extracted to separate component
  playPreview() {
    this.setState({ showPreview: true });
  }

  async export(interval: number, onEnd: () => void) {
    const exportImage =
      !this.props.selectedDesign ||
      this.props.selectedDesign.config.animated[
        this.state.currentPreviewIdx - 1
      ] === false;

    if (exportImage) {
      try {
        const uri = await captureRef(this.rootRef, {
          format: 'jpg',
          quality: 0.8
        });
        await CameraRoll.saveToCameraRoll(uri);
        Alert.alert('Success', 'Image exported to camera roll');

        // Post NSNotification with image URI to NSNotificationCenter (handle it on native Swift side)
        // You should always send second arg
        NotificationManager.postNotification('StarifiedImageRendered', { uri });
      } catch (err) {
        Alert.alert('Error', err);
      } finally {
        onEnd();
      }
    } else {
      const root = findNodeHandle(this.rootRef);
      const LottieManager = NativeModules.LottieManager;

      try {
        let lottieRef = null;

        if (this.props.selectedDesign) {
          lottieRef = this.animationRefs[
            this.state.currentPreviewIdx - 1
          ].getHandle();
        }
        let repeats = 1;

        if (this.props.selectedDesign && this.props.selectedDesign.config) {
          repeats = Number.parseFloat(this.props.selectedDesign.config.repeat);
        }

        await LottieManager.exportVideo(root,
          lottieRef,
          repeats ? repeats : 1,
        )
          .then((renderedVideoURL: string) => {
            if (renderedVideoURL) {
              // Post NSNotification with video URI to NSNotificationCenter (handle it on native Swift side)
              // You should always send second arg
              NotificationManager.postNotification('StarifiedVideoRendered', { uri: renderedVideoURL });
            }
          });

        Alert.alert('Success', 'Video exported to documents folder');
      } catch (error) {
        Alert.alert('Error', 'Error while exporting');
      } finally {
        onEnd();
      }
    }
  }

  renderPagination(index: number): JSX.Element {
    const { designOption, selectedDesign } = this.state;
    const totalDesigns = selectedDesign.files.length;
    let barWidth = windowSize.width * 0.32;
    if (totalDesigns > 3) {
      barWidth = windowSize.width * (0.95 / totalDesigns);
    } else if (totalDesigns <= 1) {
      return null;
    }
    windowSize.width * 0.32;
    if (designOption && selectedDesign !== null)
      return (
        <View style={styles.designOptionBar}>
          {selectedDesign.files.map((f, i) => (
            <View
              key={i}
              style={[
                index === i ? styles.designOptionSelected : styles.designOption,
                { width: barWidth }
              ]}
            />
          ))}
        </View>
      );
    else return <View />;
  }

  async addReplacedConent(lottieRef: Object) {
    const { sourceData } = this.props;
    const { selectedDesign } = this.props;
    if (!lottieRef) {
      return;
    }
    if (selectedDesign && selectedDesign.config['lottie-replace-layers']) {
      Object.keys(selectedDesign.config['lottie-replace-layers']).forEach(
        async key => {
          const LottieManager = NativeModules.LottieManager;
          const layers = selectedDesign.config['lottie-replace-layers'][key];

          let lottieRef = null;

          if (this.props.selectedDesign) {
            lottieRef = this.animationRefs[
              this.state.currentPreviewIdx - 1
            ].getHandle();
          }
          await LottieManager.replaceLayers(
            lottieRef,
            sourceData.outputBlended,
            layers
          );

          this.setState({ replacedLayers: true });
        }
      );
    } else {
      this.setState({ replacedLayers: false });
    }
  }

  prepareLottieLayers(animation: any) {
    const { sourceData } = this.props;
    const { selectedDesign } = this.props;

    // if the have body replacement enabled, we need to do two things:
    // 1. Remove content in layers from config
    // 2. Add new content instead
    // To remove old one we preprocess JSON object, for bodymovin file format
    // check https://github.com/airbnb/lottie-web/tree/master/docs/json
    if (selectedDesign && selectedDesign.config['lottie-replace-layers']) {
      Object.keys(selectedDesign.config['lottie-replace-layers']).forEach(
        key => {
          const replaceList =
            selectedDesign.config['lottie-replace-layers'][key];

          const layers = animation.layers.filter(
            l => replaceList.indexOf(l.nm) >= 0
          );

          layers.forEach(l => {
            l.shapes = [];
          });
        }
      );
    }

    if (this.props.sourceData.lottieColor) {
      const color = this.props.sourceData.lottieColor;
      const colors = hexRgb(color);
      const colorsArray = [
        colors.red / 255.0,
        colors.green / 255.0,
        colors.blue / 255.0
      ];
      this.replaceColor(animation, colorsArray);
    }
    return animation;
  }

  replaceColor(o: any, color: any[]) {
    // c is color property
    // k is value
    if (o.c) {
      const colorObj = o.c;
      if (
        typeof colorObj === 'object' &&
        colorObj.k &&
        colorObj.k.length === 4
      ) {
        // color can be different kind of properties
        // we replace only explicit rgba values
        colorObj.k = [...color, 1];
      }
    }

    for (let i in o) {
      if (o.hasOwnProperty(i)) {
        if (typeof o[i] === 'object') {
          this.replaceColor(o[i], color);
        }
      }
    }
  }

  renderAnimations() {
    const {
      // sourceData,
      showRealOutlineStrokeDrawing
    } = this.state;

    const { backgroundData, foregroundData, sourceData } = this.props;

    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 40
    };

    this.animationRefs = [];
    return this.state.animations.map((animation, index) => {
      return (
        <TouchableWithoutFeedback
          key={index}
          style={{ width: '100%', height: '100%' }}
          onLongPress={this.props.onLongPress}
        >
          <View
            onSwipe={this.onSwipe}
            config={config}
            style={styles.backgroundGesture}
          >
            {this.generateBackground(sourceData, backgroundData)}

            {this.generateMiddleground(sourceData, backgroundData)}

            {this.generateForeground(
              sourceData,
              backgroundData,
              foregroundData
            )}

            {this.generateStrokeDrawing(
              sourceData,
              foregroundData,
              showRealOutlineStrokeDrawing
            )}

            {!this.state.replacedLayers && (
              <Image
                source={{ uri: sourceData.picureData.uri }}
                style={styles.preview}
              />
            )}
            <TouchableWithoutFeedback onLongPress={this.props.onLongPress}>
              <Animation
                loop={true}
                ref={animationRef => {
                  this.animationRefs[index] = animationRef;
                  this.addReplacedConent(animationRef);
                }}
                style={styles.backgroundLottie}
                source={animation}
              />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      );
    });
  }

  onSwipePreview(index: number): void {
    this.setState({ currentPreviewIdx: index + 1 });
    this.playAnimation(index);
  }

  onEndPreview(): void {
    this.setState({ showPreview: false });
  }

  generateBackground(
    sourceData: Source,
    backgroundData: BackgroundLayers
  ): JSX.Element {
    if (this.state.replacedLayers) {
      return null;
    }

    if (backgroundData.background.enable) {
      if (backgroundData.background.type == 1) {
        return (
          <Image
            source={{ uri: sourceData.picureData.uri }}
            style={[
              styles.previewBG,
              { tintColor: backgroundData.background.color }
            ]}
          />
        );
      } else if (backgroundData.background.type == 0) {
        return (
          <Image
            source={backgroundData.background.picureData}
            style={styles.previewBG}
          />
        );
      } else if (backgroundData.background.type === 2) {
        return (
          <Image
            source={{ uri: backgroundData.background.pictureUri }}
            style={styles.previewBG}
          />
        );
      }
    }

    return (
      <Image
        source={{ uri: sourceData.picureData.uri }}
        style={styles.previewBG}
      />
    );
  }

  generateMiddleground(
    sourceData: Source,
    backgroundData: BackgroundLayers
  ): JSX.Element {
    if (this.state.replacedLayers) {
      return null;
    }

    if (backgroundData.middleground.enable) {
      return (
        <Image
          source={{ uri: sourceData.picureData.uri }}
          style={[
            styles.previewMG,
            { tintColor: backgroundData.middleground.color }
          ]}
        />
      );
    }
  }

  generateForeground(
    sourceData: Source,
    backgroundData: BackgroundLayers,
    foregroundData: ForegroundLayers
  ): JSX.Element {
    if (this.state.replacedLayers) {
      return null;
    }

    const mainImageUrl = backgroundData.background.enable
      ? sourceData.outputBlended
      : sourceData.outputURL;

    if (foregroundData.silhouette.enable) {
      return (
        <View style={styles.previewFG}>
          <Image source={{ uri: mainImageUrl }} style={[styles.previewFG]} />
          <Image
            source={{ uri: mainImageUrl }}
            style={[
              styles.previewFG,
              { tintColor: foregroundData.silhouette.color }
            ]}
          />
        </View>
      );
    }
    return <Image source={{ uri: mainImageUrl }} style={[styles.previewFG]} />;
  }

  generateStrokeDrawing(
    sourceData: Source,
    foregroundData: ForegroundLayers,
    showRealOutlineStrokeDrawing: boolean
  ): JSX.Element {
    // was if(showRealOutlineStrokeDrawing)

    if (this.state.replacedLayers) {
      return null;
    }

    const showOutines =
      foregroundData.outlines.one.enable ||
      foregroundData.outlines.two.enable ||
      foregroundData.outlines.three.enable;

    const outlinesParams = {
      innerOffset: 15.0,
      outerShift: 10.0,
      offsetChangeFactor: 0.1,
      widthChangeFactor: 0.1,
      updateFrequency: 30
    };

    if (showOutines) {
      // configurable parameters

      var layers = [];

      if (foregroundData.outlines.three.enable) {
        let color3Width = foregroundData.outlines.three.stroke;
        let variance = 2;

        layers.push({
          color: foregroundData.outlines.three.color,
          randomnessLevel: 0.01,
          minWidth: color3Width - variance,
          maxWidth: color3Width + variance,
          ...outlinesParams
        });
      }

      if (foregroundData.outlines.two.enable) {
        let color2Width = foregroundData.outlines.two.stroke;
        let variance = 4;
        layers.push({
          color: foregroundData.outlines.two.color,
          randomnessLevel: 0.01,
          minWidth: color2Width + 5 - variance,
          maxWidth: color2Width + 5 + variance,
          ...outlinesParams
        });
      }

      if (foregroundData.outlines.one.enable) {
        let color1Width = foregroundData.outlines.one.stroke;
        let variance = 4;
        layers.push({
          color: foregroundData.outlines.one.color,
          randomnessLevel: 0.01,
          minWidth: color1Width + 10 - variance,
          maxWidth: color1Width + 10 + variance,
          ...outlinesParams
        });
      }
      if (layers.length != 0) {
        return (
          <OutlineStrokeDrawing
            imageName={sourceData.outputMaskURL}
            style={styles.outlineStrokeDrawing}
            layers={layers}
          />
        );
      }
    }
  }

  public render(): JSX.Element {
    const {
      showRealOutlineStrokeDrawing,
      showTutorial,
      showPreview
    } = this.state;

    const { sourceData, foregroundData, backgroundData } = this.props;

    const { designForPreview } = this.props;

    return (
      <View
        style={styles.container}
        ref={ref => {
          this.rootRef = ref;
        }}
      >
        <Modal
          style={{ position: 'absolute', top: windowSize.height / 2 - 175 }}
          isVisible={showTutorial}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}
          useNativeDriver
          scrollTo={() => {}}
          scrollOffset={0}
          backdropColor="transparent"
          onBackdropPress={() => this.setState({ showTutorial: false })}
        >
          <TouchableWithoutFeedback
            onPressIn={() => this.setState({ showTutorial: false })}
          >
            <View style={styles.tutorial}>
              <Text style={styles.textTutorial}>
                Swipe up / down: change design{'\n'}Swipe left / right: design
                options
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {showPreview && (
          <DesignPreview
            design={designForPreview}
            videoRef={ref => {
              this.player = ref;
            }}
            onVideoEnd={() => {
              this.setState({ showPreview: false });
            }}
          />
        )}

        {/* When using Preview in background and foregorund screens */}
        {this.state.animations.length === 0 && (
          <TouchableWithoutFeedback
            style={{ width: '100%', height: '100%' }}
            onLongPress={this.props.onLongPress}
          >
            <View style={{ flex: 1 }}>
              {this.generateBackground(sourceData, backgroundData)}
              {this.generateMiddleground(sourceData, backgroundData)}
              {this.generateForeground(
                sourceData,
                backgroundData,
                foregroundData
              )}
              {this.generateStrokeDrawing(
                sourceData,
                foregroundData,
                showRealOutlineStrokeDrawing
              )}
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Main screen - when user selectc design  */}
        {this.state.animations.length > 0 && (
          <Swiper
            renderPagination={this.renderPagination}
            loop={false}
            horizontal
            index={0}
            scrollEnabled
            onIndexChanged={this.onSwipePreview}
          >
            {this.renderAnimations()}
          </Swiper>
        )}
      </View>
    );
  }
}

interface Props {
  sourceData: Source;
  backgroundData: BackgroundLayers;
  foregroundData: ForegroundLayers;
  designForPreview?: Design;
  designOption: boolean;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  selectedDesign?: Design;
  onLongPress?: () => void;
  showRealOutlineStrokeDrawing?: boolean;
}

interface State {
  animations: any[]; // this is array of lottie view refs
  sourceData: Source;
  designOption: boolean;
  selectedDesign: Design;
  showTutorial: boolean;
  replacedLayers: boolean; // don't show main immage for designs with replaced layers
  currentPreviewIdx: number;
  showPreview: boolean;
  previewUrl: string;
  showRealOutlineStrokeDrawing: boolean;
}

const windowSize: ScaledSize = Dimensions.get('window');
const styles: any = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: windowSize.width,
    height: windowSize.width,
    backgroundColor: Palette.bgColor
  },
  preview: {
    flex: 1,
    alignSelf: 'flex-start',
    width: windowSize.width,
    height: windowSize.width
  },

  previewBG: {
    width: windowSize.width,
    height: windowSize.width,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1
  },

  previewMG: {
    width: windowSize.width,
    height: windowSize.width,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2
  },

  previewFG: {
    width: windowSize.width,
    height: windowSize.width,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 4
  },

  outlineStrokeDrawing: {
    width: windowSize.width,
    height: windowSize.width,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5
  },

  designOptionBar: {
    position: 'absolute',
    bottom: -9,
    left: 0,
    flexDirection: 'row',
    width: windowSize.width,
    justifyContent: 'space-around',
    height: 6
  },
  designOption: {
    width: windowSize.width * 0.32,
    height: 3,
    backgroundColor: Palette.colorGray
  },
  designOptionSelected: {
    width: windowSize.width * 0.32,
    height: 3,
    backgroundColor: Palette.colorLightBlack
  },
  tutorial: {
    width: 331,
    height: 75,
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: 'rgba(36,36,36,0.8)'
  },
  textTutorial: {
    ...Palette.textMedium17,
    color: Palette.bgColor,
    textAlign: 'center'
  },
  backgroundGesture: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999
  },
  backgroundLottie: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3
  }
});
