describe("sub", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("SUB A, B: 1 - 1 (zero flag)", function() {
    core.registerA = 0x01;
    core.registerB = 0x01;

    core.OPCODE[0x90](core);

    expect(core.registerA).to.equal(0x00);
    expect(core.registerB).to.equal(0x01);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(true);
    expect(core.FSubtract).to.equal(true);
  });

  it("SUB A, B: 0x10 - 0x01 (half carry)", function() {
    core.registerA = 0x10;
    core.registerB = 0x01;

    core.OPCODE[0x90](core);

    expect(core.registerA).to.equal(0x0F);
    expect(core.registerB).to.equal(0x01);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FCarry).to.equal(false);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

  it("SUB A, B: 0x01 - 0x02 (carry)", function() {
    core.registerA = 0x01;
    core.registerB = 0x02;

    core.OPCODE[0x90](core);

    expect(core.registerA).to.equal(0xFF);
    expect(core.registerB).to.equal(0x02);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FCarry).to.equal(true);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(true);
  });

});
