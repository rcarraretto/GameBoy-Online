describe("inc", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("INC A", function() {
    core.registerA = 18
    core.OPCODE[0x3C](core)
    expect(core.registerA).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC A - overflow", function() {
    core.registerA = 0xFF
    core.OPCODE[0x3C](core)
    expect(core.registerA).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC A - half carry", function() {
    core.registerA = 0x0F
    core.OPCODE[0x3C](core)
    expect(core.registerA).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC B", function() {
    core.registerB = 18
    core.OPCODE[0x04](core)
    expect(core.registerB).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC B - overflow", function() {
    core.registerB = 0xFF
    core.OPCODE[0x04](core)
    expect(core.registerB).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC B - half carry", function() {
    core.registerB = 0x0F
    core.OPCODE[0x04](core)
    expect(core.registerB).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC C", function() {
    core.registerC = 18
    core.OPCODE[0x0C](core)
    expect(core.registerC).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC C - overflow", function() {
    core.registerC = 0xFF
    core.OPCODE[0x0C](core)
    expect(core.registerC).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC C - half carry", function() {
    core.registerC = 0x0F
    core.OPCODE[0x0C](core)
    expect(core.registerC).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC D", function() {
    core.registerD = 18
    core.OPCODE[0x14](core)
    expect(core.registerD).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC D - overflow", function() {
    core.registerD = 0xFF
    core.OPCODE[0x14](core)
    expect(core.registerD).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC D - half carry", function() {
    core.registerD = 0x0F
    core.OPCODE[0x14](core)
    expect(core.registerD).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC E", function() {
    core.registerE = 18
    core.OPCODE[0x1C](core)
    expect(core.registerE).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC E - overflow", function() {
    core.registerE = 0xFF
    core.OPCODE[0x1C](core)
    expect(core.registerE).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC E - half carry", function() {
    core.registerE = 0x0F
    core.OPCODE[0x1C](core)
    expect(core.registerE).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

});
