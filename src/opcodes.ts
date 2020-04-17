import { cout } from './terminal';

export const OPCODE = [
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	//RLCA
	//#0x07:
	function (parentObj) {
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | (parentObj.registerA >> 7);
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	//RRCA
	//#0x0F:
	function (parentObj) {
		parentObj.registerA = (parentObj.registerA >> 1) | ((parentObj.registerA & 1) << 7);
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//STOP
	//#0x10:
	function (parentObj) {
		if (parentObj.cGBC) {
			if ((parentObj.memory[0xFF4D] & 0x01) == 0x01) {		//Speed change requested.
				if (parentObj.memory[0xFF4D] > 0x7F) {				//Go back to single speed mode.
					cout("Going into single clock speed mode.", 0);
					parentObj.doubleSpeedShifter = 0;
					parentObj.memory[0xFF4D] &= 0x7F;				//Clear the double speed mode flag.
				}
				else {												//Go to double speed mode.
					cout("Going into double clock speed mode.", 0);
					parentObj.doubleSpeedShifter = 1;
					parentObj.memory[0xFF4D] |= 0x80;				//Set the double speed mode flag.
				}
				parentObj.memory[0xFF4D] &= 0xFE;					//Reset the request bit.
			}
			else {
				parentObj.handleSTOP();
			}
		}
		else {
			parentObj.handleSTOP();
		}
	},
	null,
	null,
	null,
	null,
	null,
	null,
	//RLA
	//#0x17:
	function (parentObj) {
		var carry_flag = (parentObj.FCarry) ? 1 : 0;
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | carry_flag;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//JR n
	//#0x18:
	function (parentObj) {
		parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
	},
	null,
	null,
	null,
	null,
	null,
	null,
	//RRA
	//#0x1F:
	function (parentObj) {
		var carry_flag = (parentObj.FCarry) ? 0x80 : 0;
		parentObj.FCarry = ((parentObj.registerA & 1) == 1);
		parentObj.registerA = (parentObj.registerA >> 1) | carry_flag;
		parentObj.FZero = parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//JR NZ, n
	//#0x20:
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	null,
	//LDI (HL), A
	//#0x22:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
		parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
	},
	null,
	null,
	null,
	null,
	//DAA
	//#0x27:
	function (parentObj) {
		if (!parentObj.FSubtract) {
			if (parentObj.FCarry || parentObj.registerA > 0x99) {
				parentObj.registerA = (parentObj.registerA + 0x60) & 0xFF;
				parentObj.FCarry = true;
			}
			if (parentObj.FHalfCarry || (parentObj.registerA & 0xF) > 0x9) {
				parentObj.registerA = (parentObj.registerA + 0x06) & 0xFF;
				parentObj.FHalfCarry = false;
			}
		}
		else if (parentObj.FCarry && parentObj.FHalfCarry) {
			parentObj.registerA = (parentObj.registerA + 0x9A) & 0xFF;
			parentObj.FHalfCarry = false;
		}
		else if (parentObj.FCarry) {
			parentObj.registerA = (parentObj.registerA + 0xA0) & 0xFF;
		}
		else if (parentObj.FHalfCarry) {
			parentObj.registerA = (parentObj.registerA + 0xFA) & 0xFF;
			parentObj.FHalfCarry = false;
		}
		parentObj.FZero = (parentObj.registerA == 0);
	},
	//JR Z, n
	//#0x28:
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	null,
	//LDI A, (HL)
	//#0x2A:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
	},
	null,
	null,
	null,
	null,
	//CPL
	//#0x2F:
	function (parentObj) {
		parentObj.registerA ^= 0xFF;
		parentObj.FSubtract = parentObj.FHalfCarry = true;
	},
	//JR NC, n
	//#0x30:
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	null,
	//LDD (HL), A
	//#0x32:
	function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	null,
	null,
	null,
	null,
	//SCF
	//#0x37:
	function (parentObj) {
		parentObj.FCarry = true;
		parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	//JR C, n
	//#0x38:
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.programCounter + ((parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24) + 1) & 0xFFFF;
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		}
	},
	null,
	//LDD A, (HL)
	//#0x3A:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
	},
	null,
	null,
	null,
	null,
	//CCF
	//#0x3F:
	function (parentObj) {
		parentObj.FCarry = !parentObj.FCarry;
		parentObj.FSubtract = parentObj.FHalfCarry = false;
	},
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	//HALT
	//#0x76:
	function (parentObj) {
		//See if there's already an IRQ match:
		if ((parentObj.interruptsEnabled & parentObj.interruptsRequested & 0x1F) > 0) {
			if (!parentObj.cGBC && !parentObj.usedBootROM) {
				//HALT bug in the DMG CPU model (Program Counter fails to increment for one instruction after HALT):
				parentObj.skipPCIncrement = true;
			}
			else {
				//CGB gets around the HALT PC bug by doubling the hidden NOP.
				parentObj.CPUTicks += 4;
			}
		}
		else {
			//CPU is stalled until the next IRQ match:
			parentObj.calculateHALTPeriod();
		}
	},
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	//ADC A, B
	//#0x88:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerB + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerB & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, C
	//#0x89:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerC + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerC & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, D
	//#0x8A:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerD + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerD & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, E
	//#0x8B:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.registerE + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (parentObj.registerE & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, H
	//#0x8C:
	function (parentObj) {
		var tempValue = (parentObj.registersHL >> 8);
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, L
	//#0x8D:
	function (parentObj) {
		var tempValue = (parentObj.registersHL & 0xFF);
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, (HL)
	//#0x8E:
	function (parentObj) {
		var tempValue = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//ADC A, A
	//#0x8F:
	function (parentObj) {
		//shift left register A one bit for some ops here as an optimization:
		var dirtySum = (parentObj.registerA << 1) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((((parentObj.registerA << 1) & 0x1E) | ((parentObj.FCarry) ? 1 : 0)) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	null,
	null,
	null,
	null,
	//SUB A, H
	//#0x94:
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL >> 8);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, L
	//#0x95:
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//SUB A, (HL)
	//#0x96:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	null,
	//SBC A, B
	//#0x98:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerB - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerB & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, C
	//#0x99:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerC - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerC & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, D
	//#0x9A:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerD - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerD & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, E
	//#0x9B:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerE - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registerE & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, H
	//#0x9C:
	function (parentObj) {
		var temp_var = parentObj.registersHL >> 8;
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, L
	//#0x9D:
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL & 0xFF) - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (parentObj.registersHL & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, (HL)
	//#0x9E:
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//SBC A, A
	//#0x9F:
	function (parentObj) {
		//Optimized SBC A:
		if (parentObj.FCarry) {
			parentObj.FZero = false;
			parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = true;
			parentObj.registerA = 0xFF;
		}
		else {
			parentObj.FHalfCarry = parentObj.FCarry = false;
			parentObj.FSubtract = parentObj.FZero = true;
			parentObj.registerA = 0;
		}
	},
	//AND B
	//#0xA0:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND C
	//#0xA1:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND D
	//#0xA2:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND E
	//#0xA3:
	function (parentObj) {
		parentObj.registerA &= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND H
	//#0xA4:
	function (parentObj) {
		parentObj.registerA &= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND L
	//#0xA5:
	function (parentObj) {
		parentObj.registerA &= parentObj.registersHL;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND (HL)
	//#0xA6:
	function (parentObj) {
		parentObj.registerA &= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//AND A
	//#0xA7:
	function (parentObj) {
		//number & same number = same number
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//XOR B
	//#0xA8:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR C
	//#0xA9:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR D
	//#0xAA:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR E
	//#0xAB:
	function (parentObj) {
		parentObj.registerA ^= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR H
	//#0xAC:
	function (parentObj) {
		parentObj.registerA ^= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR L
	//#0xAD:
	function (parentObj) {
		parentObj.registerA ^= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR (HL)
	//#0xAE:
	function (parentObj) {
		parentObj.registerA ^= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//XOR A
	//#0xAF:
	function (parentObj) {
		//number ^ same number == 0
		parentObj.registerA = 0;
		parentObj.FZero = true;
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//OR B
	//#0xB0:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerB;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR C
	//#0xB1:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerC;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR D
	//#0xB2:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerD;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR E
	//#0xB3:
	function (parentObj) {
		parentObj.registerA |= parentObj.registerE;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR H
	//#0xB4:
	function (parentObj) {
		parentObj.registerA |= (parentObj.registersHL >> 8);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR L
	//#0xB5:
	function (parentObj) {
		parentObj.registerA |= (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR (HL)
	//#0xB6:
	function (parentObj) {
		parentObj.registerA |= parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//OR A
	//#0xB7:
	function (parentObj) {
		//number | same number == same number
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//CP B
	//#0xB8:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerB;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP C
	//#0xB9:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerC;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP D
	//#0xBA:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerD;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP E
	//#0xBB:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.registerE;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP H
	//#0xBC:
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL >> 8);
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP L
	//#0xBD:
	function (parentObj) {
		var dirtySum = parentObj.registerA - (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP (HL)
	//#0xBE:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//CP A
	//#0xBF:
	function (parentObj) {
		parentObj.FHalfCarry = parentObj.FCarry = false;
		parentObj.FZero = parentObj.FSubtract = true;
	},
	//RET !FZ
	//#0xC0:
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	null,
	//JP !FZ, nn
	//#0xC2:
	function (parentObj) {
		if (!parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//JP nn
	//#0xC3:
	function (parentObj) {
		parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
	},
	//CALL !FZ, nn
	//#0xC4:
	function (parentObj) {
		if (!parentObj.FZero) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	null,
	//ADD, n
	//#0xC6:
	function (parentObj) {
		var dirtySum = parentObj.registerA + parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FHalfCarry = ((dirtySum & 0xF) < (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//RST 0
	//#0xC7:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0;
	},
	//RET FZ
	//#0xC8:
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	//RET
	//#0xC9:
	function (parentObj) {
		parentObj.programCounter =  (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
	},
	//JP FZ, nn
	//#0xCA:
	function (parentObj) {
		if (parentObj.FZero) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//Secondary OP Code Set:
	//#0xCB:
	function (parentObj) {
		var opcode = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		//Increment the program counter to the next instruction:
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		//Get how many CPU cycles the current 0xCBXX op code counts for:
		parentObj.CPUTicks += parentObj.SecondaryTICKTable[opcode];
		//Execute secondary OP codes for the 0xCB OP code call.
		CBOPCODE[opcode](parentObj);
	},
	//CALL FZ, nn
	//#0xCC:
	function (parentObj) {
		if (parentObj.FZero) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//CALL nn
	//#0xCD:
	function (parentObj) {
		var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = temp_pc;
	},
	//ADC A, n
	//#0xCE:
	function (parentObj) {
		var tempValue = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		var dirtySum = parentObj.registerA + tempValue + ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) + (tempValue & 0xF) + ((parentObj.FCarry) ? 1 : 0) > 0xF);
		parentObj.FCarry = (dirtySum > 0xFF);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = false;
	},
	//RST 0x8
	//#0xCF:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x8;
	},
	//RET !FC
	//#0xD0:
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	null,
	//JP !FC, nn
	//#0xD2:
	function (parentObj) {
		if (!parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//0xD3 - Illegal
	//#0xD3:
	function (_parentObj) {
		cout("Illegal op code 0xD3 called, pausing emulation.", 2);
		this.pause();
	},
	//CALL !FC, nn
	//#0xD4:
	function (parentObj) {
		if (!parentObj.FCarry) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	null,
	//SUB A, n
	//#0xD6:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirtySum & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//RST 0x10
	//#0xD7:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x10;
	},
	//RET FC
	//#0xD8:
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
			parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
			parentObj.CPUTicks += 12;
		}
	},
	//RETI
	//#0xD9:
	function (parentObj) {
		parentObj.programCounter = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
		parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
		//Immediate for HALT:
		parentObj.IRQEnableDelay = (parentObj.IRQEnableDelay == 2 || parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) == 0x76) ? 1 : 2;
	},
	//JP FC, nn
	//#0xDA:
	function (parentObj) {
		if (parentObj.FCarry) {
			parentObj.programCounter = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.CPUTicks += 4;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//0xDB - Illegal
	//#0xDB:
	function (_parentObj) {
		cout("Illegal op code 0xDB called, pausing emulation.", 2);
		this.pause();
	},
	//CALL FC, nn
	//#0xDC:
	function (parentObj) {
		if (parentObj.FCarry) {
			var temp_pc = (parentObj.memoryRead((parentObj.programCounter + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
			parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
			parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
			parentObj.programCounter = temp_pc;
			parentObj.CPUTicks += 12;
		}
		else {
			parentObj.programCounter = (parentObj.programCounter + 2) & 0xFFFF;
		}
	},
	//0xDD - Illegal
	//#0xDD:
	function (_parentObj) {
		cout("Illegal op code 0xDD called, pausing emulation.", 2);
		this.pause();
	},
	//SBC A, n
	//#0xDE:
	function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		var dirtySum = parentObj.registerA - temp_var - ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = ((parentObj.registerA & 0xF) - (temp_var & 0xF) - ((parentObj.FCarry) ? 1 : 0) < 0);
		parentObj.FCarry = (dirtySum < 0);
		parentObj.registerA = dirtySum & 0xFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = true;
	},
	//RST 0x18
	//#0xDF:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x18;
	},
	//LDH (n), A
	//#0xE0:
	function (parentObj) {
		parentObj.memoryHighWrite(parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter), parentObj.registerA);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	null,
	//LD (0xFF00 + C), A
	//#0xE2:
	function (parentObj) {
		parentObj.memoryHighWriter[parentObj.registerC](parentObj, parentObj.registerC, parentObj.registerA);
	},
	//0xE3 - Illegal
	//#0xE3:
	function (_parentObj) {
		cout("Illegal op code 0xE3 called, pausing emulation.", 2);
		this.pause();
	},
	//0xE4 - Illegal
	//#0xE4:
	function (_parentObj) {
		cout("Illegal op code 0xE4 called, pausing emulation.", 2);
		this.pause();
	},
	null,
	//AND n
	//#0xE6:
	function (parentObj) {
		parentObj.registerA &= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = parentObj.FCarry = false;
	},
	//RST 0x20
	//#0xE7:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x20;
	},
	//ADD SP, n
	//#0xE8:
	function (parentObj) {
		var temp_value2 = (parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24;
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		var temp_value = (parentObj.stackPointer + temp_value2) & 0xFFFF;
		temp_value2 = parentObj.stackPointer ^ temp_value2 ^ temp_value;
		parentObj.stackPointer = temp_value;
		parentObj.FCarry = ((temp_value2 & 0x100) == 0x100);
		parentObj.FHalfCarry = ((temp_value2 & 0x10) == 0x10);
		parentObj.FZero = parentObj.FSubtract = false;
	},
	//JP, (HL)
	//#0xE9:
	function (parentObj) {
		parentObj.programCounter = parentObj.registersHL;
	},
	null,
	//0xEB - Illegal
	//#0xEB:
	function (_parentObj) {
		cout("Illegal op code 0xEB called, pausing emulation.", 2);
		this.pause();
	},
	//0xEC - Illegal
	//#0xEC:
	function (_parentObj) {
		cout("Illegal op code 0xEC called, pausing emulation.", 2);
		this.pause();
	},
	//0xED - Illegal
	//#0xED:
	function (_parentObj) {
		cout("Illegal op code 0xED called, pausing emulation.", 2);
		this.pause();
	},
	//XOR n
	//#0xEE:
	function (parentObj) {
		parentObj.registerA ^= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FSubtract = parentObj.FHalfCarry = parentObj.FCarry = false;
	},
	//RST 0x28
	//#0xEF:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x28;
	},
	//LDH A, (n)
	//#0xF0:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryHighRead(parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter));
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	},
	null,
	//LD A, (0xFF00 + C)
	//#0xF2:
	function (parentObj) {
		parentObj.registerA = parentObj.memoryHighReader[parentObj.registerC](parentObj, parentObj.registerC);
	},
	//DI
	//#0xF3:
	function (parentObj) {
		parentObj.IME = false;
		parentObj.IRQEnableDelay = 0;
	},
	//0xF4 - Illegal
	//#0xF4:
	function (_parentObj) {
		cout("Illegal op code 0xF4 called, pausing emulation.", 2);
		this.pause();
	},
	null,
	//OR n
	//#0xF6:
	function (parentObj) {
		parentObj.registerA |= parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FSubtract = parentObj.FCarry = parentObj.FHalfCarry = false;
	},
	//RST 0x30
	//#0xF7:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x30;
	},
	//LDHL SP, n
	//#0xF8:
	function (parentObj) {
		var temp_var = (parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 24) >> 24;
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.registersHL = (parentObj.stackPointer + temp_var) & 0xFFFF;
		temp_var = parentObj.stackPointer ^ temp_var ^ parentObj.registersHL;
		parentObj.FCarry = ((temp_var & 0x100) == 0x100);
		parentObj.FHalfCarry = ((temp_var & 0x10) == 0x10);
		parentObj.FZero = parentObj.FSubtract = false;
	},
	null,
	null,
	//EI
	//#0xFB:
	function (parentObj) {
		//Immediate for HALT:
		parentObj.IRQEnableDelay = (parentObj.IRQEnableDelay == 2 || parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) == 0x76) ? 1 : 2;
	},
	//0xFC - Illegal
	//#0xFC:
	function (_parentObj) {
		cout("Illegal op code 0xFC called, pausing emulation.", 2);
		this.pause();
	},
	//0xFD - Illegal
	//#0xFD:
	function (_parentObj) {
		cout("Illegal op code 0xFD called, pausing emulation.", 2);
		this.pause();
	},
	//CP n
	//#0xFE:
	function (parentObj) {
		var dirtySum = parentObj.registerA - parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
		parentObj.FHalfCarry = ((dirtySum & 0xF) > (parentObj.registerA & 0xF));
		parentObj.FCarry = (dirtySum < 0);
		parentObj.FZero = (dirtySum == 0);
		parentObj.FSubtract = true;
	},
	//RST 0x38
	//#0xFF:
	function (parentObj) {
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter >> 8);
		parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
		parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.programCounter & 0xFF);
		parentObj.programCounter = 0x38;
	}
];

const CBOPCODE = [
	//RLC B
	//#0x00:
	function (parentObj) {
		parentObj.FCarry = (parentObj.registerB > 0x7F);
		parentObj.registerB = ((parentObj.registerB << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//RLC C
	//#0x01:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerC > 0x7F);
		parentObj.registerC = ((parentObj.registerC << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//RLC D
	//#0x02:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerD > 0x7F);
		parentObj.registerD = ((parentObj.registerD << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//RLC E
	//#0x03:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerE > 0x7F);
		parentObj.registerE = ((parentObj.registerE << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//RLC H
	//#0x04:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | ((parentObj.FCarry) ? 0x100 : 0) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//RLC L
	//#0x05:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x80) == 0x80);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//RLC (HL)
	//#0x06:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = (temp_var > 0x7F);
		temp_var = ((temp_var << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	//RLC A
	//#0x07:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//RRC B
	//#0x08:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerB >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//RRC C
	//#0x09:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerC >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//RRC D
	//#0x0A:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerD >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//RRC E
	//#0x0B:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerE >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//RRC H
	//#0x0C:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.FCarry) ? 0x8000 : 0) | ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//RRC L
	//#0x0D:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x01) == 0x01);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.FCarry) ? 0x80 : 0) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//RRC (HL)
	//#0x0E:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		temp_var = ((parentObj.FCarry) ? 0x80 : 0) | (temp_var >> 1);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	//RRC A
	//#0x0F:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerA >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//RL B
	//#0x10:
	,function (parentObj) {
		var newFCarry = (parentObj.registerB > 0x7F);
		parentObj.registerB = ((parentObj.registerB << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//RL C
	//#0x11:
	,function (parentObj) {
		var newFCarry = (parentObj.registerC > 0x7F);
		parentObj.registerC = ((parentObj.registerC << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//RL D
	//#0x12:
	,function (parentObj) {
		var newFCarry = (parentObj.registerD > 0x7F);
		parentObj.registerD = ((parentObj.registerD << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//RL E
	//#0x13:
	,function (parentObj) {
		var newFCarry = (parentObj.registerE > 0x7F);
		parentObj.registerE = ((parentObj.registerE << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//RL H
	//#0x14:
	,function (parentObj) {
		var newFCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | ((parentObj.FCarry) ? 0x100 : 0) | (parentObj.registersHL & 0xFF);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//RL L
	//#0x15:
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x80) == 0x80);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//RL (HL)
	//#0x16:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var newFCarry = (temp_var > 0x7F);
		temp_var = ((temp_var << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	//RL A
	//#0x17:
	,function (parentObj) {
		var newFCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = ((parentObj.registerA << 1) & 0xFF) | ((parentObj.FCarry) ? 1 : 0);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//RR B
	//#0x18:
	,function (parentObj) {
		var newFCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerB >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//RR C
	//#0x19:
	,function (parentObj) {
		var newFCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerC >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//RR D
	//#0x1A:
	,function (parentObj) {
		var newFCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerD >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//RR E
	//#0x1B:
	,function (parentObj) {
		var newFCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerE >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//RR H
	//#0x1C:
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.FCarry) ? 0x8000 : 0) | ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//RR L
	//#0x1D:
	,function (parentObj) {
		var newFCarry = ((parentObj.registersHL & 0x01) == 0x01);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.FCarry) ? 0x80 : 0) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//RR (HL)
	//#0x1E:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		var newFCarry = ((temp_var & 0x01) == 0x01);
		temp_var = ((parentObj.FCarry) ? 0x80 : 0) | (temp_var >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	//RR A
	//#0x1F:
	,function (parentObj) {
		var newFCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = ((parentObj.FCarry) ? 0x80 : 0) | (parentObj.registerA >> 1);
		parentObj.FCarry = newFCarry;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//SLA B
	//#0x20:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerB > 0x7F);
		parentObj.registerB = (parentObj.registerB << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//SLA C
	//#0x21:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerC > 0x7F);
		parentObj.registerC = (parentObj.registerC << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//SLA D
	//#0x22:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerD > 0x7F);
		parentObj.registerD = (parentObj.registerD << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//SLA E
	//#0x23:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerE > 0x7F);
		parentObj.registerE = (parentObj.registerE << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//SLA H
	//#0x24:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registersHL > 0x7FFF);
		parentObj.registersHL = ((parentObj.registersHL << 1) & 0xFE00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//SLA L
	//#0x25:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0080) == 0x0080);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL << 1) & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//SLA (HL)
	//#0x26:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = (temp_var > 0x7F);
		temp_var = (temp_var << 1) & 0xFF;
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	//SLA A
	//#0x27:
	,function (parentObj) {
		parentObj.FCarry = (parentObj.registerA > 0x7F);
		parentObj.registerA = (parentObj.registerA << 1) & 0xFF;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//SRA B
	//#0x28:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB = (parentObj.registerB & 0x80) | (parentObj.registerB >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//SRA C
	//#0x29:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC = (parentObj.registerC & 0x80) | (parentObj.registerC >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//SRA D
	//#0x2A:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD = (parentObj.registerD & 0x80) | (parentObj.registerD >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//SRA E
	//#0x2B:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE = (parentObj.registerE & 0x80) | (parentObj.registerE >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//SRA H
	//#0x2C:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0x80FF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//SRA L
	//#0x2D:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0001) == 0x0001);
		parentObj.registersHL = (parentObj.registersHL & 0xFF80) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//SRA (HL)
	//#0x2E:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		temp_var = (temp_var & 0x80) | (temp_var >> 1);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var == 0);
	}
	//SRA A
	//#0x2F:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA = (parentObj.registerA & 0x80) | (parentObj.registerA >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//SWAP B
	//#0x30:
	,function (parentObj) {
		parentObj.registerB = ((parentObj.registerB & 0xF) << 4) | (parentObj.registerB >> 4);
		parentObj.FZero = (parentObj.registerB == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP C
	//#0x31:
	,function (parentObj) {
		parentObj.registerC = ((parentObj.registerC & 0xF) << 4) | (parentObj.registerC >> 4);
		parentObj.FZero = (parentObj.registerC == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP D
	//#0x32:
	,function (parentObj) {
		parentObj.registerD = ((parentObj.registerD & 0xF) << 4) | (parentObj.registerD >> 4);
		parentObj.FZero = (parentObj.registerD == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP E
	//#0x33:
	,function (parentObj) {
		parentObj.registerE = ((parentObj.registerE & 0xF) << 4) | (parentObj.registerE >> 4);
		parentObj.FZero = (parentObj.registerE == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP H
	//#0x34:
	,function (parentObj) {
		parentObj.registersHL = ((parentObj.registersHL & 0xF00) << 4) | ((parentObj.registersHL & 0xF000) >> 4) | (parentObj.registersHL & 0xFF);
		parentObj.FZero = (parentObj.registersHL < 0x100);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP L
	//#0x35:
	,function (parentObj) {
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL & 0xF) << 4) | ((parentObj.registersHL & 0xF0) >> 4);
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP (HL)
	//#0x36:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		temp_var = ((temp_var & 0xF) << 4) | (temp_var >> 4);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var);
		parentObj.FZero = (temp_var == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SWAP A
	//#0x37:
	,function (parentObj) {
		parentObj.registerA = ((parentObj.registerA & 0xF) << 4) | (parentObj.registerA >> 4);
		parentObj.FZero = (parentObj.registerA == 0);
		parentObj.FCarry = parentObj.FHalfCarry = parentObj.FSubtract = false;
	}
	//SRL B
	//#0x38:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerB & 0x01) == 0x01);
		parentObj.registerB >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerB == 0);
	}
	//SRL C
	//#0x39:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerC & 0x01) == 0x01);
		parentObj.registerC >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerC == 0);
	}
	//SRL D
	//#0x3A:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerD & 0x01) == 0x01);
		parentObj.registerD >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerD == 0);
	}
	//SRL E
	//#0x3B:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerE & 0x01) == 0x01);
		parentObj.registerE >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerE == 0);
	}
	//SRL H
	//#0x3C:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0100) == 0x0100);
		parentObj.registersHL = ((parentObj.registersHL >> 1) & 0xFF00) | (parentObj.registersHL & 0xFF);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registersHL < 0x100);
	}
	//SRL L
	//#0x3D:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registersHL & 0x0001) == 0x0001);
		parentObj.registersHL = (parentObj.registersHL & 0xFF00) | ((parentObj.registersHL & 0xFF) >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0xFF) == 0);
	}
	//SRL (HL)
	//#0x3E:
	,function (parentObj) {
		var temp_var = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
		parentObj.FCarry = ((temp_var & 0x01) == 0x01);
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, temp_var >> 1);
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (temp_var < 2);
	}
	//SRL A
	//#0x3F:
	,function (parentObj) {
		parentObj.FCarry = ((parentObj.registerA & 0x01) == 0x01);
		parentObj.registerA >>= 1;
		parentObj.FHalfCarry = parentObj.FSubtract = false;
		parentObj.FZero = (parentObj.registerA == 0);
	}
	//BIT 0, B
	//#0x40:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x01) == 0);
	}
	//BIT 0, C
	//#0x41:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x01) == 0);
	}
	//BIT 0, D
	//#0x42:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x01) == 0);
	}
	//BIT 0, E
	//#0x43:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x01) == 0);
	}
	//BIT 0, H
	//#0x44:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0100) == 0);
	}
	//BIT 0, L
	//#0x45:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0001) == 0);
	}
	//BIT 0, (HL)
	//#0x46:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x01) == 0);
	}
	//BIT 0, A
	//#0x47:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x01) == 0);
	}
	//BIT 1, B
	//#0x48:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x02) == 0);
	}
	//BIT 1, C
	//#0x49:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x02) == 0);
	}
	//BIT 1, D
	//#0x4A:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x02) == 0);
	}
	//BIT 1, E
	//#0x4B:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x02) == 0);
	}
	//BIT 1, H
	//#0x4C:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0200) == 0);
	}
	//BIT 1, L
	//#0x4D:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0002) == 0);
	}
	//BIT 1, (HL)
	//#0x4E:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x02) == 0);
	}
	//BIT 1, A
	//#0x4F:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x02) == 0);
	}
	//BIT 2, B
	//#0x50:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x04) == 0);
	}
	//BIT 2, C
	//#0x51:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x04) == 0);
	}
	//BIT 2, D
	//#0x52:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x04) == 0);
	}
	//BIT 2, E
	//#0x53:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x04) == 0);
	}
	//BIT 2, H
	//#0x54:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0400) == 0);
	}
	//BIT 2, L
	//#0x55:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0004) == 0);
	}
	//BIT 2, (HL)
	//#0x56:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x04) == 0);
	}
	//BIT 2, A
	//#0x57:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x04) == 0);
	}
	//BIT 3, B
	//#0x58:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x08) == 0);
	}
	//BIT 3, C
	//#0x59:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x08) == 0);
	}
	//BIT 3, D
	//#0x5A:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x08) == 0);
	}
	//BIT 3, E
	//#0x5B:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x08) == 0);
	}
	//BIT 3, H
	//#0x5C:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0800) == 0);
	}
	//BIT 3, L
	//#0x5D:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0008) == 0);
	}
	//BIT 3, (HL)
	//#0x5E:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x08) == 0);
	}
	//BIT 3, A
	//#0x5F:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x08) == 0);
	}
	//BIT 4, B
	//#0x60:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x10) == 0);
	}
	//BIT 4, C
	//#0x61:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x10) == 0);
	}
	//BIT 4, D
	//#0x62:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x10) == 0);
	}
	//BIT 4, E
	//#0x63:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x10) == 0);
	}
	//BIT 4, H
	//#0x64:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x1000) == 0);
	}
	//BIT 4, L
	//#0x65:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0010) == 0);
	}
	//BIT 4, (HL)
	//#0x66:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x10) == 0);
	}
	//BIT 4, A
	//#0x67:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x10) == 0);
	}
	//BIT 5, B
	//#0x68:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x20) == 0);
	}
	//BIT 5, C
	//#0x69:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x20) == 0);
	}
	//BIT 5, D
	//#0x6A:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x20) == 0);
	}
	//BIT 5, E
	//#0x6B:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x20) == 0);
	}
	//BIT 5, H
	//#0x6C:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x2000) == 0);
	}
	//BIT 5, L
	//#0x6D:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0020) == 0);
	}
	//BIT 5, (HL)
	//#0x6E:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x20) == 0);
	}
	//BIT 5, A
	//#0x6F:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x20) == 0);
	}
	//BIT 6, B
	//#0x70:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x40) == 0);
	}
	//BIT 6, C
	//#0x71:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x40) == 0);
	}
	//BIT 6, D
	//#0x72:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x40) == 0);
	}
	//BIT 6, E
	//#0x73:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x40) == 0);
	}
	//BIT 6, H
	//#0x74:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x4000) == 0);
	}
	//BIT 6, L
	//#0x75:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0040) == 0);
	}
	//BIT 6, (HL)
	//#0x76:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x40) == 0);
	}
	//BIT 6, A
	//#0x77:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x40) == 0);
	}
	//BIT 7, B
	//#0x78:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerB & 0x80) == 0);
	}
	//BIT 7, C
	//#0x79:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerC & 0x80) == 0);
	}
	//BIT 7, D
	//#0x7A:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerD & 0x80) == 0);
	}
	//BIT 7, E
	//#0x7B:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerE & 0x80) == 0);
	}
	//BIT 7, H
	//#0x7C:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x8000) == 0);
	}
	//BIT 7, L
	//#0x7D:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registersHL & 0x0080) == 0);
	}
	//BIT 7, (HL)
	//#0x7E:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x80) == 0);
	}
	//BIT 7, A
	//#0x7F:
	,function (parentObj) {
		parentObj.FHalfCarry = true;
		parentObj.FSubtract = false;
		parentObj.FZero = ((parentObj.registerA & 0x80) == 0);
	}
	//RES 0, B
	//#0x80:
	,function (parentObj) {
		parentObj.registerB &= 0xFE;
	}
	//RES 0, C
	//#0x81:
	,function (parentObj) {
		parentObj.registerC &= 0xFE;
	}
	//RES 0, D
	//#0x82:
	,function (parentObj) {
		parentObj.registerD &= 0xFE;
	}
	//RES 0, E
	//#0x83:
	,function (parentObj) {
		parentObj.registerE &= 0xFE;
	}
	//RES 0, H
	//#0x84:
	,function (parentObj) {
		parentObj.registersHL &= 0xFEFF;
	}
	//RES 0, L
	//#0x85:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFFE;
	}
	//RES 0, (HL)
	//#0x86:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xFE);
	}
	//RES 0, A
	//#0x87:
	,function (parentObj) {
		parentObj.registerA &= 0xFE;
	}
	//RES 1, B
	//#0x88:
	,function (parentObj) {
		parentObj.registerB &= 0xFD;
	}
	//RES 1, C
	//#0x89:
	,function (parentObj) {
		parentObj.registerC &= 0xFD;
	}
	//RES 1, D
	//#0x8A:
	,function (parentObj) {
		parentObj.registerD &= 0xFD;
	}
	//RES 1, E
	//#0x8B:
	,function (parentObj) {
		parentObj.registerE &= 0xFD;
	}
	//RES 1, H
	//#0x8C:
	,function (parentObj) {
		parentObj.registersHL &= 0xFDFF;
	}
	//RES 1, L
	//#0x8D:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFFD;
	}
	//RES 1, (HL)
	//#0x8E:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xFD);
	}
	//RES 1, A
	//#0x8F:
	,function (parentObj) {
		parentObj.registerA &= 0xFD;
	}
	//RES 2, B
	//#0x90:
	,function (parentObj) {
		parentObj.registerB &= 0xFB;
	}
	//RES 2, C
	//#0x91:
	,function (parentObj) {
		parentObj.registerC &= 0xFB;
	}
	//RES 2, D
	//#0x92:
	,function (parentObj) {
		parentObj.registerD &= 0xFB;
	}
	//RES 2, E
	//#0x93:
	,function (parentObj) {
		parentObj.registerE &= 0xFB;
	}
	//RES 2, H
	//#0x94:
	,function (parentObj) {
		parentObj.registersHL &= 0xFBFF;
	}
	//RES 2, L
	//#0x95:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFFB;
	}
	//RES 2, (HL)
	//#0x96:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xFB);
	}
	//RES 2, A
	//#0x97:
	,function (parentObj) {
		parentObj.registerA &= 0xFB;
	}
	//RES 3, B
	//#0x98:
	,function (parentObj) {
		parentObj.registerB &= 0xF7;
	}
	//RES 3, C
	//#0x99:
	,function (parentObj) {
		parentObj.registerC &= 0xF7;
	}
	//RES 3, D
	//#0x9A:
	,function (parentObj) {
		parentObj.registerD &= 0xF7;
	}
	//RES 3, E
	//#0x9B:
	,function (parentObj) {
		parentObj.registerE &= 0xF7;
	}
	//RES 3, H
	//#0x9C:
	,function (parentObj) {
		parentObj.registersHL &= 0xF7FF;
	}
	//RES 3, L
	//#0x9D:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFF7;
	}
	//RES 3, (HL)
	//#0x9E:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xF7);
	}
	//RES 3, A
	//#0x9F:
	,function (parentObj) {
		parentObj.registerA &= 0xF7;
	}
	//RES 3, B
	//#0xA0:
	,function (parentObj) {
		parentObj.registerB &= 0xEF;
	}
	//RES 4, C
	//#0xA1:
	,function (parentObj) {
		parentObj.registerC &= 0xEF;
	}
	//RES 4, D
	//#0xA2:
	,function (parentObj) {
		parentObj.registerD &= 0xEF;
	}
	//RES 4, E
	//#0xA3:
	,function (parentObj) {
		parentObj.registerE &= 0xEF;
	}
	//RES 4, H
	//#0xA4:
	,function (parentObj) {
		parentObj.registersHL &= 0xEFFF;
	}
	//RES 4, L
	//#0xA5:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFEF;
	}
	//RES 4, (HL)
	//#0xA6:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xEF);
	}
	//RES 4, A
	//#0xA7:
	,function (parentObj) {
		parentObj.registerA &= 0xEF;
	}
	//RES 5, B
	//#0xA8:
	,function (parentObj) {
		parentObj.registerB &= 0xDF;
	}
	//RES 5, C
	//#0xA9:
	,function (parentObj) {
		parentObj.registerC &= 0xDF;
	}
	//RES 5, D
	//#0xAA:
	,function (parentObj) {
		parentObj.registerD &= 0xDF;
	}
	//RES 5, E
	//#0xAB:
	,function (parentObj) {
		parentObj.registerE &= 0xDF;
	}
	//RES 5, H
	//#0xAC:
	,function (parentObj) {
		parentObj.registersHL &= 0xDFFF;
	}
	//RES 5, L
	//#0xAD:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFDF;
	}
	//RES 5, (HL)
	//#0xAE:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xDF);
	}
	//RES 5, A
	//#0xAF:
	,function (parentObj) {
		parentObj.registerA &= 0xDF;
	}
	//RES 6, B
	//#0xB0:
	,function (parentObj) {
		parentObj.registerB &= 0xBF;
	}
	//RES 6, C
	//#0xB1:
	,function (parentObj) {
		parentObj.registerC &= 0xBF;
	}
	//RES 6, D
	//#0xB2:
	,function (parentObj) {
		parentObj.registerD &= 0xBF;
	}
	//RES 6, E
	//#0xB3:
	,function (parentObj) {
		parentObj.registerE &= 0xBF;
	}
	//RES 6, H
	//#0xB4:
	,function (parentObj) {
		parentObj.registersHL &= 0xBFFF;
	}
	//RES 6, L
	//#0xB5:
	,function (parentObj) {
		parentObj.registersHL &= 0xFFBF;
	}
	//RES 6, (HL)
	//#0xB6:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0xBF);
	}
	//RES 6, A
	//#0xB7:
	,function (parentObj) {
		parentObj.registerA &= 0xBF;
	}
	//RES 7, B
	//#0xB8:
	,function (parentObj) {
		parentObj.registerB &= 0x7F;
	}
	//RES 7, C
	//#0xB9:
	,function (parentObj) {
		parentObj.registerC &= 0x7F;
	}
	//RES 7, D
	//#0xBA:
	,function (parentObj) {
		parentObj.registerD &= 0x7F;
	}
	//RES 7, E
	//#0xBB:
	,function (parentObj) {
		parentObj.registerE &= 0x7F;
	}
	//RES 7, H
	//#0xBC:
	,function (parentObj) {
		parentObj.registersHL &= 0x7FFF;
	}
	//RES 7, L
	//#0xBD:
	,function (parentObj) {
		parentObj.registersHL &= 0xFF7F;
	}
	//RES 7, (HL)
	//#0xBE:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) & 0x7F);
	}
	//RES 7, A
	//#0xBF:
	,function (parentObj) {
		parentObj.registerA &= 0x7F;
	}
	//SET 0, B
	//#0xC0:
	,function (parentObj) {
		parentObj.registerB |= 0x01;
	}
	//SET 0, C
	//#0xC1:
	,function (parentObj) {
		parentObj.registerC |= 0x01;
	}
	//SET 0, D
	//#0xC2:
	,function (parentObj) {
		parentObj.registerD |= 0x01;
	}
	//SET 0, E
	//#0xC3:
	,function (parentObj) {
		parentObj.registerE |= 0x01;
	}
	//SET 0, H
	//#0xC4:
	,function (parentObj) {
		parentObj.registersHL |= 0x0100;
	}
	//SET 0, L
	//#0xC5:
	,function (parentObj) {
		parentObj.registersHL |= 0x01;
	}
	//SET 0, (HL)
	//#0xC6:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x01);
	}
	//SET 0, A
	//#0xC7:
	,function (parentObj) {
		parentObj.registerA |= 0x01;
	}
	//SET 1, B
	//#0xC8:
	,function (parentObj) {
		parentObj.registerB |= 0x02;
	}
	//SET 1, C
	//#0xC9:
	,function (parentObj) {
		parentObj.registerC |= 0x02;
	}
	//SET 1, D
	//#0xCA:
	,function (parentObj) {
		parentObj.registerD |= 0x02;
	}
	//SET 1, E
	//#0xCB:
	,function (parentObj) {
		parentObj.registerE |= 0x02;
	}
	//SET 1, H
	//#0xCC:
	,function (parentObj) {
		parentObj.registersHL |= 0x0200;
	}
	//SET 1, L
	//#0xCD:
	,function (parentObj) {
		parentObj.registersHL |= 0x02;
	}
	//SET 1, (HL)
	//#0xCE:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x02);
	}
	//SET 1, A
	//#0xCF:
	,function (parentObj) {
		parentObj.registerA |= 0x02;
	}
	//SET 2, B
	//#0xD0:
	,function (parentObj) {
		parentObj.registerB |= 0x04;
	}
	//SET 2, C
	//#0xD1:
	,function (parentObj) {
		parentObj.registerC |= 0x04;
	}
	//SET 2, D
	//#0xD2:
	,function (parentObj) {
		parentObj.registerD |= 0x04;
	}
	//SET 2, E
	//#0xD3:
	,function (parentObj) {
		parentObj.registerE |= 0x04;
	}
	//SET 2, H
	//#0xD4:
	,function (parentObj) {
		parentObj.registersHL |= 0x0400;
	}
	//SET 2, L
	//#0xD5:
	,function (parentObj) {
		parentObj.registersHL |= 0x04;
	}
	//SET 2, (HL)
	//#0xD6:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x04);
	}
	//SET 2, A
	//#0xD7:
	,function (parentObj) {
		parentObj.registerA |= 0x04;
	}
	//SET 3, B
	//#0xD8:
	,function (parentObj) {
		parentObj.registerB |= 0x08;
	}
	//SET 3, C
	//#0xD9:
	,function (parentObj) {
		parentObj.registerC |= 0x08;
	}
	//SET 3, D
	//#0xDA:
	,function (parentObj) {
		parentObj.registerD |= 0x08;
	}
	//SET 3, E
	//#0xDB:
	,function (parentObj) {
		parentObj.registerE |= 0x08;
	}
	//SET 3, H
	//#0xDC:
	,function (parentObj) {
		parentObj.registersHL |= 0x0800;
	}
	//SET 3, L
	//#0xDD:
	,function (parentObj) {
		parentObj.registersHL |= 0x08;
	}
	//SET 3, (HL)
	//#0xDE:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x08);
	}
	//SET 3, A
	//#0xDF:
	,function (parentObj) {
		parentObj.registerA |= 0x08;
	}
	//SET 4, B
	//#0xE0:
	,function (parentObj) {
		parentObj.registerB |= 0x10;
	}
	//SET 4, C
	//#0xE1:
	,function (parentObj) {
		parentObj.registerC |= 0x10;
	}
	//SET 4, D
	//#0xE2:
	,function (parentObj) {
		parentObj.registerD |= 0x10;
	}
	//SET 4, E
	//#0xE3:
	,function (parentObj) {
		parentObj.registerE |= 0x10;
	}
	//SET 4, H
	//#0xE4:
	,function (parentObj) {
		parentObj.registersHL |= 0x1000;
	}
	//SET 4, L
	//#0xE5:
	,function (parentObj) {
		parentObj.registersHL |= 0x10;
	}
	//SET 4, (HL)
	//#0xE6:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x10);
	}
	//SET 4, A
	//#0xE7:
	,function (parentObj) {
		parentObj.registerA |= 0x10;
	}
	//SET 5, B
	//#0xE8:
	,function (parentObj) {
		parentObj.registerB |= 0x20;
	}
	//SET 5, C
	//#0xE9:
	,function (parentObj) {
		parentObj.registerC |= 0x20;
	}
	//SET 5, D
	//#0xEA:
	,function (parentObj) {
		parentObj.registerD |= 0x20;
	}
	//SET 5, E
	//#0xEB:
	,function (parentObj) {
		parentObj.registerE |= 0x20;
	}
	//SET 5, H
	//#0xEC:
	,function (parentObj) {
		parentObj.registersHL |= 0x2000;
	}
	//SET 5, L
	//#0xED:
	,function (parentObj) {
		parentObj.registersHL |= 0x20;
	}
	//SET 5, (HL)
	//#0xEE:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x20);
	}
	//SET 5, A
	//#0xEF:
	,function (parentObj) {
		parentObj.registerA |= 0x20;
	}
	//SET 6, B
	//#0xF0:
	,function (parentObj) {
		parentObj.registerB |= 0x40;
	}
	//SET 6, C
	//#0xF1:
	,function (parentObj) {
		parentObj.registerC |= 0x40;
	}
	//SET 6, D
	//#0xF2:
	,function (parentObj) {
		parentObj.registerD |= 0x40;
	}
	//SET 6, E
	//#0xF3:
	,function (parentObj) {
		parentObj.registerE |= 0x40;
	}
	//SET 6, H
	//#0xF4:
	,function (parentObj) {
		parentObj.registersHL |= 0x4000;
	}
	//SET 6, L
	//#0xF5:
	,function (parentObj) {
		parentObj.registersHL |= 0x40;
	}
	//SET 6, (HL)
	//#0xF6:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x40);
	}
	//SET 6, A
	//#0xF7:
	,function (parentObj) {
		parentObj.registerA |= 0x40;
	}
	//SET 7, B
	//#0xF8:
	,function (parentObj) {
		parentObj.registerB |= 0x80;
	}
	//SET 7, C
	//#0xF9:
	,function (parentObj) {
		parentObj.registerC |= 0x80;
	}
	//SET 7, D
	//#0xFA:
	,function (parentObj) {
		parentObj.registerD |= 0x80;
	}
	//SET 7, E
	//#0xFB:
	,function (parentObj) {
		parentObj.registerE |= 0x80;
	}
	//SET 7, H
	//#0xFC:
	,function (parentObj) {
		parentObj.registersHL |= 0x8000;
	}
	//SET 7, L
	//#0xFD:
	,function (parentObj) {
		parentObj.registersHL |= 0x80;
	}
	//SET 7, (HL)
	//#0xFE:
	,function (parentObj) {
		parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL) | 0x80);
	}
	//SET 7, A
	//#0xFF:
	,function (parentObj) {
		parentObj.registerA |= 0x80;
	}
];

