import {
  createStore,
  applyMiddleware,
  compose,
  Store,
  Reducer,
  ReducersMapObject
} from "redux";
import { persistCombineReducers, persistStore } from "redux-persist";
import storage from "redux-persist/es/storage";
import thunk from "redux-thunk";

import appReducer from "./ducks/app";
import categoriesReducer from "./ducks/categories";
import designsReducer from "./ducks/designs";
import sourceReducer from "./ducks/source";
import backgroundReducer from "./ducks/background";
import foregroundReducer from "./ducks/foreground";
import designReducer from "./ducks/design";

const config = {
  key: "root",
  storage,
  blacklist: ["foreground", "background", "source", "design"]
};
export class GlobalStore {
  private rootReducer: Reducer<{}>;
  private store: Store<{}>;
  private reducers: ReducersMapObject = {
    app: appReducer,
    categories: categoriesReducer,
    designs: designsReducer,
    source: sourceReducer,
    foreground: foregroundReducer,
    background: backgroundReducer,
    design: designReducer
  };

  public constructor() {
    this.rootReducer = persistCombineReducers<ReducersMapObject>(
      config,
      this.reducers
    );
  }

  public configureStore(): Store<{}> {
    this.store = createStore(this.rootReducer, compose(applyMiddleware(thunk)));
    persistStore(this.store);
    return this.store;
  }
}
