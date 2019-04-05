import { TakePictureResponse, RecordResponse } from 'react-native-camera';

export const URL_API: string = 'https://df.starified.com';

export type Action = {
  type: string;
  payload?: any;
};

export type Category = string;

export enum DesignStatus {
  PENDING = 'pending',
  THUMB = 'thumb',
  READY = 'ready'
}

export enum BackgroundImageType {
  STOCK = 0,
  SOLID = 1,
  LIBRARY = 2
}

//
export enum SourceType {
  PHOTO = 0,
  VIDEO = 1,
  GALLERY = 2
}

export type Design = {
  id: string;
  title: string;
  manifest: string;
  category: Category;
  status: DesignStatus;
  previews?: string[];
  thumb?: {
    ready: boolean;
    remote: string;
    localPath?: string;
  };
  files?: {
    ready: boolean;
    remote: string;
    file: string;
    localPath?: string;
  }[];
  config?: any;
};

export type Source = {
  picureData?: TakePictureResponse;
  videoData?: RecordResponse;
  sourceType?: SourceType;
  // local fs address to file after 'cut'
  outputURL?: string;
  // local fs address to file with 'cut' mask
  outputMaskURL?: string;
  // same as before, but with transparent backgroud instead of white
  // transparent for refine functions, white for outlines
  outputTransparentMaskURL?: string;
  // color applies to lottie animation
  lottieColor?: string;
  // Same as outputURL picture, but edges is blended
  // we use this version in case the user swapped background,
  // so image will be not so sharp
  outputBlended?: string;
};

export type App = {
  tutorialFirst: boolean;
  tutorialSecond: boolean;
};

// Redux actions

export interface Outline {
  enable: boolean;
  color: string;
  stroke: number;
}
export interface Outlines {
  one: Outline;
  two: Outline;
  three: Outline;
}

export interface Silhouette {
  enable: boolean;
  color: string;
}

export interface ForegroundLayers {
  outlines: Outlines;
  silhouette: Silhouette;
}

export interface Middleground {
  enable: boolean;
  color?: string;
}

export interface Background {
  enable: boolean;
  type?: number;
  color?: string;
  stockID?: number;
  picureData?: any; // it's stock image, actual type is things, returned by require('')
  pictureUri?: string; // for library background, picture from picker
}

export interface BackgroundLayers {
  middleground: Middleground;
  background: Background;
}