function read_word_operand (parentObj) {
	var low_byte = parentObj.memoryRead(parentObj.programCounter);
	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;

	var high_byte = parentObj.memoryRead(parentObj.programCounter);
	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;

	return (high_byte << 8) | low_byte;
};

var reg_combo = {

	inc_op: function (reg_name) {
		return function (parentObj) {
			var value = reg_combo.get(parentObj, reg_name) + 1;
			reg_combo.set(parentObj, reg_name, value);
		};
	},

	dec_op: function (reg_name) {
		return function (parentObj) {
			var value = (reg_combo.get(parentObj, reg_name) - 1) & 0xFFFF;
			reg_combo.set(parentObj, reg_name, value);
		};
	},

	get: function (parentObj, reg_name) {
		var reg_high = 'register' + reg_name[0];
		var reg_low = 'register' + reg_name[1];
		return (parentObj[reg_high] << 8) | parentObj[reg_low];
	},

	set: function (parentObj, reg_name, value) {
		var reg_high = 'register' + reg_name[0];
		var reg_low = 'register' + reg_name[1];
		parentObj[reg_high] = (value >> 8) & 0xFF;
		parentObj[reg_low] = value & 0xFF;
	},
};

function nop (_parentObj) {
}

function ld_reg_n (reg_name) {
	return function(parentObj) {
		parentObj['register' + reg_name] = parentObj.memoryRead(parentObj.programCounter);
		parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	};
}

