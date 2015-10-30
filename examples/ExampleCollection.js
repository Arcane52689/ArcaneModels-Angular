
// Unlike the BaseModel, the BaseColleciton can be used as is, without create a new one
angular.module('myProject').factroy('NewModelCollection', ['BaseCollection', 'NewModel', function(BaseCollection, NewModel) {
  var NewModelCollection = BaseCollection({
    model: NewModel,  // Whatever the model of the colleciton you want is
    url: "api/new_models" // Whatever the url for your collection is
  })

  NewModelCollection.fetch();

  return NewModelCollection
} ])

// This way creates a collection that you then have access to throughout the app whenever you inject 'NewModelCollection'
