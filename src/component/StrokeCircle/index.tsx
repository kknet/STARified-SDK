import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  View,
  Image,
  PanResponder,
  PanResponderInstance
} from 'react-native';
import _ from 'lodash';

export class StrokeCircle extends React.PureComponent<Props, State> {
  static defaultProps: Props = {
    debounceTimeout: 10,
    stroke: 8,
    onChange: () => null
  };
  public carousel: any;

  private panResponder: PanResponderInstance;

  private _debouncedChange: any;

  public constructor(props: Props) {
    super(props);

    this.onValueChange = this.onValueChange.bind(this);

    this._debouncedChange = _.debounce(
      this.onValueChange,
      props.debounceTimeout
    );

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        let { stroke } = this.props;

        stroke = stroke - gestureState.dy;
        if (stroke <= 1) {
          stroke = 8;
        }

        if (stroke >= 45) {
          stroke = 45;
        }

        this._debouncedChange(stroke, gestureState.dy);
      }
    });
  }

  onValueChange(stroke: number, dy: number): void {
    this.props.onChange(stroke);
  }
  public render(): JSX.Element {
    const { stroke } = this.props;
    return (
      <View style={styles.container} {...this.panResponder.panHandlers}>
        <Image
          source={require('../../../assets/color_circle.png')}
          style={{ alignSelf: 'center' }}
        />
        <View
          style={[
            styles.stroke,
            {
              width: stroke,
              height: stroke,
              borderRadius: stroke / 2
            }
          ]}
        />
      </View>
    );
  }
}

interface Props {
  stroke: number;
  onChange: (stroke: number) => void;
  debounceTimeout: number;
}
interface State {}
const styles: any = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center'
  },
  stroke: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'black'
  }
});
