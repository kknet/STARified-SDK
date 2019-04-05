import { App, Action } from './../definition';

export const RESET: string = 'starified/app/reset';

const initState: App = {
  tutorialFirst: true,
  tutorialSecond: true
};

// TODO add updating tutorials

const reducer = (state: App = initState, action: Action): App => {
  return state;
};

export const resetApp = (): Action => {
  return {
    type: RESET,
    payload: {}
  };
};

export default reducer;
