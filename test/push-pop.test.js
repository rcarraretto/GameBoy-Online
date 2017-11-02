describe("push / pop", function() {
  var GameBoyCore = require('../js/GameBoyCore');
  var _ = require('lodash');
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });


  it("PUSH BC", function() {
    core.registerB = 0xBB;
    core.registerC = 0xCC;
    core.stackPointer = 0xC099;

    core.OPCODE[0xC5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xCC);
    expect(core.memory[0xC098]).to.equal(0xBB);
  });

  it("PUSH DE", function() {
    core.registerD = 0xDD;
    core.registerE = 0xEE;
    core.stackPointer = 0xC099;

    core.OPCODE[0xD5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xEE);
    expect(core.memory[0xC098]).to.equal(0xDD);
  });

  it("PUSH HL", function() {
    core.registersHL = 0xAABB;
    core.stackPointer = 0xC099;

    core.OPCODE[0xE5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xBB);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

});
