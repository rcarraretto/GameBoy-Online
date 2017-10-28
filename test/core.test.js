describe("gameboy", function() {
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

});
