describe("LD [reg], [n]", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var _ = require('lodash');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
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

});
