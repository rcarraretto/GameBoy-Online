describe("nop", function() {
  var GameBoyCore = require('../src/GameBoyCore');
  var _ = require('lodash');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
    core.registerA = 1;
    core.registerB = 2;
    core.registerC = 3;
    core.registerD = 4;
    core.registerE = 5;
    core.registersHL = 6;
  });

  it("NOP", function() {
    var before = _.clone(core);
    core.OPCODE[0x00](core)

    expect(core.registerA).to.equal(before.registerA);
    expect(core.registerB).to.equal(before.registerB);
    expect(core.registerC).to.equal(before.registerC);
    expect(core.registerD).to.equal(before.registerD);
    expect(core.registerE).to.equal(before.registerE);
    expect(core.registersHL).to.equal(before.registersHL);

    expect(core.FZero).to.equal(before.FZero);
    expect(core.FSubtract).to.equal(before.FSubtract);
    expect(core.FHalfCarry).to.equal(before.FHalfCarry);
    expect(core.FCarry).to.equal(before.FCarry);

    expect(core.stackPointer).to.equal(before.stackPointer);
    expect(core.programCounter).to.equal(before.programCounter);
  });

});
