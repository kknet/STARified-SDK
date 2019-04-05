import * as React from 'react';
import { connect } from 'react-redux';

import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  Animated,
  View,
  Text
} from 'react-native';

// import PixelColor from 'react-native-pixel-color';
import { Source } from '../../definition';

class ColorPickkingPannel extends React.PureComponent<IProps, IState> {
  private _val: Position;
  private panResponder: PanResponderInstance;
  public constructor(props: IProps) {
    super(props);
    this.state = {
      pan: new Animated.ValueXY(),
      sourceData: this.props.sourceData,
      selectedColor: 'transparent'
    };
  }
  componentWillReceiveProps(newProps: IProps): void {
    if (newProps.sourceData !== this.state.sourceData) {
      this.setState({ sourceData: newProps.sourceData });
    }
  }
  componentWillMount(): void {
    const imageData = this.state.sourceData.picureData.base64;
    PixelColor.createTempImage(imageData);
    // Add a listener for the delta value change
    this._val = { x: initialPos.x, y: initialPos.y };
    this.state.pan.setValue({ x: initialPos.x, y: initialPos.y });
    this.state.pan.addListener(value => {
      var x = value.x + 25,
        y = value.y + 25;
      if (x < 1) x = 1;
      else if (x > windowSize.width - 1) x = windowSize.width - 1;

      if (y < 1) y = 1;
      else if (y > windowSize.width - 1) y = windowSize.width - 1;

      PixelColor.getHex({
        x,
        y,
        height: windowSize.width,
        width: windowSize.width
      })
        .then(color => {
          this.setState({ selectedColor: color });
        })
        .catch(err => {
          // Oops, something went wrong. Check that the filename is correct and
          // inspect err to get more details.
          PixelColor.createTempImage(imageData);
          console.log(err);
        });
    });
    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value
        });
        this.state.pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: (e, gesture) => {
        this.state.pan.flattenOffset();
        this.props.onColor(this.state.selectedColor);
      }
      // adjusting delta value
    });
  }
  public render(): JSX.Element {
    const { selectedColor } = this.state;
    return (
      <View style={styles.container}>
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[this.state.pan.getLayout(), styles.circle]}
        >
          <View
            style={[
              styles.colorBlock,
              {
                backgroundColor: selectedColor
              }
            ]}
          />
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: 'rgba(92, 91, 91, 70)'
            }}
          />
        </Animated.View>
      </View>
    );
  }
}

function mapStateToProps(state: any): IStateProps {
  return {
    sourceData: state.source.sourceData
  };
}
export default connect<IStateProps, {}, {}>(
  mapStateToProps,
  {}
)(ColorPickkingPannel);

interface IStateProps extends React.Props<{}> {
  sourceData: Source;
}

interface IProps {
  sourceData: Source;
  onColor: (color: string) => void;
}
interface IState {
  pan: Animated.ValueXY;
  sourceData: Source;
  selectedColor: string;
}
interface Position {
  x: number;
  y: number;
}

const windowSize: ScaledSize = Dimensions.get('window');
const initialPos: Position = {
  x: windowSize.width - 50,
  y: windowSize.width - 50
};

const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    width: windowSize.width,
    height: windowSize.width
  },
  circle: {
    backgroundColor: 'transparent',
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  colorBlock: {
    position: 'absolute',
    top: -30,
    left: 6,
    height: 38,
    width: 38,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2
  }
});