function ld_reg_nn (regNames) {
	var ld_reg0 = ld_reg_n(regNames[0]);
	var ld_reg1 = ld_reg_n(regNames[1]);
	return function(parentObj) {
		ld_reg1(parentObj);
		ld_reg0(parentObj);
	};
}

// NOP
OPCODE[0x00] = nop;

/* INC */
function update_flags_inc8 (parentObj, value) {
	parentObj.FZero = (value == 0);
	parentObj.FHalfCarry = ((value & 0xF) == 0);
	parentObj.FSubtract = false;
}

function inc_reg8_op (reg_name) {
	return function (parentObj) {
		var regKey = 'register' + reg_name;
		var value = (parentObj[regKey] + 1) & 0xFF;
		parentObj[regKey] = value;
		update_flags_inc8(parentObj, value);
	};
}

// INC A
OPCODE[0x3C] = inc_reg8_op('A');
// INC B
OPCODE[0x04] = inc_reg8_op('B');
// INC C
OPCODE[0x0C] = inc_reg8_op('C');
// INC D
OPCODE[0x14] = inc_reg8_op('D');
// INC E
OPCODE[0x1C] = inc_reg8_op('E');
// INC BC
OPCODE[0x03] = reg_combo.inc_op('BC');
// INC DE
OPCODE[0x13] = reg_combo.inc_op('DE');
// INC HL
OPCODE[0x23] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL + 1) & 0xFFFF;
};
// INC H
OPCODE[0x24] = function (parentObj) {
	var H = ((parentObj.registersHL >> 8) + 1) & 0xFF;
	parentObj.registersHL = (H << 8) | (parentObj.registersHL & 0xFF);
	update_flags_inc8(parentObj, H);
};
// INC L
OPCODE[0x2C] = function (parentObj) {
	var L = (parentObj.registersHL + 1) & 0xFF;
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | L;
	update_flags_inc8(parentObj, L);
};
// INC (HL)
OPCODE[0x34] = function (parentObj) {
	var value = (parentObj.memoryRead(parentObj.registersHL) + 1) & 0xFF;
	parentObj.memoryWrite(parentObj.registersHL, value);
	update_flags_inc8(parentObj, value);
};
// INC SP
OPCODE[0x33] = function (parentObj) {
	parentObj.stackPointer = (parentObj.stackPointer + 1) & 0xFFFF;
};

