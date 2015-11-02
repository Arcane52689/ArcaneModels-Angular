
app.factory('NewModel', ['BaseModel', function(BaseModel) {
  var NewModel = function(data) {
    this.initialize(data);
    this.urlBase = "api/new_url"
  }
  //This sets up the interitance structure, so that the NewModel inherits all the o
  BaseModel.parentOf(NewModel);

  return NewModel
}])
