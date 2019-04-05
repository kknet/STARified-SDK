import * as React from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
export class UndoCircle extends React.PureComponent<IProps, {}> {

  public constructor(props: IProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <TouchableOpacity 
        style={styles.container}
        onPress={this.props.onChange}
        >
            <Image source={require('../../../assets/icon_undo.png')} style={{ alignSelf: 'center' }}/>
      </TouchableOpacity>
    );
  }
}
interface IProps {
  onChange:() => void;
}

const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center'
  },
});
