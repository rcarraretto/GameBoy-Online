import { expect } from "chai";
import { GameBoyCore } from "../src/GameBoyCore";
import * as _ from "lodash";
import { OPCODE } from "../src/opcodes";

describe("ld", function () {
    var core;

    beforeEach(function () {
        core = new GameBoyCore();
        core.setupRAM();
    });

    /* LD [reg8], [reg8] */

    it("LD A, A", function () {
        var before = _.clone(core);
        OPCODE[0x7f](core);

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

    it("LD A, B", function () {
        core.registerA = 0x18;
        core.registerB = 0x32;
        OPCODE[0x78](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registerB).to.equal(0x32);
    });

    it("LD A, C", function () {
        core.registerA = 0x18;
        core.registerC = 0x32;
        OPCODE[0x79](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registerC).to.equal(0x32);
    });

    it("LD A, D", function () {
        core.registerA = 0x18;
        core.registerD = 0x32;
        OPCODE[0x7a](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registerD).to.equal(0x32);
    });

    it("LD A, E", function () {
        core.registerA = 0x18;
        core.registerE = 0x32;
        OPCODE[0x7b](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD B, A", function () {
        core.registerB = 0x32;
        core.registerA = 0x18;
        OPCODE[0x47](core);
        expect(core.registerB).to.equal(0x18);
        expect(core.registerA).to.equal(0x18);
    });

    it("LD B, B", function () {
        var before = _.clone(core);
        OPCODE[0x40](core);

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

    it("LD B, C", function () {
        core.registerB = 0x32;
        core.registerC = 0x18;
        OPCODE[0x41](core);
        expect(core.registerB).to.equal(0x18);
        expect(core.registerC).to.equal(0x18);
    });

    it("LD B, D", function () {
        core.registerB = 0x32;
        core.registerD = 0x18;
        OPCODE[0x42](core);
        expect(core.registerB).to.equal(0x18);
        expect(core.registerD).to.equal(0x18);
    });

    it("LD B, E", function () {
        core.registerB = 0x32;
        core.registerE = 0x18;
        OPCODE[0x43](core);
        expect(core.registerB).to.equal(0x18);
        expect(core.registerE).to.equal(0x18);
    });

    it("LD C, A", function () {
        core.registerC = 0x18;
        core.registerA = 0x32;
        OPCODE[0x4f](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registerA).to.equal(0x32);
    });

    it("LD C, B", function () {
        core.registerC = 0x18;
        core.registerB = 0x32;
        OPCODE[0x48](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registerB).to.equal(0x32);
    });

    it("LD C, C", function () {
        var before = _.clone(core);
        OPCODE[0x49](core);

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

    it("LD C, D", function () {
        core.registerC = 0x18;
        core.registerD = 0x32;
        OPCODE[0x4a](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registerD).to.equal(0x32);
    });

    it("LD C, E", function () {
        core.registerC = 0x18;
        core.registerE = 0x32;
        OPCODE[0x4b](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD D, A", function () {
        core.registerD = 0x18;
        core.registerA = 0x32;
        OPCODE[0x57](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registerA).to.equal(0x32);
    });

    it("LD D, B", function () {
        core.registerD = 0x18;
        core.registerB = 0x32;
        OPCODE[0x50](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registerB).to.equal(0x32);
    });

    it("LD D, C", function () {
        core.registerD = 0x18;
        core.registerC = 0x32;
        OPCODE[0x51](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registerC).to.equal(0x32);
    });

    it("LD D, D", function () {
        var before = _.clone(core);
        OPCODE[0x52](core);

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

    it("LD D, E", function () {
        core.registerD = 0x18;
        core.registerE = 0x32;
        OPCODE[0x53](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD E, A", function () {
        core.registerE = 0x18;
        core.registerA = 0x32;
        OPCODE[0x5f](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD E, B", function () {
        core.registerE = 0x18;
        core.registerB = 0x32;
        OPCODE[0x58](core);
        expect(core.registerB).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD E, C", function () {
        core.registerE = 0x18;
        core.registerC = 0x32;
        OPCODE[0x59](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD E, D", function () {
        core.registerE = 0x18;
        core.registerD = 0x32;
        OPCODE[0x5a](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD E, E", function () {
        var before = _.clone(core);
        OPCODE[0x5b](core);

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

    it("LD SP, HL", function () {
        core.registersHL = 0xabcd;
        core.stackPointer = 0x0000;
        OPCODE[0xf9](core);
        expect(core.registersHL).to.equal(0xabcd);
        expect(core.stackPointer).to.equal(0xabcd);
    });

    it("LD H, H", function () {
        var before = _.clone(core);
        OPCODE[0x64](core);

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

    it("LD H, L", function () {
        core.registersHL = 0x1832;
        OPCODE[0x65](core);
        expect(core.registersHL).to.equal(0x3232);
    });

    it("LD L, L", function () {
        var before = _.clone(core);
        OPCODE[0x6d](core);

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

    it("LD L, H", function () {
        core.registersHL = 0x1832;
        OPCODE[0x6c](core);
        expect(core.registersHL).to.equal(0x1818);
    });

    /* LD [reg8], H */

    it("LD A, H", function () {
        core.registerA = 0x18;
        core.registersHL = 0x32aa;
        OPCODE[0x7c](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registersHL).to.equal(0x32aa);
    });

    it("LD B, H", function () {
        core.registerB = 0x18;
        core.registersHL = 0x32aa;
        OPCODE[0x44](core);
        expect(core.registerB).to.equal(0x32);
        expect(core.registersHL).to.equal(0x32aa);
    });

    it("LD C, H", function () {
        core.registerC = 0x18;
        core.registersHL = 0x32aa;
        OPCODE[0x4c](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registersHL).to.equal(0x32aa);
    });

    it("LD D, H", function () {
        core.registerD = 0x18;
        core.registersHL = 0x32aa;
        OPCODE[0x54](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registersHL).to.equal(0x32aa);
    });

    it("LD E, H", function () {
        core.registerE = 0x18;
        core.registersHL = 0x32aa;
        OPCODE[0x5c](core);
        expect(core.registerE).to.equal(0x32);
        expect(core.registersHL).to.equal(0x32aa);
    });

    /* LD [reg8], L */

    it("LD A, L", function () {
        core.registerA = 0x18;
        core.registersHL = 0xaa32;
        OPCODE[0x7d](core);
        expect(core.registerA).to.equal(0x32);
        expect(core.registersHL).to.equal(0xaa32);
    });

    it("LD B, L", function () {
        core.registerB = 0x18;
        core.registersHL = 0xaa32;
        OPCODE[0x45](core);
        expect(core.registerB).to.equal(0x32);
        expect(core.registersHL).to.equal(0xaa32);
    });

    it("LD C, L", function () {
        core.registerC = 0x18;
        core.registersHL = 0xaa32;
        OPCODE[0x4d](core);
        expect(core.registerC).to.equal(0x32);
        expect(core.registersHL).to.equal(0xaa32);
    });

    it("LD D, L", function () {
        core.registerD = 0x18;
        core.registersHL = 0xaa32;
        OPCODE[0x55](core);
        expect(core.registerD).to.equal(0x32);
        expect(core.registersHL).to.equal(0xaa32);
    });

    it("LD E, L", function () {
        core.registerE = 0x18;
        core.registersHL = 0xaa32;
        OPCODE[0x5d](core);
        expect(core.registerE).to.equal(0x32);
        expect(core.registersHL).to.equal(0xaa32);
    });

    /* LD H, [reg8] */

    it("LD H, A", function () {
        core.registersHL = 0x32aa;
        core.registerA = 0x58;
        OPCODE[0x67](core);
        expect(core.registersHL).to.equal(0x58aa);
        expect(core.registerA).to.equal(0x58);
    });

    it("LD H, B", function () {
        core.registersHL = 0x32aa;
        core.registerB = 0x58;
        OPCODE[0x60](core);
        expect(core.registersHL).to.equal(0x58aa);
        expect(core.registerB).to.equal(0x58);
    });

    it("LD H, C", function () {
        core.registersHL = 0x32aa;
        core.registerC = 0x58;
        OPCODE[0x61](core);
        expect(core.registersHL).to.equal(0x58aa);
        expect(core.registerC).to.equal(0x58);
    });

    it("LD H, D", function () {
        core.registersHL = 0x32aa;
        core.registerD = 0x58;
        OPCODE[0x62](core);
        expect(core.registersHL).to.equal(0x58aa);
        expect(core.registerD).to.equal(0x58);
    });

    it("LD H, E", function () {
        core.registersHL = 0x32aa;
        core.registerE = 0x58;
        OPCODE[0x63](core);
        expect(core.registersHL).to.equal(0x58aa);
        expect(core.registerE).to.equal(0x58);
    });

    /* LD L, [reg8] */

    it("LD L, A", function () {
        core.registersHL = 0xaa32;
        core.registerA = 0x58;
        OPCODE[0x6f](core);
        expect(core.registersHL).to.equal(0xaa58);
        expect(core.registerA).to.equal(0x58);
    });

    it("LD L, B", function () {
        core.registersHL = 0xaa32;
        core.registerB = 0x58;
        OPCODE[0x68](core);
        expect(core.registersHL).to.equal(0xaa58);
        expect(core.registerB).to.equal(0x58);
    });

    it("LD L, C", function () {
        core.registersHL = 0xaa32;
        core.registerC = 0x58;
        OPCODE[0x69](core);
        expect(core.registersHL).to.equal(0xaa58);
        expect(core.registerC).to.equal(0x58);
    });

    it("LD L, D", function () {
        core.registersHL = 0xaa32;
        core.registerD = 0x58;
        OPCODE[0x6a](core);
        expect(core.registersHL).to.equal(0xaa58);
        expect(core.registerD).to.equal(0x58);
    });

    it("LD L, E", function () {
        core.registersHL = 0xaa32;
        core.registerE = 0x58;
        OPCODE[0x6b](core);
        expect(core.registersHL).to.equal(0xaa58);
        expect(core.registerE).to.equal(0x58);
    });

    /* LD [reg8], n */

    it("LD A, n", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x3e](core);

        expect(core.registerA).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0101);
    });

    it("LD B, n", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x06](core);

        expect(core.registerB).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0101);
    });

    it("LD C, n", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x0e](core);

        expect(core.registerC).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0101);
    });

    it("LD D, n", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x16](core);

        expect(core.registerD).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0101);
    });

    it("LD E, n", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x1e](core);

        expect(core.registerE).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0101);
    });

    it("LD H, n", function () {
        core.registersHL = 0xaabb;
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x26](core);

        expect(core.registersHL).to.equal(0x32bb);
        expect(core.programCounter).to.equal(0x0101);
    });

    it("LD L, n", function () {
        core.registersHL = 0xaabb;
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x2e](core);

        expect(core.registersHL).to.equal(0xaa32);
        expect(core.programCounter).to.equal(0x0101);
    });

    /* LD [reg8], (HL) */

    it("LD A, (HL)", function () {
        core.registerA = 0x94;
        core.registersHL = 0x0100;
        core.memory[0x0100] = 0x32;
        OPCODE[0x7e](core);
        expect(core.registerA).to.equal(0x32);
    });

    it("LD B, (HL)", function () {
        core.registerB = 0x94;
        core.registersHL = 0x0100;
        core.memory[0x0100] = 0x32;
        OPCODE[0x46](core);
        expect(core.registerB).to.equal(0x32);
    });

    it("LD C, (HL)", function () {
        core.registerC = 0x94;
        core.registersHL = 0x0100;
        core.memory[0x0100] = 0x32;
        OPCODE[0x4e](core);
        expect(core.registerC).to.equal(0x32);
    });

    it("LD D, (HL)", function () {
        core.registerD = 0x94;
        core.registersHL = 0x0100;
        core.memory[0x0100] = 0x32;
        OPCODE[0x56](core);
        expect(core.registerD).to.equal(0x32);
    });

    it("LD E, (HL)", function () {
        core.registerE = 0x94;
        core.registersHL = 0x0100;
        core.memory[0x0100] = 0x32;
        OPCODE[0x5e](core);
        expect(core.registerE).to.equal(0x32);
    });

    it("LD H, (HL)", function () {
        core.registersHL = 0x01ab;
        core.memory[0x01ab] = 0x32;
        OPCODE[0x66](core);
        expect(core.registersHL).to.equal(0x32ab);
    });

    it("LD L, (HL)", function () {
        core.registersHL = 0x01ab;
        core.memory[0x01ab] = 0x32;
        OPCODE[0x6e](core);
        expect(core.registersHL).to.equal(0x0132);
    });

    /* LD (HL), [reg8] */

    it("LD (HL), A", function () {
        core.registersHL = 0xc001;
        core.registerA = 0x32;

        OPCODE[0x77](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (HL), B", function () {
        core.registersHL = 0xc001;
        core.registerB = 0x32;

        OPCODE[0x70](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (HL), C", function () {
        core.registersHL = 0xc001;
        core.registerC = 0x32;

        OPCODE[0x71](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (HL), D", function () {
        core.registersHL = 0xc001;
        core.registerD = 0x32;

        OPCODE[0x72](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (HL), E", function () {
        core.registersHL = 0xc001;
        core.registerE = 0x32;

        OPCODE[0x73](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (HL), H", function () {
        core.registersHL = 0xc001;

        OPCODE[0x74](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0xc0);
    });

    it("LD (HL), L", function () {
        core.registersHL = 0xc001;

        OPCODE[0x75](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x01);
    });

    it("LD (HL), n", function () {
        core.registersHL = 0xc001;
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;

        OPCODE[0x36](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    /* LD [reg16], nn */

    it("LD BC, nn", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;
        core.memory[0x0101] = 0x33;

        OPCODE[0x01](core);

        expect(core.registerC).to.equal(0x32);
        expect(core.registerB).to.equal(0x33);
        expect(core.programCounter).to.equal(0x0102);
    });

    it("LD DE, nn", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;
        core.memory[0x0101] = 0x33;

        OPCODE[0x11](core);

        expect(core.registerE).to.equal(0x32);
        expect(core.registerD).to.equal(0x33);
        expect(core.programCounter).to.equal(0x0102);
    });

    it("LD HL, nn", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;
        core.memory[0x0101] = 0x33;

        OPCODE[0x21](core);

        expect(core.registersHL).to.equal(0x3332);
        expect(core.programCounter).to.equal(0x0102);
    });

    it("LD SP, nn", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x32;
        core.memory[0x0101] = 0x33;
        core.stackPointer = 0xffff;

        OPCODE[0x31](core);

        expect(core.stackPointer).to.equal(0x3332);
        expect(core.programCounter).to.equal(0x0102);
    });

    it("LD A, (BC)", function () {
        core.registerB = 0x02;
        core.registerC = 0xab;
        core.memory[0x02ab] = 0x32;

        OPCODE[0x0a](core);

        expect(core.registerA).to.equal(0x32);
    });

    it("LD A, (DE)", function () {
        core.registerD = 0x02;
        core.registerE = 0xab;
        core.memory[0x02ab] = 0x32;

        OPCODE[0x1a](core);

        expect(core.registerA).to.equal(0x32);
    });

    it("LD (BC), A", function () {
        core.registerB = 0xc0;
        core.registerC = 0x01;
        core.registerA = 0x32;

        OPCODE[0x02](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (DE), A", function () {
        core.registerD = 0xc0;
        core.registerE = 0x01;
        core.registerA = 0x32;

        OPCODE[0x12](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
    });

    it("LD (nn), A", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x01;
        core.memory[0x0101] = 0xc0;
        core.registerA = 0x32;

        OPCODE[0xea](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0102);
    });

    it("LD (nn), SP", function () {
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x01;
        core.memory[0x0101] = 0xc0;
        core.stackPointer = 0xab32;

        OPCODE[0x08](core);

        // this memory segment is "write normal"
        // 0xC000 < x < 0xE000
        expect(core.memory[0xc001]).to.equal(0x32);
        expect(core.memory[0xc002]).to.equal(0xab);
        expect(core.programCounter).to.equal(0x0102);
    });

    it("LD A, (nn)", function () {
        core.registerA = 0xab;
        core.programCounter = 0x0100;
        core.memory[0x0100] = 0x01;
        core.memory[0x0101] = 0xc0;
        core.memory[0xc001] = 0x32;

        OPCODE[0xfa](core);

        expect(core.registerA).to.equal(0x32);
        expect(core.memory[0xc001]).to.equal(0x32);
        expect(core.programCounter).to.equal(0x0102);
    });
});
