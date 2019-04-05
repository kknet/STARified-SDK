import * as React from 'react';
import {
  Dimensions,
  ScaledSize,
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  ImageBackground
} from 'react-native';
import { Palette } from '../../Palette';
import { Design, Category } from '../../definition';

import Carousel from '../../vendor/react-native-snap-carousel';

import { getPathInDocuments } from './../../fs';

/**
 * This is carousel for selecting design.
 * This is controller component. You need to pass selectedDesignID, selectedCtgIndex props and
 * handle handleSnap callback prop
 */
export class DesignSelector extends React.PureComponent<Props, State> {
  public carousel: any;

  public constructor(props: Props) {
    super(props);
    this.onSelectDesign = this.onSelectDesign.bind(this);
  }

  public nextDesign(): void {
    this.carousel.snapToNext(true);
  }
  public prevDesign(): void {
    this.carousel.snapToPrev(true);
  }
  public onSelectDesign(item, index): any {
    if (item.status !== 'ready') {
      return;
    }

    // design can be selected and deselected
    const { selectedDesignID } = this.props;

    if (!selectedDesignID || selectedDesignID !== item.id) {
      this.props.handleSnap(item);
    } else {
      this.props.handleSnap(null);
    }
    this.carousel.snapToItem(index, true);
  }
  public renderItem({ item, index }: any): JSX.Element {
    const { selectedDesignID } = this.props;

    return (
      <TouchableHighlight
        key={`snap${index}`}
        onPress={() => this.onSelectDesign(item, index)}
        onLongPress={() => this.props.onLongSelectDesign(item, index)}
        onPressOut={this.props.onStopPreview}
      >
        <View style={styles.cell}>
          <ImageBackground
            source={{
              uri: getPathInDocuments(item.thumb.localPath)
            }}
            style={styles.designItem}
          >
            {item.status === 'thumb' ? <View style={styles.greyCell} /> : null}
            {item.id === selectedDesignID && (
              <Image
                source={require('../../../assets/icon_checked.png')}
                style={styles.selected}
              />
            )}
          </ImageBackground>
        </View>
      </TouchableHighlight>
    );
  }
  public render(): JSX.Element {
    if (!this.props.designs) {
      return null;
    }

    const category = this.props.categories[this.props.selectedCtgIndex];

    const entries = this.props.designs.filter(
      design => design.status !== 'pending' && design.category === category
    );

    const firstItem = this.props.selectedDesignID
      ? entries.findIndex(item => item.id === this.props.selectedDesignID)
      : 0;

    return (
      <View style={styles.container}>
        <Carousel
          ref={carousel => (this.carousel = carousel)}
          data={entries}
          renderItem={this.renderItem.bind(this)}
          sliderWidth={windowSize.width}
          itemWidth={windowSize.width * 0.2}
          firstItem={firstItem}
          inactiveSlideScale={0.9}
          slideStyle={styles.slideStyle}
          enableMomentum={false}
          enableSnap={false}
        />
      </View>
    );
  }
}
interface Props {
  designs: Design[];
  handleSnap: (item: Design) => void;
  selectedDesignID?: string;
  selectedCtgIndex: number;
  categories: Category[];
  onLongSelectDesign?: (design: Design, index: number) => void;
  onStopPreview?: () => void;
}

interface State {}
const windowSize: ScaledSize = Dimensions.get('window');
const styles: any = StyleSheet.create({
  container: {
    width: windowSize.width,
    height: 72,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bgColorTransparent
  },
  slideStyle: {
    backgroundColor: 'transparent',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center'
  },
  greyCell: {
    backgroundColor: 'rgba(216,216,216,0.5)',
    flex: 1
  },
  cell: {
    height: 72,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    alignSelf: 'center'
  },
  designItem: {
    height: 72,
    width: 72,
    justifyContent: 'center'
  }
});
