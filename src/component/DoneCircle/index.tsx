import * as React from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
export class DoneCircle extends React.PureComponent<IProps, {}> {

  public constructor(props: IProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <TouchableOpacity 
        style={styles.container}
        onPress={this.props.onDone}
        >
            <Image source={require('../../../assets/icon_refine_done.png')} style={{ alignSelf: 'center' }}/>
      </TouchableOpacity>
    );
  }
}
interface IProps {
  onDone:() => void;
}

const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center'
  },
});
