import * as React from 'react';
import { StyleSheet, Modal, View, Text } from 'react-native';
import { BlurView } from 'react-native-blur';
import Animation from 'lottie-react-native';
import { Palette } from '../../Palette';

export class Spinner extends React.PureComponent<IProps, IState> {

  public animation: any;

  public constructor(props: IProps) {
    super(props);
  }

  public componentDidMount(): void {
    this.animation.play();
  }

  public render(): JSX.Element {
    return (
      <Modal
        onRequestClose={() => { }}
        supportedOrientations={['landscape', 'portrait']}
        transparent={true}
        visible={this.props.visible}
      >
        <BlurView blurType="dark" blurAmount={20} style={styles.container}>
          <View style={styles.background}>
            <Animation
              ref={animation => { this.animation = animation; }}
              style={{
                width: 100,
                height: 100,
              }}
              source={require('../../../assets/lottie/search.json')}
              loop
            />
            
          </View>
          <Text style={styles.title}>
            Updating Designs ...
          </Text>
        </BlurView>
      </Modal>
    );
  }

}

interface IProps {
  visible: boolean;
}

interface IState { }

const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'column'
  },
  title: {
    ...Palette.textMedium17,
    color: Palette.whiteTextPrimary,
    textAlign: 'center',
    marginTop: 10,
  },
});
