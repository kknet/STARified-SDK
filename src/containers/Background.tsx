import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Preview, NavBar, ExColorSelector } from '../component';
import { updateBackgroundLayers } from '../ducks/background';
import {
  Source,
  BackgroundLayers,
  ForegroundLayers,
  Background as BackgroundType,
  Action
} from '../definition';

type Props = {
  componentId: string;
  source: Source;
  backgroundLayers: BackgroundLayers;
  foregroundLayers: ForegroundLayers;
  navigation: any;
  updateBackgroundLayers: (BackgroundLayers) => Action;
};

type State = {
  data: BackgroundType;
};

class Background extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      data: { ...props.backgroundLayers.background }
    };
  }

  handleDone = () => {
    this.props.updateBackgroundLayers({
      middleground: this.props.backgroundLayers.middleground,
      background: this.state.data
    });

    this.props.navigation.goBack();
  };

  handleClear = () => {
    this.setState({
      data: { ...this.props.backgroundLayers.background }
    });
  };

  render() {
    const { source, backgroundLayers, foregroundLayers } = this.props;
    const { data } = this.state;

    const previewData = {
      middleground: backgroundLayers.middleground,
      background: data
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <NavBar
            iconLeft="close"
            iconRight=""
            title="Background"
            onPressLeft={() => {
              this.props.navigation.goBack();
            }}
            onPressRight={() => null}
          />

          <View style={styles.wrapper}>
            <Preview
              sourceData={source}
              designOption={false}
              backgroundData={previewData}
              foregroundData={foregroundLayers}
            />

            <ExColorSelector
              data={data}
              onChangeData={data => {
                this.setState({ data: { ...data, enable: true } });
              }}
              onDone={this.handleDone}
              onClear={this.handleClear}
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
)(Background);
