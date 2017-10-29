describe("ld", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var _ = require('lodash');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
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

  it("LD A, B", function() {
    core.registerA = 0x18;
    core.registerB = 0x32;
    core.OPCODE[0x78](core)
    expect(core.registerA).to.equal(0x32);
    expect(core.registerB).to.equal(0x32);
  });

  it("LD A, C", function() {
    core.registerA = 0x18;
    core.registerC = 0x32;
    core.OPCODE[0x79](core)
    expect(core.registerA).to.equal(0x32);
    expect(core.registerC).to.equal(0x32);
  });

  it("LD A, D", function() {
    core.registerA = 0x18;
    core.registerD = 0x32;
    core.OPCODE[0x7A](core)
    expect(core.registerA).to.equal(0x32);
    expect(core.registerD).to.equal(0x32);
  });

  it("LD A, E", function() {
    core.registerA = 0x18;
    core.registerE = 0x32;
    core.OPCODE[0x7B](core)
    expect(core.registerA).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
  });

  it("LD B, A", function() {
    core.registerB = 0x32;
    core.registerA = 0x18;
    core.OPCODE[0x47](core)
    expect(core.registerB).to.equal(0x18);
    expect(core.registerA).to.equal(0x18);
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

  it("LD B, C", function() {
    core.registerB = 0x32;
    core.registerC = 0x18;
    core.OPCODE[0x41](core)
    expect(core.registerB).to.equal(0x18);
    expect(core.registerC).to.equal(0x18);
  });

  it("LD B, D", function() {
    core.registerB = 0x32;
    core.registerD = 0x18;
    core.OPCODE[0x42](core)
    expect(core.registerB).to.equal(0x18);
    expect(core.registerD).to.equal(0x18);
  });

  it("LD B, E", function() {
    core.registerB = 0x32;
    core.registerE = 0x18;
    core.OPCODE[0x43](core)
    expect(core.registerB).to.equal(0x18);
    expect(core.registerE).to.equal(0x18);
  });

  it("LD C, A", function() {
    core.registerC = 0x18;
    core.registerA = 0x32;
    core.OPCODE[0x4F](core)
    expect(core.registerC).to.equal(0x32);
    expect(core.registerA).to.equal(0x32);
  });

  it("LD C, B", function() {
    core.registerC = 0x18;
    core.registerB = 0x32;
    core.OPCODE[0x48](core)
    expect(core.registerC).to.equal(0x32);
    expect(core.registerB).to.equal(0x32);
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

  it("LD C, D", function() {
    core.registerC = 0x18;
    core.registerD = 0x32;
    core.OPCODE[0x4A](core)
    expect(core.registerC).to.equal(0x32);
    expect(core.registerD).to.equal(0x32);
  });

  it("LD C, E", function() {
    core.registerC = 0x18;
    core.registerE = 0x32;
    core.OPCODE[0x4B](core)
    expect(core.registerC).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
  });

  it("LD D, A", function() {
    core.registerD = 0x18;
    core.registerA = 0x32;
    core.OPCODE[0x57](core)
    expect(core.registerD).to.equal(0x32);
    expect(core.registerA).to.equal(0x32);
  });

  it("LD D, B", function() {
    core.registerD = 0x18;
    core.registerB = 0x32;
    core.OPCODE[0x50](core)
    expect(core.registerD).to.equal(0x32);
    expect(core.registerB).to.equal(0x32);
  });

  it("LD D, C", function() {
    core.registerD = 0x18;
    core.registerC = 0x32;
    core.OPCODE[0x51](core)
    expect(core.registerD).to.equal(0x32);
    expect(core.registerC).to.equal(0x32);
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

  it("LD D, E", function() {
    core.registerD = 0x18;
    core.registerE = 0x32;
    core.OPCODE[0x53](core)
    expect(core.registerD).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
  });

  it("LD E, A", function() {
    core.registerE = 0x18;
    core.registerA = 0x32;
    core.OPCODE[0x5F](core)
    expect(core.registerA).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
  });

  it("LD E, B", function() {
    core.registerE = 0x18;
    core.registerB = 0x32;
    core.OPCODE[0x58](core)
    expect(core.registerB).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
  });

  it("LD E, C", function() {
    core.registerE = 0x18;
    core.registerC = 0x32;
    core.OPCODE[0x59](core)
    expect(core.registerC).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
  });

  it("LD E, D", function() {
    core.registerE = 0x18;
    core.registerD = 0x32;
    core.OPCODE[0x5A](core)
    expect(core.registerD).to.equal(0x32);
    expect(core.registerE).to.equal(0x32);
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

  it("LD A, n", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;

    core.OPCODE[0x3E](core)

    expect(core.registerA).to.equal(0x32);
    expect(core.programCounter).to.equal(0x0101);
  });

  it("LD B, n", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;

    core.OPCODE[0x06](core)

    expect(core.registerB).to.equal(0x32);
    expect(core.programCounter).to.equal(0x0101);
  });

  it("LD C, n", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;

    core.OPCODE[0x0E](core)

    expect(core.registerC).to.equal(0x32);
    expect(core.programCounter).to.equal(0x0101);
  });

  it("LD D, n", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;

    core.OPCODE[0x16](core)

    expect(core.registerD).to.equal(0x32);
    expect(core.programCounter).to.equal(0x0101);
  });

  it("LD E, n", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;

    core.OPCODE[0x1E](core)

    expect(core.registerE).to.equal(0x32);
    expect(core.programCounter).to.equal(0x0101);
  });

  it("LD BC, nn", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;
    core.memory[0x0101] = 0x33;

    core.OPCODE[0x01](core)

    expect(core.registerC).to.equal(0x32);
    expect(core.registerB).to.equal(0x33);
    expect(core.programCounter).to.equal(0x0102);
  });

  it("LD DE, nn", function() {
    core.programCounter = 0x0100;
    core.memory[0x0100] = 0x32;
    core.memory[0x0101] = 0x33;

    core.OPCODE[0x11](core)

    expect(core.registerE).to.equal(0x32);
    expect(core.registerD).to.equal(0x33);
    expect(core.programCounter).to.equal(0x0102);
  });

  it("LD A, (BC)", function() {
    core.registerB = 0x02;
    core.registerC = 0xAB;
    core.memory[0x02AB] = 0x32;

    core.OPCODE[0x0A](core)

    expect(core.registerA).to.equal(0x32);
  });

  it("LD A, (DE)", function() {
    core.registerD = 0x02;
    core.registerE = 0xAB;
    core.memory[0x02AB] = 0x32;

    core.OPCODE[0x1A](core)

    expect(core.registerA).to.equal(0x32);
  });

  it("LD (BC), A", function() {
    core.registerB = 0xC0;
    core.registerC = 0x01;
    core.registerA = 0x32;

    core.OPCODE[0x02](core)

    // this memory segment is "write normal"
    // 0xC000 < x < 0xE000
    expect(core.memory[0xC001]).to.equal(0x32);
  });

  it("LD (DE), A", function() {
    core.registerD = 0xC0;
    core.registerE = 0x01;
    core.registerA = 0x32;

    core.OPCODE[0x12](core)

    // this memory segment is "write normal"
    // 0xC000 < x < 0xE000
    expect(core.memory[0xC001]).to.equal(0x32);
  });

});
