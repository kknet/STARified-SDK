import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ImagePickerIOS
} from 'react-native';
// TODO img-cropper
// import ImagePicker from 'react-native-image-crop-picker';
import {
  RNCamera,
  CameraType,
  FlashMode,
  TakePictureResponse,
  RecordResponse
} from 'react-native-camera';

import { getPathInDocuments, copyToDocuments } from '../../fs';

import { Palette } from '../../Palette';

export class Camera extends React.PureComponent<IProps, IState> {
  public camera: any;

  public constructor(props: IProps) {
    super(props);

    this.state = {
      type: RNCamera.Constants.Type.back,
      flashMode: RNCamera.Constants.FlashMode.off,
      sourceType: this.props.sourceType, // 0 => Photo, 1 => Video, 2 => Gallery
      recordOn: false
    };
    this.handleCameraType = this.handleCameraType.bind(this);
    this.handleCameraFlash = this.handleCameraFlash.bind(this);
    this.takePicture = this.takePicture.bind(this);
  }

  componentWillReceiveProps(newProps: IProps) {
    if (newProps.sourceType !== this.state.sourceType) {
      this.setState({ sourceType: newProps.sourceType });

      if (newProps.sourceType === 1) {
        this.openImagePicker();
      }
    }
  }

  openImagePicker(): void {
    // TODO fix camera picker
    ImagePickerIOS.openSelectDialog(
      {},
      async imageUri => {
        await copyToDocuments(imageUri, 'input_img.png');
        const newPath = getPathInDocuments('input_img.png');
        let result: TakePictureResponse = {
          width: 1080,
          height: 1080,
          uri: newPath
          // base64: `data:${image.mime};base64,` + image.data
        };
        this.props.onTakePicture(result);

        console.log('debug componentWillReceiveProps newPath', newPath);
      },
      () => null
    );
  }
  handleCameraType(): void {
    let { type } = this.state;
    type =
      type === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back;
    this.setState({ type });
  }
  handleCameraFlash(): void {
    let { flashMode } = this.state;
    flashMode =
      flashMode === RNCamera.Constants.FlashMode.off
        ? RNCamera.Constants.FlashMode.on
        : RNCamera.Constants.FlashMode.off;
    this.setState({ flashMode });
  }
  populateCameraBtn(): JSX.Element {
    const { sourceType, recordOn } = this.state;
    return (
      <TouchableOpacity style={styles.cameraBtn} onPress={this.takePicture}>
        {(sourceType === 0 && (
          <Image source={require('../../../assets/Shot.png')} />
        )) ||
          ((recordOn === false && (
            <Image source={require('../../../assets/Record.png')} />
          )) || <Image source={require('../../../assets/Record-off.png')} />)}
      </TouchableOpacity>
    );
  }
  async takePicture() {
    const { sourceType } = this.state;
    if (this.camera) {
      if (sourceType === 0) {
        const options = { quality: 1, base64: true, width: 1080 };
        const data: TakePictureResponse = await this.camera.takePictureAsync(
          options
        );
        await copyToDocuments(data.uri, 'input_img.png');
        const newPath = getPathInDocuments('input_img.png');
        let result: TakePictureResponse = {
          width: 1080,
          height: 1080,
          uri: newPath
          // base64: `data:${image.mime};base64,` + image.data
        };
        this.props.onTakePicture(result);
      } else if (sourceType === 1) {
        // let { recordOn } = this.state;
        // if (recordOn === false) {
        // } else {
        // }
        // recordOn = !recordOn;
        // this.setState({ recordOn });
      }
    }
  }

  public render(): JSX.Element {
    const { sourceType } = this.state;
    const popCamButton = this.populateCameraBtn();
    return (
      <View style={styles.container}>
        <View>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={this.state.type}
            flashMode={this.state.flashMode}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={
              'We need your permission to use your camera phone'
            }
          />
          <TouchableOpacity
            style={styles.reverseBtn}
            onPress={this.handleCameraType}
          >
            <Image source={require('../../../assets/camera-reverse.png')} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flashBtn}
            onPress={this.handleCameraFlash}
          >
            <Image source={require('../../../assets/camera-flash.png')} />
          </TouchableOpacity>
        </View>
        {sourceType < 1 && (
          <View style={styles.cameraControl}>{popCamButton}</View>
        )}
      </View>
    );
  }
}
interface IProps {
  sourceType: number;
  onTakePicture: (data: TakePictureResponse) => void;
  onTakeVideo: (data: RecordResponse) => void;
  onCancelGallery: () => void;
}
interface IState {
  type: keyof CameraType;
  flashMode: keyof FlashMode;
  sourceType: number;
  recordOn: boolean;
}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: Palette.bgColor
  },
  preview: {
    alignSelf: 'flex-start',
    width: windowSize.width,
    height: windowSize.width
  },
  cameraControl: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  cameraBtn: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  reverseBtn: {
    position: 'absolute',
    bottom: 15,
    left: 10
  },
  flashBtn: {
    position: 'absolute',
    bottom: 15,
    right: 10
  }
});
