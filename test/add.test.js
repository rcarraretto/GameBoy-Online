describe("add", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("ADD A, A: 0 + 0", function() {
    core.registerA = 0x00;

    core.OPCODE[0x87](core);

    expect(core.registerA).to.equal(0x00);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, A: 2 + 2", function() {
    core.registerA = 0x02;

    core.OPCODE[0x87](core);

    expect(core.registerA).to.equal(0x04);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, A: 127 + 127", function() {
    core.registerA = 0x7F;

    core.OPCODE[0x87](core);

    expect(core.registerA).to.equal(0xFE);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, A: 128 + 128", function() {
    core.registerA = 0x80;

    core.OPCODE[0x87](core);

    expect(core.registerA).to.equal(0x00);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(true);
    expect(core.FZero).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, B: 0 + 0", function() {
    core.registerA = 0x00;
    core.registerB = 0x00;

    core.OPCODE[0x80](core);

    expect(core.registerB).to.equal(0x00);
    expect(core.registerA).to.equal(0x00);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, B: 2 + 3", function() {
    core.registerA = 0x02;
    core.registerB = 0x03;

    core.OPCODE[0x80](core);

    expect(core.registerB).to.equal(0x03);
    expect(core.registerA).to.equal(0x05);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, B: 127 + 127", function() {
    core.registerA = 0x7F;
    core.registerB = 0x7F;

    core.OPCODE[0x80](core);

    expect(core.registerB).to.equal(0x7F);
    expect(core.registerA).to.equal(0xFE);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, B: 128 + 240", function() {
    core.registerA = 0x80;
    core.registerB = 0xF0;

    core.OPCODE[0x80](core);

    expect(core.registerB).to.equal(0xF0);
    expect(core.registerA).to.equal(0x70);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(true);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, C: 128 + 240", function() {
    core.registerA = 0x80;
    core.registerC = 0xF0;

    core.OPCODE[0x81](core);

    expect(core.registerC).to.equal(0xF0);
    expect(core.registerA).to.equal(0x70);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(true);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, D: 128 + 240", function() {
    core.registerA = 0x80;
    core.registerD = 0xF0;

    core.OPCODE[0x82](core);

    expect(core.registerD).to.equal(0xF0);
    expect(core.registerA).to.equal(0x70);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(true);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("ADD A, E: 128 + 240", function() {
    core.registerA = 0x80;
    core.registerE = 0xF0;

    core.OPCODE[0x83](core);

    expect(core.registerE).to.equal(0xF0);
    expect(core.registerA).to.equal(0x70);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(true);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

});
