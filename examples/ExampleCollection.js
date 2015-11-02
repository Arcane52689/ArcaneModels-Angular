
// Unlike the BaseModel, the BaseColleciton can be used as is, without create a new one
angular.module('MyProject').factory('NewModelCollection', ['BaseCollection', 'NewModel', function(BaseCollection, NewModel) {
  var NewModelCollection = new BaseCollection({
    model: NewModel,  // Whatever the model of the colleciton you want is
    url: "api/new_models" // Whatever the url for your collection is
  })

  NewModelCollection.fetch();

  return NewModelCollection
} ])

// This way creates a collection that you then have access to throughout the app whenever you inject 'NewModelCollection'

//To create a new collection type, you can do this.

angular.module('MyProject').factory('NewModelCollection', ['BaseCollection', 'NewModel', function(BaseCollection, NewModel) {
  var NewModelCollection = function(options) {
    this.initialize(options)
  }

  BaseCollection.parentOf(NewModelCollection);

  return NewModelCollection;
} ])

// Using this method creates a new type of collection, that inherits everything from the parent collection.  You can overwrite the built-methods, and still call the parent method using BaseCollection.prototype.apply(this, args)
