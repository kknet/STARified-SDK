import * as React from 'react';
import Carousel from 'react-native-snap-carousel';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback
} from 'react-native';
import { Palette } from '../../Palette';
export class SourceSelector extends React.PureComponent<IProps, IState> {
  public carousel: any;

  public constructor(props: IProps) {
    super(props);
    this.state = {
      entries: [
        {
          name: 'Camera',
          screen: 'source.Camera',
          index: 0
        },
        // {
        //   name: 'Video',
        //   screen: 'source.Video',
        //   index: 1
        // },
        {
          name: 'Gallery',
          screen: 'source.Gallery',
          index: 2
        }
      ],
      snap: 0
    };
  }
  public setSourceType(type: number) {
    this.carousel.snapToItem(type, true);
  }
  public onSelectCategory(index: number): any {
    this.carousel.snapToItem(index, true);
  }
  public renderItem({ item, index }: any): JSX.Element {
    const selected: boolean = index === this.state.snap;
    return (
      <TouchableWithoutFeedback onPressIn={() => this.onSelectCategory(index)}>
        <View key={`snap${index}`} style={styles.cell}>
          <Text style={selected ? styles.textTitleSelected : styles.textTitle}>
            {item.name}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  public render(): JSX.Element {
    return (
      <View style={styles.container}>
        <Carousel
          ref={carousel => (this.carousel = carousel)}
          data={this.state.entries}
          renderItem={this.renderItem.bind(this)}
          sliderWidth={windowSize.width}
          itemWidth={70}
          firstItem={0}
          inactiveSlideScale={0.9}
          slideStyle={styles.slideStyle}
          onSnapToItem={snap => {
            this.setState({ snap });
            this.props.handleSnap(snap);
          }}
        />
      </View>
    );
  }
}
interface IProps {
  handleSnap: (index: number) => void;
}
interface IState {
  entries: { name: string; screen: string; index: number }[];
  snap: number;
}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  container: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgColor
  },
  slideStyle: {
    backgroundColor: 'transparent',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cell: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textTitle: { ...Palette.textMedium17, fontWeight: 'bold' },
  textTitleSelected: {
    ...Palette.textMedium17,
    fontWeight: 'bold',
    color: Palette.colorBlack
  }
});
