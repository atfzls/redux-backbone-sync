import Backbone from 'backbone';

// backbone start
export const Song = Backbone.Model.extend({});

export const Songs = Backbone.Collection.extend({
  model: Song,
});
