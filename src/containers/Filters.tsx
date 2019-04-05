import * as React from 'react';
import { connect } from 'react-redux';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  View,
  SafeAreaView
} from 'react-native';
import {
  Preview,
  CategorySelector,
  DesignSelector,
  NavBar,
  EffectsMenu,
  ColorSelector,
  SaveAnimation
} from '../component';

// import { Navigation } from 'react-native-navigation';
import {
  Action,
  BackgroundLayers,
  ForegroundLayers,
  Design,
  Category,
  Source
} from '../definition';

import { resetApp } from '../ducks/app';
import { setLottieColor } from '../ducks/source';
import { selectDesign } from '../ducks/design';

class Filters extends React.Component<Props, State> {
  public designRef: any = null;
  public previewRef: any = null;
  private animationTimeOut: any = null;

  public constructor(props: Props) {
    super(props);
    this.state = {
      showColorBox: false,
      showTutorial: null,
      saveStart: false,
      saveDone: false,
      selectedCtg: 0,
      designForPreview: null
    };
  }

  showColorSelector = (): void => {
    this.setState({ showColorBox: true });
  };

  onNextDesign = (): void => {
    this.designRef.nextDesign();
  };

  onPrevDesign = (): void => {
    this.designRef.prevDesign();
  };

  startSaveAnimation = (): void => {
    this.setState({ saveStart: true });
    this.previewRef.export(3000, () => {
      this.setState({
        saveStart: false,
        saveDone: true
      });
    });
    // this.animationTimeOut = setTimeout(() => {
    //   this.setState({ saveDone: true });
    // }, 3000);
  };

  onDoneSaveAnimation = (): void => {
    this.setState({ saveStart: false, saveDone: false });
    clearTimeout(this.animationTimeOut);
  };

  onPressRefine = (): void => {
    // TODO fix
    // Navigation.push(this.props.componentId, {
    //   component: {
    //     name: 'starify.Refine'
    //   }
    // });
  };

  public render(): JSX.Element {
    const { designForPreview, saveDone, saveStart, selectedCtg } = this.state;

    const {
      categories,
      design,
      designs,
      source,
      backgroundData,
      foregroundData
    } = this.props;

    const selectedDesign = this.props.design;
    const designName = selectedDesign === null ? '' : selectedDesign.title;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <NavBar
            iconLeft="chevron-left"
            iconRight="Save"
            title={designName}
            onPressLeft={async () => {
              // TODO fix navigation for gallery reset
              this.props.navigation.popToTop();
              this.props.resetApp();
            }}
            onPressRight={this.startSaveAnimation}
          />

          <View style={styles.wrapper}>
            <Preview
              ref={ref => (this.previewRef = ref)}
              sourceData={source}
              backgroundData={backgroundData}
              foregroundData={foregroundData}
              designOption
              onSwipeDown={this.onNextDesign}
              onSwipeUp={this.onPrevDesign}
              selectedDesign={design}
              onLongPress={this.onPressRefine}
              designForPreview={designForPreview}
            />

            {this.state.showColorBox === false && (
              <View style={styles.effectsBoxWrapper}>
                <EffectsMenu
                  silhouette={foregroundData.silhouette.enable}
                  outline={
                    foregroundData.outlines.one.enable ||
                    foregroundData.outlines.two.enable ||
                    foregroundData.outlines.three.enable
                  }
                  background={backgroundData.background.enable}
                  overlay={backgroundData.middleground.enable}
                  navigation={this.props.navigation}
                  color={source.lottieColor}
                  onColorPress={() => {
                    this.setState({ showColorBox: true });
                  }}
                />
              </View>
            )}
          </View>

          {this.state.showColorBox === false && (
            <View>
              <DesignSelector
                ref={ref => (this.designRef = ref)}
                handleSnap={snap => {
                  this.props.selectDesign(snap);
                }}
                designs={designs}
                categories={categories}
                selectedDesignID={selectedDesign ? selectedDesign.id : null}
                selectedCtgIndex={selectedCtg}
                onLongSelectDesign={design =>
                  this.setState({ designForPreview: design }, () => {
                    this.previewRef.playPreview();
                  })
                }
                onStopPreview={() => {
                  this.previewRef.onEndPreview();
                }}
              />

              <CategorySelector
                handleSnap={snap =>
                  this.setState({
                    selectedCtg: snap
                  })
                }
                categories={categories}
                snap={selectedCtg}
              />
            </View>
          )}

          {this.state.showColorBox === true && (
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch'
              }}
            >
              <View style={{ height: 60, backgroundColor: 'transparent' }} />
              <ColorSelector
                onDone={color => {
                  this.props.setLottieColor(color);
                  this.setState({ showColorBox: false });
                }}
                onColor={() => null}
                onClear={() => {
                  this.props.setLottieColor(null);
                  this.setState({ showColorBox: false });
                }}
                color={source.lottieColor ? source.lottieColor : '#00000000'}
              />
            </View>
          )}

          <SaveAnimation
            start={saveStart}
            done={saveDone}
            onDone={this.onDoneSaveAnimation}
          />
        </View>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state: any): ReduxProps {
  return {
    source: state.source,
    designs: state.designs,
    design: state.design,
    categories: state.categories,
    backgroundData: state.background,
    foregroundData: state.foreground
  };
}

export default connect<ReduxProps, DispatchProps, {}>(
  mapStateToProps,
  {
    setLottieColor,
    selectDesign,
    resetApp
  }
)(Filters);

interface ReduxProps extends React.Props<{}> {
  source: Source;
  design: Design;
  showTutorial?: boolean;
  categories: Category[];
  designs: Design[];
  backgroundData: BackgroundLayers;
  foregroundData: ForegroundLayers;
}

interface DispatchProps {
  setLottieColor(color: string): Action;
  selectDesign(design: Design): Action;
  resetApp(): Action;
}

interface NavProps {
  navigation: any;
}

type Props = ReduxProps & DispatchProps & NavProps;

interface State {
  showColorBox: boolean;
  showTutorial: boolean;
  saveStart: boolean;
  saveDone: boolean;
  selectedCtg: number;
  designForPreview: Design;
}

const windowSize: ScaledSize = Dimensions.get('window');

const styles: any = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  wrapper: {
    flex: 1
  },
  effectsBoxWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch'
  }
});
