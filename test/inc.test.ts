import { expect } from 'chai';
import { GameBoyCore } from '../src/GameBoyCore';
import { OPCODE } from '../src/opcodes';

describe("inc", function() {
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });

  it("INC A", function() {
    core.registerA = 18;
    OPCODE[0x3C](core);
    expect(core.registerA).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC A - overflow", function() {
    core.registerA = 0xFF;
    OPCODE[0x3C](core);
    expect(core.registerA).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC A - half carry", function() {
    core.registerA = 0x0F;
    OPCODE[0x3C](core);
    expect(core.registerA).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC B", function() {
    core.registerB = 18;
    OPCODE[0x04](core);
    expect(core.registerB).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC B - overflow", function() {
    core.registerB = 0xFF;
    OPCODE[0x04](core);
    expect(core.registerB).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC B - half carry", function() {
    core.registerB = 0x0F;
    OPCODE[0x04](core);
    expect(core.registerB).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC C", function() {
    core.registerC = 18;
    OPCODE[0x0C](core);
    expect(core.registerC).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC C - overflow", function() {
    core.registerC = 0xFF;
    OPCODE[0x0C](core);
    expect(core.registerC).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC C - half carry", function() {
    core.registerC = 0x0F;
    OPCODE[0x0C](core);
    expect(core.registerC).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC D", function() {
    core.registerD = 18;
    OPCODE[0x14](core);
    expect(core.registerD).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC D - overflow", function() {
    core.registerD = 0xFF;
    OPCODE[0x14](core);
    expect(core.registerD).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC D - half carry", function() {
    core.registerD = 0x0F;
    OPCODE[0x14](core);
    expect(core.registerD).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC E", function() {
    core.registerE = 18;
    OPCODE[0x1C](core);
    expect(core.registerE).to.equal(19);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC E - overflow", function() {
    core.registerE = 0xFF;
    OPCODE[0x1C](core);
    expect(core.registerE).to.equal(0);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC E - half carry", function() {
    core.registerE = 0x0F;
    OPCODE[0x1C](core);
    expect(core.registerE).to.equal(0x10);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC BC", function() {
    core.registerB = 1;
    core.registerC = 2;
    OPCODE[0x03](core);
    expect(core.registerC).to.equal(3);
    expect(core.registerB).to.equal(1);

    // 0 to 1
    core.registerB = 0;
    core.registerC = 0;
    OPCODE[0x03](core);
    expect(core.registerC).to.equal(1);
    expect(core.registerB).to.equal(0);

    // to max 16 bit number
    core.registerB = 255;
    core.registerC = 254;
    OPCODE[0x03](core);
    expect(core.registerC).to.equal(255);
    expect(core.registerB).to.equal(255);

    // overflow 16 bit
    core.registerB = 255;
    core.registerC = 255;
    OPCODE[0x03](core);
    expect(core.registerC).to.equal(0);
    expect(core.registerB).to.equal(0);

    // overflow C
    core.registerB = 0;
    core.registerC = 255;
    OPCODE[0x03](core);
    expect(core.registerC).to.equal(0);
    expect(core.registerB).to.equal(1);
  });

  it("INC DE", function() {
    core.registerD = 1;
    core.registerE = 2;
    OPCODE[0x13](core);
    expect(core.registerE).to.equal(3);
    expect(core.registerD).to.equal(1);

    // 0 to 1
    core.registerD = 0;
    core.registerE = 0;
    OPCODE[0x13](core);
    expect(core.registerE).to.equal(1);
    expect(core.registerD).to.equal(0);

    // to max 16 bit number
    core.registerD = 255;
    core.registerE = 254;
    OPCODE[0x13](core);
    expect(core.registerE).to.equal(255);
    expect(core.registerD).to.equal(255);

    // overflow 16 bit
    core.registerD = 255;
    core.registerE = 255;
    OPCODE[0x13](core);
    expect(core.registerE).to.equal(0);
    expect(core.registerD).to.equal(0);

    // overflow E
    core.registerD = 0;
    core.registerE = 255;
    OPCODE[0x13](core);
    expect(core.registerE).to.equal(0);
    expect(core.registerD).to.equal(1);
  });

  it("INC HL", function() {
    core.registersHL = 18;
    OPCODE[0x23](core);
    expect(core.registersHL).to.equal(19);

    // overflow 16 bits
    core.registersHL = 0xFFFF;
    OPCODE[0x23](core);
    expect(core.registersHL).to.equal(0);
  });

  it("INC H", function() {
    core.registersHL = 0x2018;
    OPCODE[0x24](core);
    expect(core.registersHL).to.equal(0x2118);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);

    // overflow H 8 bits
    core.registersHL = 0xFF18;
    OPCODE[0x24](core);
    expect(core.registersHL).to.equal(0x0018);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC L", function() {
    core.registersHL = 0x2018;
    OPCODE[0x2C](core);
    expect(core.registersHL).to.equal(0x2019);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);

    // overflow L 8 bits
    core.registersHL = 0x18FF;
    OPCODE[0x2C](core);
    expect(core.registersHL).to.equal(0x1800);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC (HL)", function() {
    core.memory[0xC001] = 0x32;
    core.registersHL = 0xC001;
    OPCODE[0x34](core);
    expect(core.memory[0xC001]).to.equal(0x33);
    expect(core.FZero).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FSubtract).to.equal(false);

    // overflow 8 bits
    core.memory[0xC001] = 0xFF;
    core.registersHL = 0xC001;
    OPCODE[0x34](core);
    expect(core.memory[0xC001]).to.equal(0x00);
    expect(core.FZero).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FSubtract).to.equal(false);
  });

  it("INC SP", function() {
    core.stackPointer = 18;
    OPCODE[0x33](core);
    expect(core.stackPointer).to.equal(19);

    // overflow
    core.stackPointer = 0xFFFF;
    OPCODE[0x33](core);
    expect(core.stackPointer).to.equal(0);
  });

});
