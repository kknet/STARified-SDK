import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorCircle } from '../ColorCircle';

type Props = {
  navigation: any;
  onColorPress: () => void;
  color: string;
  silhouette: boolean;
  outline: boolean;
  background: boolean;
  overlay: boolean;
};

const IconItem = ({ label, icon, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem}>
    <Image style={isActive ? styles.iconActive : styles.icon} source={icon} />
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{label}</Text>
    </View>
  </TouchableOpacity>
);

class EffectsMenu extends React.Component<Props> {
  static defaultProps = {
    silhouette: true,
    outline: false,
    background: false,
    overlay: true
  };
  navigate = (screen: string) => {
    this.props.navigation.navigate(screen);
  };
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={this.props.onColorPress}
        >
          <ColorCircle color={this.props.color} />
          <View style={[styles.labelContainer, { marginTop: 7 }]}>
            <Text style={styles.label}>Color</Text>
          </View>
        </TouchableOpacity>

        {/* <IconItem
          label="Color"
          onPress={this.props.onColorPress}
          icon={require('../../../assets/navigation/color.png')}
        /> */}
        <IconItem
          label="Silhoutte"
          isActive={this.props.silhouette}
          onPress={() => this.navigate('Silhouette')}
          icon={require('../../../assets/navigation/silhouette.png')}
        />
        <IconItem
          label="Outline"
          isActive={this.props.outline}
          onPress={() => this.navigate('Outline')}
          icon={require('../../../assets/navigation/outline.png')}
        />
        <IconItem
          label="Background"
          isActive={this.props.background}
          onPress={() => this.navigate('Background')}
          icon={require('../../../assets/navigation/background.png')}
        />
        <IconItem
          isActive={this.props.overlay}
          onPress={() => this.navigate('Overlay')}
          label="Overlay"
          icon={require('../../../assets/navigation/overlay.png')}
        />
      </View>
    );
  }
}

const styles: any = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
    marginTop: 10
  },
  icon: {
    width: 50,
    height: 50
  },
  iconActive: {
    width: 50,
    height: 50,
    backgroundColor: '#F6F0FB',
    borderRadius: 25
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 75
  },
  label: {
    color: 'black',
    fontSize: 10,
    fontFamily: 'Montserrat'
  },
  labelContainer: {
    marginTop: 5,
    backgroundColor: '#E8E8E8',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
    alignSelf: 'center'
  }
});
export { EffectsMenu };
