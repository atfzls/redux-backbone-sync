import produce from "immer";
import { createStore } from "redux";

export const store = createStore((state: any, action: any) => {
  switch (action.type) {
    case "INCREASE_LISTENER": {
      const id = action.payload;
      return produce(state, (draft: any) => {
        draft.songs.find((song: any) => song.id === id).listeners += 1;
      });
    }
    case "UPDATE_SONG_TITLE": {
      const id = action.payload.id;
      return produce(state, (draft: any) => {
        draft.songs.find((song: any) => song.id === id).title =
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
}, {});
