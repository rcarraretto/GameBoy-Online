describe("nop", function() {
  var GameBoyCore = require('../js/GameBoyCore');
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

  it("LD A, A", function() {
    var before = _.clone(core);
    core.OPCODE[0x7F](core)

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

  it("LD B, B", function() {
    var before = _.clone(core);
    core.OPCODE[0x40](core)

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

  it("LD C, C", function() {
    var before = _.clone(core);
    core.OPCODE[0x49](core)

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

  it("LD D, D", function() {
    var before = _.clone(core);
    core.OPCODE[0x52](core)

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

  it("LD E, E", function() {
    var before = _.clone(core);
    core.OPCODE[0x5B](core)

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

  it("LD H, H", function() {
    var before = _.clone(core);
    core.OPCODE[0x64](core)

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

  it("LD L, L", function() {
    var before = _.clone(core);
    core.OPCODE[0x6D](core)

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
