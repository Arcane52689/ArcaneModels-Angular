

describe( "BaseModel", function() {
  beforeEach(angular.mock.module('AngularModelFactory'));
  var BaseModel, BaseCollection;
  beforeEach(inject(function(_BaseModel_, _BaseCollection_) {
    BaseModel = _BaseModel_;
    BaseCollection = _BaseCollection_;
  }));

  describe(" BaseModel.parentOf", function() {
    it("should establish a prototypical inheritance of the class given", function() {
      var Child = function () {};
      expect(Child.prototype.fetch).toBeUndefined();
      BaseModel.parentOf(Child);
      expect(Child.prototype.fetch).not.toBeUndefined();
    })
  })

  describe(" prototype methods", function() {
    var $httpBackend, NewModel, createHandler, fetchHandler, updateHandler, destroyHandler, dataObject;
    beforeEach(inject(function($injector) {
      dataObject = {id: 1, one: 1, two: 2, three: 3}
      $httpBackend = $injector.get('$httpBackend');
      createHandler = $httpBackend.when('POST', '/new_model').respond(dataObject);
      fetchHandler = $httpBackend.when('GET', '/new_model/1').respond(dataObject);
      updateHandler = $httpBackend.when('PUT', '/new_model/1').respond(dataObject);
      destroyHandler = $httpBackend.when('DELETE', '/new_model/1').respond( dataObject);
      NewModel = function(data) {
        this.initialize(data);
        this.urlBase = '/new_model'
      }
      BaseModel.parentOf(NewModel);
    }))
    var model;
    beforeEach(function() { model = new NewModel(dataObject) });
    describe( "BaseModel.prototype.initialize", function() {

      it ("should use the initialize method to call updateAttributes and set _collections to an empty array", function() {
        expect(model.attributes).toEqual(dataObject)
        expect(model._collections).toBeDefined();
        expect(model._collections.length).toBe(0);
      });
    })

    describe("BaseModel.prototype.updateAttributes", function() {
      it("should set model.id if an id is present", function() {
        expect(model.id).toBeDefined();
        model = new NewModel({})
        expect(model.id).toBeUndefined();
      })

      beforeEach(function() { model.updateAttributes({one: 'one', four: 4})})

      it("should overwrite old attributes", function() {

        expect(model.attributes.one).toBe('one');
      })

      it("should add new attributes", function() {
        expect(model.attributes.four).toBe(4);
      })

      it("should not lose attributes", function() {
        expect(model.attributes.three).toBe(3);
      })
    })
    describe( "BaseModel.prototype.isNew", function() {

      it ("should determine whether or not an object is persisted using the isNew method", function() {
        model = new NewModel({});
        expect(model.isNew()).toBe(true);
        model.id = 1;
        expect(model.isNew()).toBe(false);
      } )
    })


    describe( "BaseModel.prototype.fetch", function() {
      var emptyModel
      beforeEach(function() {
        emptyModel = new NewModel({id: 1});
        $httpBackend.expectGET('/new_model/1');
      });
      it ("should fetch new data", function() {
        emptyModel.fetch();
        $httpBackend.flush();
        expect(emptyModel.attributes.one).toBe(1);
      });

      it ("should take an object with success callback", function() {
        var test
        emptyModel.fetch({
          success: function() {
            test = "success"
          }
        })
        $httpBackend.flush();
        expect(test).toBe("success")
      })

      it ("should take an object with an error callback", function() {
        var test
        fetchHandler.respond(422, '')
        emptyModel.fetch({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        })
        $httpBackend.flush();
        expect(test).toBe("error");
      })

    })

    describe("BaseModel.prototype.url", function() {
      it("should construct a url using the urlBase and the id", function() {
        expect(model.url()).toBe("/new_model/1")
      })
    })

    describe("BaseModel.prototype.save", function() {

      afterEach(function() {
        $httpBackend.resetExpectations();
      })

      it ("should make a post request isNew is true", function() {
        $httpBackend.expectPOST('/new_model');

        model.id = undefined;
        model.attributes.id = undefined
        model.save();
        $httpBackend.flush();
        expect(model.id).toBe(1);
      })

      it ("should make a put request when isNew is false", function() {
        $httpBackend.expectPUT('/new_model/1');
        model.attributes.three = false;
        model.save();
        $httpBackend.flush();
        expect(model.attributes.three).toBe(3);

      })

      it ("should take a success callback to call if the request succeeds", function() {
        var test
        $httpBackend.expectPUT('/new_model/1');
        model.save({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        })
        $httpBackend.flush();
        expect(test).toBe('success');
      })

      it ("should take a error callback to call if the request fails", function() {
        var test
        updateHandler.respond(400, '');

        $httpBackend.expectPUT('/new_model/1');
        model.save({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        })
        $httpBackend.flush();
        expect(test).toBe('error');
      })

    })

    describe("BaseModel.Prototype.destroy", function() {
      var myCollection
      beforeEach(function() {
        $httpBackend.expectDELETE('/new_model/1');
        myCollection = new BaseCollection( {
          model: NewModel
        })
        myCollection.add(model);
      })

      it('should take a succes callback', function() {
        var test
        model.destroy({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        });
        $httpBackend.flush();
        expect(test).toBe('success')
      })

      it('should take a success callback', function() {
        var test
        destroyHandler.respond(404, '')
        model.destroy({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        });
        $httpBackend.flush();
        expect(test).toBe('error')
      })

      it("should remove itself from all collections", function() {
        model.destroy();
        $httpBackend.flush();
        expect(model._collections.length).toBe(0);
      })
    })


    
  })

});
