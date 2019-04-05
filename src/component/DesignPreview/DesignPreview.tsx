import React from 'react';
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { Design } from './../../definition';
import api from './../../api';

export class DesignPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loader: false,
    };
  }
  public render() {
    const { videoRef, onVideoEnd, onError, design } = this.props;

    if (!design) {
      return null;
    }
    const source = api.apiRoute(design.previews[0]);

    if (source.includes('mp4')) {
      return (
        <View style={styles.wrapper}>
          {this.state.loader && (
            <ImageBackground
              source={{ uri: api.apiRoute(design.thumb.remote) }}
              style={styles.spinnerWrapper}>
              <ActivityIndicator size="large" color="#ffffff" />
            </ImageBackground>
          )}
          <Video
            source={{ uri: source }} // Can be a URL or a local file.
            ref={videoRef} // Store reference
            //onBuffer={this.onBuffer}                // Callback when remote video is buffering
            onEnd={onVideoEnd} // Callback when playback finishes
            onError={onError} // Callback when video cannot be loaded
            style={styles.content}
            onLoadStart={() => this.setState({ loader: true })}
            onProgress={({ currentTime }) => {
              if (this.state.loader) {
                if (currentTime >= 0.1) {
                  this.setState({
                    loader: false,
                  });
                }
              }
            }}
          />
        </View>
      );
    } else {
      return (
        <Image
          source={{
            uri: source,
          }}
          style={styles.img}
          justifyContent={'center'}
        />
      );
    }
  }
}

interface Props {
  design: Design;
  videoRef?: any;
  onVideoEnd?: any;
  onError?: any;
}

interface State {
  loader: boolean;
}
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  content: {
    flex: 1,
  },
  posterPreview: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 110,
  },
  spinnerWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 110,
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  img: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
  },
});
