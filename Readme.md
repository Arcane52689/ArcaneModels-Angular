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
#### Private
+ updateAttributes(data) : takes an object as the parameter and then assigns each key value pair to the attributes object. If the key already exists, it's overwritten
#### Public
+ fetch(options) fetches data, can take success and error callbacks in the options
+ get(property) : returns the value set for that property
+ set(property, value) : sets the value of property to the given value
+ isNew() : returns true if the model lacks an id property
+ url() : returns the appropriate url depending on whether or not the model has an id.
+
## Collections
