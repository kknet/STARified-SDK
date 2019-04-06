import * as React from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  ScaledSize,
  StyleSheet,
  View,
  StatusBar,
  NativeModules,
  Modal,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Palette } from '../Palette';
import {
  SourceSelector,
  CategorySelector,
  Camera,
  DesignSelector,
  DesignPreview
} from '../component';
import { TakePictureResponse, RecordResponse } from 'react-native-camera';
// TODO navigation
// import { Navigation } from 'react-native-navigation';
import {
  Source as SourceState,
  Category,
  Design,
  SourceType
} from '../definition';
import { purgeTempFiles } from './../fs';
import { updateSource } from '../ducks/source';
import { getDesigns, validateLocalData } from '../ducks/designs';

// Manager for posting notifications to NSNotificationCenter
var NotificationManager = require('react-native').NativeModules
  .NotificationManager;

class Source extends React.Component<Props, State> {
  public sourceSelector: any = null;
  public videoRef: any = null;
  private haveFiles: boolean = true;
  public constructor(props: Props) {
    super(props);
    this.state = {
      sourceTypeIndex: 0,
      selectedCategoryIndex: null,
      showPreview: false,
      showSpinner: false,
      designForPreview: null
    };
    this.onSourceType = this.onSourceType.bind(this);
    this.onTakePicture = this.onTakePicture.bind(this);
    this.onTakeVideo = this.onTakeVideo.bind(this);
    this.onCancelGallery = this.onCancelGallery.bind(this);
    this.onStarifedClose = this.onStarifedClose.bind(this);
  }

  async onTakePicture(data: TakePictureResponse): Promise<void> {
    this.setState(
      {
        showSpinner: true
      },
      () => {
        this.segmentation(data);
      }
    );
  }

  onStarifedClose = () => {
    // Post NSNotification about Starified closing to native side.
    // You should always send second arg
    NotificationManager.postNotification('StarifiedClosingRequest', {});
  };

  segmentation(data: any): void {
    var Segmentation = NativeModules.MobileUnetSegmentation;
    Segmentation.processURL(
      data.uri,
      (_, outputUrl, outputMaskUrl, outputTransparentMaskUrl) => {
        this.props.updateSource({
          outputURL: outputUrl,
          outputMaskURL: outputMaskUrl,
          outputTransparentMaskURL: outputTransparentMaskUrl,
          picureData: data,
          sourceType: SourceType[this.state.sourceTypeIndex]
        });

        this.haveFiles = true;
        this.setState({ showSpinner: false }, () => {
          this.props.navigation.navigate('Refine');
          // TODO navigation
          // Navigation.push(this.props.componentId, {
          //   component: {
          //     name: "starify.Refine"
          //   }
          // });
        });
      }
    );
  }

  onTakeVideo(data: RecordResponse): void {
    console.error('not implemented');
  }

  async componentDidAppear() {
    if (this.sourceSelector) {
      this.sourceSelector.setSourceType(0);
    }
  }

  async onSourceType(sourceType: number): Promise<void> {
    if (this.haveFiles) {
      // we need to clenup working files before each new user picture pick, as they have predefined names
      // but this method will be called after gellery select also,
      // as it called in componentDidApper, and in this case we don't need to remove files
      await purgeTempFiles();
      this.haveFiles = false;
    }
    this.setState({ sourceTypeIndex: sourceType });
  }

  onCancelGallery(): void {
    this.sourceSelector.setSourceType(0);
  }

  public async componentDidMount(): Promise<void> {
    StatusBar.setHidden(true);

    // TODO navigation
    // Navigation.events().bindComponent(this);

    try {
      await this.props.validateLocalData();
    } catch (err) {
      Alert.alert('Design validating error', err);
    }

    try {
      await this.props.getDesigns();
    } catch (err) {
      Alert.alert('Server error', err.message);
    }
  }

  public componentDidUpdate(): void {
    if (
      this.state.selectedCategoryIndex === null &&
      this.props.categories &&
      this.props.categories.length > 0
    ) {
      this.setState({
        selectedCategoryIndex: 0
      });
    }
  }

  private previewDesign(design: Design): void {
    this.setState({
      showPreview: true,
      designForPreview: design
    });
  }

  public render(): JSX.Element {
    const { sourceTypeIndex, selectedCategoryIndex } = this.state;

    const { categories, designs } = this.props;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Palette.bgColor }}>
        <View style={styles.container}>
          <SourceSelector
            ref={ref => (this.sourceSelector = ref)}
            handleSnap={this.onSourceType}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={this.onStarifedClose}
          >
            <Text style={styles.closeButtonText}>
              Close
            </Text>
          </TouchableOpacity>

          <Camera
            sourceType={sourceTypeIndex}
            onTakePicture={this.onTakePicture}
            onTakeVideo={this.onTakeVideo}
            onCancelGallery={this.onCancelGallery}
          />

          {this.state.showPreview && (
            <View style={styles.previewContainer}>
              <DesignPreview
                design={this.state.designForPreview}
                videoRef={ref => {
                  this.videoRef = ref;
                }}
                onVideoEnd={() => {
                  this.setState({ showPreview: false });
                }}
              />
            </View>
          )}

          <View>
            <DesignSelector
              handleSnap={() => null}
              designs={designs}
              categories={categories}
              selectedCtgIndex={selectedCategoryIndex}
              onLongSelectDesign={design => {
                this.previewDesign(design);
              }}
              onStopPreview={() => {
                this.setState({ showPreview: false });
              }}
            />

            <CategorySelector
              handleSnap={snap =>
                this.setState({ selectedCategoryIndex: snap })
              }
              categories={categories}
              snap={selectedCategoryIndex}
            />
          </View>

          <Modal visible={this.state.showSpinner}>
            <View style={styles.spinner}>
              <View>
                <ActivityIndicator size="large" color="white" />
                <Text style={{ color: 'white' }}>Processing...</Text>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state: any): ReduxProps {
  return {
    source: state.source,
    categories: state.categories,
    designs: state.designs
    // sourceData: state.source.sourceData
  };
}

export default connect<ReduxProps, DispatchProps, {}>(
  mapStateToProps,
  {
    updateSource,
    validateLocalData,
    getDesigns
  }
)(Source);

interface ReduxProps extends React.Props<{}> {
  source: Source;
  designs: Design[];
  categories: Category[];
}

interface DispatchProps {
  validateLocalData(): void;
  updateSource(data: object): void;
  getDesigns(): void;
}

interface NavProps {
  componentId: string;
}

type Props = ReduxProps & DispatchProps & NavProps;

interface State {
  showSpinner: boolean;
  sourceTypeIndex: number;
  // sourceData: ISourceData;
  designForPreview: Design;
  selectedCategoryIndex: number;
  showPreview: boolean;
}

const windowSize: ScaledSize = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.bgColor
  },
  closeButton: {
    position: 'absolute',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 8,
    height: 44,
  },
  closeButtonText: {
    ...Palette.textMedium17,
    fontWeight: 'bold',
    color: Palette.colorBlack
  },
  previewContainer: {
    position: 'absolute',
    width: windowSize.width,
    height: windowSize.width,
    top: 44,
    left: 0
  },
  spinner: {
    alignItems: 'center',
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center'
  }
});
