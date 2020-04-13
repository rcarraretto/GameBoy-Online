describe("misc", function() {
  var GameBoyCore = require('../src/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("initial values", function() {
    expect(core.registerA).to.equal(1);
  });

});