/* DEC */
function update_flags_dec8 (parentObj, value) {
	parentObj.FZero = (value == 0);
	parentObj.FHalfCarry = ((value & 0xF) == 0xF);
	parentObj.FSubtract = true;
}

function dec_reg8_op (reg_name) {
	return function (parentObj) {
		var regKey = 'register' + reg_name;
		var value = (parentObj[regKey] - 1) & 0xFF;
		parentObj[regKey] = value;
		update_flags_dec8(parentObj, value);
	};
}

// DEC A
OPCODE[0x3D] = dec_reg8_op('A');
// DEC B
OPCODE[0x05] = dec_reg8_op('B');
// DEC C
OPCODE[0x0D] = dec_reg8_op('C');
// DEC D
OPCODE[0x15] = dec_reg8_op('D');
// DEC E
OPCODE[0x1D] = dec_reg8_op('E');
// DEC BC
OPCODE[0x0B] = reg_combo.dec_op('BC');
// DEC DE
OPCODE[0x1B] = reg_combo.dec_op('DE');
// DEC HL
OPCODE[0x2B] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL - 1) & 0xFFFF;
};
// DEC H
OPCODE[0x25] = function (parentObj) {
	var H = ((parentObj.registersHL >> 8) - 1) & 0xFF;
	parentObj.registersHL = (H << 8) | (parentObj.registersHL & 0xFF);
	update_flags_dec8(parentObj, H);
};
// DEC L
OPCODE[0x2D] = function (parentObj) {
	var L = (parentObj.registersHL - 1) & 0xFF;
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | L;
	update_flags_dec8(parentObj, L);
};

