import { BackgroundLayers, BackgroundImageType, Action } from './../definition';
import { RESET } from './app';

export const UPDATE_BACKGROUND_LAYERS: string = 'starified/background/update';

type State = BackgroundLayers;

const initialState: BackgroundLayers = {
  middleground: {
    enable: false
  },
  background: {
    enable: false,
    type: BackgroundImageType.STOCK
  }
};

const reducer = (state: State = initialState, action: any) => {
  switch (action.type) {
    case UPDATE_BACKGROUND_LAYERS:
      return {
        background: {
          ...action.payload.background
        },
        middleground: {
          ...action.payload.middleground
        }
      };
    case RESET:
      return initialState;
  }
  return state;
};

export function updateBackgroundLayers(layers: BackgroundLayers): Action {
  return {
    type: UPDATE_BACKGROUND_LAYERS,
    payload: layers
  };
}

export default reducer;
