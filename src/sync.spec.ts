import Backbone from "backbone";
import produce from "immer";
import { createStore } from "redux";
import { sync } from "./sync";
import { reducerWrapper } from "./reducerWrapper";

describe("sync backbone model and redux store", () => {
  let songs: any;
  let store: any;
  let disposables: Function[] = [];

  const SongModel = Backbone.Model.extend({});
  const SongsCollection = Backbone.Collection.extend({
    model: SongModel
  });

  beforeEach(() => {
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

    store = createStore(reducerWrapper(reducer));

    songs = new SongsCollection([
      new SongModel({ title: "Blue in Green", listeners: 0, id: 1 }),
      new SongModel({ title: "So What", listeners: 0, id: 2 }),
      new SongModel({ title: "All Blues", listeners: 0, id: 3 })
    ]);

    disposables = sync(store, songs, "songs");
  });

  afterEach(() => {
    disposables.forEach(disposable => disposable());
  });

  describe("update redux after updating model", () => {
    it("updating title of song ", () => {
      songs.at(0).set("title", "New Title");
      expect(store.getState()).toMatchInlineSnapshot(`
        Object {
          "songs": Array [
            Object {
              "id": 1,
              "listeners": 0,
              "title": "New Title",
            },
            Object {
              "id": 2,
              "listeners": 0,
              "title": "So What",
            },
            Object {
              "id": 3,
              "listeners": 0,
              "title": "All Blues",
            },
          ],
        }
      `);
    });

    it("updating listeners of song ", () => {
      songs.at(0).set("listeners", songs.at(0).get("listeners") + 1);
      expect(store.getState()).toMatchInlineSnapshot(`
        Object {
          "songs": Array [
            Object {
              "id": 1,
              "listeners": 1,
              "title": "Blue in Green",
            },
            Object {
              "id": 2,
              "listeners": 0,
              "title": "So What",
            },
            Object {
              "id": 3,
              "listeners": 0,
              "title": "All Blues",
            },
          ],
        }
      `);
    });

    it("updating multiple listeners of song ", () => {
      songs.at(0).set("listeners", songs.at(0).get("listeners") + 1);
      songs.at(0).set("listeners", songs.at(0).get("listeners") + 1);
      songs.at(0).set("listeners", songs.at(0).get("listeners") + 1);

      songs.at(1).set("listeners", songs.at(1).get("listeners") + 1);
      songs.at(2).set("listeners", songs.at(2).get("listeners") + 1);

      expect(store.getState()).toMatchInlineSnapshot(`
        Object {
          "songs": Array [
            Object {
              "id": 1,
              "listeners": 3,
              "title": "Blue in Green",
            },
            Object {
              "id": 2,
              "listeners": 1,
              "title": "So What",
            },
            Object {
              "id": 3,
              "listeners": 1,
              "title": "All Blues",
            },
          ],
        }
      `);
    });
  });

  describe("update backbone model after updating redux state", () => {
    it("updating title of song", () => {
      store.dispatch({
        type: "UPDATE_SONG_TITLE",
        payload: {
          id: 2,
          title: "New Title for id 2"
        }
      });

      expect(songs.toJSON()).toMatchInlineSnapshot(`
        Array [
          Object {
            "id": 1,
            "listeners": 0,
            "title": "Blue in Green",
          },
          Object {
            "id": 2,
            "listeners": 0,
            "title": "New Title for id 2",
          },
          Object {
            "id": 3,
            "listeners": 0,
            "title": "All Blues",
          },
        ]
      `);
    });

    it("updating listeners", () => {
      store.dispatch({
        type: "INCREASE_LISTENER",
        payload: 1
      });

      expect(songs.toJSON()).toMatchInlineSnapshot(`
        Array [
          Object {
            "id": 1,
            "listeners": 1,
            "title": "Blue in Green",
          },
          Object {
            "id": 2,
            "listeners": 0,
            "title": "So What",
          },
          Object {
            "id": 3,
            "listeners": 0,
            "title": "All Blues",
          },
        ]
      `);
    });

    it("updating multiple listeners of song", () => {
      store.dispatch({
        type: "INCREASE_LISTENER",
        payload: 1
      });
      store.dispatch({
        type: "INCREASE_LISTENER",
        payload: 1
      });
      store.dispatch({
        type: "INCREASE_LISTENER",
        payload: 1
      });
      store.dispatch({
        type: "INCREASE_LISTENER",
        payload: 2
      });
      store.dispatch({
        type: "INCREASE_LISTENER",
        payload: 3
      });

      expect(songs.toJSON()).toMatchInlineSnapshot(`
        Array [
          Object {
            "id": 1,
            "listeners": 3,
            "title": "Blue in Green",
          },
          Object {
            "id": 2,
            "listeners": 1,
            "title": "So What",
          },
          Object {
            "id": 3,
            "listeners": 1,
            "title": "All Blues",
          },
        ]
      `);
    });
  });
});