// DEC (HL)
OPCODE[0x35] = function (parentObj) {
	var value = (parentObj.memoryRead(parentObj.registersHL) - 1) & 0xFF;
	parentObj.memoryWrite(parentObj.registersHL, value);
	update_flags_dec8(parentObj, value);
};

// DEC SP
OPCODE[0x3B] = function (parentObj) {
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
};




/* LD [reg8], [reg8] */
function ld_reg_reg(dst_reg_name, src_reg_name) {
	var dst_reg = 'register' + dst_reg_name;
	var src_reg = 'register' + src_reg_name
	return function (parentObj) {
		parentObj[dst_reg] = parentObj[src_reg];
	};
}

// LD A, A
OPCODE[0x7F] = ld_reg_reg('A', 'A');
// LD A, B
OPCODE[0x78] = ld_reg_reg('A', 'B');
// LD A, C
OPCODE[0x79] = ld_reg_reg('A', 'C');
// LD A, D
OPCODE[0x7A] = ld_reg_reg('A', 'D');
// LD A, E
OPCODE[0x7B] = ld_reg_reg('A', 'E');
// LD B, A
OPCODE[0x47] = ld_reg_reg('B', 'A');
// LD B, B
OPCODE[0x40] = ld_reg_reg('B', 'B');
// LD B, C
OPCODE[0x41] = ld_reg_reg('B', 'C');
// LD B, D
OPCODE[0x42] = ld_reg_reg('B', 'D');
// LD B, E
OPCODE[0x43] = ld_reg_reg('B', 'E');
// LD C, A
OPCODE[0x4F] = ld_reg_reg('C', 'A');
// LD C, B
OPCODE[0x48] = ld_reg_reg('C', 'B');
// LD C, C
OPCODE[0x49] = ld_reg_reg('C', 'C');
// LD C, D
OPCODE[0x4A] = ld_reg_reg('C', 'D');
// LD C, E
OPCODE[0x4B] = ld_reg_reg('C', 'E');
// LD D, A
OPCODE[0x57] = ld_reg_reg('D', 'A');
// LD D, B
OPCODE[0x50] = ld_reg_reg('D', 'B');
// LD D, C
OPCODE[0x51] = ld_reg_reg('D', 'C');
// LD D, D
OPCODE[0x52] = ld_reg_reg('D', 'D');
// LD D, E
OPCODE[0x53] = ld_reg_reg('D', 'E');
// LD E, A
OPCODE[0x5F] = ld_reg_reg('E', 'A');
// LD E, B
OPCODE[0x58] = ld_reg_reg('E', 'B');
// LD E, C
OPCODE[0x59] = ld_reg_reg('E', 'C');
// LD E, D
OPCODE[0x5A] = ld_reg_reg('E', 'D');
// LD E, E
OPCODE[0x5b] = ld_reg_reg('E', 'E');

