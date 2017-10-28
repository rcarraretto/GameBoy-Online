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

});
