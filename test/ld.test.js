describe("ld", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var _ = require('lodash');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  /* LD [reg8], [reg8] */

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

  it("LD H, L", function() {
    core.registersHL = 0x1832;
    core.OPCODE[0x65](core)
    expect(core.registersHL).to.equal(0x3232);
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

  it("LD L, H", function() {
    core.registersHL = 0x1832;
    core.OPCODE[0x6C](core)
    expect(core.registersHL).to.equal(0x1818);
  });



  /* LD [reg8], H */

  it("LD A, H", function() {
    core.registerA = 0x18;
    core.registersHL = 0x32AA;
    core.OPCODE[0x7C](core);
    expect(core.registerA).to.equal(0x32);
    expect(core.registersHL).to.equal(0x32AA);
  });

  it("LD B, H", function() {
    core.registerB = 0x18;
    core.registersHL = 0x32AA;
    core.OPCODE[0x44](core);
    expect(core.registerB).to.equal(0x32);
    expect(core.registersHL).to.equal(0x32AA);
  });

  it("LD C, H", function() {
    core.registerC = 0x18;
    core.registersHL = 0x32AA;
    core.OPCODE[0x4C](core);
    expect(core.registerC).to.equal(0x32);
    expect(core.registersHL).to.equal(0x32AA);
  });

  it("LD D, H", function() {
    core.registerD = 0x18;
    core.registersHL = 0x32AA;
    core.OPCODE[0x54](core);
    expect(core.registerD).to.equal(0x32);
    expect(core.registersHL).to.equal(0x32AA);
  });

  it("LD E, H", function() {
    core.registerE = 0x18;
    core.registersHL = 0x32AA;
    core.OPCODE[0x5C](core);
    expect(core.registerE).to.equal(0x32);
    expect(core.registersHL).to.equal(0x32AA);
  });



  /* LD [reg8], L */

  it("LD A, L", function() {
    core.registerA = 0x18;
    core.registersHL = 0xAA32;
    core.OPCODE[0x7D](core);
    expect(core.registerA).to.equal(0x32);
    expect(core.registersHL).to.equal(0xAA32);
  });

  it("LD B, L", function() {
    core.registerB = 0x18;
    core.registersHL = 0xAA32;
    core.OPCODE[0x45](core);
    expect(core.registerB).to.equal(0x32);
    expect(core.registersHL).to.equal(0xAA32);
  });

  it("LD C, L", function() {
    core.registerC = 0x18;
    core.registersHL = 0xAA32;
    core.OPCODE[0x4D](core);
    expect(core.registerC).to.equal(0x32);
    expect(core.registersHL).to.equal(0xAA32);
  });

  it("LD D, L", function() {
    core.registerD = 0x18;
    core.registersHL = 0xAA32;
    core.OPCODE[0x55](core);
    expect(core.registerD).to.equal(0x32);
    expect(core.registersHL).to.equal(0xAA32);
  });

  it("LD E, L", function() {
    core.registerE = 0x18;
    core.registersHL = 0xAA32;
    core.OPCODE[0x5D](core);
    expect(core.registerE).to.equal(0x32);
    expect(core.registersHL).to.equal(0xAA32);
  });



  /* LD H, [reg8] */

  it("LD H, A", function() {
    core.registersHL = 0x32AA;
    core.registerA = 0x58;
    core.OPCODE[0x67](core);
    expect(core.registersHL).to.equal(0x58AA);
    expect(core.registerA).to.equal(0x58);
  });

  it("LD H, B", function() {
    core.registersHL = 0x32AA;
    core.registerB = 0x58;
    core.OPCODE[0x60](core);
    expect(core.registersHL).to.equal(0x58AA);
    expect(core.registerB).to.equal(0x58);
  });

  it("LD H, C", function() {
    core.registersHL = 0x32AA;
    core.registerC = 0x58;
    core.OPCODE[0x61](core);
    expect(core.registersHL).to.equal(0x58AA);
    expect(core.registerC).to.equal(0x58);
  });

  it("LD H, D", function() {
    core.registersHL = 0x32AA;
    core.registerD = 0x58;
    core.OPCODE[0x62](core);
    expect(core.registersHL).to.equal(0x58AA);
    expect(core.registerD).to.equal(0x58);
  });

  it("LD H, E", function() {
    core.registersHL = 0x32AA;
    core.registerE = 0x58;
    core.OPCODE[0x63](core);
    expect(core.registersHL).to.equal(0x58AA);
    expect(core.registerE).to.equal(0x58);
  });




  /* LD L, [reg8] */

  it("LD L, A", function() {
    core.registersHL = 0xAA32;
    core.registerA = 0x58;
    core.OPCODE[0x6F](core);
    expect(core.registersHL).to.equal(0xAA58);
    expect(core.registerA).to.equal(0x58);
  });

  it("LD L, B", function() {
    core.registersHL = 0xAA32;
    core.registerB = 0x58;
    core.OPCODE[0x68](core);
    expect(core.registersHL).to.equal(0xAA58);
    expect(core.registerB).to.equal(0x58);
  });

  it("LD L, C", function() {
    core.registersHL = 0xAA32;
    core.registerC = 0x58;
    core.OPCODE[0x69](core);
    expect(core.registersHL).to.equal(0xAA58);
    expect(core.registerC).to.equal(0x58);
  });

  it("LD L, D", function() {
    core.registersHL = 0xAA32;
    core.registerD = 0x58;
    core.OPCODE[0x6A](core);
    expect(core.registersHL).to.equal(0xAA58);
    expect(core.registerD).to.equal(0x58);
  });

  it("LD L, E", function() {
    core.registersHL = 0xAA32;
    core.registerE = 0x58;
    core.OPCODE[0x6B](core);
    expect(core.registersHL).to.equal(0xAA58);
    expect(core.registerE).to.equal(0x58);
  });



  /* LD [reg8], n */

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




  /* LD [reg8], (HL) */

  it("LD A, (HL)", function() {
    core.registerA = 0x94;
    core.registersHL = 0x0100;
    core.memory[0x0100] = 0x32;
    core.OPCODE[0x7E](core)
    expect(core.registerA).to.equal(0x32);
  });

  it("LD B, (HL)", function() {
    core.registerB = 0x94;
    core.registersHL = 0x0100;
    core.memory[0x0100] = 0x32;
    core.OPCODE[0x46](core)
    expect(core.registerB).to.equal(0x32);
  });

  it("LD C, (HL)", function() {
    core.registerC = 0x94;
    core.registersHL = 0x0100;
    core.memory[0x0100] = 0x32;
    core.OPCODE[0x4E](core)
    expect(core.registerC).to.equal(0x32);
  });

  it("LD D, (HL)", function() {
    core.registerD = 0x94;
    core.registersHL = 0x0100;
    core.memory[0x0100] = 0x32;
    core.OPCODE[0x56](core)
    expect(core.registerD).to.equal(0x32);
  });

  it("LD E, (HL)", function() {
    core.registerE = 0x94;
    core.registersHL = 0x0100;
    core.memory[0x0100] = 0x32;
    core.OPCODE[0x5E](core)
    expect(core.registerE).to.equal(0x32);
  });



  /* LD [reg16], nn */

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
