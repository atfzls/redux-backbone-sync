export const reducerWrapper = (reducer: any) => (
  state: any,
  action: { type: string; payload: any }
) => {
  if (action.type === "REDUX_BACKBONE_EVAL") {
    return action.payload(state);
  }

  return reducer(state, action);
};
