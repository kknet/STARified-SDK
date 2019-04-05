import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import { Palette } from './../Palette';
import Icon from 'react-native-vector-icons/MaterialIcons';

export class NavBar extends React.PureComponent<Props, State> {
  public render(): JSX.Element {
    const { title } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.props.onPressLeft}
          style={styles.iconLeft}
        >
          <Icon
            color={Palette.darkColor}
            size={33}
            name={this.props.iconLeft}
          />
        </TouchableOpacity>
        <View style={styles.iconCenter}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity
          onPress={this.props.onPressRight}
          style={styles.iconRight}
        >
          <Text style={styles.rightText}>{this.props.iconRight}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
interface Props {
  onPressLeft: () => void;
  onPressRight: () => void;
  title: string;
  iconLeft?: string;
  iconRight: string;
}
interface State {}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: any = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: windowSize.width,
    height: 44,
    backgroundColor: Palette.bgColor,
    paddingHorizontal: 10
  },
  iconLeft: {
    flex: 0.2,
    alignSelf: 'center',
    height: 44,
    justifyContent: 'center'
  },
  iconCenter: {
    flex: 0.6,
    alignSelf: 'center'
  },
  iconRight: {
    flex: 0.2,
    alignSelf: 'center',
    alignItems: 'flex-end',
    height: 44,
    justifyContent: 'center'
  },
  rightText: {
    ...Palette.textMedium17,
    color: Palette.colorPurple
  },
  title: {
    ...Palette.textMedium17,
    color: Palette.colorBlack,
    textAlign: 'center'
  }
});
