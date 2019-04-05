import * as React from 'react';
import Carousel from '../../vendor/react-native-snap-carousel';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { Palette } from '../../Palette';
import _ from 'lodash';

/**
 * This is component for rendering bottom design categories selector
 * Component is controller component. You have to pass "snap" prop and hadle onSnap callback
 */
export class CategorySelector extends React.PureComponent<Props, IState> {
  public carousel: any;
  private callbackSnap: any;

  public constructor(props: Props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
    this.callbackSnap = _.debounce(this.props.handleSnap, 200);
  }

  public onSelectCategory(index: number): any {
    this.carousel.snapToItem(index, true);
  }

  public renderItem({ item, index }: any): JSX.Element {
    const selected: boolean = index === this.props.snap;

    return (
      <TouchableWithoutFeedback
        key={`snap${index}`}
        onPress={() => this.onSelectCategory(index)}
      >
        <View style={styles.cell}>
          <Text style={selected ? styles.textTitleSelected : styles.textTitle}>
            {item.name}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  onScroll(event) {
    let snap = Math.floor((this.carousel.currentScrollPosition + 33) / 67);
    if (snap < 0) snap = 0;
    else if (snap > this.props.categories.length - 1)
      snap = this.props.categories.length - 1;
    this.callbackSnap(snap);
  }
  public render(): JSX.Element {
    if (!this.props.categories) {
      return null;
    }

    const entries = this.props.categories.map((category, index) => ({
      name: category,
      screen: category,
      index: index
    }));

    return (
      <View style={styles.container}>
        <Carousel
          ref={carousel => (this.carousel = carousel)}
          data={entries}
          renderItem={this.renderItem.bind(this)}
          sliderWidth={windowSize.width}
          itemWidth={70}
          firstItem={this.props.snap}
          decelerationRate={10}
          inactiveSlideScale={0.9}
          slideStyle={styles.slideStyle}
          enableSnap={false}
          enableMomentum={true}
          onScroll={this.onScroll}
          //onScrollEndDrag={this.onEndScroll}
          onSnapToItem={(snap: number) => {
            // this.setState({ snap });
            this.callbackSnap(snap);
          }}
        />
        <Image
          source={require('../../../assets/Triangle.png')}
          style={styles.currentPos}
        />
      </View>
    );
  }
}

interface Props {
  snap: number;
  handleSnap: (index: number) => void;
  categories: string[];
}

interface IState {}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: any = StyleSheet.create({
  container: {
    // width: windowSize.width * 0.8,
    height: 50,
    alignItems: 'center',
    // alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgColor
    // backgroundColor: 'green'
    // position: 'absolute',
    // bottom: 0
  },
  slideStyle: {
    backgroundColor: 'transparent',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cell: {
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currentPos: {
    position: 'absolute',
    bottom: 0
  },
  textTitle: { ...Palette.textMedium13, fontWeight: 'bold' },
  textTitleSelected: {
    ...Palette.textMedium13,
    fontWeight: 'bold',
    color: Palette.colorBlack
  }
});
