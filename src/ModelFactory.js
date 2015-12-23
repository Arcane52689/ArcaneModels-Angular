;(function() {
  var ModelFactory = angular.module('AngularModelFactory', [])


  ModelFactory.factory( 'BaseModel', ['$http', function($http) {

    var BaseModel = function(data) {
      this.initialize(data);
      this.idIsOptional = false;
  }


    BaseModel.parentOf =  function(child) {
      var Surrogate = function() {};
      Surrogate.prototype = BaseModel.prototype;
      child.prototype  = new Surrogate();
    }

    BaseModel.prototype.initialize = function(data) {
      this.updateAttributes(data);
      this._collections = [];
    }

    BaseModel.prototype.updateAttributes = function(data) {
      data = data || {}
      this.attributes = this.attributes || {};
      for (key in data){
        if (data.hasOwnProperty) {
          this.attributes[key] = data[key];
        }
      }
      if (typeof data.id !=='undefined') {
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
      $http.post(this.url(), this._toJSON()).success(function(resp) {
        this.updateAttributes(resp);
        options.success && options.success(resp);
      }.bind(this)).error(function(resp) {
        options.error && options.error(resp);
      })
    }

    BaseModel.prototype.update = function(options) {
      $http.put(this.url(), this._toJSON()).success(function(resp) {
        this.updateAttributes(resp);
        options.success && options.success(resp);
      }.bind(this)).error(function(resp) {
        options.error && options.error(resp)
      })
    }

    BaseModel.prototype.get = function(key) {
      return this.attributes[key];
    }

    BaseModel.prototype.set = function(key, value) {
      this.attributes[key] = value;
    }

    BaseModel.prototype._toJSON = function() {
      var data, nameSpace;
      if (this.toJSON) {
        data = this.toJSON();
      } else {
        data = {}
      }
      if (data.nameSpace) {
        nameSpace = data.nameSpace;
        delete data.nameSpace;
      }
      for (key in this.attributes) {
        if (!data.hasOwnProperty(key)) {
          if (nameSpace) {
            data[nameSpace][key] = this.attributes[key]
          } else {
            data[key] = this.attributes[key]
          }
        }
      }
      return data;
    }

    BaseModel.prototype.fetch = function(options) {
      options = options || {};
      if (this.id || this.idIsOptional) {
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

    BaseModel.prototype.belongsTo = function(collection, cid) {
      this._collections.push({
        collection: collection,
        cid: cid
      })
      return this;
    }

    BaseModel.prototype.getCID = function(collection) {
      var result
      this._collections.forEach(function(c) {
        if (c.collection === collection) {
          result = c.cid
        }
      })
      return result;
    }

    BaseModel.prototype.removeFromCollections = function() {
      this._collections.forEach(function(collection) {
        collection.collection.remove(collection.cid);
      }.bind(this));
      this._collections = [];
      return this;
    }



    BaseModel.prototype.destroy = function(options) {
      options = options || {};
      if (this.id) {
        $http.delete(this.url()).success(function(resp) {
          this.removeFromCollections();
          options.success && options.success(resp)
        }.bind(this)).error(function(resp) {
          options.error && options.error(resp)
        }.bind(this))
      } else {
        this.removeFromCollections();
      }

    }




    return BaseModel;

}])

ModelFactory.factory('BaseCollection', ['$http', 'BaseModel',function($http, BaseModel) {

  var BaseCollection = function(options) {
    this.initialize(options);
  }

  BaseCollection.parentOf =  function(child) {
    var Surrogate = function() {};
    Surrogate.prototype = BaseCollection.prototype;
    child.prototype  = new Surrogate();
  }

  BaseCollection.prototype.initialize = function(options) {
    this.model = options.model || BaseModel;
    this.url = options.url;
    this.models = [];
    this.modelsById = {};
    this.modelsByCID = {};
    this.comparator = options.comparator || 'id';
    this.reverse = options.reverse || false;
    this.perPage = options.perPage || 25;
    this.searchOptions = options.searchOptions || {};
    this.currentCID = 1;
    this.isClone = false;
  }

  BaseCollection.prototype.fetch = function(options) {
    this.beforeFetch && this.beforeFetch();
    options = options || {};
    $http.get(this.url,{ params: this.searchOptions}).success(function(resp) {
      if(options.clearModels) {
        this.clearModels();
      }
      this.addModels(resp);
      options.success && options.success(resp)
    }.bind(this)).error(function(resp) {
      console.error(resp);
      options.error && options.error(resp);
    })
  }

  /* adding functions */

  BaseCollection.prototype.addModels = function(dataArr) {
    this.adding = true;
    dataArr.forEach(this.addModel.bind(this));
    this.adding = false
    this.sort();
  }

  BaseCollection.prototype.addModel = function(data) {
    var model = new this.model(data);
    this.add(model);
    return model;
  }



  BaseCollection.prototype.add = function(model) {
    if (model.id) {
      if (this.modelsById[model.id]) {
        this.modelsById[model.id].updateAttributes(model.attributes);
      } else {
        this.modelsById[model.id] = model;
        this.models.push(model);
        if (!this.isClone) {
          model.belongsTo(this, this.currentCID)
        }
        this.modelsByCID[this.currentCID] = model;
        this.currentCID += 1;
      }
    } else {
      this.models.push(model)
      if (!this.isClone) {
        model.belongsTo(this, this.currentCID)
      }
      this.modelsByCID[this.currentCID] = model;
      this.currentCID += 1;
    }
    if (!this.adding) {
      this.sort();
    }
    return model;
  }


  BaseCollection.prototype.remove = function(cid) {
    var model
    if (typeof cid === 'object') {
      model = cid;
    } else {
      model = this.modelsByCID[cid];
    }
    delete this.modelsByCID[cid];
    var index = this.findIndex(cid);
    if (index >=0) {
      this.models.splice(index, 1);
    }
    if ( model.id) {
      delete this.modelsById[model.id];
    }
  }

  BaseCollection.prototype.clearModels = function(id) {
    this.models = [];
    this.modelsById = {};
    this.modelsByCID = {};
    this.currentCID = 0
  }
  /* Sorting Functions */

  BaseCollection.prototype.reverseOrder = function() {
    this.reverse = this.reverse ? false : true;
    return this;
  }




  /* compare is a private function used to compare two models by the comparator */
  BaseCollection.prototype.compare = function(c1, c2) {
    var attribute1 = c1.get(this.comparator);
    var attribute2 = c2.get(this.comparator);
    if (typeof attribute1 === 'string') {
      attribute1 = (typeof attribute1 === 'undefined') ? 'zzzz': attribute1.toLowerCase();
      attribute2 = (typeof attribute2 === 'undefined') ? 'zzzz': attribute2.toLowerCase();
    }
    if (typeof attribute1 === 'undefined') {
      attribute1 = 100000
    }
    if (typeof attribute2 === 'undefined') {
      attribute2 = 100000
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



/* search function */



  BaseCollection.prototype.find = function(id) {
    return this.modelsById[id];
  }

  BaseCollection.prototype.findOrFetch = function(id) {
    var model = this.find(id);
    if (!model) {
      model = new this.model({id: id})
    }
    model.fetch();
    return model;
  }

  BaseCollection.prototype.findIndex = function(cid) {
    var index = -1
    this.models.forEach(function(model, idx) {
      if (model.getCID(this) === cid) {
        index = idx;
      }
    }.bind(this))
    return index;
  }
/*  subset functions */

  BaseCollection.prototype.emptyClone = function() {
    var dup = new this.constructor({
      model: this.model,
      url: this.url,
      comparator: this.comparator,
      reverse: this.reverse,
      perPage: this.perPage,
      searchOptions: this.searchOptions
    });
    dup.isClone = true;
    return dup;
  }


  BaseCollection.prototype.where = function(callback) {
    var result = this.emptyClone();
    result.adding = true
    this.models.forEach(function(model) {
      if (callback(model)) {
        result.add(model);
      }
    })
    result.sort()
    return result;
  }

  BaseCollection.prototype.all = function() {
    return this.models;
  }
  // returns the first n items in the collection. if no number is passed, it returns the first item
  BaseCollection.prototype.first = function(n) {
    n = n || 1;
    if (n=== 1) {
      return this.models[0]
    } else {
      return this.models.slice(0, n);
    }
  }

/* information functions */
  BaseCollection.prototype.any = function(callback) {
    var model
    callback = callback || function() { return true };
    for (var i = 0; i < this.models.length; i++) {
      model = this.models[i];
      if (callback(model, i)) {
        return true;
      }
    }
    return false;
  }

  BaseCollection.prototype.none = function(callback) {
    return !this.any(callback);
  }

  BaseCollection.prototype.areAll = function(callback) {
    for (var i = 0; i < this.models.length; i++) {
      if (!callback(this.models[i])) {
        return false;
      }
    }
    return true;
  }


  BaseCollection.prototype.count = function(callback) {
    callback = callback || function() { return true };
    var count = 0;
    this.each(function(model) {
      if (callback(model)) {
        count += 1;
      }
    })
    return count;
  }


  BaseCollection.prototype.empty = function() {
    return (this.models.length === 0);
  }


/* iteration function */

  BaseCollection.prototype.each = function(callback) {
      var model, idx
    for (idx = 0; idx < this.models.length; idx++) {
      model = this.models[idx];
      callback.call(this, model, idx, this.models)
    }
    return this;
  }


  BaseCollection.prototype.map = function(callback) {
    var model, result, results, i;
    results = [];
    for (i = 0; i < this.models.length; i++) {
      model = this.models[i];
      result = callback(model, i, this.models);
      results.push(result);
    }
    return results;
  }


  /* pagination */

  BaseCollection.prototype.pages = function() {
    return Math.ceil(this.models.length / this.perPage);
  }

  BaseCollection.prototype.getStartIndex = function(page) {
    return this.perPage * (page - 1);
  }




  BaseCollection.prototype.getPage = function(pageNumber) {
    return this.models.slice(this.getStartIndex(pageNumber), this.getStartIndex(pageNumber) + this.perPage);
  }


  return BaseCollection;

}])


}());
