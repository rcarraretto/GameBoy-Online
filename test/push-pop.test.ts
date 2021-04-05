import { expect } from "chai";
import { GameBoyCore } from "../src/GameBoyCore";
import { OPCODE } from "../src/opcodes";

describe("push / pop", function () {
    var core;

    beforeEach(function () {
        core = new GameBoyCore();
        core.setupRAM();
    });

    it("PUSH BC", function () {
        core.registerB = 0xbb;
        core.registerC = 0xcc;
        core.stackPointer = 0xc099;

        OPCODE[0xc5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0xcc);
        expect(core.memory[0xc098]).to.equal(0xbb);
    });

    it("PUSH DE", function () {
        core.registerD = 0xdd;
        core.registerE = 0xee;
        core.stackPointer = 0xc099;

        OPCODE[0xd5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0xee);
        expect(core.memory[0xc098]).to.equal(0xdd);
    });

    it("PUSH HL", function () {
        core.registersHL = 0xaabb;
        core.stackPointer = 0xc099;

        OPCODE[0xe5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0xbb);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("POP BC", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0xcc;
        core.memory[0xc098] = 0xbb;

        OPCODE[0xc1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.registerC).to.equal(0xcc);
        expect(core.registerB).to.equal(0xbb);
    });

    it("POP DE", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0xee;
        core.memory[0xc098] = 0xdd;

        OPCODE[0xd1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.registerD).to.equal(0xdd);
        expect(core.registerE).to.equal(0xee);
    });

    it("POP HL", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0xbb;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xe1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.registersHL).to.equal(0xaabb);
    });

    it("PUSH AF - all flags unset", function () {
        core.registerA = 0xaa;
        core.stackPointer = 0xc099;
        core.FZero = false;
        core.FSubtract = false;
        core.FHalfCarry = false;
        core.FCarry = false;

        OPCODE[0xf5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0x00);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("PUSH AF - flag zero", function () {
        core.registerA = 0xaa;
        core.stackPointer = 0xc099;
        core.FZero = true;
        core.FSubtract = false;
        core.FHalfCarry = false;
        core.FCarry = false;

        OPCODE[0xf5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0x80);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("PUSH AF - flag subtract", function () {
        core.registerA = 0xaa;
        core.stackPointer = 0xc099;
        core.FZero = false;
        core.FSubtract = true;
        core.FHalfCarry = false;
        core.FCarry = false;

        OPCODE[0xf5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0x40);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("PUSH AF - flag half carry", function () {
        core.registerA = 0xaa;
        core.stackPointer = 0xc099;
        core.FZero = false;
        core.FSubtract = false;
        core.FHalfCarry = true;
        core.FCarry = false;

        OPCODE[0xf5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0x20);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("PUSH AF - flag carry", function () {
        core.registerA = 0xaa;
        core.stackPointer = 0xc099;
        core.FZero = false;
        core.FSubtract = false;
        core.FHalfCarry = false;
        core.FCarry = true;

        OPCODE[0xf5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0x10);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("PUSH AF - all flags set", function () {
        core.registerA = 0xaa;
        core.stackPointer = 0xc099;
        core.FZero = true;
        core.FSubtract = true;
        core.FHalfCarry = true;
        core.FCarry = true;

        OPCODE[0xf5](core);

        expect(core.stackPointer).to.equal(0xc097);
        expect(core.memory[0xc097]).to.equal(0xf0);
        expect(core.memory[0xc098]).to.equal(0xaa);
    });

    it("POP AF - all flags unset", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0x00;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xf1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.registerA).to.equal(0xaa);
    });

    it("POP AF - flag zero", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0x80;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xf1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.FZero).to.equal(true);
        expect(core.FSubtract).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.registerA).to.equal(0xaa);
    });

    it("POP AF - flag subtract", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0x40;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xf1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.registerA).to.equal(0xaa);
    });

    it("POP AF - flag half carry", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0x20;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xf1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.registerA).to.equal(0xaa);
    });

    it("POP AF - flag carry", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0x10;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xf1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.registerA).to.equal(0xaa);
    });

    it("POP AF - all flags set", function () {
        core.stackPointer = 0xc097;
        core.memory[0xc097] = 0xf0;
        core.memory[0xc098] = 0xaa;

        OPCODE[0xf1](core);

        expect(core.stackPointer).to.equal(0xc099);
        expect(core.FZero).to.equal(true);
        expect(core.FSubtract).to.equal(true);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(true);
        expect(core.registerA).to.equal(0xaa);
    });
});
