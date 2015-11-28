describe('BaseCollection', function() {
  var BaseModel, BaseCollection, fetchHandler, dataArr, $httpBackend, data;
  beforeEach(module('AngularModelFactory'));
  beforeEach(inject(function(_BaseModel_, _BaseCollection_) {
    BaseModel = _BaseModel_;
    BaseCollection = _BaseCollection_;
  }))

  dataArr = [];
  for (var i=0; i < 100; i++) {
    data = {id: i, testing:"test #" + i, neg: 0-i }
    dataArr.push(data);
  }

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    fetchHandler = $httpBackend.when('GET', '/tests').respond(dataArr);
  }));

  describe("BaseCollection.parentOf", function() {
    it ("should establish a prototypical inheritance", function() {
      var Child = function () {};
      expect(Child.prototype.fetch).toBeUndefined();
      BaseCollection.parentOf(Child);
      expect(Child.prototype.fetch).not.toBeUndefined();
    })
  })

  describe( "BaseCollection.prototype methods", function(){
    beforeEach(function() {
      collection = new BaseCollection({
        url: '/tests'
      });
      collection.addModels(dataArr);
    })

    describe("BaseCollection.prototype.initialize", function() {
      it("should take an options object as an arument with a url and a model inside it and use them to define the attributes", function() {
        expect(collection.url).toBe('/tests');
      })

      it("should set the Model attribute to BaseModel unless otherwise specified", function() {
        expect(collection.model).toBe(BaseModel);
        collection = new BaseCollection({
          url: "",
          model: "ooga booga"
        })
        expect(collection.model).toBe('ooga booga');
      })

      it('should set the comparator to id unless otherwise specified', function() {
        expect(collection.comparator).toBe('id');
        collection = new BaseCollection({
          url: "",
          comparator: "neg"
        })
        expect(collection.comparator).toBe('neg')
      } );

      it("should set the reverse option to false unless otherwise specified", function() {
        expect(collection.reverse).toBe(false);
        collection = new BaseCollection({
          url: "",
          reverse: true
        })
        expect(collection.reverse).toBe(true);
      })
    })



    describe("BaseCollection.prototype.fetch()", function() {
      beforeEach(function() {
        $httpBackend.expectGET('/tests');
      })
      it("should add the fetched models to the collection", function() {
        collection = new BaseCollection({
          url: '/tests',
          model: BaseModel
        })
        collection.fetch();
        $httpBackend.flush();
        expect(collection.all().length).toBe(100);
      })


      it("should take a success callback", function() {
        var test
        collection.fetch({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        })
        $httpBackend.flush();
        expect(test).toBe('success')
      })

      it("should take an error callback", function() {
        var test
        fetchHandler.respond(404, '')
        collection.fetch({
          success: function() {
            test = "success"
          },
          error: function() {
            test = "error";
          }
        })
        $httpBackend.flush();
        expect(test).toBe('error')
      })
    })

    describe("Adding methods", function()  {


      describe( "BaseColleciton.prototype.add", function() {

        it("should take a model as an argument and add it to the collection", function() {
          var model = new BaseModel({id: 101})
          collection.add(model);
          expect(collection.all().length).toBe(101);
        })

        it("should add the model to the id tracker if the model has an id", function() {
          var model = new BaseModel({id: 101})
          collection.add(model);
          expect(collection.modelsById[101]).toBe(model);
        })

        it("should overwrite the attributes of an old model if the id is already present", function() {
          var model = new BaseModel({id: 50, testing: "testing"})
          collection.add(model);
          expect(collection.all().length).toBe(100);
          expect(collection.modelsById[50].attributes.testing).toBe('testing')
        })

        it("should not overwite the identity of the old model", function() {
          var model = new BaseModel({id: 50, testing: "testing"})
          model50 = collection.modelsById[50];
          collection.add(model);
          expect(collection.modelsById[50]).toBe(model50)
        })

        it("should sort the models after adding", function() {
            var model = new BaseModel({id: 0});
            collection.add(model);
            expect(collection.first().id).toBe(0);
        })

      })


      describe( "BaseCollection.prototype.addModel", function() {
        it ("should take a data object, convert it to a model, and add it to the array", function() {
          data = {id: 101};
          collection.addModel(data);
          expect(collection.modelsById[101].attributes).toBeDefined();
          expect(collection.count()).toBe(101);
        })
      })

    })

    describe(" Sorting functions", function() {
      describe( "BaseCollection.prototype.sort", function() {

        it ("should sort the models array by the comparator", function() {
          collection.sort();
          expect(collection.first().id).toBe(0);
        })

        it ("should sort the models differently if you change the comparator", function() {
          collection.comparator = "neg"
          collection.sort();
          expect(collection.first().id).toBe(99);
        })

        it ("should take a callback as an argument and sort by that callback", function() {
          var callback = function(m1,m2) {
            return 1;
          }
          collection.sort(callback)
          expect(collection.first().id).toBe(50)
        })
      })

      describe( 'BaseCollection.prototype.reverseOrder', function() {
        it("should reverse the sorted order of the array", function() {
          collection.reverseOrder();
          collection.sort();
          expect(collection.first().id).toBe(99)
        })

        it("should cancel out when used twice", function() {
          collection.reverseOrder().reverseOrder();
          collection.sort();
          expect(collection.first().id).toBe(0);

        })
      })
    })

    describe( 'Search functions ', function() {
      describe ('BaseCollection.prototype.find', function() {
        it("it should look up a model by it's id attribute", function() {
          var model = collection.find(50);
          expect(model.id).toBe(50)
        })
      })

      describe ('BaseCollection.prototype.findIndex', function() {
        it("should find a model's position in the models array", function() {
          expect(collection.findIndex(18)).toBe(18);
        })

        it("should return -1 if the index isn't found", function() {
          expect(collection.findIndex(105)).toBe(-1);
        })
      })
    })

    describe("subset functions -each should return a subset of the list", function() {
      describe("BaseCollection.prototype.where", function() {
        it ("should take a callback as an argument and return a new collection", function() {
          var result = collection.where(function(m) {
            return (m.id > 90);
          })
          expect(result.constructor).toBe(collection.constructor)
        })

        it('should return a subcollection where the callback result was true', function() {
          result = collection.where(function(m) {
            return(m.id > 90);
          })
          expect(result.count()).toBe(9);
          expect(result.any(function(m) {return m.id < 90})).toBe(false);
        });
      });

      describe("BaseCollection.prototype.all", function() {
        it("should return an array containing all the models in the collection", function() {
          result = collection.all();
          expect(result.length).toBe(100);
        })
      })

      describe("BaseCollection.prototype.first", function() {
        it ("should return the first model if no argument is given", function() {
          result = collection.first();
          expect(result).toBe(collection.models[0]);
        });

        it ("should accept an integer, n, as an argument and return an array containing the first n integers", function() {
          result = collection.first(5);
          expect(result.length).toBe(5);
        });
      });
    });
    describe(' Conditional functions - methods that take a true/false callback and check the models array against it', function() {
      describe( 'BaseCollection.prototoype.any', function() {
        it ("should take a call back as an argument and return true if it returns true for any models", function() {
          result = collection.any(function(m) { return (m.id > 90) })
          expect(result).toBe(true);
        })

        it("should return true if no callback is passed and there are any models in the collection", function() {
          expect(collection.any()).toBe(true);
        })

        it("should return false if no callback is passed and there are no models in the collection", function() {
          collection = new BaseCollection({});
          expect(collection.any()).toBe(false);
        })

      })

      describe("BaseCollection.prototype.none", function() {
        it("should take a callback as an argument and return true if none of the models return true", function() {
          result = collection.none(function(m) { m.id < 0});
          expect(result).toBe(true);
        })
        it('should return true if the collection is empty and no callback is passed', function() {
          collection = new BaseCollection({});
          expect(collection.none()).toBe(true);
        })

        it("should return false if the collection is not emty and no callback is passed", function() {
          expect(collection.none()).toBe(false);
        })
      });

      describe("BaseCollection.prototype.count", function() {

        it("should take a callback and return the total number of items for which the callback is true", function() {
          expect(collection.count(function(m) { return m.id > 90})).toBe(9)
        });


        it("should return the total number of models in the collection if no callback is passed", function() {
          expect(collection.count()).toBe(100);
        });
      });

      describe("BaseCollection.prototype.areAll", function() {
        it("should take a call back as an arugment and return true if all items meet the criteria", function() {
          result = collection.areAll(function(m) {
            return !(typeof m.id === 'undefined');
          })
          expect(result).toBe(true);
        })


      })


      describe("BaseCollection.prototype.empty", function() {
        it("should return false if the collection is not empty", function() {
          expect(collection.empty()).toBe(false);
        })

        it("should return true if the collection is empty", function()  {
          collection = collection.where(function() {return false});
          expect(collection.empty()).toBe(true);
        })
      })
    });

    describe('Iteration methods: each, map ...', function() {
      describe("BaseModel.prototype.each", function() {
        it("should iterate over each object in the array", function() {
          var num = 0;
          collection.each(function(m) {
            num += 1
          })
          expect(num).toBe(100)
        });
      });

      describe("BaseModel.prototype.map", function() {
        it ("should take a callback as an argument and return an array",function() {
          result = collection.map(function(m) { return m.id });
          expect(result.constructor).toBe([].constructor)
        })

        it ("should return an array containing all the results of the given callback", function() {
          result = collection.map(function(m) { return m.id });
          expect(result.length).toBe(100);
        })
      });
    });

    describe("Pagination Methods", function() {
      describe("BaseCollection.prototype.pages", function() {
        it("should return the total number of pages in the collection", function() {
          expect(collection.pages()).toBe(4);
        })

        it("should change the number of pages when perPage is changed", function() {
          collection.perPage = 10;
          expect(collection.pages()).toBe(10);
        })

      })

      describe("BaseCollection.prototype.getStartIndex", function() {
        it("should return 0 for the first page", function() {
          expect(collection.getStartIndex(1)).toBe(0);
        })

        it("should return perPage for the second Page", function() {
          expect(collection.getStartIndex(2)).toBe(25);
        })

      })

      describe("BaseCollection.prototype.getPage", function() {
        it("should return the first 25 items for the first page", function() {
          expect(collection.getPage(1).length).toBe(25);
          expect(collection.getPage(1)[24].id).toBe(24);
        })
      })

    })

  })







})
