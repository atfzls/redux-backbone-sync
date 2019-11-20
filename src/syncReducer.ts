export const syncReducer = (reducer: any) => (
  state: any,
  action: { type: string; payload: any }
) => {
  if (action.type === 'EVAL') {
    return action.payload(state);
  }

  return reducer(state, action);
};
