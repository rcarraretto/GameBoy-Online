describe("dec", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("DEC A", function() {
    core.registerA = 18;
    core.OPCODE[0x3D](core);
    expect(core.registerA).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC A - underflow", function() {
    core.registerA = 0;
    core.OPCODE[0x3D](core);
    expect(core.registerA).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC A - to zero", function() {
    core.registerA = 1;
    core.OPCODE[0x3D](core);
    expect(core.registerA).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC B", function() {
    core.registerB = 18;
    core.OPCODE[0x05](core);
    expect(core.registerB).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC B - underflow", function() {
    core.registerB = 0;
    core.OPCODE[0x05](core);
    expect(core.registerB).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC B - to zero", function() {
    core.registerB = 1;
    core.OPCODE[0x05](core);
    expect(core.registerB).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC C", function() {
    core.registerC = 18;
    core.OPCODE[0x0D](core);
    expect(core.registerC).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC C - underflow", function() {
    core.registerC = 0;
    core.OPCODE[0x0D](core);
    expect(core.registerC).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC C - to zero", function() {
    core.registerC = 1;
    core.OPCODE[0x0D](core);
    expect(core.registerC).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC D", function() {
    core.registerD = 18;
    core.OPCODE[0x15](core);
    expect(core.registerD).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC D - underflow", function() {
    core.registerD = 0;
    core.OPCODE[0x15](core);
    expect(core.registerD).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC D - to zero", function() {
    core.registerD = 1;
    core.OPCODE[0x15](core);
    expect(core.registerD).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC E", function() {
    core.registerE = 18;
    core.OPCODE[0x1D](core);
    expect(core.registerE).to.equal(17);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC E - underflow", function() {
    core.registerE = 0;
    core.OPCODE[0x1D](core);
    expect(core.registerE).to.equal(255);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC E - to zero", function() {
    core.registerE = 1;
    core.OPCODE[0x1D](core);
    expect(core.registerE).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("DEC BC", function() {
    core.registerB = 1;
    core.registerC = 2;
    core.OPCODE[0x0B](core)
    expect(core.registerC).to.equal(1);
    expect(core.registerB).to.equal(1);

    // 1 to 0
    core.registerB = 0;
    core.registerC = 1;
    core.OPCODE[0x0B](core)
    expect(core.registerC).to.equal(0);
    expect(core.registerB).to.equal(0);

    // from max 16 bit number
    core.registerB = 255;
    core.registerC = 255;
    core.OPCODE[0x0B](core)
    expect(core.registerC).to.equal(254);
    expect(core.registerB).to.equal(255);

    // underflow 16 bit
    core.registerB = 0;
    core.registerC = 0;
    core.OPCODE[0x0B](core)
    expect(core.registerC).to.equal(255);
    expect(core.registerB).to.equal(255);

    // C: 0 to 255
    core.registerB = 255;
    core.registerC = 0;
    core.OPCODE[0x0B](core)
    expect(core.registerC).to.equal(255);
    expect(core.registerB).to.equal(254);
  });

  it("DEC DE", function() {
    core.registerD = 1;
    core.registerE = 2;
    core.OPCODE[0x1B](core)
    expect(core.registerE).to.equal(1);
    expect(core.registerD).to.equal(1);

    // 1 to 0
    core.registerD = 0;
    core.registerE = 1;
    core.OPCODE[0x1B](core)
    expect(core.registerE).to.equal(0);
    expect(core.registerD).to.equal(0);

    // from max 16 bit number
    core.registerD = 255;
    core.registerE = 255;
    core.OPCODE[0x1B](core)
    expect(core.registerE).to.equal(254);
    expect(core.registerD).to.equal(255);

    // underflow 16 bit
    core.registerD = 0;
    core.registerE = 0;
    core.OPCODE[0x1B](core)
    expect(core.registerE).to.equal(255);
    expect(core.registerD).to.equal(255);

    // C: 0 to 255
    core.registerD = 255;
    core.registerE = 0;
    core.OPCODE[0x1B](core)
    expect(core.registerE).to.equal(255);
    expect(core.registerD).to.equal(254);
  });

  it("DEC SP", function() {
    core.stackPointer = 18;
    core.OPCODE[0x3B](core);
    expect(core.stackPointer).to.equal(17);

    // underflow
    core.stackPointer = 0;
    core.OPCODE[0x3B](core);
    expect(core.stackPointer).to.equal(0xFFFF);
  });

});
