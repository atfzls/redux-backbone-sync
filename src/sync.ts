import * as _ from "lodash";
import { Store } from "redux";
import produce from "immer";
import Backbone from "backbone";

export function sync(
  store: Store<any, any>,
  slicePath: string,
  model: Backbone.Collection | Backbone.Model,
  modelAttribute?: string,
) {
  const updateStore = () =>
    store.dispatch({
      type: "EVAL",
      payload: (state: any) => {
        return produce(state, (draft: any) => {
          _.set(draft, slicePath, model.toJSON());
        });
      }
    });

  updateStore(); // for hydrating store with initial state
  const callback = () => {
    updateStore();
  };
  const unsubscribeModel = () => {
    model.off("change", callback);
  };
  let movelEvent = 'change';
  if (modelAttribute) {
    movelEvent += `:${modelAttribute}`
  }
  model.on(movelEvent, () => {
    updateStore();
  });

  const subscribeToSlice = (key: string) => {
    let oldSlice: any;

    return store.subscribe(() => {
      const slice = _.get(store.getState(), key);

      if (oldSlice !== slice) {
        if (model instanceof Backbone.Collection) {
          model.reset();
        }
        model.set(slice);
        oldSlice = slice;
      }
    });
  };

  const unsubscribeStore = subscribeToSlice(slicePath);

  return [unsubscribeModel, unsubscribeStore];
}
