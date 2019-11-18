import produce from "immer";
import { createStore } from "redux";

interface State {
  songs: Array<{ id: number; title: string; listeners: number }>;
}

export const store = createStore(
  (
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
      case "EVAL": {
        return action.payload(state);
      }
      default: {
        return state;
      }
    }
  }
);
