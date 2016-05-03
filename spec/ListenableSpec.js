describe("Listenable", function() {
  beforeEach(angular.mock.module('AngularModelFactory'));
  var Listenable;
  beforeEach(inject(function(_Listenable_) {
    Listenable = _Listenable_;
  }));

  describe("adding listeners", function() {
    var model


    describe(".on(event, callback)", function() {
      beforeEach(function() {
        model = new Listenable();
      })

      it("should increase the listener count to the object", function() {
        var count = model._listenerCount
        model.on('add', function() {
          console.log('here')
        })
        expect(model._listenerCount).toBe(count + 1);
      })

      it("should take call use the callback function whenever 'trigger' is called", function(done) {
        var test1 ="unassigned"
        expect(test1).toBe("unassigned");
        model.on('test', function() {
          test1 = 'assigned';
          expect(test1).toBe('assigned');
          done();
        });
        model.trigger('test');
      })


    })

    describe(".one(event, callback)", function() {
      var model, count;
      beforeEach(function() {
        model = new Listenable()
      })

      it("should increase the listener count", function() {
        count = model._listenerCount;
        model.one('test', function() { console.log('test')});
        expect(model._listenerCount).toBe(count + 1);
      })

      it("should remove itself from the listeners after being called", function(done) {
        count = 0;
        model.one('test', function() {
          count += 1;
          expect(count).toBe(1);
          done();
        })
        model.trigger('test');
        model.trigger('test');

      })
    })
  })


  describe('Triggers and callbacks', function() {

    describe('trigger(event)', function() {

      beforeEach(function() {
        model = new Listenable();
      })
      it("should trigger the callback functions asynchrously", function(done) {
        var test1 ="unassigned"
        expect(test1).toBe("unassigned");
        model.on('test', function() {
          test1 = 'assigned';
          done();
        });
        model.trigger('test');
        expect(test1).toBe('unassigned');
      })

      it("on('all') should trigger whenever trigger is called", function(done) {

        var test1 ="unassigned"
        expect(test1).toBe("unassigned");
        model.on('all', function() {
          test1 = 'assigned';
          expect(test1).toBe('assigned');
          done();
        });
        model.trigger('test');
      })

      it("on('all') should trigger callbacks once when trigger('all') is used", function(done) {
        var test1 = 0;

        expect(test1).toBe(0);
        model.on('all', function() {
          test1 += 1;
          console.log(test1);
          expect(test1).toBe(1);
          done();
        });
        model.trigger('all');
      })
    })

    describe("callListeners(event)", function() {

      beforeEach(function() {
        model = new Listenable();
      })

    })

  })

  describe("Removing Listeners", function() {

    describe("findEventByListenerId(id)", function() {
      var model;
      beforeEach(function() {
        model =  new Listenable();
      })

      it("should find a listener by it's id, and return an object containing it's event and index", function() {
        var listenerId1 = model.on("test", function() {});
        var listenerId2 = model.on("add", function() {});
        var listenerId3 = model.on("test", function() {});
        var result = model.findEventByListenerId(listenerId1);
        expect(result.event).toBe('test');
        expect(result.index).toBe(0);

      })
    })

  })



})