describe("Listenable", function() {
  beforeEach(angular.mock.module('AngularModelFactory'));
  var Listenable;
  beforeEach(inject(function(_Listenable_) {
    Listenable = _Listenable_;
  }));

  describe("adding listeners", function() {
    var model
    beforeEach(function() {
      model = new Listenable();
    })

    describe(".on(event, callback)", function() {


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

    describe(".one(even, callback)", function() {

    })




  })



})