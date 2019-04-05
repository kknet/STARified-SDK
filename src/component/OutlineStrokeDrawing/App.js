import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, Button, View, Slider } from 'react-native';

import OutlineSrokeView from './OutlineStrokeDrawingView.js';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      left: 0,
      name: '_processed_mask',
      width: 1,
    };
  }

  onFinishChanging = () => {
    // this._outlineStrokeViewRef.save(
    //   (error, newPath) => {
    //     // use a new path for stroke drawing.
    //     console.log("New path" ,  newPath)
    //     this.setState({name : newPath})
    //   }
    // )

    this.setState({ left: this.state.left + 1 });
  };

  onSliderChange = value => {
    this.setState({ width: value });
  };

  render() {
    // configurable parameters
    let color1Width = this.state.width;
    let variance = this.state.width / 4;

    let color1 = '#FF0000';
    // There are always 3 layers
    let layers = [
      {
        color: color1,
        randomnessLevel: 0.8,
        minWidth: color1Width - variance,
        maxWidth: color1Width + variance,
        innerOffset: 10.0,
        outerShift: 10.0,
      },
    ];

    return (
      <View>
        {/*
          Another four layers here
        */}
        <OutlineSrokeView
          style={{
            left: this.state.left,
            top: 0,
            width: 400,
            height: 400,
          }}
          imageName={this.state.name}
          layers={layers}
          ref={ref => {
            this._outlineStrokeViewRef = ref;
          }}
        />
        <Button onPress={this.onFinishChanging} title="save" />
        <Slider
          onValueChange={this.onSliderChange}
          minimumValue={1}
          maximumValue={15}
        />
      </View>
    );
  }
}
