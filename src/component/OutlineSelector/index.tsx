import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { ColorCircle, ColorSelector, StrokeCircle } from '../../component';
import { Palette, IColor } from '../../Palette';
import { Outline } from '../../definition';

export class OutlineSelector extends React.PureComponent<Props> {
  public constructor(props: Props) {
    super(props);
    this.onOutlineState = this.onOutlineState.bind(this);
  }
  onOutlineState(): void {
    const { data } = this.props;
    this.props.onChangeData({ ...data, enable: !data.enable });
  }
  renderIdxBtn(): JSX.Element {
    const { data } = this.props;
    const index = this.props.index;
    if (data.enable) {
      if (index === 0)
        return (
          <Image source={require('../../../assets/Outline1-enabled.png')} />
        );
      else if (index === 1)
        return (
          <Image source={require('../../../assets/Outline2-enabled.png')} />
        );
      else if (index === 2)
        return (
          <Image source={require('../../../assets/Outline3-enabled.png')} />
        );
    } else {
      if (index === 0)
        return (
          <Image source={require('../../../assets/Outline1-disabled.png')} />
        );
      else if (index === 1)
        return (
          <Image source={require('../../../assets/Outline2-disabled.png')} />
        );
      else if (index === 2)
        return (
          <Image source={require('../../../assets/Outline3-disabled.png')} />
        );
    }
  }
  public render(): JSX.Element {
    const { data } = this.props;

    const outlineElement: JSX.Element = this.renderIdxBtn();
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.onOutlineState}
          style={styles.outlineState}
        >
          {outlineElement}
        </TouchableOpacity>
        {data.enable && (
          <TouchableOpacity
            onPress={this.props.onPickColor}
            style={styles.outlineState}
          >
            <ColorCircle color={data.color} />
          </TouchableOpacity>
        )}
        {data.enable && (
          <StrokeCircle
            debounceTimeout={300}
            stroke={data.stroke}
            onChange={stroke => {
              const { data } = this.props;
              this.props.onChangeData({ ...data, stroke });
            }}
          />
        )}
      </View>
    );
  }
}
interface Props {
  onChangeData: (data: Outline) => void;
  data: Outline;
  index: number;
  onPickColor: () => void;
}

const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Palette.bgColorTransparent,
    justifyContent: 'space-around',
    alignSelf: 'center',
    alignItems: 'center',
    paddingBottom: 4,
    width: 190
  }
});