// LD SP, HL
OPCODE[0xF9] = function (parentObj) {
	parentObj.stackPointer = parentObj.registersHL;
};


// LD H, H
OPCODE[0x64] = ld_reg_reg('H', 'H');
// LD H, L
OPCODE[0x65] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF) * 0x101;
};
// LD L, H
OPCODE[0x6C] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | (parentObj.registersHL >> 8);
};
// LD L, L
OPCODE[0x6D] = ld_reg_reg('L', 'L');



/* LD [reg8], H */

// LD A, H
OPCODE[0x7C] = function (parentObj) {
	parentObj.registerA = parentObj.registersHL >> 8;
};
// LD B, H
OPCODE[0x44] = function (parentObj) {
	parentObj.registerB = parentObj.registersHL >> 8;
};
// LD C, H
OPCODE[0x4C] = function (parentObj) {
	parentObj.registerC = parentObj.registersHL >> 8;
};
// LD D, H
OPCODE[0x54] = function (parentObj) {
	parentObj.registerD = parentObj.registersHL >> 8;
};
// LD E, H
OPCODE[0x5C] = function (parentObj) {
	parentObj.registerE = parentObj.registersHL >> 8;
};



/* LD [reg8], L */

// LD A, L
OPCODE[0x7D] = function (parentObj) {
	parentObj.registerA = parentObj.registersHL & 0xFF;
};
// LD B, L
OPCODE[0x45] = function (parentObj) {
	parentObj.registerB = parentObj.registersHL & 0xFF;
};
// LD C, L
OPCODE[0x4D] = function (parentObj) {
	parentObj.registerC = parentObj.registersHL & 0xFF;
};
// LD D, L
OPCODE[0x55] = function (parentObj) {
	parentObj.registerD = parentObj.registersHL & 0xFF;
};
// LD E, L
OPCODE[0x5D] = function (parentObj) {
	parentObj.registerE = parentObj.registersHL & 0xFF;
};



