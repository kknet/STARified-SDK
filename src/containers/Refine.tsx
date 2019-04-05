import * as React from 'react';
import { connect } from 'react-redux';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  View,
  NativeModules,
  findNodeHandle,
  SafeAreaView
} from 'react-native';
import { NavBar } from '../component';
import { RefineView } from '../component';
// import { Navigation } from 'react-native-navigation';
import { Action, Source } from '../definition';

import {
  EraseCircle,
  BrushCircle,
  StrokeCircle,
  UndoCircle,
  DoneCircle
} from '../component';

const { RefineViewManager } = NativeModules;

const saveFunc = (handle, callback) => RefineViewManager.save(handle, callback);
const revertFunc = (handle, callback) =>
  RefineViewManager.revert(handle, callback);

import { updateSource as setSourceData } from '../ducks/source';
import { object } from 'prop-types';

class Refine extends React.Component<Props, State> {
  refineRef: any;
  public constructor(props: Props) {
    super(props);
    this.state = {
      isErasing: false,
      stroke: 8
    };
  }
  handleSave = () => {
    saveFunc(
      findNodeHandle(this.refineRef),
      (newFile, newMask, newTransparentMask, newFeathered) => {
        this.props.setSourceData({
          outputURL: newFile,
          outputBlended: newFeathered,
          outputMaskURL: newMask,
          outputTransparentMaskURL: newTransparentMask
        });

        this.props.navigation.navigate('Filters');

        // TODO fix navigation
        // Navigation.push(this.props.componentId, {
        //   component: {
        //     name: 'starify.Filters'
        //   }
        // });
      }
    );
  };
  handleRevert = () => {
    revertFunc(findNodeHandle(this.refineRef), () => null);
  };
  public render(): JSX.Element {
    const { sourceData } = this.props;
    const { isErasing, stroke } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <NavBar
            iconLeft={'close'}
            iconRight={''}
            title={'Refine Cutout'}
            onPressLeft={() => {
              // TODO fix
              // Navigation.pop(this.props.componentId);
              this.props.navigation.goBack();
            }}
            onPressRight={() => {}}
          />

          {sourceData.picureData && (
            <RefineView
              style={styles.refineView}
              background={sourceData.picureData.uri}
              strokeWidth={this.state.stroke}
              mask={sourceData.outputTransparentMaskURL}
              ref={ref => (this.refineRef = ref)}
              isErasing={isErasing}
            />
          )}

          <View style={styles.pannel}>
            <View
              style={{
                flex: 0.4,
                flexDirection: 'row',
                alignItems: 'flex-end'
              }}
            >
              <EraseCircle
                enable={isErasing}
                onChange={() => {
                  this.setState({ isErasing: true });
                }}
              />
              <BrushCircle
                enable={!isErasing}
                onChange={() => {
                  this.setState({ isErasing: false });
                }}
              />
              <View style={{ width: 89, alignItems: 'center' }}>
                <StrokeCircle
                  stroke={stroke}
                  onChange={value => {
                    this.setState({ stroke: value });
                  }}
                />
              </View>
              <View style={{ width: 89, alignItems: 'center' }}>
                <UndoCircle onChange={this.handleRevert} />
              </View>
            </View>
            <View style={{ flex: 0.6, justifyContent: 'center' }}>
              <DoneCircle onDone={this.handleSave} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

function mapStateToProps(state: any): ReduxProps {
  return {
    sourceData: state.source,
    showTutorial: state.source.showTutorial
  };
}

export default connect<ReduxProps, DispatchProps, {}>(
  mapStateToProps,
  {
    setSourceData
  }
)(Refine);

interface ReduxProps extends React.Props<{}> {
  sourceData: Source;
  showTutorial: boolean;
}

interface DispatchProps {
  setSourceData(sourceData: Source): Action;
}

interface NavProps {
  componentId: string;
}

type Props = ReduxProps & DispatchProps & NavProps;

interface State {
  isErasing: boolean;
  stroke: number;
}

const windowSize: ScaledSize = Dimensions.get('window');

const styles: any = StyleSheet.create<any>({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  refineView: {
    width: windowSize.width,
    height: windowSize.width
  },
  pannel: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
