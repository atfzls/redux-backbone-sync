import produce from "immer";
import { createStore } from "redux";
import { syncReducer } from "./syncReducer";

interface State {
  songs: Array<{ id: number; title: string; listeners: number }>;
}

const reducer = (
  state: State = { songs: [] },
  action: { type: string; payload: any }
): State => {
  switch (action.type) {
    case "INCREASE_LISTENER": {
      const id = action.payload;
      return produce(state, draft => {
        draft.songs.find(song => song.id === id)!.listeners += 1;
      });
    }
    case "UPDATE_SONG_TITLE": {
      const id = action.payload.id;
      return produce(state, draft => {
        draft.songs.find(song => song.id === id)!.title =
          action.payload.title;
      });
    }
    default: {
      return state;
    }
  }
};

export const store = createStore(
  syncReducer(reducer)
);
