import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { ColorSelector, Preview, NavBar } from '../component';
import { updateBackgroundLayers } from '../ducks/background';
import {
  Action,
  Source,
  BackgroundLayers,
  ForegroundLayers,
  Middleground
} from '../definition';

type Props = {
  navigation: any;
  source: Source;
  backgroundLayers: BackgroundLayers;
  foregroundLayers: ForegroundLayers;
  updateBackgroundLayers: (BackgroundLayers) => Action;
};

type State = {
  data: Middleground;
};

const DEFAULT_COLOR = '#e572a480';

class Overlay extends Component<Props, State> {
  constructor(props) {
    super(props);
    let data;

    if (props.backgroundLayers.middleground.enable) {
      data = { ...props.backgroundLayers.middleground };
    } else {
      data = {
        enable: true,
        color: DEFAULT_COLOR
      };
    }

    this.state = {
      data
    };
  }

  handleDone = () => {
    this.props.updateBackgroundLayers({
      middleground: this.state.data,
      background: this.props.backgroundLayers.background
    });

    this.props.navigation.goBack();
  };

  handleClear = () => {
    this.setState({
      data: { enable: false, color: DEFAULT_COLOR }
    });
  };

  render() {
    const { source, backgroundLayers, foregroundLayers } = this.props;
    const { data } = this.state;

    const preview = {
      background: backgroundLayers.background,
      middleground: data
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <NavBar
            iconLeft="close"
            iconRight=""
            title="Overlay"
            onPressLeft={() => {
              this.props.navigation.goBack();
            }}
            onPressRight={() => null}
          />

          <View style={styles.wrapper}>
            <Preview
              sourceData={source}
              designOption={false}
              backgroundData={preview}
              foregroundData={foregroundLayers}
            />

            <ColorSelector
              onClear={this.handleClear}
              onColor={color =>
                this.setState({ data: { enable: true, color: color } })
              }
              onDone={this.handleDone}
              color={data.color}
              enableOpacity
            />
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
  wrapper: {
    flex: 1
  }
});

const mapStateToProps = state => ({
  source: state.source,
  backgroundLayers: state.background,
  foregroundLayers: state.foreground
});

export default connect(
  mapStateToProps,
  { updateBackgroundLayers }
)(Overlay);
