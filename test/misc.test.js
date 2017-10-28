describe("misc", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("initial values", function() {
    expect(core.registerA).to.equal(1);
  });

  it("NOP", function() {
    core.OPCODE[0x00](core)
  });

});
