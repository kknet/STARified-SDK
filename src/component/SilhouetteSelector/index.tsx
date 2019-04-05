import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { ColorCircle, ColorSelector } from '..';
import { Palette, IColor } from '../../Palette';
import { Silhouette } from '../../definition';
export class SilhouetteSelector extends React.PureComponent<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      //data: this.props.data,
      showColorBox: false
    };
    this.onOutlineState = this.onOutlineState.bind(this);
    this.showColorSelector = this.showColorSelector.bind(this);
  }
  componentWillReceiveProps(newProps: Props) {
    // if (newProps.data !== this.state.data) {
    //   this.setState({ data: newProps.data });
    // }
  }

  onColorSelected = (color: string): void => {
    let { data } = this.props;
    this.setState({ showColorBox: false }, () => {
      this.props.onChangeData({ ...data, color });
      this.props.onModalContent(false);
    });

    // let { data } = this.state;
    // (data.color = color),
    //   this.setState({ data, showColorBox: false }, () => {
    //     this.props.onChangeData(data);
    //     this.props.onModalContent(false);
    //   });
  };

  onColorChange = (color: string): void => {
    let { data } = this.props;
    this.props.onChangeData({ ...data, color });
    this.props.onModalContent(false);

    // let { data } = this.state;
    // (data.color = color),
    //   this.setState({ data }, () => {
    //     this.props.onChangeData(data);
    //   });
  };

  showColorSelector(): void {
    let { showColorBox } = this.state;
    showColorBox = !showColorBox;
    this.setState({ showColorBox });
    this.props.onModalContent(true);
  }

  onOutlineState(): void {
    let { data } = this.props;
    // data.enable = !data.enable;
    // this.setState({ ...data, enable: !data.enable });
    // this.forceUpdate();
    this.props.onChangeData({ ...data, enable: !data.enable });
  }

  public render(): JSX.Element {
    const { showColorBox } = this.state;
    const { data } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.onOutlineState}
          style={styles.outlineState}
        >
          {(data.enable && (
            <Image
              source={require('../../../assets/icon_silhouette_enabled.png')}
            />
          )) || (
            <Image
              source={require('../../../assets/icon_silhouette_disabled.png')}
            />
          )}
        </TouchableOpacity>

        {data.enable && (
          <TouchableOpacity
            onPress={this.showColorSelector}
            style={styles.outlineState}
          >
            <ColorCircle color={data.color} />
          </TouchableOpacity>
        )}

        <ColorSelector
          onDone={this.onColorSelected}
          onColor={this.onColorChange}
          color={data.color}
          showModal={showColorBox}
          enableOpacity
        />
      </View>
    );
  }
}
interface Props {
  onChangeData: (data: Silhouette) => void;
  data: Silhouette;
  onModalContent: (boolean) => void;
}
interface State {
  showColorBox: boolean;
  data: Silhouette;
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
  },
  outlineState: {
    //marginRight: 20,
  }
});
