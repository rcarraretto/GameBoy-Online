import { expect } from "chai";
import { GameBoyCore } from "../src/GameBoyCore";
import { OPCODE } from "../src/opcodes";

describe("add", function () {
    var core;

    beforeEach(function () {
        core = new GameBoyCore();
        core.setupRAM();
    });

    it("ADD A, A: 0 + 0", function () {
        core.registerA = 0x00;

        OPCODE[0x87](core);

        expect(core.registerA).to.equal(0x00);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FZero).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, A: 2 + 2", function () {
        core.registerA = 0x02;

        OPCODE[0x87](core);

        expect(core.registerA).to.equal(0x04);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, A: 127 + 127", function () {
        core.registerA = 0x7f;

        OPCODE[0x87](core);

        expect(core.registerA).to.equal(0xfe);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, A: 128 + 128", function () {
        core.registerA = 0x80;

        OPCODE[0x87](core);

        expect(core.registerA).to.equal(0x00);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, B: 0 + 0", function () {
        core.registerA = 0x00;
        core.registerB = 0x00;

        OPCODE[0x80](core);

        expect(core.registerB).to.equal(0x00);
        expect(core.registerA).to.equal(0x00);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FZero).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, B: 2 + 3", function () {
        core.registerA = 0x02;
        core.registerB = 0x03;

        OPCODE[0x80](core);

        expect(core.registerB).to.equal(0x03);
        expect(core.registerA).to.equal(0x05);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, B: 127 + 127", function () {
        core.registerA = 0x7f;
        core.registerB = 0x7f;

        OPCODE[0x80](core);

        expect(core.registerB).to.equal(0x7f);
        expect(core.registerA).to.equal(0xfe);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, B: 128 + 240", function () {
        core.registerA = 0x80;
        core.registerB = 0xf0;

        OPCODE[0x80](core);

        expect(core.registerB).to.equal(0xf0);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, C: 128 + 240", function () {
        core.registerA = 0x80;
        core.registerC = 0xf0;

        OPCODE[0x81](core);

        expect(core.registerC).to.equal(0xf0);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, D: 128 + 240", function () {
        core.registerA = 0x80;
        core.registerD = 0xf0;

        OPCODE[0x82](core);

        expect(core.registerD).to.equal(0xf0);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, E: 128 + 240", function () {
        core.registerA = 0x80;
        core.registerE = 0xf0;

        OPCODE[0x83](core);

        expect(core.registerE).to.equal(0xf0);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, H: 128 + 240", function () {
        core.registerA = 0x80;
        core.registersHL = 0xf000;

        OPCODE[0x84](core);

        expect(core.registersHL).to.equal(0xf000);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, L: 128 + 240", function () {
        core.registerA = 0x80;
        core.registersHL = 0x00f0;

        OPCODE[0x85](core);

        expect(core.registersHL).to.equal(0x00f0);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD A, (HL): 128 + 240", function () {
        core.registerA = 0x80;
        core.registersHL = 0x0100;
        core.memory[0x0100] = 0xf0;

        OPCODE[0x86](core);

        expect(core.registersHL).to.equal(0x0100);
        expect(core.registerA).to.equal(0x70);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FZero).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    /* [ADD HL, n] */

    it("ADD HL, BC: 0 + 0", function () {
        core.registersHL = 0x0000;
        core.registerB = 0x00;
        core.registerC = 0x00;
        core.FZero = false;

        OPCODE[0x09](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        // zero flag not affected
        expect(core.FZero).to.equal(false);
    });

    it("ADD HL, BC: 0x1002 + 0x0A02", function () {
        core.registersHL = 0x1002;
        core.registerB = 0x0a;
        core.registerC = 0x02;

        OPCODE[0x09](core);

        expect(core.registersHL).to.equal(0x1a04);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, BC: 0x00FF + 0x0001 (no half carry)", function () {
        core.registersHL = 0x00ff;
        core.registerB = 0x00;
        core.registerC = 0x01;

        OPCODE[0x09](core);

        expect(core.registersHL).to.equal(0x0100);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, BC: 0x0FFF + 0x0001 (half carry)", function () {
        core.registersHL = 0x0fff;
        core.registerB = 0x00;
        core.registerC = 0x01;

        OPCODE[0x09](core);

        expect(core.registersHL).to.equal(0x1000);
        // Half Carry set if carry from bit 11
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, BC: 0xFFFF + 0x0001 (carry)", function () {
        core.registersHL = 0xffff;
        core.registerB = 0x00;
        core.registerC = 0x01;

        OPCODE[0x09](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(true);
        // Carry set if carry from bit 15
        expect(core.FCarry).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, DE: 0 + 0", function () {
        core.registersHL = 0x0000;
        core.registerD = 0x00;
        core.registerE = 0x00;
        core.FZero = false;

        OPCODE[0x19](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        // zero flag not affected
        expect(core.FZero).to.equal(false);
    });

    it("ADD HL, DE: 0x1002 + 0x0A02", function () {
        core.registersHL = 0x1002;
        core.registerD = 0x0a;
        core.registerE = 0x02;

        OPCODE[0x19](core);

        expect(core.registersHL).to.equal(0x1a04);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, DE: 0x00FF + 0x0001 (no half carry)", function () {
        core.registersHL = 0x00ff;
        core.registerD = 0x00;
        core.registerE = 0x01;

        OPCODE[0x19](core);

        expect(core.registersHL).to.equal(0x0100);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, DE: 0x0FFF + 0x0001 (half carry)", function () {
        core.registersHL = 0x0fff;
        core.registerD = 0x00;
        core.registerE = 0x01;

        OPCODE[0x19](core);

        expect(core.registersHL).to.equal(0x1000);
        // Half Carry set if carry from bit 11
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, DE: 0xFFFF + 0x0001 (carry)", function () {
        core.registersHL = 0xffff;
        core.registerD = 0x00;
        core.registerE = 0x01;

        OPCODE[0x19](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(true);
        // Carry set if carry from bit 15
        expect(core.FCarry).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, HL: 0 + 0", function () {
        core.registersHL = 0x0000;
        core.FZero = false;

        OPCODE[0x29](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        // zero flag not affected
        expect(core.FZero).to.equal(false);
    });

    it("ADD HL, HL: 0x0080 + 0x0080 (no half carry)", function () {
        core.registersHL = 0x0080;

        OPCODE[0x29](core);

        expect(core.registersHL).to.equal(0x0100);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, HL: 0x0800 + 0x0800 (half carry)", function () {
        core.registersHL = 0x0800;

        OPCODE[0x29](core);

        expect(core.registersHL).to.equal(0x1000);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, HL: 0x8000 + 0x8000 (carry)", function () {
        core.registersHL = 0x8000;

        OPCODE[0x29](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, SP: 0 + 0", function () {
        core.registersHL = 0x0000;
        core.stackPointer = 0x0000;
        core.FZero = false;

        OPCODE[0x39](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
        // zero flag not affected
        expect(core.FZero).to.equal(false);
    });

    it("ADD HL, SP: 0x00FF + 0x0001 (no half carry)", function () {
        core.registersHL = 0x00ff;
        core.stackPointer = 0x0001;

        OPCODE[0x39](core);

        expect(core.registersHL).to.equal(0x0100);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, SP: 0x0FFF + 0x0001 (half carry)", function () {
        core.registersHL = 0x0fff;
        core.stackPointer = 0x0001;

        OPCODE[0x39](core);

        expect(core.registersHL).to.equal(0x1000);
        // Half Carry set if carry from bit 11
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FCarry).to.equal(false);
        expect(core.FSubtract).to.equal(false);
    });

    it("ADD HL, BC: 0xFFFF + 0x0001 (carry)", function () {
        core.registersHL = 0xffff;
        core.stackPointer = 0x0001;

        OPCODE[0x39](core);

        expect(core.registersHL).to.equal(0x0000);
        expect(core.FHalfCarry).to.equal(true);
        // Carry set if carry from bit 15
        expect(core.FCarry).to.equal(true);
        expect(core.FSubtract).to.equal(false);
    });
});