/* LD H, [reg8] */

// LD H, A
OPCODE[0x67] = function (parentObj) {
	parentObj.registersHL = (parentObj.registerA << 8) | (parentObj.registersHL & 0xFF);
};
// LD H, B
OPCODE[0x60] = function (parentObj) {
	parentObj.registersHL = (parentObj.registerB << 8) | (parentObj.registersHL & 0xFF);
};
// LD H, C
OPCODE[0x61] = function (parentObj) {
	parentObj.registersHL = (parentObj.registerC << 8) | (parentObj.registersHL & 0xFF);
};
// LD H, D
OPCODE[0x62] = function (parentObj) {
	parentObj.registersHL = (parentObj.registerD << 8) | (parentObj.registersHL & 0xFF);
};
// LD H, E
OPCODE[0x63] = function (parentObj) {
	parentObj.registersHL = (parentObj.registerE << 8) | (parentObj.registersHL & 0xFF);
};



/* LD L, [reg8] */

// LD L, A
OPCODE[0x6F] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerA;
};
// LD L, B
OPCODE[0x68] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerB;
};
// LD L, C
OPCODE[0x69] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerC;
};
// LD L, D
OPCODE[0x6A] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerD;
};
// LD L, E
OPCODE[0x6B] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.registerE;
};



/* LD [reg8], n */

// LD A, n
OPCODE[0x3E] = ld_reg_n('A');
// LD B, n
OPCODE[0x06] = ld_reg_n('B');
// LD C, n
OPCODE[0x0E] = ld_reg_n('C');
// LD D, n
OPCODE[0x16] = ld_reg_n('D');
// LD E, n
OPCODE[0x1E] = ld_reg_n('E');
// LD H, n
OPCODE[0x26] = function (parentObj) {
	parentObj.registersHL = (parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter) << 8) | (parentObj.registersHL & 0xFF);
	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
};
// LD L, n
OPCODE[0x2E] = function (parentObj) {
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | parentObj.memoryReader[parentObj.programCounter](parentObj, parentObj.programCounter);
	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
};
// LD BC, nn
OPCODE[0x01] = ld_reg_nn('BC');
// LD DE, nn
OPCODE[0x11] = ld_reg_nn('DE');
// LD HL, nn
OPCODE[0x21] = function (parentObj) {
	parentObj.registersHL = read_word_operand(parentObj);
};
// LD SP, nn
OPCODE[0x31] = function (parentObj) {
	parentObj.stackPointer = read_word_operand(parentObj);
};



/* LD [reg8], (HL) */

// LD A, (HL)
OPCODE[0x7E] = function (parentObj) {
	parentObj.registerA = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
};
// LD B, (HL)
OPCODE[0x46] = function (parentObj) {
	parentObj.registerB = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
};
// LD C, (HL)
OPCODE[0x4E] = function (parentObj) {
	parentObj.registerC = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
};
// LD D, (HL)
OPCODE[0x56] = function (parentObj) {
	parentObj.registerD = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
};
// LD E, (HL)
OPCODE[0x5E] = function (parentObj) {
	parentObj.registerE = parentObj.memoryReader[parentObj.registersHL](parentObj, parentObj.registersHL);
};
// LD H, (HL)
OPCODE[0x66] = function (parentObj) {
	var mem_value = parentObj.memoryRead(parentObj.registersHL);
	parentObj.registersHL = (mem_value << 8) | (parentObj.registersHL & 0xFF);
};
// LD L, (HL)
OPCODE[0x6E] = function (parentObj) {
	var mem_value = parentObj.memoryRead(parentObj.registersHL);
	parentObj.registersHL = (parentObj.registersHL & 0xFF00) | mem_value;
};



