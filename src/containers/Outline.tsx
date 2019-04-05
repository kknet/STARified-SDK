import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Preview, NavBar, ColorSelector } from '../component';
import { OutlineSelector } from '../component/OutlineSelector';
import { updateForegroundLayers } from '../ducks/foreground';
import _ from 'lodash';
import {
  Action,
  Source,
  BackgroundLayers,
  ForegroundLayers,
  Outline as OutlineType
} from '../definition';

type Props = {
  navigation: any;
  source: Source;
  backgroundLayers: BackgroundLayers;
  foregroundLayers: ForegroundLayers;
  updateForegroundLayers: (ForegroundLayers) => Action;
};

type State = {
  one: OutlineType;
  two: OutlineType;
  three: OutlineType;
  activeOutline: string;
  inColorPickerMode: boolean;
};

const DEFAULT_COLOR = '#E572A4';

class Outline extends Component<Props, State> {
  constructor(props) {
    super(props);

    let state = {
      inColorPickerMode: false,
      activeOutline: null,
      one: { ...props.foregroundLayers.outlines.one },
      two: { ...props.foregroundLayers.outlines.two },
      three: { ...props.foregroundLayers.outlines.three }
    };

    // enable default outline
    if (!state.one.enable && !state.two.enable && !state.three.enable) {
      state.one = {
        enable: true,
        color: DEFAULT_COLOR,
        stroke: 8
      };
    }

    this.state = state;
  }

  done = () => {
    this.props.updateForegroundLayers({
      silhouette: this.props.foregroundLayers.silhouette,
      outlines: {
        one: this.state.one,
        two: this.state.two,
        three: this.state.three
      }
    });
    this.props.navigation.goBack();
  };

  render() {
    const { source, backgroundLayers, foregroundLayers } = this.props;
    const { one, two, three, activeOutline } = this.state;

    const preview = {
      silhouette: foregroundLayers.silhouette,
      outlines: {
        one,
        two,
        three
      }
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <NavBar
            iconLeft="close"
            iconRight=""
            title="Outlines"
            onPressLeft={() => {
              this.props.navigation.goBack();
            }}
            onPressRight={() => null}
          />

          <View style={styles.wrapper}>
            <Preview
              sourceData={source}
              designOption={false}
              backgroundData={backgroundLayers}
              foregroundData={preview}
            />

            {this.state.inColorPickerMode === false && (
              <View style={styles.outlines}>
                <TouchableOpacity style={styles.doneBtn} onPress={this.done}>
                  <Image source={require('../../assets/icon_done.png')} />
                </TouchableOpacity>

                <OutlineSelector
                  index={0}
                  data={one}
                  onPickColor={() => {
                    this.setState({
                      inColorPickerMode: true,
                      activeOutline: 'one'
                    });
                  }}
                  onChangeData={(data: OutlineType) => {
                    this.setState({ one: data });
                  }}
                />
                <OutlineSelector
                  index={1}
                  data={two}
                  onPickColor={() => {
                    this.setState({
                      inColorPickerMode: true,
                      activeOutline: 'two'
                    });
                  }}
                  onChangeData={(data: OutlineType) => {
                    this.setState({ two: data });
                  }}
                />
                <OutlineSelector
                  index={2}
                  data={three}
                  onPickColor={() => {
                    this.setState({
                      inColorPickerMode: true,
                      activeOutline: 'three'
                    });
                  }}
                  onChangeData={(data: OutlineType) => {
                    this.setState({ three: data });
                  }}
                />
              </View>
            )}

            {this.state.inColorPickerMode === true && (
              <ColorSelector
                onColor={color => {
                  const updater = {};
                  updater[activeOutline] = {
                    ...this.state[activeOutline],
                    color
                  };
                  this.setState(updater);
                }}
                color={this.state[activeOutline].color}
                onClear={() => {
                  const updater = {
                    inColorPickerMode: false
                  };
                  updater[activeOutline] = {
                    ...this.state[activeOutline],
                    enable: false
                  };
                  this.setState(updater);
                }}
                onDone={() => {
                  this.setState({ inColorPickerMode: false });
                }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  doneBtn: {
    position: 'absolute',
    right: 15,
    top: 15
  },
  wrapper: {
    flex: 1
  },
  outlines: {
    paddingTop: 35,
    height: 200,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
});

const mapStateToProps = state => ({
  source: state.source,
  backgroundLayers: state.background,
  foregroundLayers: state.foreground
});

export default connect(
  mapStateToProps,
  { updateForegroundLayers }
)(Outline);
