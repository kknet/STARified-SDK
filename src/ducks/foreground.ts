import { ForegroundLayers, Action } from './../definition';
import { RESET } from './app';
export const UPDATE_FOREGROUND_LAYERS = 'starified/foreground/update';

type State = ForegroundLayers;

const initialState: ForegroundLayers = {
  outlines: {
    one: {
      enable: false,
      color: '#E572A4',
      stroke: 8
    },
    two: {
      enable: false,
      color: '#BDF9FF',
      stroke: 8
    },
    three: {
      enable: false,
      color: '#BDF9FF',
      stroke: 8
    }
  },
  silhouette: {
    enable: false,
    color: '#9754ef77'
  }
};

const reducer = (state: State = initialState, action: any) => {
  switch (action.type) {
    case UPDATE_FOREGROUND_LAYERS:
      const outlines = action.payload.outlines;
      return {
        outlines: {
          one: { ...outlines.one },
          two: { ...outlines.two },
          three: { ...outlines.three }
        },
        silhouette: {
          ...action.payload.silhouette
        }
      };
    case RESET:
      return initialState;
  }
  return state;
};

export function updateForegroundLayers(layers: ForegroundLayers): Action {
  return {
    type: UPDATE_FOREGROUND_LAYERS,
    payload: layers
  };
}

export default reducer;
