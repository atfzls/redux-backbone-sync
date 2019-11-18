import { Store } from "redux";

export function sync(store: Store<any, any>, model: any, sliceName: string) {
  const updateStore = () =>
    store.dispatch({
      type: "EVAL",
      payload: (state: any) => {
        return {
          ...state,
          [sliceName]: model.toJSON()
        };
      }
    });

  updateStore(); // for hydrating store with initial state
  const callback = () => {
    updateStore();
  }
  const unsubscribeModel = () => {
    model.off('change', callback);
  }
  model.on("change", () => {
    updateStore();
  });

  const subscribeToSlice = (key: string) => {
    let oldSlice: any;

    return store.subscribe(() => {
      const slice = store.getState()[key];

      if (oldSlice !== slice) {
        model.reset();
        model.set(slice);
        oldSlice = slice;
      }
    });
  };

  const unsubscribeStore = subscribeToSlice(sliceName);

  return [unsubscribeModel, unsubscribeStore];
}
