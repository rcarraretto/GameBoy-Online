import { expect } from 'chai';
import { GameBoyCore } from '../src/GameBoyCore';
import { OPCODE } from '../src/opcodes';

describe("push / pop", function() {
  var core;

  beforeEach(function() {
    core = new GameBoyCore();
    core.setupRAM();
  });


  it("PUSH BC", function() {
    core.registerB = 0xBB;
    core.registerC = 0xCC;
    core.stackPointer = 0xC099;

    OPCODE[0xC5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xCC);
    expect(core.memory[0xC098]).to.equal(0xBB);
  });

  it("PUSH DE", function() {
    core.registerD = 0xDD;
    core.registerE = 0xEE;
    core.stackPointer = 0xC099;

    OPCODE[0xD5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xEE);
    expect(core.memory[0xC098]).to.equal(0xDD);
  });

  it("PUSH HL", function() {
    core.registersHL = 0xAABB;
    core.stackPointer = 0xC099;

    OPCODE[0xE5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xBB);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("POP BC", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0xCC;
    core.memory[0xC098] = 0xBB;

    OPCODE[0xC1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.registerC).to.equal(0xCC);
    expect(core.registerB).to.equal(0xBB);
  });

  it("POP DE", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0xEE;
    core.memory[0xC098] = 0xDD;

    OPCODE[0xD1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.registerD).to.equal(0xDD);
    expect(core.registerE).to.equal(0xEE);
  });

  it("POP HL", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0xBB;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xE1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.registersHL).to.equal(0xAABB);
  });

  it("PUSH AF - all flags unset", function() {
    core.registerA = 0xAA;
    core.stackPointer = 0xC099;
    core.FZero = false;
    core.FSubtract = false;
    core.FHalfCarry = false;
    core.FCarry = false;

    OPCODE[0xF5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0x00);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("PUSH AF - flag zero", function() {
    core.registerA = 0xAA;
    core.stackPointer = 0xC099;
    core.FZero = true;
    core.FSubtract = false;
    core.FHalfCarry = false;
    core.FCarry = false;

    OPCODE[0xF5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0x80);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("PUSH AF - flag subtract", function() {
    core.registerA = 0xAA;
    core.stackPointer = 0xC099;
    core.FZero = false;
    core.FSubtract = true;
    core.FHalfCarry = false;
    core.FCarry = false;

    OPCODE[0xF5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0x40);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("PUSH AF - flag half carry", function() {
    core.registerA = 0xAA;
    core.stackPointer = 0xC099;
    core.FZero = false;
    core.FSubtract = false;
    core.FHalfCarry = true;
    core.FCarry = false;

    OPCODE[0xF5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0x20);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("PUSH AF - flag carry", function() {
    core.registerA = 0xAA;
    core.stackPointer = 0xC099;
    core.FZero = false;
    core.FSubtract = false;
    core.FHalfCarry = false;
    core.FCarry = true;

    OPCODE[0xF5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0x10);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("PUSH AF - all flags set", function() {
    core.registerA = 0xAA;
    core.stackPointer = 0xC099;
    core.FZero = true;
    core.FSubtract = true;
    core.FHalfCarry = true;
    core.FCarry = true;

    OPCODE[0xF5](core);

    expect(core.stackPointer).to.equal(0xC097);
    expect(core.memory[0xC097]).to.equal(0xF0);
    expect(core.memory[0xC098]).to.equal(0xAA);
  });

  it("POP AF - all flags unset", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0x00;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xF1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.registerA).to.equal(0xAA);
  });

  it("POP AF - flag zero", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0x80;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xF1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.FZero).to.equal(true);
    expect(core.FSubtract).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.registerA).to.equal(0xAA);
  });

  it("POP AF - flag subtract", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0x40;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xF1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(true);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(false);
    expect(core.registerA).to.equal(0xAA);
  });

  it("POP AF - flag half carry", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0x20;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xF1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FCarry).to.equal(false);
    expect(core.registerA).to.equal(0xAA);
  });

  it("POP AF - flag carry", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0x10;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xF1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.FZero).to.equal(false);
    expect(core.FSubtract).to.equal(false);
    expect(core.FHalfCarry).to.equal(false);
    expect(core.FCarry).to.equal(true);
    expect(core.registerA).to.equal(0xAA);
  });

  it("POP AF - all flags set", function() {
    core.stackPointer = 0xC097;
    core.memory[0xC097] = 0xF0;
    core.memory[0xC098] = 0xAA;

    OPCODE[0xF1](core);

    expect(core.stackPointer).to.equal(0xC099);
    expect(core.FZero).to.equal(true);
    expect(core.FSubtract).to.equal(true);
    expect(core.FHalfCarry).to.equal(true);
    expect(core.FCarry).to.equal(true);
    expect(core.registerA).to.equal(0xAA);
  });

});
