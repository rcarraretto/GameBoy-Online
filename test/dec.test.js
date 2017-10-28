describe("dec", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("DEC A", function() {
    core.registerA = 18
    core.OPCODE[0x3D](core)
    expect(core.registerA).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC A - underflow", function() {
    core.registerA = 0
    core.OPCODE[0x3D](core)
    expect(core.registerA).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC A - to zero", function() {
    core.registerA = 1
    core.OPCODE[0x3D](core)
    expect(core.registerA).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC B", function() {
    core.registerB = 18
    core.OPCODE[0x05](core)
    expect(core.registerB).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC B - underflow", function() {
    core.registerB = 0
    core.OPCODE[0x05](core)
    expect(core.registerB).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC B - to zero", function() {
    core.registerB = 1
    core.OPCODE[0x05](core)
    expect(core.registerB).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC C", function() {
    core.registerC = 18
    core.OPCODE[0x0D](core)
    expect(core.registerC).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC C - underflow", function() {
    core.registerC = 0
    core.OPCODE[0x0D](core)
    expect(core.registerC).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC C - to zero", function() {
    core.registerC = 1
    core.OPCODE[0x0D](core)
    expect(core.registerC).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC D", function() {
    core.registerD = 18
    core.OPCODE[0x15](core)
    expect(core.registerD).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC D - underflow", function() {
    core.registerD = 0
    core.OPCODE[0x15](core)
    expect(core.registerD).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC D - to zero", function() {
    core.registerD = 1
    core.OPCODE[0x15](core)
    expect(core.registerD).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC E", function() {
    core.registerE = 18
    core.OPCODE[0x1D](core)
    expect(core.registerE).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC E - underflow", function() {
    core.registerE = 0
    core.OPCODE[0x1D](core)
    expect(core.registerE).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC E - to zero", function() {
    core.registerE = 1
    core.OPCODE[0x1D](core)
    expect(core.registerE).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

});