/* LD (HL), [reg8] */

// LD (HL), A
OPCODE[0x77] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerA);
};
// LD (HL), B
OPCODE[0x70] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerB);
};
// LD (HL), C
OPCODE[0x71] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerC);
};
// LD (HL), D
OPCODE[0x72] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerD);
};
// LD (HL), E
OPCODE[0x73] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registerE);
};
// LD (HL), H
OPCODE[0x74] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registersHL >> 8);
};
// LD (HL), L
OPCODE[0x75] = function (parentObj) {
	parentObj.memoryWriter[parentObj.registersHL](parentObj, parentObj.registersHL, parentObj.registersHL & 0xFF);
};

// LD (HL), n
OPCODE[0x36] = function (parentObj) {
	var value = parentObj.memoryRead(parentObj.programCounter);
	parentObj.programCounter = (parentObj.programCounter + 1) & 0xFFFF;
	parentObj.memoryWrite(parentObj.registersHL, value);
};



/* LD [reg16], nn */

// LD A, (BC)
OPCODE[0x0A] = function (parentObj) {
	var address = reg_combo.get(parentObj, 'BC');
	parentObj.registerA = parentObj.memoryRead(address);
};
// LD A, (DE)
OPCODE[0x1A] = function (parentObj) {
	var address = reg_combo.get(parentObj, 'DE');
	parentObj.registerA = parentObj.memoryRead(address);
};



// LD (BC), A
OPCODE[0x02] = function (parentObj) {
	var address = reg_combo.get(parentObj, 'BC');
	var value = parentObj.registerA;
	parentObj.memoryWrite(address, value);
};
// LD (DE), A
OPCODE[0x12] = function (parentObj) {
	var address = reg_combo.get(parentObj, 'DE');
	var value = parentObj.registerA;
	parentObj.memoryWrite(address, value);
};

// LD (nn), A
OPCODE[0xEA] = function (parentObj) {
	var addr16 = read_word_operand(parentObj);
	parentObj.memoryWrite(addr16, parentObj.registerA);
};
// LD (nn), SP
OPCODE[0x08] = function (parentObj) {
	var low_addr16 = read_word_operand(parentObj);
	var low_byte = parentObj.stackPointer & 0xFF;
	parentObj.memoryWrite(low_addr16, low_byte);

	var high_addr16 = (low_addr16 + 1) & 0xFFFF;
	var high_byte = parentObj.stackPointer >> 8;
	parentObj.memoryWrite(high_addr16, high_byte);
};
// LD A, (nn)
OPCODE[0xFA] = function (parentObj) {
	var addr16 = read_word_operand(parentObj);
	parentObj.registerA = parentObj.memoryRead(addr16);
};

// PUSH BC
OPCODE[0xC5] = function (parentObj) {
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerB);
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerC);
};
// PUSH DE
OPCODE[0xD5] = function (parentObj) {
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerD);
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerE);
};
// PUSH HL
OPCODE[0xE5] = function (parentObj) {
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registersHL >> 8);
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registersHL & 0xFF);
};
// POP BC
OPCODE[0xC1] = function (parentObj) {
	parentObj.registerC = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
	parentObj.registerB = parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF);
	parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
};
// POP DE
OPCODE[0xD1] = function (parentObj) {
	parentObj.registerE = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
	parentObj.registerD = parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF);
	parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
};
// POP HL
OPCODE[0xE1] = function (parentObj) {
	parentObj.registersHL = (parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF) << 8) | parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
	parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
};
// PUSH AF
OPCODE[0xF5] = function (parentObj) {
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, parentObj.registerA);
	parentObj.stackPointer = (parentObj.stackPointer - 1) & 0xFFFF;
	var flags = (parentObj.FZero ? 0x80 : 0) |
		(parentObj.FSubtract ? 0x40 : 0) |
		(parentObj.FHalfCarry ? 0x20 : 0) |
		(parentObj.FCarry ? 0x10 : 0);
	parentObj.memoryWriter[parentObj.stackPointer](parentObj, parentObj.stackPointer, flags);
};
// POP AF
OPCODE[0xF1] = function (parentObj) {
	var temp_var = parentObj.memoryReader[parentObj.stackPointer](parentObj, parentObj.stackPointer);
	parentObj.FZero = (temp_var > 0x7F);
	parentObj.FSubtract = ((temp_var & 0x40) == 0x40);
	parentObj.FHalfCarry = ((temp_var & 0x20) == 0x20);
	parentObj.FCarry = ((temp_var & 0x10) == 0x10);
	parentObj.registerA = parentObj.memoryRead((parentObj.stackPointer + 1) & 0xFFFF);
	parentObj.stackPointer = (parentObj.stackPointer + 2) & 0xFFFF;
};

/* [ADD A, n] */
function add_A_n (parentObj, value) {
	var dirty_sum = parentObj.registerA + value;
	parentObj.FHalfCarry = ((dirty_sum & 0xF) < (parentObj.registerA & 0xF));
	parentObj.FCarry = (dirty_sum > 0xFF);
	parentObj.registerA = dirty_sum & 0xFF;
	parentObj.FZero = (parentObj.registerA == 0);
	parentObj.FSubtract = false;
}
// ADD A, A
OPCODE[0x87] = function (parentObj) {
	add_A_n(parentObj, parentObj.registerA);
};
// ADD A, B
OPCODE[0x80] = function (parentObj) {
	add_A_n(parentObj, parentObj.registerB);
};
// ADD A, C
OPCODE[0x81] = function (parentObj) {
	add_A_n(parentObj, parentObj.registerC);
};
// ADD A, D
OPCODE[0x82] = function (parentObj) {
	add_A_n(parentObj, parentObj.registerD);
};
// ADD A, E
OPCODE[0x83] = function (parentObj) {
	add_A_n(parentObj, parentObj.registerE);
};
// ADD A, H
OPCODE[0x84] = function (parentObj) {
	var value = parentObj.registersHL >> 8;
	add_A_n(parentObj, value);
};
// ADD A, L
OPCODE[0x85] = function (parentObj) {
	var value = parentObj.registersHL & 0xFF;
	add_A_n(parentObj, value);
};
// ADD A, (HL)
OPCODE[0x86] = function (parentObj) {
	var value = parentObj.memoryRead(parentObj.registersHL);
	add_A_n(parentObj, value);
};

/* [ADD HL, n] */
function add_hl (parentObj, value) {
	var dirty_sum = parentObj.registersHL + value;
	parentObj.FHalfCarry = ((parentObj.registersHL & 0xFFF) > (dirty_sum & 0xFFF));
	parentObj.FCarry = (dirty_sum > 0xFFFF);
	parentObj.registersHL = dirty_sum & 0xFFFF;
	parentObj.FSubtract = false;
}
// ADD HL, BC
OPCODE[0x09] = function (parentObj) {
	var value = ((parentObj.registerB << 8) | parentObj.registerC);
	add_hl(parentObj, value);
};
// ADD HL, DE
OPCODE[0x19] = function (parentObj) {
	var value = ((parentObj.registerD << 8) | parentObj.registerE);
	add_hl(parentObj, value);
};
// ADD HL, HL
OPCODE[0x29] = function (parentObj) {
	var value = parentObj.registersHL;
	add_hl(parentObj, value);
};
// ADD HL, SP
OPCODE[0x39] = function (parentObj) {
	var value = parentObj.stackPointer;
	add_hl(parentObj, value);
};

/* [SUB A, n] */
function sub_A_n (parentObj, value) {
	var dirty_sum = parentObj.registerA - value;
	parentObj.FHalfCarry = ((parentObj.registerA & 0xF) < (dirty_sum & 0xF));
	parentObj.FCarry = (dirty_sum < 0);
	parentObj.registerA = dirty_sum & 0xFF;
	parentObj.FZero = (dirty_sum == 0);
	parentObj.FSubtract = true;
}
// SUB A, A
OPCODE[0x97] = function (parentObj) {
	sub_A_n(parentObj, parentObj.registerA);
};
// SUB A, B
OPCODE[0x90] = function (parentObj) {
	sub_A_n(parentObj, parentObj.registerB);
};
// SUB A, C
OPCODE[0x91] = function (parentObj) {
	sub_A_n(parentObj, parentObj.registerC);
};
// SUB A, D
OPCODE[0x92] = function (parentObj) {
	sub_A_n(parentObj, parentObj.registerD);
};
// SUB A, E
OPCODE[0x93] = function (parentObj) {
	sub_A_n(parentObj, parentObj.registerE);
};
