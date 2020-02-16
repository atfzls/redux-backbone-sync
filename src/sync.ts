import get from 'lodash.get';
import set from 'lodash.set';
import { Store } from "redux";
import produce from "immer";
import Backbone from "backbone";

export function sync(
  store: Store<any, any>,
  slicePath: string,
  model: Backbone.Collection | Backbone.Model,
  modelAttribute?: string
) {
  const updateStore = () =>
    store.dispatch({
      type: "REDUX_BACKBONE_EVAL",
      payload: (state: any) => {
        return produce(state, (draft: any) => {
          set(
            draft,
            slicePath,
            modelAttribute ? model.get(modelAttribute) : model.toJSON()
          );
        });
      }
    });

  updateStore(); // for hydrating store with initial state

  let modelEvent = "change";
  if (modelAttribute) {
    modelEvent += `:${modelAttribute}`;
  }
  const unsubscribeModel = () => {
    model.off("change", updateStore);
  };
  model.on(modelEvent, () => {
    updateStore();
  });

  const subscribeToSlice = (key: string) => {
    let oldSlice: any;

    return store.subscribe(() => {
      const slice = get(store.getState(), key);

      if (oldSlice === slice) {
        return;
      }
      if (model instanceof Backbone.Collection) {
        model.reset();
      }
      if (modelAttribute) {
        model.set(modelAttribute, slice);
      } else {
        model.set(slice);
      }

      oldSlice = slice;
    });
  };

  const unsubscribeStore = subscribeToSlice(slicePath);

  return [unsubscribeModel, unsubscribeStore];
}
