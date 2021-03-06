import { expect } from "chai";
import { GameBoyCore } from "../src/GameBoyCore";
import { OPCODE } from "../src/opcodes";

describe("dec", function () {
    var core;

    beforeEach(function () {
        core = new GameBoyCore();
        core.setupRAM();
    });

    it("DEC A", function () {
        core.registerA = 18;
        OPCODE[0x3d](core);
        expect(core.registerA).to.equal(17);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC A - underflow", function () {
        core.registerA = 0;
        OPCODE[0x3d](core);
        expect(core.registerA).to.equal(255);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC A - to zero", function () {
        core.registerA = 1;
        OPCODE[0x3d](core);
        expect(core.registerA).to.equal(0);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC B", function () {
        core.registerB = 18;
        OPCODE[0x05](core);
        expect(core.registerB).to.equal(17);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC B - underflow", function () {
        core.registerB = 0;
        OPCODE[0x05](core);
        expect(core.registerB).to.equal(255);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC B - to zero", function () {
        core.registerB = 1;
        OPCODE[0x05](core);
        expect(core.registerB).to.equal(0);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC C", function () {
        core.registerC = 18;
        OPCODE[0x0d](core);
        expect(core.registerC).to.equal(17);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC C - underflow", function () {
        core.registerC = 0;
        OPCODE[0x0d](core);
        expect(core.registerC).to.equal(255);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC C - to zero", function () {
        core.registerC = 1;
        OPCODE[0x0d](core);
        expect(core.registerC).to.equal(0);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC D", function () {
        core.registerD = 18;
        OPCODE[0x15](core);
        expect(core.registerD).to.equal(17);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC D - underflow", function () {
        core.registerD = 0;
        OPCODE[0x15](core);
        expect(core.registerD).to.equal(255);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC D - to zero", function () {
        core.registerD = 1;
        OPCODE[0x15](core);
        expect(core.registerD).to.equal(0);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC E", function () {
        core.registerE = 18;
        OPCODE[0x1d](core);
        expect(core.registerE).to.equal(17);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC E - underflow", function () {
        core.registerE = 0;
        OPCODE[0x1d](core);
        expect(core.registerE).to.equal(255);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC E - to zero", function () {
        core.registerE = 1;
        OPCODE[0x1d](core);
        expect(core.registerE).to.equal(0);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC BC", function () {
        core.registerB = 1;
        core.registerC = 2;
        OPCODE[0x0b](core);
        expect(core.registerC).to.equal(1);
        expect(core.registerB).to.equal(1);

        // 1 to 0
        core.registerB = 0;
        core.registerC = 1;
        OPCODE[0x0b](core);
        expect(core.registerC).to.equal(0);
        expect(core.registerB).to.equal(0);

        // from max 16 bit number
        core.registerB = 255;
        core.registerC = 255;
        OPCODE[0x0b](core);
        expect(core.registerC).to.equal(254);
        expect(core.registerB).to.equal(255);

        // underflow 16 bit
        core.registerB = 0;
        core.registerC = 0;
        OPCODE[0x0b](core);
        expect(core.registerC).to.equal(255);
        expect(core.registerB).to.equal(255);

        // Register C: from 0 to 255
        core.registerB = 255;
        core.registerC = 0;
        OPCODE[0x0b](core);
        expect(core.registerC).to.equal(255);
        expect(core.registerB).to.equal(254);
    });

    it("DEC DE", function () {
        core.registerD = 1;
        core.registerE = 2;
        OPCODE[0x1b](core);
        expect(core.registerE).to.equal(1);
        expect(core.registerD).to.equal(1);

        // 1 to 0
        core.registerD = 0;
        core.registerE = 1;
        OPCODE[0x1b](core);
        expect(core.registerE).to.equal(0);
        expect(core.registerD).to.equal(0);

        // from max 16 bit number
        core.registerD = 255;
        core.registerE = 255;
        OPCODE[0x1b](core);
        expect(core.registerE).to.equal(254);
        expect(core.registerD).to.equal(255);

        // underflow 16 bit
        core.registerD = 0;
        core.registerE = 0;
        OPCODE[0x1b](core);
        expect(core.registerE).to.equal(255);
        expect(core.registerD).to.equal(255);

        // Register E: from 0 to 255
        core.registerD = 255;
        core.registerE = 0;
        OPCODE[0x1b](core);
        expect(core.registerE).to.equal(255);
        expect(core.registerD).to.equal(254);
    });

    it("DEC HL", function () {
        core.registersHL = 18;
        OPCODE[0x2b](core);
        expect(core.registersHL).to.equal(17);

        // underflow
        core.registersHL = 0;
        OPCODE[0x2b](core);
        expect(core.registersHL).to.equal(0xffff);
    });

    it("DEC H", function () {
        core.registersHL = 0x1820;
        OPCODE[0x25](core);
        expect(core.registersHL).to.equal(0x1720);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);

        // underflow
        core.registersHL = 0x0020;
        OPCODE[0x25](core);
        expect(core.registersHL).to.equal(0xff20);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);

        // zero flag
        core.registersHL = 0x0120;
        OPCODE[0x25](core);
        expect(core.registersHL).to.equal(0x0020);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC L", function () {
        core.registersHL = 0x1821;
        OPCODE[0x2d](core);
        expect(core.registersHL).to.equal(0x1820);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);

        // underflow
        core.registersHL = 0x1900;
        OPCODE[0x2d](core);
        expect(core.registersHL).to.equal(0x19ff);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);

        // zero flag
        core.registersHL = 0x1901;
        OPCODE[0x2d](core);
        expect(core.registersHL).to.equal(0x1900);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC (HL)", function () {
        core.memory[0xc001] = 0x32;
        core.registersHL = 0xc001;
        OPCODE[0x35](core);
        expect(core.memory[0xc001]).to.equal(0x31);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);

        // underflow 8 bits
        core.memory[0xc001] = 0x00;
        core.registersHL = 0xc001;
        OPCODE[0x35](core);
        expect(core.memory[0xc001]).to.equal(0xff);
        expect(core.FZero).to.equal(false);
        expect(core.FHalfCarry).to.equal(true);
        expect(core.FSubtract).to.equal(true);

        // zero flag
        core.memory[0xc001] = 0x01;
        core.registersHL = 0xc001;
        OPCODE[0x35](core);
        expect(core.memory[0xc001]).to.equal(0x00);
        expect(core.FZero).to.equal(true);
        expect(core.FHalfCarry).to.equal(false);
        expect(core.FSubtract).to.equal(true);
    });

    it("DEC SP", function () {
        core.stackPointer = 18;
        OPCODE[0x3b](core);
        expect(core.stackPointer).to.equal(17);

        // underflow
        core.stackPointer = 0;
        OPCODE[0x3b](core);
        expect(core.stackPointer).to.equal(0xffff);
    });
});
