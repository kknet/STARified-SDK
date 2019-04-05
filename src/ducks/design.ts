import { Design, Action } from './../definition';

export const SELECT_DESIGN: string = 'starified/design/select';

import { SET_LOTTIE_COLOR } from './source';

import { RESET } from './app';

type State = Design;

const reducer = (state: State = null, action: any): State => {
  switch (action.type) {
    case SELECT_DESIGN:
      return action.payload;
    case SET_LOTTIE_COLOR:
      return state;
    case RESET:
      return null;
  }
  return state;
};

export const selectDesign = (design: Design): Action => {
  return {
    type: SELECT_DESIGN,
    payload: design
  };
};

export default reducer;
