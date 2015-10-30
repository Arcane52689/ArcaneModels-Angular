;(function() {
  var ModelFactory = angular.module('AngularModelFactory', [])


  ModelFactory.factory( 'BaseModel', ['$http', function($http) {


    BaseModel.parentOf =  function(child) {
      var Surrogate = function() {};
      Surrogate.prototype = this.prototype;
      child.prototype  = new Surrogate();
    }

    BaseModel.prototype.updateAttributes = function(data) {
      data = data || {}
      this.attributes = this.attributes || {};
      for (key in data){
        if (data.hasOwnProperty) {
          this.attributes[key] = data[key];
        }
      }
      if (data.id) {
        this.id = data.id;
      }
    }

    BaseModel.prototype.isNew = function() {
      return !this.id;
    }

    BaseModel.prototype.url = function() {
      if (this.isNew()) {
        return this.urlBase;
      } else {
        return this.urlBase + "/"+ this.id
      }
    }

    BaseModel.prototype.data = function() {
      return  this.attributes;
    }

    BaseModel.prototype.save = function(options) {
      options = options || {};
      if (this.isNew()) {
        this.create(options);
      } else {
        this.update(options);
      }
    }


    BaseModel.prototype.create = function(options) {
      $http.post(this.url(), this.attributes).success(function(resp) {
        this.updateAttributes(resp);
        options.success && options.success(resp);
      }.bind(this)).error(function(resp) {
        options.error && options.error(resp);
      })
    }

    BaseModel.prototype.update = function(options) {
      $http.put(this.url(), this.attributes).success(function(resp) {
        debugger
        this.updateAttributes(resp);
        options.success && options.success(resp);
      }.bind(this)).error(function(resp, options) {
        options.error && options.error(resp)
      })
    }

    BaseModel.prototype.get = function(key) {
      return this.attributes[key];
    }

    BaseModel.prototype.set = function(key, value) {
      this.attributes[key] = value;
    }

    BaseModel.prototype.fetch = function(options) {
      options = options || {};
      if (this.id) {
        $http.get(this.url()).success(function(resp) {
          this.updateAttributes(resp);
          options.success && options.success(resp);
        }.bind(this)).error(function(resp) {
          options.error && options.error(resp);
        })
      } else {
        console.error("Can't call fetch on an unsaved object")
      }

    }

    return BaseModel;

}])

ModelFactory.factory('BaseCollection', ['$http',function($http) {

  var BaseCollection = function(options) {
    this.initialize(options);
  }

  BaseCollection.parentOf =  function(child) {
    var Surrogate = function() {};
    Surrogate.prototype = this.prototype;
    child.prototype  = new Surrogate();
  }

  BaseCollection.prototype.initialize = function(options) {
    this.model = options.model;
    this.url = options.url
    this.models = [];
    this.modelsById = {};
    this.comparator = options.comparator || 'id';
    this.reverse = false;
  }

  BaseCollection.prototype.fetch = function(options) {
    options = options || {};
    $http.get(this.url).success(function(resp) {
      this.addModels(resp);
      options.success && options.success(resp)
    }.bind(this)).error(function(resp) {
      console.error(resp);
      options.error && options.error(resp);
    })
  }

  BaseCollection.prototype.addModels = function(dataArr) {
    this.adding = true;
    dataArr.forEach(this.addModel.bind(this));
    this.adding = false
    this.sort();
  }

  BaseCollection.prototype.addModel = function(data) {
    var model = new this.model(data);
    this.add(model);
  }

  BaseCollection.prototype.each = function(callback) {
    for (model in this.models) {
      callback(model);
    }
    return this;
  }

  BaseCollection.prototype.add = function(model) {
    if (model.id) {
      if (this.modelsById[model.id]) {
        this.modelsById[model.id].updateAttributes(model.attributes);
      } else {
        this.modelsById[model.id] = model;
        this.models.push(model);
      }
    } else {
      this.models.push(model)
    }
    if (!this.adding) {
      this.sort();
    }
  }

  BaseCollection.prototype.reverseOrder = function() {
    this.reverse = this.reverse ? false : true;
    return this;
  }



  BaseCollection.prototype.compare = function(c1, c2) {
    var attribute1 = c1.get(this.comparator);
    var attribute2 = c2.get(this.comparator);
    if (typeof attribute1 === 'string') {
      attribute1 = attribute1.toLowerCase();
      attribute2 = attribute2.toLowerCase();
    }
    if (attribute1 < attribute2) {
      return (!this.reverse) ? -1 : 1;
    } else if ( attribute1 === attribute2) {
      return 0;
    } else {
      return (!this.reverse) ? 1 : -1;
    }
  }

  BaseCollection.prototype.sort = function(callback) {
    callback = callback || this.compare.bind(this);
    this.models.sort(callback);
    return this;
  }






  BaseCollection.prototype.find = function(id) {
    return this.modelsById[id];
  }

  BaseCollection.prototype.where = function(callback) {
    var result = new BaseCollection({
      model: this.model,
      url: undefined,
      comparator: this.comparator
    })

    this.models.forEach(function(model) {
      if (callback(model)) {
        result.add(model);
      }
    })
    return result;
  }

  BaseCollection.prototype.all = function() {
    return this.models;
  }
  // returns the first n items in the collection. if no number is passed, it returns the first item
  BaseCollection.prototype.first = function(n) {
    n = n || 1;
    return this.models.splice(0, n);
  }

  return BaseCollection;

}])

}())
