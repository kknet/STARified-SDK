import { Source, Action } from './../definition';
import { RESET } from './app';
export const UPDATE_SOURCE: string = 'starified/source/update';

export const SET_LOTTIE_COLOR: string = 'starified/source/lottie-color';

type State = Source;

const reducer = (state: State = {}, action: Action) => {
  switch (action.type) {
    case UPDATE_SOURCE:
      return { ...state, ...action.payload };

    case SET_LOTTIE_COLOR:
      return { ...state, lottieColor: action.payload };
  }

  return state;
};

export const updateSource = (data: object): Action => ({
  type: UPDATE_SOURCE,
  payload: data
});

export const setLottieColor = (color: string): Action => ({
  type: SET_LOTTIE_COLOR,
  payload: color
});

export default reducer;
