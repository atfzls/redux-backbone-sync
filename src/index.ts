import Backbone from 'backbone';
import produce from 'immer';
import get from 'lodash.get';
import set from 'lodash.set';
import { Store } from 'redux';

const ACTION_CONSTANT = 'REDUX_BACKBONE_EVAL';

export function syncReduxBackbone(
  store: Store,
  slicePath: string,
  model: Backbone.Collection | Backbone.Model,
  modelAttribute?: string,
) {
  const updateStore = () =>
    store.dispatch({
      type: ACTION_CONSTANT,
      payload: (state: any) => {
        return produce(state, (draft: any) => {
          set(
            draft,
            slicePath,
            modelAttribute ? model.get(modelAttribute) : model.toJSON(),
          );
        });
      },
    });

  updateStore(); // for hydrating store with initial state

  let modelEvent = 'change';
  if (modelAttribute) {
    modelEvent += `:${modelAttribute}`;
  }
  const unsubscribeModel = () => {
    model.off('change', updateStore);
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

export const reduxBackboneReducerWrapper = (reducer: any) => (
  state: any,
  action: any,
) => {
  if (action.type === ACTION_CONSTANT) {
    return action.payload(state);
  }

  return reducer(state, action);
};
