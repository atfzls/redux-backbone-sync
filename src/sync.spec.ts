import { store } from "./redux";
import { Songs, Song } from "./backbone";
import { sync } from "./sync";

describe("sync backbone model and redux store", () => {
  let songs: any;
  let disposables: Function[] = [];

  beforeEach(() => {
    songs = new Songs([
      new Song({ title: "Blue in Green", listeners: 0, id: 1 }),
      new Song({ title: "So What", listeners: 0, id: 2 }),
      new Song({ title: "All Blues", listeners: 0, id: 3 })
    ]);
  
    disposables = sync(store, songs, 'songs');
  });

  afterEach(() => {
    disposables.forEach(disposable => disposable());
  });

  describe('update redux after updating model', () => {
    it("updating title of song ", () => {
      songs.at(0).set('title', 'New Title');
      expect(store.getState()).toMatchSnapshot();
    });
  
    it("updating listeners of song ", () => {
      songs.at(0).set('listeners', songs.at(0).get('listeners') + 1);
      expect(store.getState()).toMatchSnapshot();
    });
  
    it("updating multiple listeners of song ", () => {
      songs.at(0).set('listeners', songs.at(0).get('listeners') + 1);
      songs.at(0).set('listeners', songs.at(0).get('listeners') + 1);
      songs.at(0).set('listeners', songs.at(0).get('listeners') + 1);
  
      songs.at(1).set('listeners', songs.at(1).get('listeners') + 1);
      songs.at(2).set('listeners', songs.at(2).get('listeners') + 1);
  
      expect(store.getState()).toMatchSnapshot();
    });
  });

  describe('update backbone model after updating redux state', () => {
    it('updating title of song', () => {
      store.dispatch({
        type: 'UPDATE_SONG_TITLE',
        payload: {
          id: 2,
          title: 'New Title for id 2'
        }
      });

      expect(songs.toJSON()).toMatchSnapshot();
    });

    it('updating listeners', () => {
      store.dispatch({
        type: 'INCREASE_LISTENER',
        payload: 1
      });

      expect(songs.toJSON()).toMatchSnapshot();
    });

    it('updating multiple listeners of song', () => {
      store.dispatch({
        type: 'INCREASE_LISTENER',
        payload: 1
      });
      store.dispatch({
        type: 'INCREASE_LISTENER',
        payload: 1
      });
      store.dispatch({
        type: 'INCREASE_LISTENER',
        payload: 1
      });
      store.dispatch({
        type: 'INCREASE_LISTENER',
        payload: 2
      });
      store.dispatch({
        type: 'INCREASE_LISTENER',
        payload: 3
      });

      expect(songs.toJSON()).toMatchSnapshot();
    });
  });
});
