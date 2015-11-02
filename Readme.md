#AngularModelFactory
This is a lightweight model and collection system I created to emulate some of the functionality found in backbone.  I understand that this setup is more confusing than that of Backbone, but I really wanted this system to be usable without any additional frameworks/scripts. So that meant doing without underscore and the wondrous _extend_ method.


## Setup
To include this in your project, first you need to inject 'AngularModelFactory' into your main project.


## Models
To instantiate a model, simply type the following:
![new-model](./images/new-model1.png)
Where NewModel is the name of the model and urlBase is the portion of the url, minus the id.  For non-RESTful API's, the prototype.url() function can be overwritten. It is very important to call this.updateAttributes(data). This is function that parses the data into attributes.  

To bind the attributes to an input, you can't use the get or set methods. Instead, you must directly access the attribute, using _model.attributes.propertyName_

### Methods


#### Public
+ BaseModel.parentOf(class) : Creates an inheritance structure, establishing BaseModel as the parent class of the given class
+ initialize(data) : the initialization function. Takes the data object and calls updateAttributes. Also sets this.\_collection
+ fetch(options) fetches data, can take success and error callbacks in the options
+ get(property) : returns the value set for that property
+ set(property, value) : sets the value of property to the given value
+ isNew() : returns true if the model lacks an id property
+ url() : returns the appropriate url depending on whether or not the model has an id.
+ save(options) : attempts to create or update the model in the database depending on the result of the isNew method. Takes an options object with a success callback and an error callback
+ destroy(options) : issues a delete request to the url given _url_. If successful, it then removes itself from all collections

#### Private
+ updateAttributes(data) : takes an object as the parameter and then assigns each key value pair to the attributes object. If the key already exists, it's overwritten
+ create(options) : called by _save_ to make a post request to the server
+ update(options) : called by _save_ to make a put request to the server


## Collections
