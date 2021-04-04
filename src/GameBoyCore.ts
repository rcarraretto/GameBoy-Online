import { XAudioServer } from './XAudioServer';
import { Resize } from './resize';
import { cout } from './terminal';
import { settings } from './settings';
import { OPCODE } from './opcodes';
import { GBBOOTROM, GBCBOOTROM, ffxxDump, SecondaryTICKTable, TICKTable } from './constants';
import { CachedDuty } from './types';
import { getTypedArray, toTypedArray, fromTypedArray } from './typed-array';

 /*
  JavaScript GameBoy Color Emulator
  Copyright (C) 2010-2016 Grant Galitz

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export class GameBoyCore {
    public canvas: HTMLCanvasElement;
    private ROMImage: string;
    private pause: () => void;
    public registerA: number;
    public registerB: number;
    public registerC: number;
    public registerD: number;
    public registerE: number;
    // Register F - Result was zero
    public FZero: boolean;
    // Register F - Subtraction was executed
    public FSubtract: boolean;
    // Register F - Half carry or half borrow
    public FHalfCarry: boolean;
    // Register F - Carry or borrow
    public FCarry: boolean;
    public registersHL: number;
    public stackPointer: number;
    public programCounter: number;
    // Relative CPU clocking to speed set, rounded appropriately
    private CPUCyclesTotal: number;
    // Relative CPU clocking to speed set base
    private CPUCyclesTotalBase: number;
    // Relative CPU clocking to speed set, the directly used value
    private CPUCyclesTotalCurrent: number;
    // Clocking per iteration rounding catch
    private CPUCyclesTotalRoundoff: number;
    // CPU clocks per iteration at 1x speed
    private baseCPUCyclesPerIteration: number;
    // HALT clocking overrun carry over
    private remainingClocks: number;
    // Whether we're in the GBC boot ROM
    private inBootstrap: boolean;
    // Updated upon ROM loading...
    public usedBootROM: boolean;
    // Did we boot to the GBC boot ROM?
    private usedGBCBootROM: boolean;
    // Has the CPU been suspended until the next interrupt?
    private halt: boolean;
    // Did we trip the DMG Halt bug?
    public skipPCIncrement: boolean;
    // Has the emulation been paused or a frame has ended?
    public stopEmulator: number;
    // Are interrupts enabled?
    public IME: boolean;
    // CPU IRQ assertion
    private IRQLineMatched: number;
    // IF Register
    public interruptsRequested: number;
    // IE Register
    public interruptsEnabled: number;
    // HDMA Transfer Flag - GBC only
    private hdmaRunning: boolean;
    // The number of clock cycles emulated
    public CPUTicks: number;
    // GBC double speed clocking shifter
    public doubleSpeedShifter: number;
    // Joypad State (two four-bit states actually)
    private JoyPad: number;
    // CPU STOP status
    private CPUStopped: boolean;
    // Array of functions mapped to read back memory
    public memoryReader: any[];
    // Array of functions mapped to write to memory
    public memoryWriter: any[];
    // Array of functions mapped to read back 0xFFXX memory
    public memoryHighReader: any[];
    // Array of functions mapped to write to 0xFFXX memory
    public memoryHighWriter: any[];
    // The full ROM file dumped to an array
    private ROM: any[];
    // Main Core Memory
    public memory: any[];
    // Switchable RAM (Used by games for more RAM) for the main memory range 0xA000 - 0xC000
    private MBCRam: any[];
    // Extra VRAM bank for GBC
    private VRAM: any[];
    // GBC main RAM Banks
    private GBCMemory: any[];
    // MBC1 Type (4/32, 16/8)
    private MBC1Mode: boolean;
    // MBC RAM Access Control
    private MBCRAMBanksEnabled: boolean;
    // MBC Currently Indexed RAM Bank
    private currMBCRAMBank: number;
    // MBC Position Adder;
    private currMBCRAMBankPosition: number;
    // GameBoy Color detection
    public cGBC: boolean;
    // Currently Switched GameBoy Color ram bank
    private gbcRamBank: number;
    // GBC RAM offset from address start
    private gbcRamBankPosition: number;
    // GBC RAM (ECHO mirroring) offset from address start
    private gbcRamBankPositionECHO: number;
    // Used to map the RAM banks to maximum size the MBC used can do
    private RAMBanks: number[];
    // Offset of the ROM bank switching
    private ROMBank1offs: number;
    // The parsed current ROM bank selection
    private currentROMBank: number;
    // Cartridge Type
    private cartridgeType: number;
    // Name of the game
    public name: string;
    // Game code (Suffix for older games)
    private gameCode: string;
    // Indicate if the game was loaded from a save state
    public fromSaveState: boolean;
    // When loaded in as a save state, this will not be empty
    public savedStateFileName: string;
    // Tracker for STAT triggering
    private STATTracker: number;
    // The scan line mode (for lines 1-144 it's 2-3-0, for 145-154 it's 1)
    private modeSTAT: number;
    // Mode 3 extra clocking counter (Depends on how many sprites are on the current line)
    private spriteCount: number;
    // Should we trigger an interrupt if LY==LYC?
    private LYCMatchTriggerSTAT: boolean;
    // Should we trigger an interrupt if in mode 2?
    private mode2TriggerSTAT: boolean;
    // Should we trigger an interrupt if in mode 1?
    private mode1TriggerSTAT: boolean;
    // Should we trigger an interrupt if in mode 0?
    private mode0TriggerSTAT: boolean;
    // Is the emulated LCD controller on?
    private LCDisOn: boolean;
    // Array of functions to handle each scan line we do (onscreen + offscreen)
    private LINECONTROL: any[];
    private DISPLAYOFFCONTROL: any[];
    // Pointer to either LINECONTROL or DISPLAYOFFCONTROL
    private LCDCONTROL: any[];
    private RTCisLatched: boolean;
    // RTC latched seconds
    private latchedSeconds: number;
    // RTC latched minutes
    private latchedMinutes: number;
    // RTC latched hours
    private latchedHours: number;
    // RTC latched lower 8-bits of the day counter
    private latchedLDays: number;
    // RTC latched high-bit of the day counter
    private latchedHDays: number;
    // RTC seconds counter
    private RTCSeconds: number;
    // RTC minutes counter
    private RTCMinutes: number;
    // RTC hours counter
    private RTCHours: number;
    // RTC days counter
    private RTCDays: number;
    // Did the RTC overflow and wrap the day counter?
    private RTCDayOverFlow: boolean;
    // Is the RTC allowed to clock up?
    private RTCHALT: boolean;
    private highX: number;
    private lowX: number;
    private highY: number;
    private lowY: number;
    // XAudioJS handle
    private audioHandle: any;
    // Length of the sound buffers
    private numSamplesTotal: number;
    private dutyLookup: CachedDuty[];
    // Buffer maintenance metric
    private bufferContainAmount: number;
    private LSFR15Table: any[];
    private LSFR7Table: any[];
    private noiseSampleTable: any[];
    private soundMasterEnabled: boolean;
    // Channel 3 adjusted sample buffer
    private channel3PCM: any[];
    // Computed post-mixing volume
    private VinLeftChannelMasterVolume: number;
    // Computed post-mixing volume
    private VinRightChannelMasterVolume: number;
    private leftChannel1: boolean;
    private leftChannel2: boolean;
    private leftChannel3: boolean;
    private leftChannel4: boolean;
    private rightChannel1: boolean;
    private rightChannel2: boolean;
    private rightChannel3: boolean;
    private rightChannel4: boolean;
    private audioClocksUntilNextEvent: number;
    private audioClocksUntilNextEventCounter: number;
    private channel1currentSampleLeft: number;
    private channel1currentSampleRight: number;
    private channel2currentSampleLeft: number;
    private channel2currentSampleRight: number;
    private channel3currentSampleLeft: number;
    private channel3currentSampleRight: number;
    private channel4currentSampleLeft: number;
    private channel4currentSampleRight: number;
    private channel1currentSampleLeftSecondary: number;
    private channel1currentSampleRightSecondary: number;
    private channel2currentSampleLeftSecondary: number;
    private channel2currentSampleRightSecondary: number;
    private channel3currentSampleLeftSecondary: number;
    private channel3currentSampleRightSecondary: number;
    private channel4currentSampleLeftSecondary: number;
    private channel4currentSampleRightSecondary: number;
    private channel1currentSampleLeftTrimary: number;
    private channel1currentSampleRightTrimary: number;
    private channel2currentSampleLeftTrimary: number;
    private channel2currentSampleRightTrimary: number;
    private mixerOutputCache: number;
    private emulatorSpeed: number;
    // Used to sample the audio system every x CPU instructions
    private audioTicks: number;
    // Used to keep alignment on audio generation
    private audioIndex: number;
    private downsampleInput: number;
    // Used to keep alignment on audio generation
    private audioDestinationPosition: number;
    // Times for how many instructions to execute before ending the loop
    private emulatorTicks: number;
    // DIV Ticks Counter (Invisible lower 8-bit)
    private DIVTicks: number;
    // Counter for how many instructions have been executed on a scanline so far
    private LCDTicks: number;
    // Counter for the TIMA timer
    private timerTicks: number;
    private TIMAEnabled: boolean;
    // Timer Max Ticks
    private TACClocker: number;
    // Serial IRQ Timer
    private serialTimer: number;
    // Serial Transfer Shift Timer
    private serialShiftTimer: number;
    // The last time we iterated the main loop
    private lastIteration: number;
    public firstIteration: number;
    private actualScanLine: number;
    // Last rendered scan line
    private lastUnrenderedLine: number;
    private queuedScanLines: number;
    private totalLinesPassed: number;
    // Post-Halt clocking
    private haltPostClocks: number;
    // Does the cartridge use MBC1?
    private cMBC1: boolean;
    // Does the cartridge use MBC2?
    private cMBC2: boolean;
    // Does the cartridge use MBC3?
    private cMBC3: boolean;
    // Does the cartridge use MBC5?
    private cMBC5: boolean;
    // Does the cartridge use MBC7?
    private cMBC7: boolean;
    // Does the cartridge use save RAM?
    private cSRAM: boolean;
    private cMMMO1: boolean;
    // Does the cartridge use the RUMBLE addressing (modified MBC5)?
    private cRUMBLE: boolean
    // Is the cartridge actually a GameBoy Camera?
    private cCamera: boolean;
    // Does the cartridge use TAMA5? (Tamagotchi Cartridge)
    private cTAMA5: boolean;
    // Does the cartridge use HuC3 (Hudson Soft / modified MBC3)?
    private cHuC3: boolean;
    // Does the cartridge use HuC1 (Hudson Soft / modified MBC1)?
    private cHuC1: boolean;
    // Does the cartridge have an RTC?
    public cTIMER: boolean;
    private ROMBanks: number[];
    // How many RAM banks were actually allocated?
    private numRAMBanks: number;
    // Current VRAM bank for GBC
    private currVRAMBank: number;
    // Register SCX (X-Scroll)
    private backgroundX: number;
    // Register SCY (Y-Scroll)
    private backgroundY: number;
    // Is the windows enabled?
    private gfxWindowDisplay: boolean;
    // Are sprites enabled?
    private gfxSpriteShow: boolean;
    // Are we doing 8x8 or 8x16 sprites?
    private gfxSpriteNormalHeight: boolean;
    // Is the BG enabled?
    private bgEnabled: boolean;
    // Can we flag the BG for priority over sprites?
    private BGPriorityEnabled: boolean;
    // The current bank of the character map the window uses
    private gfxWindowCHRBankPosition: number;
    // The current bank of the character map the BG uses
    private gfxBackgroundCHRBankPosition: number;
    // Fast mapping of the tile numbering
    private gfxBackgroundBankOffset: number;
    // Current Y offset of the window
    private windowY: number;
    // Current X offset of the window
    private windowX: number;
    // To prevent the repeating of drawing a blank screen
    private drewBlank: number;
    // Throttle how many draws we can do to once per iteration
    private drewFrame: boolean;
    // mid-scanline rendering offset
    private midScanlineOffset: number;
    // track the x-coord limit for line rendering (mid-scanline usage)
    private pixelEnd: number;
    // The x-coord we left off at for mid-scanline rendering
    private currentX: number;
    private BGCHRBank1: any[];
    private BGCHRBank2: any[];
    private BGCHRCurrentBank: any[];
    private tileCache: any[];
    // "Classic" GameBoy palette colors
    private colors: number[];
    private OBJPalette: any[];
    private BGPalette: any[];
    private gbcOBJRawPalette: any[];
    private gbcBGRawPalette: any[];
    private gbOBJPalette: any[];
    private gbBGPalette: any[];
    private gbcOBJPalette: any[];
    private gbcBGPalette: any[];
    private gbBGColorizedPalette: any[];
    private gbOBJColorizedPalette: any[];
    private cachedBGPaletteConversion: any[];
    private cachedOBJPaletteConversion: any[];
    private updateGBBGPalette: (data) => void;
    private updateGBOBJPalette: (index, data) => void;
    private colorizedGBPalettes: boolean;
    // Reference to the BG rendering function
    private BGLayerRender: (number) => void;
    // Reference to the window rendering function
    private WindowLayerRender: (number) => void;
    // Reference to the OAM rendering function
    private SpriteLayerRender: (number) => void;
    // The internal frame-buffer
    private frameBuffer: any[]
    // The secondary gfx buffer that holds the converted RGBA values
    private swizzledFrame: any[]
    // imageData handle
    private canvasBuffer: ImageData;
    // Temp variable for holding the current working framebuffer offset
    private pixelStart: number;
    public onscreenWidth: number;
    public onscreenHeight: number;
    private offscreenWidth: number;
    private offscreenHeight: number;
    private offscreenRGBCount: number;
    private resizePathClear: boolean;
    // Serial Transfer Shift Timer Refill
    private serialShiftTimerAllocated: number;
    // Are the interrupts on queue to be enabled?
    public IRQEnableDelay: number;
    public iterations: number;
    public cBATT: boolean;
    private channel1Enabled: boolean;
    private channel1canPlay: boolean;
    private channel1FrequencyTracker: number;
    private channel1FrequencyCounter: number;
    private channel1totalLength: number;
    private channel1envelopeVolume: number;
    private channel1envelopeType: boolean;
    private channel1envelopeSweeps: number;
    private channel1envelopeSweepsLast: number;
    private channel1consecutive: boolean;
    private channel1frequency: number;
    private channel1SweepFault: boolean;
    private channel1ShadowFrequency: number;
    private channel1timeSweep: number;
    private channel1lastTimeSweep: number;
    private channel1Swept: boolean;
    private channel1frequencySweepDivider: number;
    private channel1decreaseSweep: boolean;
    private channel2Enabled: boolean;
    private channel2canPlay: boolean;
    private channel2FrequencyTracker: number;
    private channel2FrequencyCounter: number;
    private channel2totalLength: number;
    private channel2envelopeVolume: number;
    private channel2envelopeType: boolean;
    private channel2envelopeSweeps: number;
    private channel2envelopeSweepsLast: number;
    private channel2consecutive: boolean;
    private channel2frequency: number;
    private channel3Enabled: boolean;
    private channel3canPlay: boolean;
    private channel3totalLength: number;
    private channel3envelopeVolume: number;
    private channel3patternType: number;
    private channel3frequency: number;
    private channel3consecutive: boolean;
    private channel4Enabled: boolean;
    private channel4canPlay: boolean;
    private channel4FrequencyPeriod: number;
    private channel4lastSampleLookup: number;
    private channel4totalLength: number;
    private channel4envelopeVolume: number;
    private channel4currentVolume: number;
    private channel4envelopeType: boolean;
    private channel4envelopeSweeps: number;
    private channel4envelopeSweepsLast: number;
    private channel4consecutive: boolean;
    private channel4BitRange: number;
    private channel1DutyTracker: number;
    private channel1CachedDuty: CachedDuty;
    private channel2DutyTracker: number;
    private channel2CachedDuty: CachedDuty;
    private sequencerClocks: any;
    private sequencePosition: any;
    private channel3Counter: any;
    private channel4Counter: any;
    private cachedChannel3Sample: any;
    private cachedChannel4Sample: any;
    private channel3FrequencyPeriod: any;
    private channel3lastSampleLookup: any;
    private ROMBankEdge: number;
    private TICKTable: any[];
    public SecondaryTICKTable: any[];
    private channel4VolumeShifter: number;
    public openRTC: (string) => any;
    public openMBC: (string) => any;
    private numROMBanks: number;
    private clocksPerSecond: number;
    private canvasOffscreen: HTMLCanvasElement;
    private drawContextOffscreen: CanvasRenderingContext2D;
    private drawContextOnscreen: CanvasRenderingContext2D;
    private resizer: any;
    private audioResamplerFirstPassFactor: number;
    private downSampleInputDivider: number;
    private audioBuffer: any[];
    private sortBuffer: any[];
    private OAMAddressCache: any[];

    constructor(canvas: HTMLCanvasElement = null, ROMImage: string = null, pause: () => void = null) {
	this.canvas = canvas;
	this.ROMImage = ROMImage;
	this.pause = pause;
	//CPU Registers and Flags:
	this.registerA = 0x01;
	this.FZero = true;
	this.FSubtract = false;
	this.FHalfCarry = true;
	this.FCarry = true;
	this.registerB = 0x00;
	this.registerC = 0x13;
	this.registerD = 0x00;
	this.registerE = 0xD8;
	this.registersHL = 0x014D;
	this.stackPointer = 0xFFFE;
	this.programCounter = 0x0100;
	//Some CPU Emulation State Variables:
	this.CPUCyclesTotal = 0;
	this.CPUCyclesTotalBase = 0;
	this.CPUCyclesTotalCurrent = 0;
	this.CPUCyclesTotalRoundoff = 0;
	this.baseCPUCyclesPerIteration	= 0;
	this.remainingClocks = 0;
	this.inBootstrap = true;
	this.usedBootROM = false;
	this.usedGBCBootROM = false;
	this.halt = false;
	this.skipPCIncrement = false;
	this.stopEmulator = 3;
	this.IME = true;
	this.IRQLineMatched = 0;
	this.interruptsRequested = 0;
	this.interruptsEnabled = 0;
	this.hdmaRunning = false;
	this.CPUTicks = 0;
	this.doubleSpeedShifter = 0;
	this.JoyPad = 0xFF;
	this.CPUStopped = false;
	//Main RAM, MBC RAM, GBC Main RAM, VRAM, etc.
	this.memoryReader = [];
	this.memoryWriter = [];
	this.memoryHighReader = [];
	this.memoryHighWriter = [];
	this.ROM = [];
	this.memory = [];
	this.MBCRam = [];
	this.VRAM = [];
	this.GBCMemory = [];
	this.MBC1Mode = false;
	this.MBCRAMBanksEnabled = false;
	this.currMBCRAMBank = 0;
	this.currMBCRAMBankPosition = -0xA000;
	this.cGBC = false;
	this.gbcRamBank = 1;
	this.gbcRamBankPosition = -0xD000;
	this.gbcRamBankPositionECHO = -0xF000;
	this.RAMBanks = [0, 1, 2, 4, 16];
	this.ROMBank1offs = 0;
	this.currentROMBank = 0;
	this.cartridgeType = 0;
	this.name = "";
	this.gameCode = "";
	this.fromSaveState = false;
	this.savedStateFileName = "";
	this.STATTracker = 0;
	this.modeSTAT = 0;
	this.spriteCount = 252;
	this.LYCMatchTriggerSTAT = false;
	this.mode2TriggerSTAT = false;
	this.mode1TriggerSTAT = false;
	this.mode0TriggerSTAT = false;
	this.LCDisOn = false;
	this.LINECONTROL = [];
	this.DISPLAYOFFCONTROL = [function (_parentObj: GameBoyCore) {
		//Array of line 0 function to handle the LCD controller when it's off (Do nothing!).
	}];
	this.LCDCONTROL = null;
	this.initializeLCDController();				//Compile the LCD controller functions.
	//RTC (Real Time Clock for MBC3):
	this.RTCisLatched = false;
	this.latchedSeconds = 0;
	this.latchedMinutes = 0;
	this.latchedHours = 0;
	this.latchedLDays = 0;
	this.latchedHDays = 0;
	this.RTCSeconds = 0;
	this.RTCMinutes = 0;
	this.RTCHours = 0;
	this.RTCDays = 0;
	this.RTCDayOverFlow = false;
	this.RTCHALT = false;
	//Gyro:
	this.highX = 127;
	this.lowX = 127;
	this.highY = 127;
	this.lowY = 127;
	//Sound variables:
	this.audioHandle = null;
	this.numSamplesTotal = 0;
	this.dutyLookup = [								//Map the duty values given to ones we can work with.
		[false, false, false, false, false, false, false, true],
		[true, false, false, false, false, false, false, true],
		[true, false, false, false, false, true, true, true],
		[false, true, true, true, true, true, true, false]
	];
	this.bufferContainAmount = 0;
	this.LSFR15Table = null;
	this.LSFR7Table = null;
	this.noiseSampleTable = null;
	this.initializeAudioStartState();
	this.soundMasterEnabled = false;
	this.channel3PCM = null;
	//Vin Shit:
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	//Channel paths enabled:
	this.leftChannel1 = false;
	this.leftChannel2 = false;
	this.leftChannel3 = false;
	this.leftChannel4 = false;
	this.rightChannel1 = false;
	this.rightChannel2 = false;
	this.rightChannel3 = false;
	this.rightChannel4 = false;
	this.audioClocksUntilNextEvent = 1;
	this.audioClocksUntilNextEventCounter = 1;
	//Channel output level caches:
	this.channel1currentSampleLeft = 0;
	this.channel1currentSampleRight = 0;
	this.channel2currentSampleLeft = 0;
	this.channel2currentSampleRight = 0;
	this.channel3currentSampleLeft = 0;
	this.channel3currentSampleRight = 0;
	this.channel4currentSampleLeft = 0;
	this.channel4currentSampleRight = 0;
	this.channel1currentSampleLeftSecondary = 0;
	this.channel1currentSampleRightSecondary = 0;
	this.channel2currentSampleLeftSecondary = 0;
	this.channel2currentSampleRightSecondary = 0;
	this.channel3currentSampleLeftSecondary = 0;
	this.channel3currentSampleRightSecondary = 0;
	this.channel4currentSampleLeftSecondary = 0;
	this.channel4currentSampleRightSecondary = 0;
	this.channel1currentSampleLeftTrimary = 0;
	this.channel1currentSampleRightTrimary = 0;
	this.channel2currentSampleLeftTrimary = 0;
	this.channel2currentSampleRightTrimary = 0;
	this.mixerOutputCache = 0;
	//Pre-multipliers to cache some calculations:
	this.emulatorSpeed = 1;
	this.initializeTiming();
	//Audio generation counters:
	this.audioTicks = 0;
	this.audioIndex = 0;
	this.downsampleInput = 0;
	this.audioDestinationPosition = 0;
	//Timing Variables
	this.emulatorTicks = 0;
	this.DIVTicks = 56;
	this.LCDTicks = 60;
	this.timerTicks = 0;
	this.TIMAEnabled = false;
	this.TACClocker = 1024;
	this.serialTimer = 0;
	this.serialShiftTimer = 0;
	this.serialShiftTimerAllocated = 0;
	this.IRQEnableDelay = 0;
	var dateVar = new Date();
	this.lastIteration = dateVar.getTime();
	dateVar = new Date();
	this.firstIteration = dateVar.getTime();
	this.iterations = 0;
	this.actualScanLine = 0;
	this.lastUnrenderedLine = 0;
	this.queuedScanLines = 0;
	this.totalLinesPassed = 0;
	this.haltPostClocks = 0;
	//ROM Cartridge Components:
	this.cMBC1 = false;
	this.cMBC2 = false;
	this.cMBC3 = false;
	this.cMBC5 = false;
	this.cMBC7 = false;
	this.cSRAM = false;
	this.cMMMO1 = false;
	this.cRUMBLE = false;
	this.cCamera = false;
	this.cTAMA5 = false;
	this.cHuC3 = false;
	this.cHuC1 = false;
	this.cTIMER = false;
	this.ROMBanks = [					// 1 Bank = 16 KBytes = 256 Kbits
		2, 4, 8, 16, 32, 64, 128, 256, 512
	];
	this.ROMBanks[0x52] = 72;
	this.ROMBanks[0x53] = 80;
	this.ROMBanks[0x54] = 96;
	this.numRAMBanks = 0;
	////Graphics Variables
	this.currVRAMBank = 0;
	this.backgroundX = 0;
	this.backgroundY = 0;
	this.gfxWindowDisplay = false;
	this.gfxSpriteShow = false;
	this.gfxSpriteNormalHeight = true;
	this.bgEnabled = true;
	this.BGPriorityEnabled = true;
	this.gfxWindowCHRBankPosition = 0;
	this.gfxBackgroundCHRBankPosition = 0;
	this.gfxBackgroundBankOffset = 0x80;
	this.windowY = 0;
	this.windowX = 0;
	this.drewBlank = 0;
	this.drewFrame = false;
	this.midScanlineOffset = -1;
	this.pixelEnd = 0;
	this.currentX = 0;
	//BG Tile Pointer Caches:
	this.BGCHRBank1 = null;
	this.BGCHRBank2 = null;
	this.BGCHRCurrentBank = null;
	//Tile Data Cache:
	this.tileCache = null;
	//Palettes:
	this.colors = [0xEFFFDE, 0xADD794, 0x529273, 0x183442];
	this.OBJPalette = null;
	this.BGPalette = null;
	this.gbcOBJRawPalette = null;
	this.gbcBGRawPalette = null;
	this.gbOBJPalette = null;
	this.gbBGPalette = null;
	this.gbcOBJPalette = null;
	this.gbcBGPalette = null;
	this.gbBGColorizedPalette = null;
	this.gbOBJColorizedPalette = null;
	this.cachedBGPaletteConversion = null;
	this.cachedOBJPaletteConversion = null;
	this.updateGBBGPalette = this.updateGBRegularBGPalette;
	this.updateGBOBJPalette = this.updateGBRegularOBJPalette;
	this.colorizedGBPalettes = false;
	this.BGLayerRender = null;
	this.WindowLayerRender = null;
	this.SpriteLayerRender = null;
	this.frameBuffer = [];
	this.swizzledFrame = null;
	this.canvasBuffer = null;
	this.pixelStart = 0;
	//Variables used for scaling in JS:
	this.onscreenWidth = this.offscreenWidth = 160;
	this.onscreenHeight = this.offscreenHeight = 144;
	this.offscreenRGBCount = this.onscreenWidth * this.onscreenHeight * 4;
	this.resizePathClear = true;
	//Initialize the white noise cache tables ahead of time:
	this.intializeWhiteNoise();
    }

public saveSRAMState() {
	if (!this.cBATT || this.MBCRam.length == 0) {
		//No battery backup...
		return [];
	}
	else {
		//Return the MBC RAM for backup...
		return fromTypedArray(this.MBCRam);
	}
}

public saveRTCState() {
	if (!this.cTIMER) {
		//No battery backup...
		return [];
	}
	else {
		//Return the MBC RAM for backup...
		return [
			this.lastIteration,
			this.RTCisLatched,
			this.latchedSeconds,
			this.latchedMinutes,
			this.latchedHours,
			this.latchedLDays,
			this.latchedHDays,
			this.RTCSeconds,
			this.RTCMinutes,
			this.RTCHours,
			this.RTCDays,
			this.RTCDayOverFlow,
			this.RTCHALT
		];
	}
}

public saveState() {
	return [
		fromTypedArray(this.ROM),
		this.inBootstrap,
		this.registerA,
		this.FZero,
		this.FSubtract,
		this.FHalfCarry,
		this.FCarry,
		this.registerB,
		this.registerC,
		this.registerD,
		this.registerE,
		this.registersHL,
		this.stackPointer,
		this.programCounter,
		this.halt,
		this.IME,
		this.hdmaRunning,
		this.CPUTicks,
		this.doubleSpeedShifter,
		fromTypedArray(this.memory),
		fromTypedArray(this.MBCRam),
		fromTypedArray(this.VRAM),
		this.currVRAMBank,
		fromTypedArray(this.GBCMemory),
		this.MBC1Mode,
		this.MBCRAMBanksEnabled,
		this.currMBCRAMBank,
		this.currMBCRAMBankPosition,
		this.cGBC,
		this.gbcRamBank,
		this.gbcRamBankPosition,
		this.ROMBank1offs,
		this.currentROMBank,
		this.cartridgeType,
		this.name,
		this.gameCode,
		this.modeSTAT,
		this.LYCMatchTriggerSTAT,
		this.mode2TriggerSTAT,
		this.mode1TriggerSTAT,
		this.mode0TriggerSTAT,
		this.LCDisOn,
		this.gfxWindowCHRBankPosition,
		this.gfxWindowDisplay,
		this.gfxSpriteShow,
		this.gfxSpriteNormalHeight,
		this.gfxBackgroundCHRBankPosition,
		this.gfxBackgroundBankOffset,
		this.TIMAEnabled,
		this.DIVTicks,
		this.LCDTicks,
		this.timerTicks,
		this.TACClocker,
		this.serialTimer,
		this.serialShiftTimer,
		this.serialShiftTimerAllocated,
		this.IRQEnableDelay,
		this.lastIteration,
		this.cMBC1,
		this.cMBC2,
		this.cMBC3,
		this.cMBC5,
		this.cMBC7,
		this.cSRAM,
		this.cMMMO1,
		this.cRUMBLE,
		this.cCamera,
		this.cTAMA5,
		this.cHuC3,
		this.cHuC1,
		this.drewBlank,
		fromTypedArray(this.frameBuffer),
		this.bgEnabled,
		this.BGPriorityEnabled,
		this.channel1FrequencyTracker,
		this.channel1FrequencyCounter,
		this.channel1totalLength,
		this.channel1envelopeVolume,
		this.channel1envelopeType,
		this.channel1envelopeSweeps,
		this.channel1envelopeSweepsLast,
		this.channel1consecutive,
		this.channel1frequency,
		this.channel1SweepFault,
		this.channel1ShadowFrequency,
		this.channel1timeSweep,
		this.channel1lastTimeSweep,
		this.channel1Swept,
		this.channel1frequencySweepDivider,
		this.channel1decreaseSweep,
		this.channel2FrequencyTracker,
		this.channel2FrequencyCounter,
		this.channel2totalLength,
		this.channel2envelopeVolume,
		this.channel2envelopeType,
		this.channel2envelopeSweeps,
		this.channel2envelopeSweepsLast,
		this.channel2consecutive,
		this.channel2frequency,
		this.channel3canPlay,
		this.channel3totalLength,
		this.channel3patternType,
		this.channel3frequency,
		this.channel3consecutive,
		fromTypedArray(this.channel3PCM),
		this.channel4FrequencyPeriod,
		this.channel4lastSampleLookup,
		this.channel4totalLength,
		this.channel4envelopeVolume,
		this.channel4currentVolume,
		this.channel4envelopeType,
		this.channel4envelopeSweeps,
		this.channel4envelopeSweepsLast,
		this.channel4consecutive,
		this.channel4BitRange,
		this.soundMasterEnabled,
		this.VinLeftChannelMasterVolume,
		this.VinRightChannelMasterVolume,
		this.leftChannel1,
		this.leftChannel2,
		this.leftChannel3,
		this.leftChannel4,
		this.rightChannel1,
		this.rightChannel2,
		this.rightChannel3,
		this.rightChannel4,
		this.channel1currentSampleLeft,
		this.channel1currentSampleRight,
		this.channel2currentSampleLeft,
		this.channel2currentSampleRight,
		this.channel3currentSampleLeft,
		this.channel3currentSampleRight,
		this.channel4currentSampleLeft,
		this.channel4currentSampleRight,
		this.channel1currentSampleLeftSecondary,
		this.channel1currentSampleRightSecondary,
		this.channel2currentSampleLeftSecondary,
		this.channel2currentSampleRightSecondary,
		this.channel3currentSampleLeftSecondary,
		this.channel3currentSampleRightSecondary,
		this.channel4currentSampleLeftSecondary,
		this.channel4currentSampleRightSecondary,
		this.channel1currentSampleLeftTrimary,
		this.channel1currentSampleRightTrimary,
		this.channel2currentSampleLeftTrimary,
		this.channel2currentSampleRightTrimary,
		this.mixerOutputCache,
		this.channel1DutyTracker,
		this.channel1CachedDuty,
		this.channel2DutyTracker,
		this.channel2CachedDuty,
		this.channel1Enabled,
		this.channel2Enabled,
		this.channel3Enabled,
		this.channel4Enabled,
		this.sequencerClocks,
		this.sequencePosition,
		this.channel3Counter,
		this.channel4Counter,
		this.cachedChannel3Sample,
		this.cachedChannel4Sample,
		this.channel3FrequencyPeriod,
		this.channel3lastSampleLookup,
		this.actualScanLine,
		this.lastUnrenderedLine,
		this.queuedScanLines,
		this.RTCisLatched,
		this.latchedSeconds,
		this.latchedMinutes,
		this.latchedHours,
		this.latchedLDays,
		this.latchedHDays,
		this.RTCSeconds,
		this.RTCMinutes,
		this.RTCHours,
		this.RTCDays,
		this.RTCDayOverFlow,
		this.RTCHALT,
		this.usedBootROM,
		this.skipPCIncrement,
		this.STATTracker,
		this.gbcRamBankPositionECHO,
		this.numRAMBanks,
		this.windowY,
		this.windowX,
		fromTypedArray(this.gbcOBJRawPalette),
		fromTypedArray(this.gbcBGRawPalette),
		fromTypedArray(this.gbOBJPalette),
		fromTypedArray(this.gbBGPalette),
		fromTypedArray(this.gbcOBJPalette),
		fromTypedArray(this.gbcBGPalette),
		fromTypedArray(this.gbBGColorizedPalette),
		fromTypedArray(this.gbOBJColorizedPalette),
		fromTypedArray(this.cachedBGPaletteConversion),
		fromTypedArray(this.cachedOBJPaletteConversion),
		fromTypedArray(this.BGCHRBank1),
		fromTypedArray(this.BGCHRBank2),
		this.haltPostClocks,
		this.interruptsRequested,
		this.interruptsEnabled,
		this.remainingClocks,
		this.colorizedGBPalettes,
		this.backgroundY,
		this.backgroundX,
		this.CPUStopped,
		this.audioClocksUntilNextEvent,
		this.audioClocksUntilNextEventCounter
	];
}

public returnFromState(returnedFrom) {
	var index = 0;
	var state = returnedFrom.slice(0);
	this.ROM = toTypedArray(state[index++], "uint8");
	this.ROMBankEdge = Math.floor(this.ROM.length / 0x4000);
	this.inBootstrap = state[index++];
	this.registerA = state[index++];
	this.FZero = state[index++];
	this.FSubtract = state[index++];
	this.FHalfCarry = state[index++];
	this.FCarry = state[index++];
	this.registerB = state[index++];
	this.registerC = state[index++];
	this.registerD = state[index++];
	this.registerE = state[index++];
	this.registersHL = state[index++];
	this.stackPointer = state[index++];
	this.programCounter = state[index++];
	this.halt = state[index++];
	this.IME = state[index++];
	this.hdmaRunning = state[index++];
	this.CPUTicks = state[index++];
	this.doubleSpeedShifter = state[index++];
	this.memory = toTypedArray(state[index++], "uint8");
	this.MBCRam = toTypedArray(state[index++], "uint8");
	this.VRAM = toTypedArray(state[index++], "uint8");
	this.currVRAMBank = state[index++];
	this.GBCMemory = toTypedArray(state[index++], "uint8");
	this.MBC1Mode = state[index++];
	this.MBCRAMBanksEnabled = state[index++];
	this.currMBCRAMBank = state[index++];
	this.currMBCRAMBankPosition = state[index++];
	this.cGBC = state[index++];
	this.gbcRamBank = state[index++];
	this.gbcRamBankPosition = state[index++];
	this.ROMBank1offs = state[index++];
	this.currentROMBank = state[index++];
	this.cartridgeType = state[index++];
	this.name = state[index++];
	this.gameCode = state[index++];
	this.modeSTAT = state[index++];
	this.LYCMatchTriggerSTAT = state[index++];
	this.mode2TriggerSTAT = state[index++];
	this.mode1TriggerSTAT = state[index++];
	this.mode0TriggerSTAT = state[index++];
	this.LCDisOn = state[index++];
	this.gfxWindowCHRBankPosition = state[index++];
	this.gfxWindowDisplay = state[index++];
	this.gfxSpriteShow = state[index++];
	this.gfxSpriteNormalHeight = state[index++];
	this.gfxBackgroundCHRBankPosition = state[index++];
	this.gfxBackgroundBankOffset = state[index++];
	this.TIMAEnabled = state[index++];
	this.DIVTicks = state[index++];
	this.LCDTicks = state[index++];
	this.timerTicks = state[index++];
	this.TACClocker = state[index++];
	this.serialTimer = state[index++];
	this.serialShiftTimer = state[index++];
	this.serialShiftTimerAllocated = state[index++];
	this.IRQEnableDelay = state[index++];
	this.lastIteration = state[index++];
	this.cMBC1 = state[index++];
	this.cMBC2 = state[index++];
	this.cMBC3 = state[index++];
	this.cMBC5 = state[index++];
	this.cMBC7 = state[index++];
	this.cSRAM = state[index++];
	this.cMMMO1 = state[index++];
	this.cRUMBLE = state[index++];
	this.cCamera = state[index++];
	this.cTAMA5 = state[index++];
	this.cHuC3 = state[index++];
	this.cHuC1 = state[index++];
	this.drewBlank = state[index++];
	this.frameBuffer = toTypedArray(state[index++], "int32");
	this.bgEnabled = state[index++];
	this.BGPriorityEnabled = state[index++];
	this.channel1FrequencyTracker = state[index++];
	this.channel1FrequencyCounter = state[index++];
	this.channel1totalLength = state[index++];
	this.channel1envelopeVolume = state[index++];
	this.channel1envelopeType = state[index++];
	this.channel1envelopeSweeps = state[index++];
	this.channel1envelopeSweepsLast = state[index++];
	this.channel1consecutive = state[index++];
	this.channel1frequency = state[index++];
	this.channel1SweepFault = state[index++];
	this.channel1ShadowFrequency = state[index++];
	this.channel1timeSweep = state[index++];
	this.channel1lastTimeSweep = state[index++];
	this.channel1Swept = state[index++];
	this.channel1frequencySweepDivider = state[index++];
	this.channel1decreaseSweep = state[index++];
	this.channel2FrequencyTracker = state[index++];
	this.channel2FrequencyCounter = state[index++];
	this.channel2totalLength = state[index++];
	this.channel2envelopeVolume = state[index++];
	this.channel2envelopeType = state[index++];
	this.channel2envelopeSweeps = state[index++];
	this.channel2envelopeSweepsLast = state[index++];
	this.channel2consecutive = state[index++];
	this.channel2frequency = state[index++];
	this.channel3canPlay = state[index++];
	this.channel3totalLength = state[index++];
	this.channel3patternType = state[index++];
	this.channel3frequency = state[index++];
	this.channel3consecutive = state[index++];
	this.channel3PCM = toTypedArray(state[index++], "int8");
	this.channel4FrequencyPeriod = state[index++];
	this.channel4lastSampleLookup = state[index++];
	this.channel4totalLength = state[index++];
	this.channel4envelopeVolume = state[index++];
	this.channel4currentVolume = state[index++];
	this.channel4envelopeType = state[index++];
	this.channel4envelopeSweeps = state[index++];
	this.channel4envelopeSweepsLast = state[index++];
	this.channel4consecutive = state[index++];
	this.channel4BitRange = state[index++];
	this.soundMasterEnabled = state[index++];
	this.VinLeftChannelMasterVolume = state[index++];
	this.VinRightChannelMasterVolume = state[index++];
	this.leftChannel1 = state[index++];
	this.leftChannel2 = state[index++];
	this.leftChannel3 = state[index++];
	this.leftChannel4 = state[index++];
	this.rightChannel1 = state[index++];
	this.rightChannel2 = state[index++];
	this.rightChannel3 = state[index++];
	this.rightChannel4 = state[index++];
	this.channel1currentSampleLeft = state[index++];
	this.channel1currentSampleRight = state[index++];
	this.channel2currentSampleLeft = state[index++];
	this.channel2currentSampleRight = state[index++];
	this.channel3currentSampleLeft = state[index++];
	this.channel3currentSampleRight = state[index++];
	this.channel4currentSampleLeft = state[index++];
	this.channel4currentSampleRight = state[index++];
	this.channel1currentSampleLeftSecondary = state[index++];
	this.channel1currentSampleRightSecondary = state[index++];
	this.channel2currentSampleLeftSecondary = state[index++];
	this.channel2currentSampleRightSecondary = state[index++];
	this.channel3currentSampleLeftSecondary = state[index++];
	this.channel3currentSampleRightSecondary = state[index++];
	this.channel4currentSampleLeftSecondary = state[index++];
	this.channel4currentSampleRightSecondary = state[index++];
	this.channel1currentSampleLeftTrimary = state[index++];
	this.channel1currentSampleRightTrimary = state[index++];
	this.channel2currentSampleLeftTrimary = state[index++];
	this.channel2currentSampleRightTrimary = state[index++];
	this.mixerOutputCache = state[index++];
	this.channel1DutyTracker = state[index++];
	this.channel1CachedDuty = state[index++];
	this.channel2DutyTracker = state[index++];
	this.channel2CachedDuty = state[index++];
	this.channel1Enabled = state[index++];
	this.channel2Enabled = state[index++];
	this.channel3Enabled = state[index++];
	this.channel4Enabled = state[index++];
	this.sequencerClocks = state[index++];
	this.sequencePosition = state[index++];
	this.channel3Counter = state[index++];
	this.channel4Counter = state[index++];
	this.cachedChannel3Sample = state[index++];
	this.cachedChannel4Sample = state[index++];
	this.channel3FrequencyPeriod = state[index++];
	this.channel3lastSampleLookup = state[index++];
	this.actualScanLine = state[index++];
	this.lastUnrenderedLine = state[index++];
	this.queuedScanLines = state[index++];
	this.RTCisLatched = state[index++];
	this.latchedSeconds = state[index++];
	this.latchedMinutes = state[index++];
	this.latchedHours = state[index++];
	this.latchedLDays = state[index++];
	this.latchedHDays = state[index++];
	this.RTCSeconds = state[index++];
	this.RTCMinutes = state[index++];
	this.RTCHours = state[index++];
	this.RTCDays = state[index++];
	this.RTCDayOverFlow = state[index++];
	this.RTCHALT = state[index++];
	this.usedBootROM = state[index++];
	this.skipPCIncrement = state[index++];
	this.STATTracker = state[index++];
	this.gbcRamBankPositionECHO = state[index++];
	this.numRAMBanks = state[index++];
	this.windowY = state[index++];
	this.windowX = state[index++];
	this.gbcOBJRawPalette = toTypedArray(state[index++], "uint8");
	this.gbcBGRawPalette = toTypedArray(state[index++], "uint8");
	this.gbOBJPalette = toTypedArray(state[index++], "int32");
	this.gbBGPalette = toTypedArray(state[index++], "int32");
	this.gbcOBJPalette = toTypedArray(state[index++], "int32");
	this.gbcBGPalette = toTypedArray(state[index++], "int32");
	this.gbBGColorizedPalette = toTypedArray(state[index++], "int32");
	this.gbOBJColorizedPalette = toTypedArray(state[index++], "int32");
	this.cachedBGPaletteConversion = toTypedArray(state[index++], "int32");
	this.cachedOBJPaletteConversion = toTypedArray(state[index++], "int32");
	this.BGCHRBank1 = toTypedArray(state[index++], "uint8");
	this.BGCHRBank2 = toTypedArray(state[index++], "uint8");
	this.haltPostClocks = state[index++];
	this.interruptsRequested = state[index++];
	this.interruptsEnabled = state[index++];
	this.checkIRQMatching();
	this.remainingClocks = state[index++];
	this.colorizedGBPalettes = state[index++];
	this.backgroundY = state[index++];
	this.backgroundX = state[index++];
	this.CPUStopped = state[index++];
	this.audioClocksUntilNextEvent = state[index++];
	this.audioClocksUntilNextEventCounter = state[index];
	this.fromSaveState = true;
	this.TICKTable = toTypedArray(TICKTable, "uint8");
	this.SecondaryTICKTable = toTypedArray(SecondaryTICKTable, "uint8");
	this.initializeReferencesFromSaveState();
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
	this.initLCD();
	this.initSound();
	this.noiseSampleTable = (this.channel4BitRange == 0x7FFF) ? this.LSFR15Table : this.LSFR7Table;
	this.channel4VolumeShifter = (this.channel4BitRange == 0x7FFF) ? 15 : 7;
}

private returnFromRTCState() {
	if (typeof this.openRTC == "function" && this.cTIMER) {
		var rtcData = this.openRTC(this.name);
		var index = 0;
		this.lastIteration = rtcData[index++];
		this.RTCisLatched = rtcData[index++];
		this.latchedSeconds = rtcData[index++];
		this.latchedMinutes = rtcData[index++];
		this.latchedHours = rtcData[index++];
		this.latchedLDays = rtcData[index++];
		this.latchedHDays = rtcData[index++];
		this.RTCSeconds = rtcData[index++];
		this.RTCMinutes = rtcData[index++];
		this.RTCHours = rtcData[index++];
		this.RTCDays = rtcData[index++];
		this.RTCDayOverFlow = rtcData[index++];
		this.RTCHALT = rtcData[index];
	}
}

public start() {
	this.initMemory();	//Write the startup memory.
	this.ROMLoad();		//Load the ROM into memory and get cartridge information from it.
	this.initLCD();		//Initialize the graphics.
	this.initSound();	//Sound object initialization.
	this.run();			//Start the emulation.
}

private initMemory() {
	//Initialize the RAM:
	this.memory = getTypedArray(0x10000, 0, "uint8");
	this.frameBuffer = getTypedArray(23040, 0xF8F8F8, "int32");
	this.BGCHRBank1 = getTypedArray(0x800, 0, "uint8");
	this.TICKTable = toTypedArray(TICKTable, "uint8");
	this.SecondaryTICKTable = toTypedArray(SecondaryTICKTable, "uint8");
	this.channel3PCM = getTypedArray(0x20, 0, "int8");
}

private generateCacheArray(tileAmount) {
	var tileArray = [];
	var tileNumber = 0;
	while (tileNumber < tileAmount) {
		tileArray[tileNumber++] = getTypedArray(64, 0, "uint8");
	}
	return tileArray;
}

private initSkipBootstrap() {
	//Fill in the boot ROM set register values
	//Default values to the GB boot ROM values, then fill in the GBC boot ROM values after ROM loading
	var index = 0xFF;
	while (index >= 0) {
		if (index >= 0x30 && index < 0x40) {
			this.memoryWrite(0xFF00 | index, ffxxDump[index]);
		}
		else {
			switch (index) {
				case 0x00:
				case 0x01:
				case 0x02:
				case 0x05:
				case 0x07:
				case 0x0F:
				case 0xFF:
					this.memoryWrite(0xFF00 | index, ffxxDump[index]);
					break;
				default:
					this.memory[0xFF00 | index] = ffxxDump[index];
			}
		}
		--index;
	}
	if (this.cGBC) {
		this.memory[0xFF6C] = 0xFE;
		this.memory[0xFF74] = 0xFE;
	}
	else {
		this.memory[0xFF48] = 0xFF;
		this.memory[0xFF49] = 0xFF;
		this.memory[0xFF6C] = 0xFF;
		this.memory[0xFF74] = 0xFF;
	}
	//Start as an unset device:
	cout("Starting without the GBC boot ROM.", 0);
	this.registerA = (this.cGBC) ? 0x11 : 0x1;
	this.registerB = 0;
	this.registerC = 0x13;
	this.registerD = 0;
	this.registerE = 0xD8;
	this.FZero = true;
	this.FSubtract = false;
	this.FHalfCarry = true;
	this.FCarry = true;
	this.registersHL = 0x014D;
	this.LCDCONTROL = this.LINECONTROL;
	this.IME = false;
	this.IRQLineMatched = 0;
	this.interruptsRequested = 225;
	this.interruptsEnabled = 0;
	this.hdmaRunning = false;
	this.CPUTicks = 12;
	this.STATTracker = 0;
	this.modeSTAT = 1;
	this.spriteCount = 252;
	this.LYCMatchTriggerSTAT = false;
	this.mode2TriggerSTAT = false;
	this.mode1TriggerSTAT = false;
	this.mode0TriggerSTAT = false;
	this.LCDisOn = true;
	this.channel1FrequencyTracker = 0x2000;
	this.channel1DutyTracker = 0;
	this.channel1CachedDuty = this.dutyLookup[2];
	this.channel1totalLength = 0;
	this.channel1envelopeVolume = 0;
	this.channel1envelopeType = false;
	this.channel1envelopeSweeps = 0;
	this.channel1envelopeSweepsLast = 0;
	this.channel1consecutive = true;
	this.channel1frequency = 1985;
	this.channel1SweepFault = true;
	this.channel1ShadowFrequency = 1985;
	this.channel1timeSweep = 1;
	this.channel1lastTimeSweep = 0;
	this.channel1Swept = false;
	this.channel1frequencySweepDivider = 0;
	this.channel1decreaseSweep = false;
	this.channel2FrequencyTracker = 0x2000;
	this.channel2DutyTracker = 0;
	this.channel2CachedDuty = this.dutyLookup[2];
	this.channel2totalLength = 0;
	this.channel2envelopeVolume = 0;
	this.channel2envelopeType = false;
	this.channel2envelopeSweeps = 0;
	this.channel2envelopeSweepsLast = 0;
	this.channel2consecutive = true;
	this.channel2frequency = 0;
	this.channel3canPlay = false;
	this.channel3totalLength = 0;
	this.channel3patternType = 4;
	this.channel3frequency = 0;
	this.channel3consecutive = true;
	this.channel3Counter = 0x418;
	this.channel4FrequencyPeriod = 8;
	this.channel4totalLength = 0;
	this.channel4envelopeVolume = 0;
	this.channel4currentVolume = 0;
	this.channel4envelopeType = false;
	this.channel4envelopeSweeps = 0;
	this.channel4envelopeSweepsLast = 0;
	this.channel4consecutive = true;
	this.channel4BitRange = 0x7FFF;
	this.channel4VolumeShifter = 15;
	this.channel1FrequencyCounter = 0x200;
	this.channel2FrequencyCounter = 0x200;
	this.channel3Counter = 0x800;
	this.channel3FrequencyPeriod = 0x800;
	this.channel3lastSampleLookup = 0;
	this.channel4lastSampleLookup = 0;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.soundMasterEnabled = true;
	this.leftChannel1 = true;
	this.leftChannel2 = true;
	this.leftChannel3 = true;
	this.leftChannel4 = true;
	this.rightChannel1 = true;
	this.rightChannel2 = true;
	this.rightChannel3 = false;
	this.rightChannel4 = false;
	this.DIVTicks = 27044;
	this.LCDTicks = 160;
	this.timerTicks = 0;
	this.TIMAEnabled = false;
	this.TACClocker = 1024;
	this.serialTimer = 0;
	this.serialShiftTimer = 0;
	this.serialShiftTimerAllocated = 0;
	this.IRQEnableDelay = 0;
	this.actualScanLine = 144;
	this.lastUnrenderedLine = 0;
	this.gfxWindowDisplay = false;
	this.gfxSpriteShow = false;
	this.gfxSpriteNormalHeight = true;
	this.bgEnabled = true;
	this.BGPriorityEnabled = true;
	this.gfxWindowCHRBankPosition = 0;
	this.gfxBackgroundCHRBankPosition = 0;
	this.gfxBackgroundBankOffset = 0;
	this.windowY = 0;
	this.windowX = 0;
	this.drewBlank = 0;
	this.midScanlineOffset = -1;
	this.currentX = 0;
}

private initBootstrap() {
	//Start as an unset device:
	cout("Starting the selected boot ROM.", 0);
	this.programCounter = 0;
	this.stackPointer = 0;
	this.IME = false;
	this.LCDTicks = 0;
	this.DIVTicks = 0;
	this.registerA = 0;
	this.registerB = 0;
	this.registerC = 0;
	this.registerD = 0;
	this.registerE = 0;
	this.FZero = this.FSubtract = this.FHalfCarry = this.FCarry = false;
	this.registersHL = 0;
	this.leftChannel1 = false;
	this.leftChannel2 = false;
	this.leftChannel3 = false;
	this.leftChannel4 = false;
	this.rightChannel1 = false;
	this.rightChannel2 = false;
	this.rightChannel3 = false;
	this.rightChannel4 = false;
	this.channel2frequency = this.channel1frequency = 0;
	this.channel4consecutive = this.channel2consecutive = this.channel1consecutive = false;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.memory[0xFF00] = 0xF;	//Set the joypad state.
}

private ROMLoad() {
	//Load the first two ROM banks (0x0000 - 0x7FFF) into regular gameboy memory:
	this.ROM = [];
	this.usedBootROM = settings.enable_gbc_bios && ((!settings.gb_boot_rom_utilized && GBCBOOTROM.length == 0x800) || (settings.gb_boot_rom_utilized && GBBOOTROM.length == 0x100));
	var maxLength = this.ROMImage.length;
	if (maxLength < 0x4000) {
		throw(new Error("ROM image size too small."));
	}
	this.ROM = getTypedArray(maxLength, 0, "uint8");
	var romIndex = 0;
	if (this.usedBootROM) {
		if (!settings.gb_boot_rom_utilized) {
			//Patch in the GBC boot ROM into the memory map:
			for (; romIndex < 0x100; ++romIndex) {
				this.memory[romIndex] = GBCBOOTROM[romIndex];											//Load in the GameBoy Color BOOT ROM.
				this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);							//Decode the ROM binary for the switch out.
			}
			for (; romIndex < 0x200; ++romIndex) {
				this.memory[romIndex] = this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);	//Load in the game ROM.
			}
			for (; romIndex < 0x900; ++romIndex) {
				this.memory[romIndex] = GBCBOOTROM[romIndex - 0x100];									//Load in the GameBoy Color BOOT ROM.
				this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);							//Decode the ROM binary for the switch out.
			}
			this.usedGBCBootROM = true;
		}
		else {
			//Patch in the GBC boot ROM into the memory map:
			for (; romIndex < 0x100; ++romIndex) {
				this.memory[romIndex] = GBBOOTROM[romIndex];											//Load in the GameBoy Color BOOT ROM.
				this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);							//Decode the ROM binary for the switch out.
			}
		}
		for (; romIndex < 0x4000; ++romIndex) {
			this.memory[romIndex] = this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);	//Load in the game ROM.
		}
	}
	else {
		//Don't load in the boot ROM:
		for (; romIndex < 0x4000; ++romIndex) {
			this.memory[romIndex] = this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);	//Load in the game ROM.
		}
	}
	//Finish the decoding of the ROM binary:
	for (; romIndex < maxLength; ++romIndex) {
		this.ROM[romIndex] = (this.ROMImage.charCodeAt(romIndex) & 0xFF);
	}
	this.ROMBankEdge = Math.floor(this.ROM.length / 0x4000);
	//Set up the emulator for the cartidge specifics:
	this.interpretCartridge();
	//Check for IRQ matching upon initialization:
	this.checkIRQMatching();
}

public getROMImage(): string {
	//Return the binary version of the ROM image currently running:
	if (this.ROMImage.length > 0) {
		return this.ROMImage;
	}
	var length = this.ROM.length;
	for (var index = 0; index < length; index++) {
		this.ROMImage += String.fromCharCode(this.ROM[index]);
	}
	return this.ROMImage;
}

private interpretCartridge() {
	// ROM name
	for (var index = 0x134; index < 0x13F; index++) {
		if (this.ROMImage.charCodeAt(index) > 0) {
			this.name += this.ROMImage[index];
		}
	}
	// ROM game code (for newer games)
	for (var index = 0x13F; index < 0x143; index++) {
		if (this.ROMImage.charCodeAt(index) > 0) {
			this.gameCode += this.ROMImage[index];
		}
	}
	cout("Game Title: " + this.name + "[" + this.gameCode + "][" + this.ROMImage[0x143] + "]", 0);
	cout("Game Code: " + this.gameCode, 0);
	// Cartridge type
	this.cartridgeType = this.ROM[0x147];
	cout("Cartridge type #" + this.cartridgeType, 0);
	//Map out ROM cartridge sub-types.
	var MBCType = "";
	switch (this.cartridgeType) {
		case 0x00:
			//ROM w/o bank switching
			if (!settings.rom_only_override) {
				MBCType = "ROM";
				break;
			}
		case 0x01:
			this.cMBC1 = true;
			MBCType = "MBC1";
			break;
		case 0x02:
			this.cMBC1 = true;
			this.cSRAM = true;
			MBCType = "MBC1 + SRAM";
			break;
		case 0x03:
			this.cMBC1 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC1 + SRAM + BATT";
			break;
		case 0x05:
			this.cMBC2 = true;
			MBCType = "MBC2";
			break;
		case 0x06:
			this.cMBC2 = true;
			this.cBATT = true;
			MBCType = "MBC2 + BATT";
			break;
		case 0x08:
			this.cSRAM = true;
			MBCType = "ROM + SRAM";
			break;
		case 0x09:
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "ROM + SRAM + BATT";
			break;
		case 0x0B:
			this.cMMMO1 = true;
			MBCType = "MMMO1";
			break;
		case 0x0C:
			this.cMMMO1 = true;
			this.cSRAM = true;
			MBCType = "MMMO1 + SRAM";
			break;
		case 0x0D:
			this.cMMMO1 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MMMO1 + SRAM + BATT";
			break;
		case 0x0F:
			this.cMBC3 = true;
			this.cTIMER = true;
			this.cBATT = true;
			MBCType = "MBC3 + TIMER + BATT";
			break;
		case 0x10:
			this.cMBC3 = true;
			this.cTIMER = true;
			this.cBATT = true;
			this.cSRAM = true;
			MBCType = "MBC3 + TIMER + BATT + SRAM";
			break;
		case 0x11:
			this.cMBC3 = true;
			MBCType = "MBC3";
			break;
		case 0x12:
			this.cMBC3 = true;
			this.cSRAM = true;
			MBCType = "MBC3 + SRAM";
			break;
		case 0x13:
			this.cMBC3 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC3 + SRAM + BATT";
			break;
		case 0x19:
			this.cMBC5 = true;
			MBCType = "MBC5";
			break;
		case 0x1A:
			this.cMBC5 = true;
			this.cSRAM = true;
			MBCType = "MBC5 + SRAM";
			break;
		case 0x1B:
			this.cMBC5 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC5 + SRAM + BATT";
			break;
		case 0x1C:
			this.cRUMBLE = true;
			MBCType = "RUMBLE";
			break;
		case 0x1D:
			this.cRUMBLE = true;
			this.cSRAM = true;
			MBCType = "RUMBLE + SRAM";
			break;
		case 0x1E:
			this.cRUMBLE = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "RUMBLE + SRAM + BATT";
			break;
		case 0x1F:
			this.cCamera = true;
			MBCType = "GameBoy Camera";
			break;
		case 0x22:
			this.cMBC7 = true;
			this.cSRAM = true;
			this.cBATT = true;
			MBCType = "MBC7 + SRAM + BATT";
			break;
		case 0xFD:
			this.cTAMA5 = true;
			MBCType = "TAMA5";
			break;
		case 0xFE:
			this.cHuC3 = true;
			MBCType = "HuC3";
			break;
		case 0xFF:
			this.cHuC1 = true;
			MBCType = "HuC1";
			break;
		default:
			MBCType = "Unknown";
			cout("Cartridge type is unknown.", 2);
			this.pause();
	}
	cout("Cartridge Type: " + MBCType + ".", 0);
	// ROM and RAM banks
	this.numROMBanks = this.ROMBanks[this.ROM[0x148]];
	cout(this.numROMBanks + " ROM banks.", 0);
	switch (this.RAMBanks[this.ROM[0x149]]) {
		case 0:
			cout("No RAM banking requested for allocation or MBC is of type 2.", 0);
			break;
		case 2:
			cout("1 RAM bank requested for allocation.", 0);
			break;
		case 3:
			cout("4 RAM banks requested for allocation.", 0);
			break;
		case 4:
			cout("16 RAM banks requested for allocation.", 0);
			break;
		default:
			cout("RAM bank amount requested is unknown, will use maximum allowed by specified MBC type.", 0);
	}
	//Check the GB/GBC mode byte:
	if (!this.usedBootROM) {
		switch (this.ROM[0x143]) {
			case 0x00:	//Only GB mode
				this.cGBC = false;
				cout("Only GB mode detected.", 0);
				break;
			case 0x32:	//Exception to the GBC identifying code:
				if (!settings.disable_colors && this.name + this.gameCode + this.ROM[0x143] == "Game and Watch 50") {
					this.cGBC = true;
					cout("Created a boot exception for Game and Watch Gallery 2 (GBC ID byte is wrong on the cartridge).", 1);
				}
				else {
					this.cGBC = false;
				}
				break;
			case 0x80:	//Both GB + GBC modes
				this.cGBC = !settings.disable_colors;
				cout("GB and GBC mode detected.", 0);
				break;
			case 0xC0:	//Only GBC mode
				this.cGBC = true;
				cout("Only GBC mode detected.", 0);
				break;
			default:
				this.cGBC = false;
				cout("Unknown GameBoy game type code #" + this.ROM[0x143] + ", defaulting to GB mode (Old games don't have a type code).", 1);
		}
		this.inBootstrap = false;
		this.setupRAM();	//CPU/(V)RAM initialization.
		this.initSkipBootstrap();
	}
	else {
		this.cGBC = this.usedGBCBootROM;	//Allow the GBC boot ROM to run in GBC mode...
		this.setupRAM();	//CPU/(V)RAM initialization.
		this.initBootstrap();
	}
	this.initializeModeSpecificArrays();
	//License Code Lookup:
	var cOldLicense = this.ROM[0x14B];
	var cNewLicense = (this.ROM[0x144] & 0xFF00) | (this.ROM[0x145] & 0xFF);
	if (cOldLicense != 0x33) {
		//Old Style License Header
		cout("Old style license code: " + cOldLicense, 0);
	}
	else {
		//New Style License Header
		cout("New style license code: " + cNewLicense, 0);
	}
	this.ROMImage = "";	//Memory consumption reduction.
}

private disableBootROM() {
	//Remove any traces of the boot ROM from ROM memory.
	for (var index = 0; index < 0x100; ++index) {
		this.memory[index] = this.ROM[index];	//Replace the GameBoy or GameBoy Color boot ROM with the game ROM.
	}
	if (this.usedGBCBootROM) {
		//Remove any traces of the boot ROM from ROM memory.
		for (index = 0x200; index < 0x900; ++index) {
			this.memory[index] = this.ROM[index];	//Replace the GameBoy Color boot ROM with the game ROM.
		}
		if (!this.cGBC) {
			//Clean up the post-boot (GB mode only) state:
			this.GBCtoGBModeAdjust();
		}
		else {
			this.recompileBootIOWriteHandling();
		}
	}
	else {
		this.recompileBootIOWriteHandling();
	}
}

private initializeTiming() {
	//Emulator Timing:
	this.clocksPerSecond = this.emulatorSpeed * 0x400000;
	this.baseCPUCyclesPerIteration = this.clocksPerSecond / 1000 * settings.loop_interval;
	this.CPUCyclesTotalRoundoff = this.baseCPUCyclesPerIteration % 4;
	this.CPUCyclesTotalBase = this.CPUCyclesTotal = (this.baseCPUCyclesPerIteration - this.CPUCyclesTotalRoundoff) | 0;
	this.CPUCyclesTotalCurrent = 0;
}

public setSpeed(speed) {
	this.emulatorSpeed = speed;
	this.initializeTiming();
	if (this.audioHandle) {
		this.initSound();
	}
}

private setupRAM() {
	//Setup the auxilliary/switchable RAM:
	if (this.cMBC2) {
		this.numRAMBanks = 1 / 16;
	}
	else if (this.cMBC1 || this.cRUMBLE || this.cMBC3 || this.cHuC3) {
		this.numRAMBanks = 4;
	}
	else if (this.cMBC5) {
		this.numRAMBanks = 16;
	}
	else if (this.cSRAM) {
		this.numRAMBanks = 1;
	}
	if (this.numRAMBanks > 0) {
		if (!this.MBCRAMUtilized()) {
			//For ROM and unknown MBC cartridges using the external RAM:
			this.MBCRAMBanksEnabled = true;
		}
		//Switched RAM Used
		var MBCRam = (typeof this.openMBC == "function") ? this.openMBC(this.name) : [];
		if (MBCRam.length > 0) {
			//Flash the SRAM into memory:
			this.MBCRam = toTypedArray(MBCRam, "uint8");
		}
		else {
			this.MBCRam = getTypedArray(this.numRAMBanks * 0x2000, 0, "uint8");
		}
	}
	cout("Actual bytes of MBC RAM allocated: " + (this.numRAMBanks * 0x2000), 0);
	this.returnFromRTCState();
	//Setup the RAM for GBC mode.
	if (this.cGBC) {
		this.VRAM = getTypedArray(0x2000, 0, "uint8");
		this.GBCMemory = getTypedArray(0x7000, 0, "uint8");
	}
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
}

private MBCRAMUtilized() {
	return this.cMBC1 || this.cMBC2 || this.cMBC3 || this.cMBC5 || this.cMBC7 || this.cRUMBLE;
}

private recomputeDimension() {
	//Cache some dimension info:
	this.onscreenWidth = this.canvas.width;
	this.onscreenHeight = this.canvas.height;
	if (navigator.userAgent.toLowerCase().indexOf("gecko") != -1 && navigator.userAgent.toLowerCase().indexOf("like gecko") == -1) {
		//Firefox slowness hack:
		this.canvas.width = this.onscreenWidth = (!settings.software_resizing) ? 160 : this.canvas.width;
		this.canvas.height = this.onscreenHeight = (!settings.software_resizing) ? 144 : this.canvas.height;
	}
	else {
		this.onscreenWidth = this.canvas.width;
		this.onscreenHeight = this.canvas.height;
	}
	this.offscreenWidth = (!settings.software_resizing) ? 160 : this.canvas.width;
	this.offscreenHeight = (!settings.software_resizing) ? 144 : this.canvas.height;
	this.offscreenRGBCount = this.offscreenWidth * this.offscreenHeight * 4;
}

public initLCD() {
	this.recomputeDimension();
	if (this.offscreenRGBCount != 92160) {
		//Only create the resizer handle if we need it:
		this.compileResizeFrameBufferFunction();
	}
	else {
		//Resizer not needed:
		this.resizer = null;
	}
	try {
		this.canvasOffscreen = document.createElement("canvas");
		this.canvasOffscreen.width = this.offscreenWidth;
		this.canvasOffscreen.height = this.offscreenHeight;
		this.drawContextOffscreen = this.canvasOffscreen.getContext("2d");
		this.drawContextOnscreen = this.canvas.getContext("2d");
		this.canvas.setAttribute("style", (this.canvas.getAttribute("style") || "") + "; image-rendering: " + ((settings.resize_smoothing) ? "auto" : "-webkit-optimize-contrast") + ";" +
		"image-rendering: " + ((settings.resize_smoothing) ? "optimizeQuality" : "-o-crisp-edges") + ";" +
		"image-rendering: " + ((settings.resize_smoothing) ? "optimizeQuality" : "-moz-crisp-edges") + ";" +
		"-ms-interpolation-mode: " + ((settings.resize_smoothing) ? "bicubic" : "nearest-neighbor") + ";");
		(this.drawContextOffscreen as any).webkitImageSmoothingEnabled  = settings.resize_smoothing;
		(this.drawContextOffscreen as any).mozImageSmoothingEnabled = settings.resize_smoothing;
		(this.drawContextOnscreen as any).webkitImageSmoothingEnabled  = settings.resize_smoothing;
		(this.drawContextOnscreen as any).mozImageSmoothingEnabled = settings.resize_smoothing;
		//Get a CanvasPixelArray buffer:
		try {
			this.canvasBuffer = this.drawContextOffscreen.createImageData(this.offscreenWidth, this.offscreenHeight);
		}
		catch (error) {
			cout("Falling back to the getImageData initialization (Error \"" + error.message + "\").", 1);
			this.canvasBuffer = this.drawContextOffscreen.getImageData(0, 0, this.offscreenWidth, this.offscreenHeight);
		}
		var index = this.offscreenRGBCount;
		while (index > 0) {
			this.canvasBuffer.data[index -= 4] = 0xF8;
			this.canvasBuffer.data[index + 1] = 0xF8;
			this.canvasBuffer.data[index + 2] = 0xF8;
			this.canvasBuffer.data[index + 3] = 0xFF;
		}
		this.graphicsBlit();
		this.canvas.style.visibility = "visible";
		if (this.swizzledFrame == null) {
			this.swizzledFrame = getTypedArray(69120, 0xFF, "uint8");
		}
		//Test the draw system and browser vblank latching:
		this.drewFrame = true;										//Copy the latest graphics to buffer.
		this.requestDraw();
	}
	catch (error) {
		throw(new Error("HTML5 Canvas support required: " + error.message + "file: " + error.fileName + ", line: " + error.lineNumber));
	}
}

private graphicsBlit() {
	if (this.offscreenWidth == this.onscreenWidth && this.offscreenHeight == this.onscreenHeight) {
		this.drawContextOnscreen.putImageData(this.canvasBuffer, 0, 0);
	}
	else {
		this.drawContextOffscreen.putImageData(this.canvasBuffer, 0, 0);
		this.drawContextOnscreen.drawImage(this.canvasOffscreen, 0, 0, this.onscreenWidth, this.onscreenHeight);
	}
}

public JoyPadEvent(key, down) {
	if (down) {
		this.JoyPad &= 0xFF ^ (1 << key);
		if (!this.cGBC && (!this.usedBootROM || !this.usedGBCBootROM)) {
			this.interruptsRequested |= 0x10;	//A real GBC doesn't set this!
			this.remainingClocks = 0;
			this.checkIRQMatching();
		}
	}
	else {
		this.JoyPad |= (1 << key);
	}
	this.memory[0xFF00] = (this.memory[0xFF00] & 0x30) + ((((this.memory[0xFF00] & 0x20) == 0) ? (this.JoyPad >> 4) : 0xF) & (((this.memory[0xFF00] & 0x10) == 0) ? (this.JoyPad & 0xF) : 0xF));
	this.CPUStopped = false;
}

public GyroEvent(x, y) {
	x *= -100;
	x += 2047;
	this.highX = x >> 8;
	this.lowX = x & 0xFF;
	y *= -100;
	y += 2047;
	this.highY = y >> 8;
	this.lowY = y & 0xFF;
}

public initSound() {
	this.audioResamplerFirstPassFactor = Math.max(Math.min(Math.floor(this.clocksPerSecond / 44100), Math.floor(0xFFFF / 0x1E0)), 1);
	this.downSampleInputDivider = 1 / (this.audioResamplerFirstPassFactor * 0xF0);
	if (settings.enable_sound) {
		this.audioHandle = new XAudioServer(2, this.clocksPerSecond / this.audioResamplerFirstPassFactor, 0, Math.max(this.baseCPUCyclesPerIteration * settings.audio_buffer_max / this.audioResamplerFirstPassFactor, 8192) << 1, null, settings.volume, function () {
			settings.enable_sound = false;
		});
		this.initAudioBuffer();
	}
	else if (this.audioHandle) {
		//Mute the audio output, as it has an immediate silencing effect:
		this.audioHandle.changeVolume(0);
	}
}

public changeVolume() {
	if (settings.enable_sound && this.audioHandle) {
		this.audioHandle.changeVolume(settings.volume);
	}
}

private initAudioBuffer() {
	this.audioIndex = 0;
	this.audioDestinationPosition = 0;
	this.downsampleInput = 0;
	this.bufferContainAmount = Math.max(this.baseCPUCyclesPerIteration * settings.audio_buffer_min / this.audioResamplerFirstPassFactor, 4096) << 1;
	this.numSamplesTotal = (this.baseCPUCyclesPerIteration / this.audioResamplerFirstPassFactor) << 1;
	this.audioBuffer = getTypedArray(this.numSamplesTotal, 0, "float32");
}

private intializeWhiteNoise() {
	//Noise Sample Tables:
	var randomFactor = 1;
	//15-bit LSFR Cache Generation:
	this.LSFR15Table = getTypedArray(0x80000, 0, "int8");
	var LSFR = 0x7FFF;	//Seed value has all its bits set.
	var LSFRShifted = 0x3FFF;
	for (var index = 0; index < 0x8000; ++index) {
		//Normalize the last LSFR value for usage:
		randomFactor = 1 - (LSFR & 1);	//Docs say it's the inverse.
		//Cache the different volume level results:
		this.LSFR15Table[0x08000 | index] = randomFactor;
		this.LSFR15Table[0x10000 | index] = randomFactor * 0x2;
		this.LSFR15Table[0x18000 | index] = randomFactor * 0x3;
		this.LSFR15Table[0x20000 | index] = randomFactor * 0x4;
		this.LSFR15Table[0x28000 | index] = randomFactor * 0x5;
		this.LSFR15Table[0x30000 | index] = randomFactor * 0x6;
		this.LSFR15Table[0x38000 | index] = randomFactor * 0x7;
		this.LSFR15Table[0x40000 | index] = randomFactor * 0x8;
		this.LSFR15Table[0x48000 | index] = randomFactor * 0x9;
		this.LSFR15Table[0x50000 | index] = randomFactor * 0xA;
		this.LSFR15Table[0x58000 | index] = randomFactor * 0xB;
		this.LSFR15Table[0x60000 | index] = randomFactor * 0xC;
		this.LSFR15Table[0x68000 | index] = randomFactor * 0xD;
		this.LSFR15Table[0x70000 | index] = randomFactor * 0xE;
		this.LSFR15Table[0x78000 | index] = randomFactor * 0xF;
		//Recompute the LSFR algorithm:
		LSFRShifted = LSFR >> 1;
		LSFR = LSFRShifted | (((LSFRShifted ^ LSFR) & 0x1) << 14);
	}
	//7-bit LSFR Cache Generation:
	this.LSFR7Table = getTypedArray(0x800, 0, "int8");
	LSFR = 0x7F;	//Seed value has all its bits set.
	for (index = 0; index < 0x80; ++index) {
		//Normalize the last LSFR value for usage:
		randomFactor = 1 - (LSFR & 1);	//Docs say it's the inverse.
		//Cache the different volume level results:
		this.LSFR7Table[0x080 | index] = randomFactor;
		this.LSFR7Table[0x100 | index] = randomFactor * 0x2;
		this.LSFR7Table[0x180 | index] = randomFactor * 0x3;
		this.LSFR7Table[0x200 | index] = randomFactor * 0x4;
		this.LSFR7Table[0x280 | index] = randomFactor * 0x5;
		this.LSFR7Table[0x300 | index] = randomFactor * 0x6;
		this.LSFR7Table[0x380 | index] = randomFactor * 0x7;
		this.LSFR7Table[0x400 | index] = randomFactor * 0x8;
		this.LSFR7Table[0x480 | index] = randomFactor * 0x9;
		this.LSFR7Table[0x500 | index] = randomFactor * 0xA;
		this.LSFR7Table[0x580 | index] = randomFactor * 0xB;
		this.LSFR7Table[0x600 | index] = randomFactor * 0xC;
		this.LSFR7Table[0x680 | index] = randomFactor * 0xD;
		this.LSFR7Table[0x700 | index] = randomFactor * 0xE;
		this.LSFR7Table[0x780 | index] = randomFactor * 0xF;
		//Recompute the LSFR algorithm:
		LSFRShifted = LSFR >> 1;
		LSFR = LSFRShifted | (((LSFRShifted ^ LSFR) & 0x1) << 6);
	}
	//Set the default noise table:
	this.noiseSampleTable = this.LSFR15Table;
}

private audioUnderrunAdjustment() {
	if (settings.enable_sound) {
		var underrunAmount = this.audioHandle.remainingBuffer();
		if (typeof underrunAmount == "number") {
			underrunAmount = this.bufferContainAmount - Math.max(underrunAmount, 0);
			if (underrunAmount > 0) {
				this.recalculateIterationClockLimitForAudio((underrunAmount >> 1) * this.audioResamplerFirstPassFactor);
			}
		}
	}
}

private initializeAudioStartState() {
	this.channel1FrequencyTracker = 0x2000;
	this.channel1DutyTracker = 0;
	this.channel1CachedDuty = this.dutyLookup[2];
	this.channel1totalLength = 0;
	this.channel1envelopeVolume = 0;
	this.channel1envelopeType = false;
	this.channel1envelopeSweeps = 0;
	this.channel1envelopeSweepsLast = 0;
	this.channel1consecutive = true;
	this.channel1frequency = 0;
	this.channel1SweepFault = false;
	this.channel1ShadowFrequency = 0;
	this.channel1timeSweep = 1;
	this.channel1lastTimeSweep = 0;
	this.channel1Swept = false;
	this.channel1frequencySweepDivider = 0;
	this.channel1decreaseSweep = false;
	this.channel2FrequencyTracker = 0x2000;
	this.channel2DutyTracker = 0;
	this.channel2CachedDuty = this.dutyLookup[2];
	this.channel2totalLength = 0;
	this.channel2envelopeVolume = 0;
	this.channel2envelopeType = false;
	this.channel2envelopeSweeps = 0;
	this.channel2envelopeSweepsLast = 0;
	this.channel2consecutive = true;
	this.channel2frequency = 0;
	this.channel3canPlay = false;
	this.channel3totalLength = 0;
	this.channel3patternType = 4;
	this.channel3frequency = 0;
	this.channel3consecutive = true;
	this.channel3Counter = 0x800;
	this.channel4FrequencyPeriod = 8;
	this.channel4totalLength = 0;
	this.channel4envelopeVolume = 0;
	this.channel4currentVolume = 0;
	this.channel4envelopeType = false;
	this.channel4envelopeSweeps = 0;
	this.channel4envelopeSweepsLast = 0;
	this.channel4consecutive = true;
	this.channel4BitRange = 0x7FFF;
	this.noiseSampleTable = this.LSFR15Table;
	this.channel4VolumeShifter = 15;
	this.channel1FrequencyCounter = 0x2000;
	this.channel2FrequencyCounter = 0x2000;
	this.channel3Counter = 0x800;
	this.channel3FrequencyPeriod = 0x800;
	this.channel3lastSampleLookup = 0;
	this.channel4lastSampleLookup = 0;
	this.VinLeftChannelMasterVolume = 8;
	this.VinRightChannelMasterVolume = 8;
	this.mixerOutputCache = 0;
	this.sequencerClocks = 0x2000;
	this.sequencePosition = 0;
	this.channel4FrequencyPeriod = 8;
	this.channel4Counter = 8;
	this.cachedChannel3Sample = 0;
	this.cachedChannel4Sample = 0;
	this.channel1Enabled = false;
	this.channel2Enabled = false;
	this.channel3Enabled = false;
	this.channel4Enabled = false;
	this.channel1canPlay = false;
	this.channel2canPlay = false;
	this.channel4canPlay = false;
	this.audioClocksUntilNextEvent = 1;
	this.audioClocksUntilNextEventCounter = 1;
	this.channel1OutputLevelCache();
	this.channel2OutputLevelCache();
	this.channel3OutputLevelCache();
	this.channel4OutputLevelCache();
	this.noiseSampleTable = this.LSFR15Table;
}

private outputAudio() {
	this.audioBuffer[this.audioDestinationPosition++] = (this.downsampleInput >>> 16) * this.downSampleInputDivider - 1;
	this.audioBuffer[this.audioDestinationPosition++] = (this.downsampleInput & 0xFFFF) * this.downSampleInputDivider - 1;
	if (this.audioDestinationPosition == this.numSamplesTotal) {
		this.audioHandle.writeAudioNoCallback(this.audioBuffer);
		this.audioDestinationPosition = 0;
	}
	this.downsampleInput = 0;
}

//Below are the audio generation functions timed against the CPU:
private generateAudio(numSamples) {
	var multiplier = 0;
	if (this.soundMasterEnabled && !this.CPUStopped) {
		for (var clockUpTo = 0; numSamples > 0;) {
			clockUpTo = Math.min(this.audioClocksUntilNextEventCounter, this.sequencerClocks, numSamples);
			this.audioClocksUntilNextEventCounter -= clockUpTo;
			this.sequencerClocks -= clockUpTo;
			numSamples -= clockUpTo;
			while (clockUpTo > 0) {
				multiplier = Math.min(clockUpTo, this.audioResamplerFirstPassFactor - this.audioIndex);
				clockUpTo -= multiplier;
				this.audioIndex += multiplier;
				this.downsampleInput += this.mixerOutputCache * multiplier;
				if (this.audioIndex == this.audioResamplerFirstPassFactor) {
					this.audioIndex = 0;
					this.outputAudio();
				}
			}
			if (this.sequencerClocks == 0) {
				this.audioComputeSequencer();
				this.sequencerClocks = 0x2000;
			}
			if (this.audioClocksUntilNextEventCounter == 0) {
				this.computeAudioChannels();
			}
		}
	}
	else {
		//SILENT OUTPUT:
		while (numSamples > 0) {
			multiplier = Math.min(numSamples, this.audioResamplerFirstPassFactor - this.audioIndex);
			numSamples -= multiplier;
			this.audioIndex += multiplier;
			if (this.audioIndex == this.audioResamplerFirstPassFactor) {
				this.audioIndex = 0;
				this.outputAudio();
			}
		}
	}
}

//Generate audio, but don't actually output it (Used for when sound is disabled by user/browser):
private generateAudioFake(numSamples) {
	if (this.soundMasterEnabled && !this.CPUStopped) {
		for (var clockUpTo = 0; numSamples > 0;) {
			clockUpTo = Math.min(this.audioClocksUntilNextEventCounter, this.sequencerClocks, numSamples);
			this.audioClocksUntilNextEventCounter -= clockUpTo;
			this.sequencerClocks -= clockUpTo;
			numSamples -= clockUpTo;
			if (this.sequencerClocks == 0) {
				this.audioComputeSequencer();
				this.sequencerClocks = 0x2000;
			}
			if (this.audioClocksUntilNextEventCounter == 0) {
				this.computeAudioChannels();
			}
		}
	}
}

private audioJIT() {
	//Audio Sample Generation Timing:
	if (settings.enable_sound) {
		this.generateAudio(this.audioTicks);
	}
	else {
		this.generateAudioFake(this.audioTicks);
	}
	this.audioTicks = 0;
}

private audioComputeSequencer() {
	switch (this.sequencePosition++) {
		case 0:
			this.clockAudioLength();
			break;
		case 2:
			this.clockAudioLength();
			this.clockAudioSweep();
			break;
		case 4:
			this.clockAudioLength();
			break;
		case 6:
			this.clockAudioLength();
			this.clockAudioSweep();
			break;
		case 7:
			this.clockAudioEnvelope();
			this.sequencePosition = 0;
	}
}

private clockAudioLength() {
	//Channel 1:
	if (this.channel1totalLength > 1) {
		--this.channel1totalLength;
	}
	else if (this.channel1totalLength == 1) {
		this.channel1totalLength = 0;
		this.channel1EnableCheck();
		this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
	}
	//Channel 2:
	if (this.channel2totalLength > 1) {
		--this.channel2totalLength;
	}
	else if (this.channel2totalLength == 1) {
		this.channel2totalLength = 0;
		this.channel2EnableCheck();
		this.memory[0xFF26] &= 0xFD;	//Channel #2 On Flag Off
	}
	//Channel 3:
	if (this.channel3totalLength > 1) {
		--this.channel3totalLength;
	}
	else if (this.channel3totalLength == 1) {
		this.channel3totalLength = 0;
		this.channel3EnableCheck();
		this.memory[0xFF26] &= 0xFB;	//Channel #3 On Flag Off
	}
	//Channel 4:
	if (this.channel4totalLength > 1) {
		--this.channel4totalLength;
	}
	else if (this.channel4totalLength == 1) {
		this.channel4totalLength = 0;
		this.channel4EnableCheck();
		this.memory[0xFF26] &= 0xF7;	//Channel #4 On Flag Off
	}
}

private clockAudioSweep() {
	//Channel 1:
	if (!this.channel1SweepFault && this.channel1timeSweep > 0) {
		if (--this.channel1timeSweep == 0) {
			this.runAudioSweep();
		}
	}
}

private runAudioSweep() {
	//Channel 1:
	if (this.channel1lastTimeSweep > 0) {
		if (this.channel1frequencySweepDivider > 0) {
			this.channel1Swept = true;
			if (this.channel1decreaseSweep) {
				this.channel1ShadowFrequency -= this.channel1ShadowFrequency >> this.channel1frequencySweepDivider;
				this.channel1frequency = this.channel1ShadowFrequency & 0x7FF;
				this.channel1FrequencyTracker = (0x800 - this.channel1frequency) << 2;
			}
			else {
				this.channel1ShadowFrequency += this.channel1ShadowFrequency >> this.channel1frequencySweepDivider;
				this.channel1frequency = this.channel1ShadowFrequency;
				if (this.channel1ShadowFrequency <= 0x7FF) {
					this.channel1FrequencyTracker = (0x800 - this.channel1frequency) << 2;
					//Run overflow check twice:
					if ((this.channel1ShadowFrequency + (this.channel1ShadowFrequency >> this.channel1frequencySweepDivider)) > 0x7FF) {
						this.channel1SweepFault = true;
						this.channel1EnableCheck();
						this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
					}
				}
				else {
					this.channel1frequency &= 0x7FF;
					this.channel1SweepFault = true;
					this.channel1EnableCheck();
					this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
				}
			}
			this.channel1timeSweep = this.channel1lastTimeSweep;
		}
		else {
			//Channel has sweep disabled and timer becomes a length counter:
			this.channel1SweepFault = true;
			this.channel1EnableCheck();
		}
	}
}

private channel1AudioSweepPerformDummy() {
	//Channel 1:
	if (this.channel1frequencySweepDivider > 0) {
		if (!this.channel1decreaseSweep) {
			var channel1ShadowFrequency = this.channel1ShadowFrequency + (this.channel1ShadowFrequency >> this.channel1frequencySweepDivider);
			if (channel1ShadowFrequency <= 0x7FF) {
				//Run overflow check twice:
				if ((channel1ShadowFrequency + (channel1ShadowFrequency >> this.channel1frequencySweepDivider)) > 0x7FF) {
					this.channel1SweepFault = true;
					this.channel1EnableCheck();
					this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
				}
			}
			else {
				this.channel1SweepFault = true;
				this.channel1EnableCheck();
				this.memory[0xFF26] &= 0xFE;	//Channel #1 On Flag Off
			}
		}
	}
}

private clockAudioEnvelope() {
	//Channel 1:
	if (this.channel1envelopeSweepsLast > -1) {
		if (this.channel1envelopeSweeps > 0) {
			--this.channel1envelopeSweeps;
		}
		else {
			if (!this.channel1envelopeType) {
				if (this.channel1envelopeVolume > 0) {
					--this.channel1envelopeVolume;
					this.channel1envelopeSweeps = this.channel1envelopeSweepsLast;
					this.channel1OutputLevelCache();
				}
				else {
					this.channel1envelopeSweepsLast = -1;
				}
			}
			else if (this.channel1envelopeVolume < 0xF) {
				++this.channel1envelopeVolume;
				this.channel1envelopeSweeps = this.channel1envelopeSweepsLast;
				this.channel1OutputLevelCache();
			}
			else {
				this.channel1envelopeSweepsLast = -1;
			}
		}
	}
	//Channel 2:
	if (this.channel2envelopeSweepsLast > -1) {
		if (this.channel2envelopeSweeps > 0) {
			--this.channel2envelopeSweeps;
		}
		else {
			if (!this.channel2envelopeType) {
				if (this.channel2envelopeVolume > 0) {
					--this.channel2envelopeVolume;
					this.channel2envelopeSweeps = this.channel2envelopeSweepsLast;
					this.channel2OutputLevelCache();
				}
				else {
					this.channel2envelopeSweepsLast = -1;
				}
			}
			else if (this.channel2envelopeVolume < 0xF) {
				++this.channel2envelopeVolume;
				this.channel2envelopeSweeps = this.channel2envelopeSweepsLast;
				this.channel2OutputLevelCache();
			}
			else {
				this.channel2envelopeSweepsLast = -1;
			}
		}
	}
	//Channel 4:
	if (this.channel4envelopeSweepsLast > -1) {
		if (this.channel4envelopeSweeps > 0) {
			--this.channel4envelopeSweeps;
		}
		else {
			if (!this.channel4envelopeType) {
				if (this.channel4envelopeVolume > 0) {
					this.channel4currentVolume = --this.channel4envelopeVolume << this.channel4VolumeShifter;
					this.channel4envelopeSweeps = this.channel4envelopeSweepsLast;
					this.channel4UpdateCache();
				}
				else {
					this.channel4envelopeSweepsLast = -1;
				}
			}
			else if (this.channel4envelopeVolume < 0xF) {
				this.channel4currentVolume = ++this.channel4envelopeVolume << this.channel4VolumeShifter;
				this.channel4envelopeSweeps = this.channel4envelopeSweepsLast;
				this.channel4UpdateCache();
			}
			else {
				this.channel4envelopeSweepsLast = -1;
			}
		}
	}
}

private computeAudioChannels() {
	//Clock down the four audio channels to the next closest audio event:
	this.channel1FrequencyCounter -= this.audioClocksUntilNextEvent;
	this.channel2FrequencyCounter -= this.audioClocksUntilNextEvent;
	this.channel3Counter -= this.audioClocksUntilNextEvent;
	this.channel4Counter -= this.audioClocksUntilNextEvent;
	//Channel 1 counter:
	if (this.channel1FrequencyCounter == 0) {
		this.channel1FrequencyCounter = this.channel1FrequencyTracker;
		this.channel1DutyTracker = (this.channel1DutyTracker + 1) & 0x7;
		this.channel1OutputLevelTrimaryCache();
	}
	//Channel 2 counter:
	if (this.channel2FrequencyCounter == 0) {
		this.channel2FrequencyCounter = this.channel2FrequencyTracker;
		this.channel2DutyTracker = (this.channel2DutyTracker + 1) & 0x7;
		this.channel2OutputLevelTrimaryCache();
	}
	//Channel 3 counter:
	if (this.channel3Counter == 0) {
		if (this.channel3canPlay) {
			this.channel3lastSampleLookup = (this.channel3lastSampleLookup + 1) & 0x1F;
		}
		this.channel3Counter = this.channel3FrequencyPeriod;
		this.channel3UpdateCache();
	}
	//Channel 4 counter:
	if (this.channel4Counter == 0) {
		this.channel4lastSampleLookup = (this.channel4lastSampleLookup + 1) & this.channel4BitRange;
		this.channel4Counter = this.channel4FrequencyPeriod;
		this.channel4UpdateCache();
	}
	//Find the number of clocks to next closest counter event:
	this.audioClocksUntilNextEventCounter = this.audioClocksUntilNextEvent = Math.min(this.channel1FrequencyCounter, this.channel2FrequencyCounter, this.channel3Counter, this.channel4Counter);
}

private channel1EnableCheck() {
	this.channel1Enabled = ((this.channel1consecutive || this.channel1totalLength > 0) && !this.channel1SweepFault && this.channel1canPlay);
	this.channel1OutputLevelSecondaryCache();
}

private channel1VolumeEnableCheck() {
	this.channel1canPlay = (this.memory[0xFF12] > 7);
	this.channel1EnableCheck();
	this.channel1OutputLevelSecondaryCache();
}

private channel1OutputLevelCache() {
	this.channel1currentSampleLeft = (this.leftChannel1) ? this.channel1envelopeVolume : 0;
	this.channel1currentSampleRight = (this.rightChannel1) ? this.channel1envelopeVolume : 0;
	this.channel1OutputLevelSecondaryCache();
}

private channel1OutputLevelSecondaryCache() {
	if (this.channel1Enabled) {
		this.channel1currentSampleLeftSecondary = this.channel1currentSampleLeft;
		this.channel1currentSampleRightSecondary = this.channel1currentSampleRight;
	}
	else {
		this.channel1currentSampleLeftSecondary = 0;
		this.channel1currentSampleRightSecondary = 0;
	}
	this.channel1OutputLevelTrimaryCache();
}

private channel1OutputLevelTrimaryCache() {
	if (this.channel1CachedDuty[this.channel1DutyTracker] && settings.channels[0]) {
		this.channel1currentSampleLeftTrimary = this.channel1currentSampleLeftSecondary;
		this.channel1currentSampleRightTrimary = this.channel1currentSampleRightSecondary;
	}
	else {
		this.channel1currentSampleLeftTrimary = 0;
		this.channel1currentSampleRightTrimary = 0;
	}
	this.mixerOutputLevelCache();
}

private channel2EnableCheck() {
	this.channel2Enabled = ((this.channel2consecutive || this.channel2totalLength > 0) && this.channel2canPlay);
	this.channel2OutputLevelSecondaryCache();
}

private channel2VolumeEnableCheck() {
	this.channel2canPlay = (this.memory[0xFF17] > 7);
	this.channel2EnableCheck();
	this.channel2OutputLevelSecondaryCache();
}

private channel2OutputLevelCache() {
	this.channel2currentSampleLeft = (this.leftChannel2) ? this.channel2envelopeVolume : 0;
	this.channel2currentSampleRight = (this.rightChannel2) ? this.channel2envelopeVolume : 0;
	this.channel2OutputLevelSecondaryCache();
}

private channel2OutputLevelSecondaryCache() {
	if (this.channel2Enabled) {
		this.channel2currentSampleLeftSecondary = this.channel2currentSampleLeft;
		this.channel2currentSampleRightSecondary = this.channel2currentSampleRight;
	}
	else {
		this.channel2currentSampleLeftSecondary = 0;
		this.channel2currentSampleRightSecondary = 0;
	}
	this.channel2OutputLevelTrimaryCache();
}

private channel2OutputLevelTrimaryCache() {
	if (this.channel2CachedDuty[this.channel2DutyTracker] && settings.channels[1]) {
		this.channel2currentSampleLeftTrimary = this.channel2currentSampleLeftSecondary;
		this.channel2currentSampleRightTrimary = this.channel2currentSampleRightSecondary;
	}
	else {
		this.channel2currentSampleLeftTrimary = 0;
		this.channel2currentSampleRightTrimary = 0;
	}
	this.mixerOutputLevelCache();
}

private channel3EnableCheck() {
	this.channel3Enabled = (/*this.channel3canPlay && */(this.channel3consecutive || this.channel3totalLength > 0));
	this.channel3OutputLevelSecondaryCache();
}

private channel3OutputLevelCache() {
	this.channel3currentSampleLeft = (this.leftChannel3) ? this.cachedChannel3Sample : 0;
	this.channel3currentSampleRight = (this.rightChannel3) ? this.cachedChannel3Sample : 0;
	this.channel3OutputLevelSecondaryCache();
}

private channel3OutputLevelSecondaryCache() {
	if (this.channel3Enabled && settings.channels[2]) {
		this.channel3currentSampleLeftSecondary = this.channel3currentSampleLeft;
		this.channel3currentSampleRightSecondary = this.channel3currentSampleRight;
	}
	else {
		this.channel3currentSampleLeftSecondary = 0;
		this.channel3currentSampleRightSecondary = 0;
	}
	this.mixerOutputLevelCache();
}

private channel4EnableCheck() {
	this.channel4Enabled = ((this.channel4consecutive || this.channel4totalLength > 0) && this.channel4canPlay);
	this.channel4OutputLevelSecondaryCache();
}

private channel4VolumeEnableCheck() {
	this.channel4canPlay = (this.memory[0xFF21] > 7);
	this.channel4EnableCheck();
	this.channel4OutputLevelSecondaryCache();
}

private channel4OutputLevelCache() {
	this.channel4currentSampleLeft = (this.leftChannel4) ? this.cachedChannel4Sample : 0;
	this.channel4currentSampleRight = (this.rightChannel4) ? this.cachedChannel4Sample : 0;
	this.channel4OutputLevelSecondaryCache();
}

private channel4OutputLevelSecondaryCache() {
	if (this.channel4Enabled && settings.channels[3]) {
		this.channel4currentSampleLeftSecondary = this.channel4currentSampleLeft;
		this.channel4currentSampleRightSecondary = this.channel4currentSampleRight;
	}
	else {
		this.channel4currentSampleLeftSecondary = 0;
		this.channel4currentSampleRightSecondary = 0;
	}
	this.mixerOutputLevelCache();
}

private mixerOutputLevelCache() {
	this.mixerOutputCache = ((((this.channel1currentSampleLeftTrimary + this.channel2currentSampleLeftTrimary + this.channel3currentSampleLeftSecondary + this.channel4currentSampleLeftSecondary) * this.VinLeftChannelMasterVolume) << 16) |
	((this.channel1currentSampleRightTrimary + this.channel2currentSampleRightTrimary + this.channel3currentSampleRightSecondary + this.channel4currentSampleRightSecondary) * this.VinRightChannelMasterVolume));
}

private channel3UpdateCache() {
	this.cachedChannel3Sample = this.channel3PCM[this.channel3lastSampleLookup] >> this.channel3patternType;
	this.channel3OutputLevelCache();
}

private channel3WriteRAM(address, data) {
	if (this.channel3canPlay) {
		this.audioJIT();
		//address = this.channel3lastSampleLookup >> 1;
	}
	this.memory[0xFF30 | address] = data;
	address <<= 1;
	this.channel3PCM[address] = data >> 4;
	this.channel3PCM[address | 1] = data & 0xF;
}

private channel4UpdateCache() {
	this.cachedChannel4Sample = this.noiseSampleTable[this.channel4currentVolume | this.channel4lastSampleLookup];
	this.channel4OutputLevelCache();
}

public run() {
	//The preprocessing before the actual iteration loop:
	if ((this.stopEmulator & 2) == 0) {
		if ((this.stopEmulator & 1) == 1) {
			if (!this.CPUStopped) {
				this.stopEmulator = 0;
				this.audioUnderrunAdjustment();
				this.clockUpdate();			//RTC clocking.
				if (!this.halt) {
					this.executeIteration();
				}
				else {						//Finish the HALT rundown execution.
					this.CPUTicks = 0;
					this.calculateHALTPeriod();
					if (this.halt) {
						this.updateCore();
						this.iterationEndRoutine();
					}
					else {
						this.executeIteration();
					}
				}
				//Request the graphics target to be updated:
				this.requestDraw();
			}
			else {
				this.audioUnderrunAdjustment();
				this.audioTicks += this.CPUCyclesTotal;
				this.audioJIT();
				this.stopEmulator |= 1;			//End current loop.
			}
		}
		else {		//We can only get here if there was an internal error, but the loop was restarted.
			cout("Iterator restarted a faulted core.", 2);
			this.pause();
		}
	}
}

private executeIteration() {
	//Iterate the interpreter loop:
	var opcodeToExecute = 0;
	var timedTicks = 0;
	while (this.stopEmulator == 0) {
		//Interrupt Arming:
		switch (this.IRQEnableDelay) {
			case 1:
				this.IME = true;
				this.checkIRQMatching();
			case 2:
				--this.IRQEnableDelay;
		}
		//Is an IRQ set to fire?:
		if (this.IRQLineMatched > 0) {
			//IME is true and and interrupt was matched:
			this.launchIRQ();
		}
		//Fetch the current opcode:
		opcodeToExecute = this.memoryReader[this.programCounter](this, this.programCounter);
		//Increment the program counter to the next instruction:
		this.programCounter = (this.programCounter + 1) & 0xFFFF;
		//Check for the program counter quirk:
		if (this.skipPCIncrement) {
			this.programCounter = (this.programCounter - 1) & 0xFFFF;
			this.skipPCIncrement = false;
		}
		//Get how many CPU cycles the current instruction counts for:
		this.CPUTicks = this.TICKTable[opcodeToExecute];
		//Execute the current instruction:
		OPCODE[opcodeToExecute](this);
		//Update the state (Inlined updateCoreFull manually here):
		//Update the clocking for the LCD emulation:
		this.LCDTicks += this.CPUTicks >> this.doubleSpeedShifter;	//LCD Timing
		this.LCDCONTROL[this.actualScanLine](this);					//Scan Line and STAT Mode Control
		//Single-speed relative timing for A/V emulation:
		timedTicks = this.CPUTicks >> this.doubleSpeedShifter;		//CPU clocking can be updated from the LCD handling.
		this.audioTicks += timedTicks;								//Audio Timing
		this.emulatorTicks += timedTicks;							//Emulator Timing
		//CPU Timers:
		this.DIVTicks += this.CPUTicks;								//DIV Timing
		if (this.TIMAEnabled) {										//TIMA Timing
			this.timerTicks += this.CPUTicks;
			while (this.timerTicks >= this.TACClocker) {
				this.timerTicks -= this.TACClocker;
				if (++this.memory[0xFF05] == 0x100) {
					this.memory[0xFF05] = this.memory[0xFF06];
					this.interruptsRequested |= 0x4;
					this.checkIRQMatching();
				}
			}
		}
		if (this.serialTimer > 0) {										//Serial Timing
			//IRQ Counter:
			this.serialTimer -= this.CPUTicks;
			if (this.serialTimer <= 0) {
				this.interruptsRequested |= 0x8;
				this.checkIRQMatching();
			}
			//Bit Shit Counter:
			this.serialShiftTimer -= this.CPUTicks;
			if (this.serialShiftTimer <= 0) {
				this.serialShiftTimer = this.serialShiftTimerAllocated;
				this.memory[0xFF01] = ((this.memory[0xFF01] << 1) & 0xFE) | 0x01;	//We could shift in actual link data here if we were to implement such!!!
			}
		}
		//End of iteration routine:
		if (this.emulatorTicks >= this.CPUCyclesTotal) {
			this.iterationEndRoutine();
		}
	}
}

private iterationEndRoutine() {
	if ((this.stopEmulator & 0x1) == 0) {
		this.audioJIT();	//Make sure we at least output once per iteration.
		//Update DIV Alignment (Integer overflow safety):
		this.memory[0xFF04] = (this.memory[0xFF04] + (this.DIVTicks >> 8)) & 0xFF;
		this.DIVTicks &= 0xFF;
		//Update emulator flags:
		this.stopEmulator |= 1;			//End current loop.
		this.emulatorTicks -= this.CPUCyclesTotal;
		this.CPUCyclesTotalCurrent += this.CPUCyclesTotalRoundoff;
		this.recalculateIterationClockLimit();
	}
}

public handleSTOP() {
	this.CPUStopped = true;						//Stop CPU until joypad input changes.
	this.iterationEndRoutine();
	if (this.emulatorTicks < 0) {
		this.audioTicks -= this.emulatorTicks;
		this.audioJIT();
	}
}

private recalculateIterationClockLimit() {
	var endModulus = this.CPUCyclesTotalCurrent % 4;
	this.CPUCyclesTotal = this.CPUCyclesTotalBase + this.CPUCyclesTotalCurrent - endModulus;
	this.CPUCyclesTotalCurrent = endModulus;
}

private recalculateIterationClockLimitForAudio(audioClocking) {
	this.CPUCyclesTotal += Math.min((audioClocking >> 2) << 2, this.CPUCyclesTotalBase << 1);
}

//OAM Search Period
private scanLineMode2() {
	if (this.STATTracker != 1) {
		if (this.mode2TriggerSTAT) {
			this.interruptsRequested |= 0x2;
			this.checkIRQMatching();
		}
		this.STATTracker = 1;
		this.modeSTAT = 2;
	}
}

//Scan Line Drawing Period
private scanLineMode3() {
	if (this.modeSTAT != 3) {
		if (this.STATTracker == 0 && this.mode2TriggerSTAT) {
			this.interruptsRequested |= 0x2;
			this.checkIRQMatching();
		}
		this.STATTracker = 1;
		this.modeSTAT = 3;
	}
}

//Horizontal Blanking Period
private scanLineMode0() {
	if (this.modeSTAT != 0) {
		if (this.STATTracker != 2) {
			if (this.STATTracker == 0) {
				if (this.mode2TriggerSTAT) {
					this.interruptsRequested |= 0x2;
					this.checkIRQMatching();
				}
				this.modeSTAT = 3;
			}
			this.incrementScanLineQueue();
			this.updateSpriteCount(this.actualScanLine);
			this.STATTracker = 2;
		}
		if (this.LCDTicks >= this.spriteCount) {
			if (this.hdmaRunning) {
				this.executeHDMA();
			}
			if (this.mode0TriggerSTAT) {
				this.interruptsRequested |= 0x2;
				this.checkIRQMatching();
			}
			this.STATTracker = 3;
			this.modeSTAT = 0;
		}
	}
}

private clocksUntilLYCMatch() {
	if (this.memory[0xFF45] != 0) {
		if (this.memory[0xFF45] > this.actualScanLine) {
			return 456 * (this.memory[0xFF45] - this.actualScanLine);
		}
		return 456 * (154 - this.actualScanLine + this.memory[0xFF45]);
	}
	return (456 * ((this.actualScanLine == 153 && this.memory[0xFF44] == 0) ? 154 : (153 - this.actualScanLine))) + 8;
}

private clocksUntilMode0() {
	switch (this.modeSTAT) {
		case 0:
			if (this.actualScanLine == 143) {
				this.updateSpriteCount(0);
				return this.spriteCount + 5016;
			}
			this.updateSpriteCount(this.actualScanLine + 1);
			return this.spriteCount + 456;
		case 2:
		case 3:
			this.updateSpriteCount(this.actualScanLine);
			return this.spriteCount;
		case 1:
			this.updateSpriteCount(0);
			return this.spriteCount + (456 * (154 - this.actualScanLine));
	}
}

private updateSpriteCount(line) {
	this.spriteCount = 252;
	if (this.cGBC && this.gfxSpriteShow) {										//Is the window enabled and are we in CGB mode?
		var lineAdjusted = line + 0x10;
		var yoffset = 0;
		var yCap = (this.gfxSpriteNormalHeight) ? 0x8 : 0x10;
		for (var OAMAddress = 0xFE00; OAMAddress < 0xFEA0 && this.spriteCount < 312; OAMAddress += 4) {
			yoffset = lineAdjusted - this.memory[OAMAddress];
			if (yoffset > -1 && yoffset < yCap) {
				this.spriteCount += 6;
			}
		}
	}
}

//LYC Register Compare
private matchLYC() {
	if (this.memory[0xFF44] == this.memory[0xFF45]) {
		this.memory[0xFF41] |= 0x04;
		if (this.LYCMatchTriggerSTAT) {
			this.interruptsRequested |= 0x2;
			this.checkIRQMatching();
		}
	}
	else {
		this.memory[0xFF41] &= 0x7B;
	}
}

private updateCore() {
	//Update the clocking for the LCD emulation:
	this.LCDTicks += this.CPUTicks >> this.doubleSpeedShifter;	//LCD Timing
	this.LCDCONTROL[this.actualScanLine](this);					//Scan Line and STAT Mode Control
	//Single-speed relative timing for A/V emulation:
	var timedTicks = this.CPUTicks >> this.doubleSpeedShifter;	//CPU clocking can be updated from the LCD handling.
	this.audioTicks += timedTicks;								//Audio Timing
	this.emulatorTicks += timedTicks;							//Emulator Timing
	//CPU Timers:
	this.DIVTicks += this.CPUTicks;								//DIV Timing
	if (this.TIMAEnabled) {										//TIMA Timing
		this.timerTicks += this.CPUTicks;
		while (this.timerTicks >= this.TACClocker) {
			this.timerTicks -= this.TACClocker;
			if (++this.memory[0xFF05] == 0x100) {
				this.memory[0xFF05] = this.memory[0xFF06];
				this.interruptsRequested |= 0x4;
				this.checkIRQMatching();
			}
		}
	}
	if (this.serialTimer > 0) {										//Serial Timing
		//IRQ Counter:
		this.serialTimer -= this.CPUTicks;
		if (this.serialTimer <= 0) {
			this.interruptsRequested |= 0x8;
			this.checkIRQMatching();
		}
		//Bit Shit Counter:
		this.serialShiftTimer -= this.CPUTicks;
		if (this.serialShiftTimer <= 0) {
			this.serialShiftTimer = this.serialShiftTimerAllocated;
			this.memory[0xFF01] = ((this.memory[0xFF01] << 1) & 0xFE) | 0x01;	//We could shift in actual link data here if we were to implement such!!!
		}
	}
}

private updateCoreFull() {
	//Update the state machine:
	this.updateCore();
	//End of iteration routine:
	if (this.emulatorTicks >= this.CPUCyclesTotal) {
		this.iterationEndRoutine();
	}
}

private initializeLCDController() {
	//Display on hanlding:
	var line = 0;
	while (line < 154) {
		if (line < 143) {
			//We're on a normal scan line:
			this.LINECONTROL[line] = function (parentObj: GameBoyCore) {
				if (parentObj.LCDTicks < 80) {
					parentObj.scanLineMode2();
				}
				else if (parentObj.LCDTicks < 252) {
					parentObj.scanLineMode3();
				}
				else if (parentObj.LCDTicks < 456) {
					parentObj.scanLineMode0();
				}
				else {
					//We're on a new scan line:
					parentObj.LCDTicks -= 456;
					if (parentObj.STATTracker != 3) {
						//Make sure the mode 0 handler was run at least once per scan line:
						if (parentObj.STATTracker != 2) {
							if (parentObj.STATTracker == 0 && parentObj.mode2TriggerSTAT) {
								parentObj.interruptsRequested |= 0x2;
							}
							parentObj.incrementScanLineQueue();
						}
						if (parentObj.hdmaRunning) {
							parentObj.executeHDMA();
						}
						if (parentObj.mode0TriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					//Update the scanline registers and assert the LYC counter:
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					//Perform a LYC counter assert:
					if (parentObj.actualScanLine == parentObj.memory[0xFF45]) {
						parentObj.memory[0xFF41] |= 0x04;
						if (parentObj.LYCMatchTriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					else {
						parentObj.memory[0xFF41] &= 0x7B;
					}
					parentObj.checkIRQMatching();
					//Reset our mode contingency variables:
					parentObj.STATTracker = 0;
					parentObj.modeSTAT = 2;
					parentObj.LINECONTROL[parentObj.actualScanLine](parentObj);	//Scan Line and STAT Mode Control.
				}
			}
		}
		else if (line == 143) {
			//We're on the last visible scan line of the LCD screen:
			this.LINECONTROL[143] = function (parentObj: GameBoyCore) {
				if (parentObj.LCDTicks < 80) {
					parentObj.scanLineMode2();
				}
				else if (parentObj.LCDTicks < 252) {
					parentObj.scanLineMode3();
				}
				else if (parentObj.LCDTicks < 456) {
					parentObj.scanLineMode0();
				}
				else {
					//Starting V-Blank:
					//Just finished the last visible scan line:
					parentObj.LCDTicks -= 456;
					if (parentObj.STATTracker != 3) {
						//Make sure the mode 0 handler was run at least once per scan line:
						if (parentObj.STATTracker != 2) {
							if (parentObj.STATTracker == 0 && parentObj.mode2TriggerSTAT) {
								parentObj.interruptsRequested |= 0x2;
							}
							parentObj.incrementScanLineQueue();
						}
						if (parentObj.hdmaRunning) {
							parentObj.executeHDMA();
						}
						if (parentObj.mode0TriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					//Update the scanline registers and assert the LYC counter:
					parentObj.actualScanLine = parentObj.memory[0xFF44] = 144;
					//Perform a LYC counter assert:
					if (parentObj.memory[0xFF45] == 144) {
						parentObj.memory[0xFF41] |= 0x04;
						if (parentObj.LYCMatchTriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
						}
					}
					else {
						parentObj.memory[0xFF41] &= 0x7B;
					}
					//Reset our mode contingency variables:
					parentObj.STATTracker = 0;
					//Update our state for v-blank:
					parentObj.modeSTAT = 1;
					parentObj.interruptsRequested |= (parentObj.mode1TriggerSTAT) ? 0x3 : 0x1;
					parentObj.checkIRQMatching();
					//Attempt to blit out to our canvas:
					if (parentObj.drewBlank == 0) {
						//Ensure JIT framing alignment:
						if (parentObj.totalLinesPassed < 144 || (parentObj.totalLinesPassed == 144 && parentObj.midScanlineOffset > -1)) {
							//Make sure our gfx are up-to-date:
							parentObj.graphicsJITVBlank();
							//Draw the frame:
							parentObj.prepareFrame();
						}
					}
					else {
						//LCD off takes at least 2 frames:
						--parentObj.drewBlank;
					}
					parentObj.LINECONTROL[144](parentObj);	//Scan Line and STAT Mode Control.
				}
			}
		}
		else if (line < 153) {
			//In VBlank
			this.LINECONTROL[line] = function (parentObj: GameBoyCore) {
				if (parentObj.LCDTicks >= 456) {
					//We're on a new scan line:
					parentObj.LCDTicks -= 456;
					parentObj.actualScanLine = ++parentObj.memory[0xFF44];
					//Perform a LYC counter assert:
					if (parentObj.actualScanLine == parentObj.memory[0xFF45]) {
						parentObj.memory[0xFF41] |= 0x04;
						if (parentObj.LYCMatchTriggerSTAT) {
							parentObj.interruptsRequested |= 0x2;
							parentObj.checkIRQMatching();
						}
					}
					else {
						parentObj.memory[0xFF41] &= 0x7B;
					}
					parentObj.LINECONTROL[parentObj.actualScanLine](parentObj);	//Scan Line and STAT Mode Control.
				}
			}
		}
		else {
			//VBlank Ending (We're on the last actual scan line)
			this.LINECONTROL[153] = function (parentObj: GameBoyCore) {
				if (parentObj.LCDTicks >= 8) {
					if (parentObj.STATTracker != 4 && parentObj.memory[0xFF44] == 153) {
						parentObj.memory[0xFF44] = 0;	//LY register resets to 0 early.
						//Perform a LYC counter assert:
						if (parentObj.memory[0xFF45] == 0) {
							parentObj.memory[0xFF41] |= 0x04;
							if (parentObj.LYCMatchTriggerSTAT) {
								parentObj.interruptsRequested |= 0x2;
								parentObj.checkIRQMatching();
							}
						}
						else {
							parentObj.memory[0xFF41] &= 0x7B;
						}
						parentObj.STATTracker = 4;
					}
					if (parentObj.LCDTicks >= 456) {
						//We reset back to the beginning:
						parentObj.LCDTicks -= 456;
						parentObj.STATTracker = parentObj.actualScanLine = 0;
						parentObj.LINECONTROL[0](parentObj);	//Scan Line and STAT Mode Control.
					}
				}
			}
		}
		++line;
	}
}

private DisplayShowOff() {
	if (this.drewBlank == 0) {
		//Output a blank screen to the output framebuffer:
		this.clearFrameBuffer();
		this.drewFrame = true;
	}
	this.drewBlank = 2;
}

private executeHDMA() {
	this.DMAWrite(1);
	if (this.halt) {
		if ((this.LCDTicks - this.spriteCount) < ((4 >> this.doubleSpeedShifter) | 0x20)) {
			//HALT clocking correction:
			this.CPUTicks = 4 + ((0x20 + this.spriteCount) << this.doubleSpeedShifter);
			this.LCDTicks = this.spriteCount + ((4 >> this.doubleSpeedShifter) | 0x20);
		}
	}
	else {
		this.LCDTicks += (4 >> this.doubleSpeedShifter) | 0x20;			//LCD Timing Update For HDMA.
	}
	if (this.memory[0xFF55] == 0) {
		this.hdmaRunning = false;
		this.memory[0xFF55] = 0xFF;	//Transfer completed ("Hidden last step," since some ROMs don't imply this, but most do).
	}
	else {
		--this.memory[0xFF55];
	}
}

private clockUpdate() {
	if (this.cTIMER) {
		var dateObj = new Date();
		var newTime = dateObj.getTime();
		var timeElapsed = newTime - this.lastIteration;	//Get the numnber of milliseconds since this last executed.
		this.lastIteration = newTime;
		if (this.cTIMER && !this.RTCHALT) {
			//Update the MBC3 RTC:
			this.RTCSeconds += timeElapsed / 1000;
			while (this.RTCSeconds >= 60) {	//System can stutter, so the seconds difference can get large, thus the "while".
				this.RTCSeconds -= 60;
				++this.RTCMinutes;
				if (this.RTCMinutes >= 60) {
					this.RTCMinutes -= 60;
					++this.RTCHours;
					if (this.RTCHours >= 24) {
						this.RTCHours -= 24
						++this.RTCDays;
						if (this.RTCDays >= 512) {
							this.RTCDays -= 512;
							this.RTCDayOverFlow = true;
						}
					}
				}
			}
		}
	}
}

private prepareFrame() {
	//Copy the internal frame buffer to the output buffer:
	this.swizzleFrameBuffer();
	this.drewFrame = true;
}

private requestDraw() {
	if (this.drewFrame) {
		this.dispatchDraw();
	}
}

private dispatchDraw() {
	if (this.offscreenRGBCount > 0) {
		//We actually updated the graphics internally, so copy out:
		if (this.offscreenRGBCount == 92160) {
			this.processDraw(this.swizzledFrame);
		}
		else {
			this.resizeFrameBuffer();
		}
	}
}

private processDraw(frameBuffer) {
	var canvasRGBALength = this.offscreenRGBCount;
	var canvasData = this.canvasBuffer.data;
	var bufferIndex = 0;
	for (var canvasIndex = 0; canvasIndex < canvasRGBALength; ++canvasIndex) {
		canvasData[canvasIndex++] = frameBuffer[bufferIndex++];
		canvasData[canvasIndex++] = frameBuffer[bufferIndex++];
		canvasData[canvasIndex++] = frameBuffer[bufferIndex++];
	}
	this.graphicsBlit();
	this.drewFrame = false;
}

private swizzleFrameBuffer() {
	//Convert our dirty 24-bit (24-bit, with internal render flags above it) framebuffer to an 8-bit buffer with separate indices for the RGB channels:
	var frameBuffer = this.frameBuffer;
	var swizzledFrame = this.swizzledFrame;
	var bufferIndex = 0;
	for (var canvasIndex = 0; canvasIndex < 69120;) {
		swizzledFrame[canvasIndex++] = (frameBuffer[bufferIndex] >> 16) & 0xFF;		//Red
		swizzledFrame[canvasIndex++] = (frameBuffer[bufferIndex] >> 8) & 0xFF;		//Green
		swizzledFrame[canvasIndex++] = frameBuffer[bufferIndex++] & 0xFF;			//Blue
	}
}

private clearFrameBuffer() {
	var bufferIndex = 0;
	var frameBuffer = this.swizzledFrame;
	if (this.cGBC || this.colorizedGBPalettes) {
		while (bufferIndex < 69120) {
			frameBuffer[bufferIndex++] = 248;
		}
	}
	else {
		while (bufferIndex < 69120) {
			frameBuffer[bufferIndex++] = 239;
			frameBuffer[bufferIndex++] = 255;
			frameBuffer[bufferIndex++] = 222;
		}
	}
}

private resizeFrameBuffer() {
	//Resize in javascript with resize.js:
	if (this.resizePathClear) {
		this.resizePathClear = false;
		this.resizer.resize(this.swizzledFrame);
	}
}

private compileResizeFrameBufferFunction() {
	if (this.offscreenRGBCount > 0) {
		this.resizer = new Resize(160, 144, this.offscreenWidth, this.offscreenHeight, false, settings.resize_smoothing);
	}
}

private renderScanLine(scanlineToRender) {
	this.pixelStart = scanlineToRender * 160;
	if (this.bgEnabled) {
		this.pixelEnd = 160;
		this.BGLayerRender(scanlineToRender);
		this.WindowLayerRender(scanlineToRender);
	}
	else {
		var pixelLine = (scanlineToRender + 1) * 160;
		var defaultColor = (this.cGBC || this.colorizedGBPalettes) ? 0xF8F8F8 : 0xEFFFDE;
		for (var pixelPosition = (scanlineToRender * 160) + this.currentX; pixelPosition < pixelLine; pixelPosition++) {
			this.frameBuffer[pixelPosition] = defaultColor;
		}
	}
	this.SpriteLayerRender(scanlineToRender);
	this.currentX = 0;
	this.midScanlineOffset = -1;
}

private renderMidScanLine() {
	if (this.actualScanLine < 144 && this.modeSTAT == 3) {
		//TODO: Get this accurate:
		if (this.midScanlineOffset == -1) {
			this.midScanlineOffset = this.backgroundX & 0x7;
		}
		if (this.LCDTicks >= 82) {
			this.pixelEnd = this.LCDTicks - 74;
			this.pixelEnd = Math.min(this.pixelEnd - this.midScanlineOffset - (this.pixelEnd % 0x8), 160);
			if (this.bgEnabled) {
				this.pixelStart = this.lastUnrenderedLine * 160;
				this.BGLayerRender(this.lastUnrenderedLine);
				this.WindowLayerRender(this.lastUnrenderedLine);
				//TODO: Do midscanline JIT for sprites...
			}
			else {
				var pixelLine = (this.lastUnrenderedLine * 160) + this.pixelEnd;
				var defaultColor = (this.cGBC || this.colorizedGBPalettes) ? 0xF8F8F8 : 0xEFFFDE;
				for (var pixelPosition = (this.lastUnrenderedLine * 160) + this.currentX; pixelPosition < pixelLine; pixelPosition++) {
					this.frameBuffer[pixelPosition] = defaultColor;
				}
			}
			this.currentX = this.pixelEnd;
		}
	}
}

private initializeModeSpecificArrays() {
	this.LCDCONTROL = (this.LCDisOn) ? this.LINECONTROL : this.DISPLAYOFFCONTROL;
	if (this.cGBC) {
		this.gbcOBJRawPalette = getTypedArray(0x40, 0, "uint8");
		this.gbcBGRawPalette = getTypedArray(0x40, 0, "uint8");
		this.gbcOBJPalette = getTypedArray(0x20, 0x1000000, "int32");
		this.gbcBGPalette = getTypedArray(0x40, 0, "int32");
		this.BGCHRBank2 = getTypedArray(0x800, 0, "uint8");
		this.BGCHRCurrentBank = (this.currVRAMBank > 0) ? this.BGCHRBank2 : this.BGCHRBank1;
		this.tileCache = this.generateCacheArray(0xF80);
	}
	else {
		this.gbOBJPalette = getTypedArray(8, 0, "int32");
		this.gbBGPalette = getTypedArray(4, 0, "int32");
		this.BGPalette = this.gbBGPalette;
		this.OBJPalette = this.gbOBJPalette;
		this.tileCache = this.generateCacheArray(0x700);
		this.sortBuffer = getTypedArray(0x100, 0, "uint8");
		this.OAMAddressCache = getTypedArray(10, 0, "int32");
	}
	this.renderPathBuild();
}

private GBCtoGBModeAdjust() {
	cout("Stepping down from GBC mode.", 0);
	this.VRAM = this.GBCMemory = this.BGCHRCurrentBank = this.BGCHRBank2 = null;
	this.tileCache.length = 0x700;
	if (settings.enable_colorization) {
		this.gbBGColorizedPalette = getTypedArray(4, 0, "int32");
		this.gbOBJColorizedPalette = getTypedArray(8, 0, "int32");
		this.cachedBGPaletteConversion = getTypedArray(4, 0, "int32");
		this.cachedOBJPaletteConversion = getTypedArray(8, 0, "int32");
		this.BGPalette = this.gbBGColorizedPalette;
		this.OBJPalette = this.gbOBJColorizedPalette;
		this.gbOBJPalette = this.gbBGPalette = null;
		this.getGBCColor();
	}
	else {
		this.gbOBJPalette = getTypedArray(8, 0, "int32");
		this.gbBGPalette = getTypedArray(4, 0, "int32");
		this.BGPalette = this.gbBGPalette;
		this.OBJPalette = this.gbOBJPalette;
	}
	this.sortBuffer = getTypedArray(0x100, 0, "uint8");
	this.OAMAddressCache = getTypedArray(10, 0, "int32");
	this.renderPathBuild();
	this.memoryReadJumpCompile();
	this.memoryWriteJumpCompile();
}

private renderPathBuild() {
	if (!this.cGBC) {
		this.BGLayerRender = this.BGGBLayerRender;
		this.WindowLayerRender = this.WindowGBLayerRender;
		this.SpriteLayerRender = this.SpriteGBLayerRender;
	}
	else {
		this.priorityFlaggingPathRebuild();
		this.SpriteLayerRender = this.SpriteGBCLayerRender;
	}
}

private priorityFlaggingPathRebuild() {
	if (this.BGPriorityEnabled) {
		this.BGLayerRender = this.BGGBCLayerRender;
		this.WindowLayerRender = this.WindowGBCLayerRender;
	}
	else {
		this.BGLayerRender = this.BGGBCLayerRenderNoPriorityFlagging;
		this.WindowLayerRender = this.WindowGBCLayerRenderNoPriorityFlagging;
	}
}

private initializeReferencesFromSaveState() {
	this.LCDCONTROL = (this.LCDisOn) ? this.LINECONTROL : this.DISPLAYOFFCONTROL;
	var tileIndex = 0;
	if (!this.cGBC) {
		if (this.colorizedGBPalettes) {
			this.BGPalette = this.gbBGColorizedPalette;
			this.OBJPalette = this.gbOBJColorizedPalette;
			this.updateGBBGPalette = this.updateGBColorizedBGPalette;
			this.updateGBOBJPalette = this.updateGBColorizedOBJPalette;

		}
		else {
			this.BGPalette = this.gbBGPalette;
			this.OBJPalette = this.gbOBJPalette;
		}
		this.tileCache = this.generateCacheArray(0x700);
		for (tileIndex = 0x8000; tileIndex < 0x9000; tileIndex += 2) {
			this.generateGBOAMTileLine(tileIndex);
		}
		for (tileIndex = 0x9000; tileIndex < 0x9800; tileIndex += 2) {
			this.generateGBTileLine(tileIndex);
		}
		this.sortBuffer = getTypedArray(0x100, 0, "uint8");
		this.OAMAddressCache = getTypedArray(10, 0, "int32");
	}
	else {
		this.BGCHRCurrentBank = (this.currVRAMBank > 0) ? this.BGCHRBank2 : this.BGCHRBank1;
		this.tileCache = this.generateCacheArray(0xF80);
		for (; tileIndex < 0x1800; tileIndex += 0x10) {
			this.generateGBCTileBank1(tileIndex);
			this.generateGBCTileBank2(tileIndex);
		}
	}
	this.renderPathBuild();
}

private RGBTint(value) {
	//Adjustment for the GBC's tinting (According to Gambatte):
	var r = value & 0x1F;
	var g = (value >> 5) & 0x1F;
	var b = (value >> 10) & 0x1F;
	return ((r * 13 + g * 2 + b) >> 1) << 16 | (g * 3 + b) << 9 | (r * 3 + g * 2 + b * 11) >> 1;
}

private getGBCColor() {
	//GBC Colorization of DMG ROMs:
	//BG
	for (var counter = 0; counter < 4; counter++) {
		var adjustedIndex = counter << 1;
		//BG
		this.cachedBGPaletteConversion[counter] = this.RGBTint((this.gbcBGRawPalette[adjustedIndex | 1] << 8) | this.gbcBGRawPalette[adjustedIndex]);
		//OBJ 1
		this.cachedOBJPaletteConversion[counter] = this.RGBTint((this.gbcOBJRawPalette[adjustedIndex | 1] << 8) | this.gbcOBJRawPalette[adjustedIndex]);
	}
	//OBJ 2
	for (counter = 4; counter < 8; counter++) {
		adjustedIndex = counter << 1;
		this.cachedOBJPaletteConversion[counter] = this.RGBTint((this.gbcOBJRawPalette[adjustedIndex | 1] << 8) | this.gbcOBJRawPalette[adjustedIndex]);
	}
	//Update the palette entries:
	this.updateGBBGPalette = this.updateGBColorizedBGPalette;
	this.updateGBOBJPalette = this.updateGBColorizedOBJPalette;
	this.updateGBBGPalette(this.memory[0xFF47]);
	this.updateGBOBJPalette(0, this.memory[0xFF48]);
	this.updateGBOBJPalette(1, this.memory[0xFF49]);
	this.colorizedGBPalettes = true;
}

private updateGBRegularBGPalette(data) {
	this.gbBGPalette[0] = this.colors[data & 0x03] | 0x2000000;
	this.gbBGPalette[1] = this.colors[(data >> 2) & 0x03];
	this.gbBGPalette[2] = this.colors[(data >> 4) & 0x03];
	this.gbBGPalette[3] = this.colors[data >> 6];
}

private updateGBColorizedBGPalette(data) {
	//GB colorization:
	this.gbBGColorizedPalette[0] = this.cachedBGPaletteConversion[data & 0x03] | 0x2000000;
	this.gbBGColorizedPalette[1] = this.cachedBGPaletteConversion[(data >> 2) & 0x03];
	this.gbBGColorizedPalette[2] = this.cachedBGPaletteConversion[(data >> 4) & 0x03];
	this.gbBGColorizedPalette[3] = this.cachedBGPaletteConversion[data >> 6];
}

private updateGBRegularOBJPalette(index, data) {
	this.gbOBJPalette[index | 1] = this.colors[(data >> 2) & 0x03];
	this.gbOBJPalette[index | 2] = this.colors[(data >> 4) & 0x03];
	this.gbOBJPalette[index | 3] = this.colors[data >> 6];
}

private updateGBColorizedOBJPalette(index, data) {
	//GB colorization:
	this.gbOBJColorizedPalette[index | 1] = this.cachedOBJPaletteConversion[index | ((data >> 2) & 0x03)];
	this.gbOBJColorizedPalette[index | 2] = this.cachedOBJPaletteConversion[index | ((data >> 4) & 0x03)];
	this.gbOBJColorizedPalette[index | 3] = this.cachedOBJPaletteConversion[index | (data >> 6)];
}

private updateGBCBGPalette(index, data) {
	if (this.gbcBGRawPalette[index] != data) {
		this.midScanLineJIT();
		//Update the color palette for BG tiles since it changed:
		this.gbcBGRawPalette[index] = data;
		if ((index & 0x06) == 0) {
			//Palette 0 (Special tile Priority stuff)
			data = 0x2000000 | this.RGBTint((this.gbcBGRawPalette[index | 1] << 8) | this.gbcBGRawPalette[index & 0x3E]);
			index >>= 1;
			this.gbcBGPalette[index] = data;
			this.gbcBGPalette[0x20 | index] = 0x1000000 | data;
		}
		else {
			//Regular Palettes (No special crap)
			data = this.RGBTint((this.gbcBGRawPalette[index | 1] << 8) | this.gbcBGRawPalette[index & 0x3E]);
			index >>= 1;
			this.gbcBGPalette[index] = data;
			this.gbcBGPalette[0x20 | index] = 0x1000000 | data;
		}
	}
}

private updateGBCOBJPalette(index, data) {
	if (this.gbcOBJRawPalette[index] != data) {
		//Update the color palette for OBJ tiles since it changed:
		this.gbcOBJRawPalette[index] = data;
		if ((index & 0x06) > 0) {
			//Regular Palettes (No special crap)
			this.midScanLineJIT();
			this.gbcOBJPalette[index >> 1] = 0x1000000 | this.RGBTint((this.gbcOBJRawPalette[index | 1] << 8) | this.gbcOBJRawPalette[index & 0x3E]);
		}
	}
}

private BGGBLayerRender(scanlineToRender) {
	var scrollYAdjusted = (this.backgroundY + scanlineToRender) & 0xFF;						//The line of the BG we're at.
	var tileYLine = (scrollYAdjusted & 7) << 3;
	var tileYDown = this.gfxBackgroundCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2);	//The row of cached tiles we're fetching from.
	var scrollXAdjusted = (this.backgroundX + this.currentX) & 0xFF;						//The scroll amount of the BG.
	var pixelPosition = this.pixelStart + this.currentX;									//Current pixel we're working on.
	var pixelPositionEnd = this.pixelStart + ((this.gfxWindowDisplay && (scanlineToRender - this.windowY) >= 0) ? Math.min(Math.max(this.windowX, 0) + this.currentX, this.pixelEnd) : this.pixelEnd);	//Make sure we do at most 160 pixels a scanline.
	var tileNumber = tileYDown + (scrollXAdjusted >> 3);
	var chrCode = this.BGCHRBank1[tileNumber];
	if (chrCode < this.gfxBackgroundBankOffset) {
		chrCode |= 0x100;
	}
	var tile = this.tileCache[chrCode];
	for (var texel = (scrollXAdjusted & 0x7); texel < 8 && pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[tileYLine | texel++]];
	}
	var scrollXAdjustedAligned = Math.min(pixelPositionEnd - pixelPosition, 0x100 - scrollXAdjusted) >> 3;
	scrollXAdjusted += scrollXAdjustedAligned << 3;
	scrollXAdjustedAligned += tileNumber;
	while (tileNumber < scrollXAdjustedAligned) {
		chrCode = this.BGCHRBank1[++tileNumber];
		if (chrCode < this.gfxBackgroundBankOffset) {
			chrCode |= 0x100;
		}
		tile = this.tileCache[chrCode];
		texel = tileYLine;
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel]];
	}
	if (pixelPosition < pixelPositionEnd) {
		if (scrollXAdjusted < 0x100) {
			chrCode = this.BGCHRBank1[++tileNumber];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			tile = this.tileCache[chrCode];
			for (texel = tileYLine - 1; pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
				this.frameBuffer[pixelPosition++] = this.BGPalette[tile[++texel]];
			}
		}
		scrollXAdjustedAligned = ((pixelPositionEnd - pixelPosition) >> 3) + tileYDown;
		while (tileYDown < scrollXAdjustedAligned) {
			chrCode = this.BGCHRBank1[tileYDown++];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			tile = this.tileCache[chrCode];
			texel = tileYLine;
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel]];
		}
		if (pixelPosition < pixelPositionEnd) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			tile = this.tileCache[chrCode];
			switch (pixelPositionEnd - pixelPosition) {
				case 7:
					this.frameBuffer[pixelPosition + 6] = this.BGPalette[tile[tileYLine | 6]];
				case 6:
					this.frameBuffer[pixelPosition + 5] = this.BGPalette[tile[tileYLine | 5]];
				case 5:
					this.frameBuffer[pixelPosition + 4] = this.BGPalette[tile[tileYLine | 4]];
				case 4:
					this.frameBuffer[pixelPosition + 3] = this.BGPalette[tile[tileYLine | 3]];
				case 3:
					this.frameBuffer[pixelPosition + 2] = this.BGPalette[tile[tileYLine | 2]];
				case 2:
					this.frameBuffer[pixelPosition + 1] = this.BGPalette[tile[tileYLine | 1]];
				case 1:
					this.frameBuffer[pixelPosition] = this.BGPalette[tile[tileYLine]];
			}
		}
	}
}

private BGGBCLayerRender(scanlineToRender) {
	var scrollYAdjusted = (this.backgroundY + scanlineToRender) & 0xFF;						//The line of the BG we're at.
	var tileYLine = (scrollYAdjusted & 7) << 3;
	var tileYDown = this.gfxBackgroundCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2);	//The row of cached tiles we're fetching from.
	var scrollXAdjusted = (this.backgroundX + this.currentX) & 0xFF;						//The scroll amount of the BG.
	var pixelPosition = this.pixelStart + this.currentX;									//Current pixel we're working on.
	var pixelPositionEnd = this.pixelStart + ((this.gfxWindowDisplay && (scanlineToRender - this.windowY) >= 0) ? Math.min(Math.max(this.windowX, 0) + this.currentX, this.pixelEnd) : this.pixelEnd);	//Make sure we do at most 160 pixels a scanline.
	var tileNumber = tileYDown + (scrollXAdjusted >> 3);
	var chrCode = this.BGCHRBank1[tileNumber];
	if (chrCode < this.gfxBackgroundBankOffset) {
		chrCode |= 0x100;
	}
	var attrCode = this.BGCHRBank2[tileNumber];
	var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
	var palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
	for (var texel = (scrollXAdjusted & 0x7); texel < 8 && pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
	}
	var scrollXAdjustedAligned = Math.min(pixelPositionEnd - pixelPosition, 0x100 - scrollXAdjusted) >> 3;
	scrollXAdjusted += scrollXAdjustedAligned << 3;
	scrollXAdjustedAligned += tileNumber;
	while (tileNumber < scrollXAdjustedAligned) {
		chrCode = this.BGCHRBank1[++tileNumber];
		if (chrCode < this.gfxBackgroundBankOffset) {
			chrCode |= 0x100;
		}
		attrCode = this.BGCHRBank2[tileNumber];
		tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
		palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
		texel = tileYLine;
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
	}
	if (pixelPosition < pixelPositionEnd) {
		if (scrollXAdjusted < 0x100) {
			chrCode = this.BGCHRBank1[++tileNumber];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileNumber];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
			for (texel = tileYLine - 1; pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
				this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[++texel]];
			}
		}
		scrollXAdjustedAligned = ((pixelPositionEnd - pixelPosition) >> 3) + tileYDown;
		while (tileYDown < scrollXAdjustedAligned) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown++];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
			texel = tileYLine;
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
		}
		if (pixelPosition < pixelPositionEnd) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
			switch (pixelPositionEnd - pixelPosition) {
				case 7:
					this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
				case 6:
					this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
				case 5:
					this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
				case 4:
					this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
				case 3:
					this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
				case 2:
					this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
				case 1:
					this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
			}
		}
	}
}

private BGGBCLayerRenderNoPriorityFlagging(scanlineToRender) {
	var scrollYAdjusted = (this.backgroundY + scanlineToRender) & 0xFF;						//The line of the BG we're at.
	var tileYLine = (scrollYAdjusted & 7) << 3;
	var tileYDown = this.gfxBackgroundCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2);	//The row of cached tiles we're fetching from.
	var scrollXAdjusted = (this.backgroundX + this.currentX) & 0xFF;						//The scroll amount of the BG.
	var pixelPosition = this.pixelStart + this.currentX;									//Current pixel we're working on.
	var pixelPositionEnd = this.pixelStart + ((this.gfxWindowDisplay && (scanlineToRender - this.windowY) >= 0) ? Math.min(Math.max(this.windowX, 0) + this.currentX, this.pixelEnd) : this.pixelEnd);	//Make sure we do at most 160 pixels a scanline.
	var tileNumber = tileYDown + (scrollXAdjusted >> 3);
	var chrCode = this.BGCHRBank1[tileNumber];
	if (chrCode < this.gfxBackgroundBankOffset) {
		chrCode |= 0x100;
	}
	var attrCode = this.BGCHRBank2[tileNumber];
	var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
	var palette = (attrCode & 0x7) << 2;
	for (var texel = (scrollXAdjusted & 0x7); texel < 8 && pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
	}
	var scrollXAdjustedAligned = Math.min(pixelPositionEnd - pixelPosition, 0x100 - scrollXAdjusted) >> 3;
	scrollXAdjusted += scrollXAdjustedAligned << 3;
	scrollXAdjustedAligned += tileNumber;
	while (tileNumber < scrollXAdjustedAligned) {
		chrCode = this.BGCHRBank1[++tileNumber];
		if (chrCode < this.gfxBackgroundBankOffset) {
			chrCode |= 0x100;
		}
		attrCode = this.BGCHRBank2[tileNumber];
		tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
		palette = (attrCode & 0x7) << 2;
		texel = tileYLine;
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
		this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
	}
	if (pixelPosition < pixelPositionEnd) {
		if (scrollXAdjusted < 0x100) {
			chrCode = this.BGCHRBank1[++tileNumber];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileNumber];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = (attrCode & 0x7) << 2;
			for (texel = tileYLine - 1; pixelPosition < pixelPositionEnd && scrollXAdjusted < 0x100; ++scrollXAdjusted) {
				this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[++texel]];
			}
		}
		scrollXAdjustedAligned = ((pixelPositionEnd - pixelPosition) >> 3) + tileYDown;
		while (tileYDown < scrollXAdjustedAligned) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown++];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = (attrCode & 0x7) << 2;
			texel = tileYLine;
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
			this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
		}
		if (pixelPosition < pixelPositionEnd) {
			chrCode = this.BGCHRBank1[tileYDown];
			if (chrCode < this.gfxBackgroundBankOffset) {
				chrCode |= 0x100;
			}
			attrCode = this.BGCHRBank2[tileYDown];
			tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
			palette = (attrCode & 0x7) << 2;
			switch (pixelPositionEnd - pixelPosition) {
				case 7:
					this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
				case 6:
					this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
				case 5:
					this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
				case 4:
					this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
				case 3:
					this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
				case 2:
					this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
				case 1:
					this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
			}
		}
	}
}

private WindowGBLayerRender(scanlineToRender) {
	if (this.gfxWindowDisplay) {									//Is the window enabled?
		var scrollYAdjusted = scanlineToRender - this.windowY;		//The line of the BG we're at.
		if (scrollYAdjusted >= 0) {
			var scrollXRangeAdjusted = (this.windowX > 0) ? (this.windowX + this.currentX) : this.currentX;
			var pixelPosition = this.pixelStart + scrollXRangeAdjusted;
			var pixelPositionEnd = this.pixelStart + this.pixelEnd;
			if (pixelPosition < pixelPositionEnd) {
				var tileYLine = (scrollYAdjusted & 0x7) << 3;
				var tileNumber = (this.gfxWindowCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2)) + (this.currentX >> 3);
				var chrCode = this.BGCHRBank1[tileNumber];
				if (chrCode < this.gfxBackgroundBankOffset) {
					chrCode |= 0x100;
				}
				var tile = this.tileCache[chrCode];
				var texel = (scrollXRangeAdjusted - this.windowX) & 0x7;
				scrollXRangeAdjusted = Math.min(8, texel + pixelPositionEnd - pixelPosition);
				while (texel < scrollXRangeAdjusted) {
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[tileYLine | texel++]];
				}
				scrollXRangeAdjusted = tileNumber + ((pixelPositionEnd - pixelPosition) >> 3);
				while (tileNumber < scrollXRangeAdjusted) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					tile = this.tileCache[chrCode];
					texel = tileYLine;
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.BGPalette[tile[texel]];
				}
				if (pixelPosition < pixelPositionEnd) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					tile = this.tileCache[chrCode];
					switch (pixelPositionEnd - pixelPosition) {
						case 7:
							this.frameBuffer[pixelPosition + 6] = this.BGPalette[tile[tileYLine | 6]];
						case 6:
							this.frameBuffer[pixelPosition + 5] = this.BGPalette[tile[tileYLine | 5]];
						case 5:
							this.frameBuffer[pixelPosition + 4] = this.BGPalette[tile[tileYLine | 4]];
						case 4:
							this.frameBuffer[pixelPosition + 3] = this.BGPalette[tile[tileYLine | 3]];
						case 3:
							this.frameBuffer[pixelPosition + 2] = this.BGPalette[tile[tileYLine | 2]];
						case 2:
							this.frameBuffer[pixelPosition + 1] = this.BGPalette[tile[tileYLine | 1]];
						case 1:
							this.frameBuffer[pixelPosition] = this.BGPalette[tile[tileYLine]];
					}
				}
			}
		}
	}
}

private WindowGBCLayerRender(scanlineToRender) {
	if (this.gfxWindowDisplay) {									//Is the window enabled?
		var scrollYAdjusted = scanlineToRender - this.windowY;		//The line of the BG we're at.
		if (scrollYAdjusted >= 0) {
			var scrollXRangeAdjusted = (this.windowX > 0) ? (this.windowX + this.currentX) : this.currentX;
			var pixelPosition = this.pixelStart + scrollXRangeAdjusted;
			var pixelPositionEnd = this.pixelStart + this.pixelEnd;
			if (pixelPosition < pixelPositionEnd) {
				var tileYLine = (scrollYAdjusted & 0x7) << 3;
				var tileNumber = (this.gfxWindowCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2)) + (this.currentX >> 3);
				var chrCode = this.BGCHRBank1[tileNumber];
				if (chrCode < this.gfxBackgroundBankOffset) {
					chrCode |= 0x100;
				}
				var attrCode = this.BGCHRBank2[tileNumber];
				var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
				var palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
				var texel = (scrollXRangeAdjusted - this.windowX) & 0x7;
				scrollXRangeAdjusted = Math.min(8, texel + pixelPositionEnd - pixelPosition);
				while (texel < scrollXRangeAdjusted) {
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
				}
				scrollXRangeAdjusted = tileNumber + ((pixelPositionEnd - pixelPosition) >> 3);
				while (tileNumber < scrollXRangeAdjusted) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
					texel = tileYLine;
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
				}
				if (pixelPosition < pixelPositionEnd) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = ((attrCode & 0x7) << 2) | ((attrCode & 0x80) >> 2);
					switch (pixelPositionEnd - pixelPosition) {
						case 7:
							this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
						case 6:
							this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
						case 5:
							this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
						case 4:
							this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
						case 3:
							this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
						case 2:
							this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
						case 1:
							this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
					}
				}
			}
		}
	}
}

private WindowGBCLayerRenderNoPriorityFlagging(scanlineToRender) {
	if (this.gfxWindowDisplay) {									//Is the window enabled?
		var scrollYAdjusted = scanlineToRender - this.windowY;		//The line of the BG we're at.
		if (scrollYAdjusted >= 0) {
			var scrollXRangeAdjusted = (this.windowX > 0) ? (this.windowX + this.currentX) : this.currentX;
			var pixelPosition = this.pixelStart + scrollXRangeAdjusted;
			var pixelPositionEnd = this.pixelStart + this.pixelEnd;
			if (pixelPosition < pixelPositionEnd) {
				var tileYLine = (scrollYAdjusted & 0x7) << 3;
				var tileNumber = (this.gfxWindowCHRBankPosition | ((scrollYAdjusted & 0xF8) << 2)) + (this.currentX >> 3);
				var chrCode = this.BGCHRBank1[tileNumber];
				if (chrCode < this.gfxBackgroundBankOffset) {
					chrCode |= 0x100;
				}
				var attrCode = this.BGCHRBank2[tileNumber];
				var tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
				var palette = (attrCode & 0x7) << 2;
				var texel = (scrollXRangeAdjusted - this.windowX) & 0x7;
				scrollXRangeAdjusted = Math.min(8, texel + pixelPositionEnd - pixelPosition);
				while (texel < scrollXRangeAdjusted) {
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[tileYLine | texel++]];
				}
				scrollXRangeAdjusted = tileNumber + ((pixelPositionEnd - pixelPosition) >> 3);
				while (tileNumber < scrollXRangeAdjusted) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = (attrCode & 0x7) << 2;
					texel = tileYLine;
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel++]];
					this.frameBuffer[pixelPosition++] = this.gbcBGPalette[palette | tile[texel]];
				}
				if (pixelPosition < pixelPositionEnd) {
					chrCode = this.BGCHRBank1[++tileNumber];
					if (chrCode < this.gfxBackgroundBankOffset) {
						chrCode |= 0x100;
					}
					attrCode = this.BGCHRBank2[tileNumber];
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | chrCode];
					palette = (attrCode & 0x7) << 2;
					switch (pixelPositionEnd - pixelPosition) {
						case 7:
							this.frameBuffer[pixelPosition + 6] = this.gbcBGPalette[palette | tile[tileYLine | 6]];
						case 6:
							this.frameBuffer[pixelPosition + 5] = this.gbcBGPalette[palette | tile[tileYLine | 5]];
						case 5:
							this.frameBuffer[pixelPosition + 4] = this.gbcBGPalette[palette | tile[tileYLine | 4]];
						case 4:
							this.frameBuffer[pixelPosition + 3] = this.gbcBGPalette[palette | tile[tileYLine | 3]];
						case 3:
							this.frameBuffer[pixelPosition + 2] = this.gbcBGPalette[palette | tile[tileYLine | 2]];
						case 2:
							this.frameBuffer[pixelPosition + 1] = this.gbcBGPalette[palette | tile[tileYLine | 1]];
						case 1:
							this.frameBuffer[pixelPosition] = this.gbcBGPalette[palette | tile[tileYLine]];
					}
				}
			}
		}
	}
}

private SpriteGBLayerRender(scanlineToRender) {
	if (this.gfxSpriteShow) {										//Are sprites enabled?
		var lineAdjusted = scanlineToRender + 0x10;
		var OAMAddress = 0xFE00;
		var yoffset = 0;
		var xcoord = 1;
		var xCoordStart = 0;
		var xCoordEnd = 0;
		var attrCode = 0;
		var palette = 0;
		var tile = null;
		var data = 0;
		var spriteCount = 0;
		var length = 0;
		var currentPixel = 0;
		var linePixel = 0;
		//Clear our x-coord sort buffer:
		while (xcoord < 168) {
			this.sortBuffer[xcoord++] = 0xFF;
		}
		if (this.gfxSpriteNormalHeight) {
			//Draw the visible sprites:
			for (var length = this.findLowestSpriteDrawable(lineAdjusted, 0x7) as number; spriteCount < length; ++spriteCount) {
				OAMAddress = this.OAMAddressCache[spriteCount];
				yoffset = (lineAdjusted - this.memory[OAMAddress]) << 3;
				attrCode = this.memory[OAMAddress | 3];
				palette = (attrCode & 0x10) >> 2;
				tile = this.tileCache[((attrCode & 0x60) << 4) | this.memory[OAMAddress | 0x2]];
				linePixel = xCoordStart = this.memory[OAMAddress | 1];
				xCoordEnd = Math.min(168 - linePixel, 8);
				xcoord = (linePixel > 7) ? 0 : (8 - linePixel);
				for (currentPixel = this.pixelStart + ((linePixel > 8) ? (linePixel - 8) : 0); xcoord < xCoordEnd; ++xcoord, ++currentPixel, ++linePixel) {
					if (this.sortBuffer[linePixel] > xCoordStart) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[yoffset | xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[yoffset | xcoord];
							if (data > 0 && attrCode < 0x80) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
					}
				}
			}
		}
		else {
			//Draw the visible sprites:
			for (var length = this.findLowestSpriteDrawable(lineAdjusted, 0xF) as number; spriteCount < length; ++spriteCount) {
				OAMAddress = this.OAMAddressCache[spriteCount];
				yoffset = (lineAdjusted - this.memory[OAMAddress]) << 3;
				attrCode = this.memory[OAMAddress | 3];
				palette = (attrCode & 0x10) >> 2;
				if ((attrCode & 0x40) == (0x40 & yoffset)) {
					tile = this.tileCache[((attrCode & 0x60) << 4) | (this.memory[OAMAddress | 0x2] & 0xFE)];
				}
				else {
					tile = this.tileCache[((attrCode & 0x60) << 4) | this.memory[OAMAddress | 0x2] | 1];
				}
				yoffset &= 0x3F;
				linePixel = xCoordStart = this.memory[OAMAddress | 1];
				xCoordEnd = Math.min(168 - linePixel, 8);
				xcoord = (linePixel > 7) ? 0 : (8 - linePixel);
				for (currentPixel = this.pixelStart + ((linePixel > 8) ? (linePixel - 8) : 0); xcoord < xCoordEnd; ++xcoord, ++currentPixel, ++linePixel) {
					if (this.sortBuffer[linePixel] > xCoordStart) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[yoffset | xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[yoffset | xcoord];
							if (data > 0 && attrCode < 0x80) {
								this.frameBuffer[currentPixel] = this.OBJPalette[palette | data];
								this.sortBuffer[linePixel] = xCoordStart;
							}
						}
					}
				}
			}
		}
	}
}

private findLowestSpriteDrawable(scanlineToRender, drawableRange) {
	var address = 0xFE00;
	var spriteCount = 0;
	var diff = 0;
	while (address < 0xFEA0 && spriteCount < 10) {
		diff = scanlineToRender - this.memory[address];
		if ((diff & drawableRange) == diff) {
			this.OAMAddressCache[spriteCount++] = address;
		}
		address += 4;
	}
	return spriteCount;
}

private SpriteGBCLayerRender(scanlineToRender) {
	if (this.gfxSpriteShow) {										//Are sprites enabled?
		var OAMAddress = 0xFE00;
		var lineAdjusted = scanlineToRender + 0x10;
		var yoffset = 0;
		var xcoord = 0;
		var endX = 0;
		var xCounter = 0;
		var attrCode = 0;
		var palette = 0;
		var tile = null;
		var data = 0;
		var currentPixel = 0;
		var spriteCount = 0;
		if (this.gfxSpriteNormalHeight) {
			for (; OAMAddress < 0xFEA0 && spriteCount < 10; OAMAddress += 4) {
				yoffset = lineAdjusted - this.memory[OAMAddress];
				if ((yoffset & 0x7) == yoffset) {
					xcoord = this.memory[OAMAddress | 1] - 8;
					endX = Math.min(160, xcoord + 8);
					attrCode = this.memory[OAMAddress | 3];
					palette = (attrCode & 7) << 2;
					tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | this.memory[OAMAddress | 2]];
					xCounter = (xcoord > 0) ? xcoord : 0;
					xcoord -= yoffset << 3;
					for (currentPixel = this.pixelStart + xCounter; xCounter < endX; ++xCounter, ++currentPixel) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[xCounter - xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[xCounter - xcoord];
							if (data > 0 && attrCode < 0x80) {		//Don't optimize for attrCode, as LICM-capable JITs should optimize its checks.
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
					}
					++spriteCount;
				}
			}
		}
		else {
			for (; OAMAddress < 0xFEA0 && spriteCount < 10; OAMAddress += 4) {
				yoffset = lineAdjusted - this.memory[OAMAddress];
				if ((yoffset & 0xF) == yoffset) {
					xcoord = this.memory[OAMAddress | 1] - 8;
					endX = Math.min(160, xcoord + 8);
					attrCode = this.memory[OAMAddress | 3];
					palette = (attrCode & 7) << 2;
					if ((attrCode & 0x40) == (0x40 & (yoffset << 3))) {
						tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | (this.memory[OAMAddress | 0x2] & 0xFE)];
					}
					else {
						tile = this.tileCache[((attrCode & 0x08) << 8) | ((attrCode & 0x60) << 4) | this.memory[OAMAddress | 0x2] | 1];
					}
					xCounter = (xcoord > 0) ? xcoord : 0;
					xcoord -= (yoffset & 0x7) << 3;
					for (currentPixel = this.pixelStart + xCounter; xCounter < endX; ++xCounter, ++currentPixel) {
						if (this.frameBuffer[currentPixel] >= 0x2000000) {
							data = tile[xCounter - xcoord];
							if (data > 0) {
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
						else if (this.frameBuffer[currentPixel] < 0x1000000) {
							data = tile[xCounter - xcoord];
							if (data > 0 && attrCode < 0x80) {		//Don't optimize for attrCode, as LICM-capable JITs should optimize its checks.
								this.frameBuffer[currentPixel] = this.gbcOBJPalette[palette | data];
							}
						}
					}
					++spriteCount;
				}
			}
		}
	}
}

//Generate only a single tile line for the GB tile cache mode:
private generateGBTileLine(address) {
	var lineCopy = (this.memory[0x1 | address] << 8) | this.memory[0x9FFE & address];
	var tileBlock = this.tileCache[(address & 0x1FF0) >> 4];
	address = (address & 0xE) << 2;
	tileBlock[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}

//Generate only a single tile line for the GBC tile cache mode (Bank 1):
private generateGBCTileLineBank1(address) {
	var lineCopy = (this.memory[0x1 | address] << 8) | this.memory[0x9FFE & address];
	address &= 0x1FFE;
	var tileBlock1 = this.tileCache[address >> 4];
	var tileBlock2 = this.tileCache[0x200 | (address >> 4)];
	var tileBlock3 = this.tileCache[0x400 | (address >> 4)];
	var tileBlock4 = this.tileCache[0x600 | (address >> 4)];
	address = (address & 0xE) << 2;
	var addressFlipped = 0x38 - address;
	tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}

//Generate all the flip combinations for a full GBC VRAM bank 1 tile:
private generateGBCTileBank1(vramAddress) {
	var address = vramAddress >> 4;
	var tileBlock1 = this.tileCache[address];
	var tileBlock2 = this.tileCache[0x200 | address];
	var tileBlock3 = this.tileCache[0x400 | address];
	var tileBlock4 = this.tileCache[0x600 | address];
	var lineCopy = 0;
	vramAddress |= 0x8000;
	address = 0;
	var addressFlipped = 56;
	do {
		lineCopy = (this.memory[0x1 | vramAddress] << 8) | this.memory[vramAddress];
		tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
		tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
		tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
		tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
		tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
		tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
		tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
		tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
		address += 8;
		addressFlipped -= 8;
		vramAddress += 2;
	} while (addressFlipped > -1);
}

//Generate only a single tile line for the GBC tile cache mode (Bank 2):
private generateGBCTileLineBank2(address) {
	var lineCopy = (this.VRAM[0x1 | address] << 8) | this.VRAM[0x1FFE & address];
	var tileBlock1 = this.tileCache[0x800 | (address >> 4)];
	var tileBlock2 = this.tileCache[0xA00 | (address >> 4)];
	var tileBlock3 = this.tileCache[0xC00 | (address >> 4)];
	var tileBlock4 = this.tileCache[0xE00 | (address >> 4)];
	address = (address & 0xE) << 2;
	var addressFlipped = 0x38 - address;
	tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}

//Generate all the flip combinations for a full GBC VRAM bank 2 tile:
private generateGBCTileBank2(vramAddress) {
	var address = vramAddress >> 4;
	var tileBlock1 = this.tileCache[0x800 | address];
	var tileBlock2 = this.tileCache[0xA00 | address];
	var tileBlock3 = this.tileCache[0xC00 | address];
	var tileBlock4 = this.tileCache[0xE00 | address];
	var lineCopy = 0;
	address = 0;
	var addressFlipped = 56;
	do {
		lineCopy = (this.VRAM[0x1 | vramAddress] << 8) | this.VRAM[vramAddress];
		tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
		tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
		tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
		tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
		tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
		tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
		tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
		tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
		address += 8;
		addressFlipped -= 8;
		vramAddress += 2;
	} while (addressFlipped > -1);
}

//Generate only a single tile line for the GB tile cache mode (OAM accessible range):
private generateGBOAMTileLine(address) {
	var lineCopy = (this.memory[0x1 | address] << 8) | this.memory[0x9FFE & address];
	address &= 0x1FFE;
	var tileBlock1 = this.tileCache[address >> 4];
	var tileBlock2 = this.tileCache[0x200 | (address >> 4)];
	var tileBlock3 = this.tileCache[0x400 | (address >> 4)];
	var tileBlock4 = this.tileCache[0x600 | (address >> 4)];
	address = (address & 0xE) << 2;
	var addressFlipped = 0x38 - address;
	tileBlock4[addressFlipped] = tileBlock2[address] = tileBlock3[addressFlipped | 7] = tileBlock1[address | 7] = ((lineCopy & 0x100) >> 7) | (lineCopy & 0x1);
	tileBlock4[addressFlipped | 1] = tileBlock2[address | 1] = tileBlock3[addressFlipped | 6] = tileBlock1[address | 6] = ((lineCopy & 0x200) >> 8) | ((lineCopy & 0x2) >> 1);
	tileBlock4[addressFlipped | 2] = tileBlock2[address | 2] = tileBlock3[addressFlipped | 5] = tileBlock1[address | 5] = ((lineCopy & 0x400) >> 9) | ((lineCopy & 0x4) >> 2);
	tileBlock4[addressFlipped | 3] = tileBlock2[address | 3] = tileBlock3[addressFlipped | 4] = tileBlock1[address | 4] = ((lineCopy & 0x800) >> 10) | ((lineCopy & 0x8) >> 3);
	tileBlock4[addressFlipped | 4] = tileBlock2[address | 4] = tileBlock3[addressFlipped | 3] = tileBlock1[address | 3] = ((lineCopy & 0x1000) >> 11) | ((lineCopy & 0x10) >> 4);
	tileBlock4[addressFlipped | 5] = tileBlock2[address | 5] = tileBlock3[addressFlipped | 2] = tileBlock1[address | 2] = ((lineCopy & 0x2000) >> 12) | ((lineCopy & 0x20) >> 5);
	tileBlock4[addressFlipped | 6] = tileBlock2[address | 6] = tileBlock3[addressFlipped | 1] = tileBlock1[address | 1] = ((lineCopy & 0x4000) >> 13) | ((lineCopy & 0x40) >> 6);
	tileBlock4[addressFlipped | 7] = tileBlock2[address | 7] = tileBlock3[addressFlipped] = tileBlock1[address] = ((lineCopy & 0x8000) >> 14) | ((lineCopy & 0x80) >> 7);
}

private graphicsJIT() {
	if (this.LCDisOn) {
		this.totalLinesPassed = 0;			//Mark frame for ensuring a JIT pass for the next framebuffer output.
		this.graphicsJITScanlineGroup();
	}
}

private graphicsJITVBlank() {
	//JIT the graphics to v-blank framing:
	this.totalLinesPassed += this.queuedScanLines;
	this.graphicsJITScanlineGroup();
}

private graphicsJITScanlineGroup() {
	//Normal rendering JIT, where we try to do groups of scanlines at once:
	while (this.queuedScanLines > 0) {
		this.renderScanLine(this.lastUnrenderedLine);
		if (this.lastUnrenderedLine < 143) {
			++this.lastUnrenderedLine;
		}
		else {
			this.lastUnrenderedLine = 0;
		}
		--this.queuedScanLines;
	}
}

private incrementScanLineQueue() {
	if (this.queuedScanLines < 144) {
		++this.queuedScanLines;
	}
	else {
		this.currentX = 0;
		this.midScanlineOffset = -1;
		if (this.lastUnrenderedLine < 143) {
			++this.lastUnrenderedLine;
		}
		else {
			this.lastUnrenderedLine = 0;
		}
	}
}

private midScanLineJIT() {
	this.graphicsJIT();
	this.renderMidScanLine();
}

//Check for the highest priority IRQ to fire:
private launchIRQ() {
	var bitShift = 0;
	var testbit = 1;
	do {
		//Check to see if an interrupt is enabled AND requested.
		if ((testbit & this.IRQLineMatched) == testbit) {
			this.IME = false;						//Reset the interrupt enabling.
			this.interruptsRequested -= testbit;	//Reset the interrupt request.
			this.IRQLineMatched = 0;				//Reset the IRQ assertion.
			//Interrupts have a certain clock cycle length:
			this.CPUTicks = 20;
			//Set the stack pointer to the current program counter value:
			this.stackPointer = (this.stackPointer - 1) & 0xFFFF;
			this.memoryWriter[this.stackPointer](this, this.stackPointer, this.programCounter >> 8);
			this.stackPointer = (this.stackPointer - 1) & 0xFFFF;
			this.memoryWriter[this.stackPointer](this, this.stackPointer, this.programCounter & 0xFF);
			//Set the program counter to the interrupt's address:
			this.programCounter = 0x40 | (bitShift << 3);
			//Clock the core for mid-instruction updates:
			this.updateCore();
			return;									//We only want the highest priority interrupt.
		}
		testbit = 1 << ++bitShift;
	} while (bitShift < 5);
}

/*
	Check for IRQs to be fired while not in HALT:
*/
private checkIRQMatching() {
	if (this.IME) {
		this.IRQLineMatched = this.interruptsEnabled & this.interruptsRequested & 0x1F;
	}
}

/*
	Handle the HALT opcode by predicting all IRQ cases correctly,
	then selecting the next closest IRQ firing from the prediction to
	clock up to. This prevents hacky looping that doesn't predict, but
	instead just clocks through the core update procedure by one which
	is very slow. Not many emulators do this because they have to cover
	all the IRQ prediction cases and they usually get them wrong.
*/
public calculateHALTPeriod() {
	//Initialize our variables and start our prediction:
	if (!this.halt) {
		this.halt = true;
		var currentClocks = -1;
		var temp_var = 0;
		if (this.LCDisOn) {
			//If the LCD is enabled, then predict the LCD IRQs enabled:
			if ((this.interruptsEnabled & 0x1) == 0x1) {
				currentClocks = ((456 * (((this.modeSTAT == 1) ? 298 : 144) - this.actualScanLine)) - this.LCDTicks) << this.doubleSpeedShifter;
			}
			if ((this.interruptsEnabled & 0x2) == 0x2) {
				if (this.mode0TriggerSTAT) {
					temp_var = (this.clocksUntilMode0() - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
				if (this.mode1TriggerSTAT && (this.interruptsEnabled & 0x1) == 0) {
					temp_var = ((456 * (((this.modeSTAT == 1) ? 298 : 144) - this.actualScanLine)) - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
				if (this.mode2TriggerSTAT) {
					temp_var = (((this.actualScanLine >= 143) ? (456 * (154 - this.actualScanLine)) : 456) - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
				if (this.LYCMatchTriggerSTAT && this.memory[0xFF45] <= 153) {
					temp_var = (this.clocksUntilLYCMatch() - this.LCDTicks) << this.doubleSpeedShifter;
					if (temp_var <= currentClocks || currentClocks == -1) {
						currentClocks = temp_var;
					}
				}
			}
		}
		if (this.TIMAEnabled && (this.interruptsEnabled & 0x4) == 0x4) {
			//CPU timer IRQ prediction:
			temp_var = ((0x100 - this.memory[0xFF05]) * this.TACClocker) - this.timerTicks;
			if (temp_var <= currentClocks || currentClocks == -1) {
				currentClocks = temp_var;
			}
		}
		if (this.serialTimer > 0 && (this.interruptsEnabled & 0x8) == 0x8) {
			//Serial IRQ prediction:
			if (this.serialTimer <= currentClocks || currentClocks == -1) {
				currentClocks = this.serialTimer;
			}
		}
	}
	else {
		var currentClocks = this.remainingClocks as number;
	}
	var maxClocks = (this.CPUCyclesTotal - this.emulatorTicks) << this.doubleSpeedShifter;
	if (currentClocks >= 0) {
		if (currentClocks <= maxClocks) {
			//Exit out of HALT normally:
			this.CPUTicks = Math.max(currentClocks, this.CPUTicks);
			this.updateCoreFull();
			this.halt = false;
			this.CPUTicks = 0;
		}
		else {
			//Still in HALT, clock only up to the clocks specified per iteration:
			this.CPUTicks = Math.max(maxClocks, this.CPUTicks);
			this.remainingClocks = currentClocks - this.CPUTicks;
		}
	}
	else {
		//Still in HALT, clock only up to the clocks specified per iteration:
		//Will stay in HALT forever (Stuck in HALT forever), but the APU and LCD are still clocked, so don't pause:
		this.CPUTicks += maxClocks;
	}
}

//Memory Reading:
public memoryRead(address) {
	//Act as a wrapper for reading the returns from the compiled jumps to memory.
	return this.memoryReader[address](this, address);	//This seems to be faster than the usual if/else.
}

public memoryHighRead(address) {
	//Act as a wrapper for reading the returns from the compiled jumps to memory.
	return this.memoryHighReader[address](this, address);	//This seems to be faster than the usual if/else.
}

private memoryReadJumpCompile() {
	//Faster in some browsers, since we are doing less conditionals overall by implementing them in advance.
	for (var index = 0x0000; index <= 0xFFFF; index++) {
		if (index < 0x4000) {
			this.memoryReader[index] = this.memoryReadNormal;
		}
		else if (index < 0x8000) {
			this.memoryReader[index] = this.memoryReadROM;
		}
		else if (index < 0x9800) {
			this.memoryReader[index] = (this.cGBC) ? this.VRAMDATAReadCGBCPU : this.VRAMDATAReadDMGCPU;
		}
		else if (index < 0xA000) {
			this.memoryReader[index] = (this.cGBC) ? this.VRAMCHRReadCGBCPU : this.VRAMCHRReadDMGCPU;
		}
		else if (index >= 0xA000 && index < 0xC000) {
			if ((this.numRAMBanks == 1 / 16 && index < 0xA200) || this.numRAMBanks >= 1) {
				if (this.cMBC7) {
					this.memoryReader[index] = this.memoryReadMBC7;
				}
				else if (!this.cMBC3) {
					this.memoryReader[index] = this.memoryReadMBC;
				}
				else {
					//MBC3 RTC + RAM:
					this.memoryReader[index] = this.memoryReadMBC3;
				}
			}
			else {
				this.memoryReader[index] = this.memoryReadBAD;
			}
		}
		else if (index >= 0xC000 && index < 0xE000) {
			if (!this.cGBC || index < 0xD000) {
				this.memoryReader[index] = this.memoryReadNormal;
			}
			else {
				this.memoryReader[index] = this.memoryReadGBCMemory;
			}
		}
		else if (index >= 0xE000 && index < 0xFE00) {
			if (!this.cGBC || index < 0xF000) {
				this.memoryReader[index] = this.memoryReadECHONormal;
			}
			else {
				this.memoryReader[index] = this.memoryReadECHOGBCMemory;
			}
		}
		else if (index < 0xFEA0) {
			this.memoryReader[index] = this.memoryReadOAM;
		}
		else if (this.cGBC && index >= 0xFEA0 && index < 0xFF00) {
			this.memoryReader[index] = this.memoryReadNormal;
		}
		else if (index >= 0xFF00) {
			switch (index) {
				case 0xFF00:
					//JOYPAD:
					this.memoryHighReader[0] = this.memoryReader[0xFF00] = function (parentObj: GameBoyCore, _address) {
						return 0xC0 | parentObj.memory[0xFF00];	//Top nibble returns as set.
					}
					break;
				case 0xFF01:
					//SB
					this.memoryHighReader[0x01] = this.memoryReader[0xFF01] = function (parentObj: GameBoyCore, _address) {
						return (parentObj.memory[0xFF02] < 0x80) ? parentObj.memory[0xFF01] : 0xFF;
					}
					break;
				case 0xFF02:
					//SC
					if (this.cGBC) {
						this.memoryHighReader[0x02] = this.memoryReader[0xFF02] = function (parentObj: GameBoyCore, _address) {
							return ((parentObj.serialTimer <= 0) ? 0x7C : 0xFC) | parentObj.memory[0xFF02];
						}
					}
					else {
						this.memoryHighReader[0x02] = this.memoryReader[0xFF02] = function (parentObj: GameBoyCore, _address) {
							return ((parentObj.serialTimer <= 0) ? 0x7E : 0xFE) | parentObj.memory[0xFF02];
						}
					}
					break;
				case 0xFF03:
					this.memoryHighReader[0x03] = this.memoryReader[0xFF03] = this.memoryReadBAD;
					break;
				case 0xFF04:
					//DIV
					this.memoryHighReader[0x04] = this.memoryReader[0xFF04] = function (parentObj: GameBoyCore, _address) {
						parentObj.memory[0xFF04] = (parentObj.memory[0xFF04] + (parentObj.DIVTicks >> 8)) & 0xFF;
						parentObj.DIVTicks &= 0xFF;
						return parentObj.memory[0xFF04];

					}
					break;
				case 0xFF05:
				case 0xFF06:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF07:
					this.memoryHighReader[0x07] = this.memoryReader[0xFF07] = function (parentObj: GameBoyCore, _address) {
						return 0xF8 | parentObj.memory[0xFF07];
					}
					break;
				case 0xFF08:
				case 0xFF09:
				case 0xFF0A:
				case 0xFF0B:
				case 0xFF0C:
				case 0xFF0D:
				case 0xFF0E:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF0F:
					//IF
					this.memoryHighReader[0x0F] = this.memoryReader[0xFF0F] = function (parentObj: GameBoyCore, _address) {
						return 0xE0 | parentObj.interruptsRequested;
					}
					break;
				case 0xFF10:
					this.memoryHighReader[0x10] = this.memoryReader[0xFF10] = function (parentObj: GameBoyCore, _address) {
						return 0x80 | parentObj.memory[0xFF10];
					}
					break;
				case 0xFF11:
					this.memoryHighReader[0x11] = this.memoryReader[0xFF11] = function (parentObj: GameBoyCore, _address) {
						return 0x3F | parentObj.memory[0xFF11];
					}
					break;
				case 0xFF12:
					this.memoryHighReader[0x12] = this.memoryHighReadNormal;
					this.memoryReader[0xFF12] = this.memoryReadNormal;
					break;
				case 0xFF13:
					this.memoryHighReader[0x13] = this.memoryReader[0xFF13] = this.memoryReadBAD;
					break;
				case 0xFF14:
					this.memoryHighReader[0x14] = this.memoryReader[0xFF14] = function (parentObj: GameBoyCore, _address) {
						return 0xBF | parentObj.memory[0xFF14];
					}
					break;
				case 0xFF15:
					this.memoryHighReader[0x15] = this.memoryReadBAD;
					this.memoryReader[0xFF15] = this.memoryReadBAD;
					break;
				case 0xFF16:
					this.memoryHighReader[0x16] = this.memoryReader[0xFF16] = function (parentObj: GameBoyCore, _address) {
						return 0x3F | parentObj.memory[0xFF16];
					}
					break;
				case 0xFF17:
					this.memoryHighReader[0x17] = this.memoryHighReadNormal;
					this.memoryReader[0xFF17] = this.memoryReadNormal;
					break;
				case 0xFF18:
					this.memoryHighReader[0x18] = this.memoryReader[0xFF18] = this.memoryReadBAD;
					break;
				case 0xFF19:
					this.memoryHighReader[0x19] = this.memoryReader[0xFF19] = function (parentObj: GameBoyCore, _address) {
						return 0xBF | parentObj.memory[0xFF19];
					}
					break;
				case 0xFF1A:
					this.memoryHighReader[0x1A] = this.memoryReader[0xFF1A] = function (parentObj: GameBoyCore, _address) {
						return 0x7F | parentObj.memory[0xFF1A];
					}
					break;
				case 0xFF1B:
					this.memoryHighReader[0x1B] = this.memoryReader[0xFF1B] = this.memoryReadBAD;
					break;
				case 0xFF1C:
					this.memoryHighReader[0x1C] = this.memoryReader[0xFF1C] = function (parentObj: GameBoyCore, _address) {
						return 0x9F | parentObj.memory[0xFF1C];
					}
					break;
				case 0xFF1D:
					this.memoryHighReader[0x1D] = this.memoryReader[0xFF1D] = this.memoryReadBAD;
					break;
				case 0xFF1E:
					this.memoryHighReader[0x1E] = this.memoryReader[0xFF1E] = function (parentObj: GameBoyCore, _address) {
						return 0xBF | parentObj.memory[0xFF1E];
					}
					break;
				case 0xFF1F:
				case 0xFF20:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF21:
				case 0xFF22:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF23:
					this.memoryHighReader[0x23] = this.memoryReader[0xFF23] = function (parentObj: GameBoyCore, _address) {
						return 0xBF | parentObj.memory[0xFF23];
					}
					break;
				case 0xFF24:
				case 0xFF25:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF26:
					this.memoryHighReader[0x26] = this.memoryReader[0xFF26] = function (parentObj: GameBoyCore, _address) {
						parentObj.audioJIT();
						return 0x70 | parentObj.memory[0xFF26];
					}
					break;
				case 0xFF27:
				case 0xFF28:
				case 0xFF29:
				case 0xFF2A:
				case 0xFF2B:
				case 0xFF2C:
				case 0xFF2D:
				case 0xFF2E:
				case 0xFF2F:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF30:
				case 0xFF31:
				case 0xFF32:
				case 0xFF33:
				case 0xFF34:
				case 0xFF35:
				case 0xFF36:
				case 0xFF37:
				case 0xFF38:
				case 0xFF39:
				case 0xFF3A:
				case 0xFF3B:
				case 0xFF3C:
				case 0xFF3D:
				case 0xFF3E:
				case 0xFF3F:
					this.memoryReader[index] = function (parentObj: GameBoyCore, address) {
						return (parentObj.channel3canPlay) ? parentObj.memory[0xFF00 | (parentObj.channel3lastSampleLookup >> 1)] : parentObj.memory[address];
					}
					this.memoryHighReader[index & 0xFF] = function (parentObj: GameBoyCore, address) {
						return (parentObj.channel3canPlay) ? parentObj.memory[0xFF00 | (parentObj.channel3lastSampleLookup >> 1)] : parentObj.memory[0xFF00 | address];
					}
					break;
				case 0xFF40:
					this.memoryHighReader[0x40] = this.memoryHighReadNormal;
					this.memoryReader[0xFF40] = this.memoryReadNormal;
					break;
				case 0xFF41:
					this.memoryHighReader[0x41] = this.memoryReader[0xFF41] = function (parentObj: GameBoyCore, _address) {
						return 0x80 | parentObj.memory[0xFF41] | parentObj.modeSTAT;
					}
					break;
				case 0xFF42:
					this.memoryHighReader[0x42] = this.memoryReader[0xFF42] = function (parentObj: GameBoyCore, _address) {
						return parentObj.backgroundY;
					}
					break;
				case 0xFF43:
					this.memoryHighReader[0x43] = this.memoryReader[0xFF43] = function (parentObj: GameBoyCore, _address) {
						return parentObj.backgroundX;
					}
					break;
				case 0xFF44:
					this.memoryHighReader[0x44] = this.memoryReader[0xFF44] = function (parentObj: GameBoyCore, _address) {
						return ((parentObj.LCDisOn) ? parentObj.memory[0xFF44] : 0);
					}
					break;
				case 0xFF45:
				case 0xFF46:
				case 0xFF47:
				case 0xFF48:
				case 0xFF49:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF4A:
					//WY
					this.memoryHighReader[0x4A] = this.memoryReader[0xFF4A] = function (parentObj: GameBoyCore, _address) {
						return parentObj.windowY;
					}
					break;
				case 0xFF4B:
					this.memoryHighReader[0x4B] = this.memoryHighReadNormal;
					this.memoryReader[0xFF4B] = this.memoryReadNormal;
					break;
				case 0xFF4C:
					this.memoryHighReader[0x4C] = this.memoryReader[0xFF4C] = this.memoryReadBAD;
					break;
				case 0xFF4D:
					this.memoryHighReader[0x4D] = this.memoryHighReadNormal;
					this.memoryReader[0xFF4D] = this.memoryReadNormal;
					break;
				case 0xFF4E:
					this.memoryHighReader[0x4E] = this.memoryReader[0xFF4E] = this.memoryReadBAD;
					break;
				case 0xFF4F:
					this.memoryHighReader[0x4F] = this.memoryReader[0xFF4F] = function (parentObj: GameBoyCore, _address) {
						return parentObj.currVRAMBank;
					}
					break;
				case 0xFF50:
				case 0xFF51:
				case 0xFF52:
				case 0xFF53:
				case 0xFF54:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF55:
					if (this.cGBC) {
						this.memoryHighReader[0x55] = this.memoryReader[0xFF55] = function (parentObj: GameBoyCore, _address) {
							if (!parentObj.LCDisOn && parentObj.hdmaRunning) {	//Undocumented behavior alert: HDMA becomes GDMA when LCD is off (Worms Armageddon Fix).
								//DMA
								parentObj.DMAWrite((parentObj.memory[0xFF55] & 0x7F) + 1);
								parentObj.memory[0xFF55] = 0xFF;	//Transfer completed.
								parentObj.hdmaRunning = false;
							}
							return parentObj.memory[0xFF55];
						}
					}
					else {
						this.memoryReader[0xFF55] = this.memoryReadNormal;
						this.memoryHighReader[0x55] = this.memoryHighReadNormal;
					}
					break;
				case 0xFF56:
					if (this.cGBC) {
						this.memoryHighReader[0x56] = this.memoryReader[0xFF56] = function (parentObj: GameBoyCore, _address) {
							//Return IR "not connected" status:
							return 0x3C | ((parentObj.memory[0xFF56] >= 0xC0) ? (0x2 | (parentObj.memory[0xFF56] & 0xC1)) : (parentObj.memory[0xFF56] & 0xC3));
						}
					}
					else {
						this.memoryReader[0xFF56] = this.memoryReadNormal;
						this.memoryHighReader[0x56] = this.memoryHighReadNormal;
					}
					break;
				case 0xFF57:
				case 0xFF58:
				case 0xFF59:
				case 0xFF5A:
				case 0xFF5B:
				case 0xFF5C:
				case 0xFF5D:
				case 0xFF5E:
				case 0xFF5F:
				case 0xFF60:
				case 0xFF61:
				case 0xFF62:
				case 0xFF63:
				case 0xFF64:
				case 0xFF65:
				case 0xFF66:
				case 0xFF67:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF68:
				case 0xFF69:
				case 0xFF6A:
				case 0xFF6B:
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
					this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF6C:
					if (this.cGBC) {
						this.memoryHighReader[0x6C] = this.memoryReader[0xFF6C] = function (parentObj: GameBoyCore, _address) {
							return 0xFE | parentObj.memory[0xFF6C];
						}
					}
					else {
						this.memoryHighReader[0x6C] = this.memoryReader[0xFF6C] = this.memoryReadBAD;
					}
					break;
				case 0xFF6D:
				case 0xFF6E:
				case 0xFF6F:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFF70:
					if (this.cGBC) {
						//SVBK
						this.memoryHighReader[0x70] = this.memoryReader[0xFF70] = function (parentObj: GameBoyCore, _address) {
							return 0x40 | parentObj.memory[0xFF70];
						}
					}
					else {
						this.memoryHighReader[0x70] = this.memoryReader[0xFF70] = this.memoryReadBAD;
					}
					break;
				case 0xFF71:
					this.memoryHighReader[0x71] = this.memoryReader[0xFF71] = this.memoryReadBAD;
					break;
				case 0xFF72:
				case 0xFF73:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadNormal;
					break;
				case 0xFF74:
					if (this.cGBC) {
						this.memoryHighReader[0x74] = this.memoryReader[0xFF74] = this.memoryReadNormal;
					}
					else {
						this.memoryHighReader[0x74] = this.memoryReader[0xFF74] = this.memoryReadBAD;
					}
					break;
				case 0xFF75:
					this.memoryHighReader[0x75] = this.memoryReader[0xFF75] = function (parentObj: GameBoyCore, _address) {
						return 0x8F | parentObj.memory[0xFF75];
					}
					break;
                case 0xFF76:
                    //Undocumented realtime PCM amplitude readback:
                    this.memoryHighReader[0x76] = this.memoryReader[0xFF76] = function (parentObj: GameBoyCore, _address) {
                        parentObj.audioJIT();
                        return (parentObj.channel2envelopeVolume << 4) | parentObj.channel1envelopeVolume;
                    }
                    break;
                case 0xFF77:
                    //Undocumented realtime PCM amplitude readback:
                    this.memoryHighReader[0x77] = this.memoryReader[0xFF77] = function (parentObj: GameBoyCore, _address) {
                        parentObj.audioJIT();
                        return (parentObj.channel4envelopeVolume << 4) | parentObj.channel3envelopeVolume;
                    }
                    break;
				case 0xFF78:
				case 0xFF79:
				case 0xFF7A:
				case 0xFF7B:
				case 0xFF7C:
				case 0xFF7D:
				case 0xFF7E:
				case 0xFF7F:
					this.memoryHighReader[index & 0xFF] = this.memoryReader[index] = this.memoryReadBAD;
					break;
				case 0xFFFF:
					//IE
					this.memoryHighReader[0xFF] = this.memoryReader[0xFFFF] = function (parentObj: GameBoyCore, _address) {
						return parentObj.interruptsEnabled;
					}
					break;
				default:
					this.memoryReader[index] = this.memoryReadNormal;
					this.memoryHighReader[index & 0xFF] = this.memoryHighReadNormal;
			}
		}
		else {
			this.memoryReader[index] = this.memoryReadBAD;
		}
	}
}

private memoryReadNormal(parentObj: GameBoyCore, address) {
	return parentObj.memory[address];
}

private memoryHighReadNormal(parentObj: GameBoyCore, address) {
	return parentObj.memory[0xFF00 | address];
}

private memoryReadROM(parentObj: GameBoyCore, address) {
	return parentObj.ROM[parentObj.currentROMBank + address];
}

private memoryReadMBC(parentObj: GameBoyCore, address) {
	//Switchable RAM
	if (parentObj.MBCRAMBanksEnabled || settings.mbc_enable_override) {
		return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
	}
	//cout("Reading from disabled RAM.", 1);
	return 0xFF;
}

private memoryReadMBC7(parentObj: GameBoyCore, address) {
	//Switchable RAM
	if (parentObj.MBCRAMBanksEnabled || settings.mbc_enable_override) {
		switch (address) {
			case 0xA000:
			case 0xA060:
			case 0xA070:
				return 0;
			case 0xA080:
				//TODO: Gyro Control Register
				return 0;
			case 0xA050:
				//Y High Byte
				return parentObj.highY;
			case 0xA040:
				//Y Low Byte
				return parentObj.lowY;
			case 0xA030:
				//X High Byte
				return parentObj.highX;
			case 0xA020:
				//X Low Byte:
				return parentObj.lowX;
			default:
				return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
		}
	}
	//cout("Reading from disabled RAM.", 1);
	return 0xFF;
}

private memoryReadMBC3(parentObj: GameBoyCore, address) {
	//Switchable RAM
	if (parentObj.MBCRAMBanksEnabled || settings.mbc_enable_override) {
		switch (parentObj.currMBCRAMBank) {
			case 0x00:
			case 0x01:
			case 0x02:
			case 0x03:
				return parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition];
				break;
			case 0x08:
				return parentObj.latchedSeconds;
				break;
			case 0x09:
				return parentObj.latchedMinutes;
				break;
			case 0x0A:
				return parentObj.latchedHours;
				break;
			case 0x0B:
				return parentObj.latchedLDays;
				break;
			case 0x0C:
				return (((parentObj.RTCDayOverFlow) ? 0x80 : 0) + ((parentObj.RTCHALT) ? 0x40 : 0)) + parentObj.latchedHDays;
		}
	}
	//cout("Reading from invalid or disabled RAM.", 1);
	return 0xFF;
}

private memoryReadGBCMemory(parentObj: GameBoyCore, address) {
	return parentObj.GBCMemory[address + parentObj.gbcRamBankPosition];
}

private memoryReadOAM(parentObj: GameBoyCore, address) {
	return (parentObj.modeSTAT > 1) ?  0xFF : parentObj.memory[address];
}

private memoryReadECHOGBCMemory(parentObj: GameBoyCore, address) {
	return parentObj.GBCMemory[address + parentObj.gbcRamBankPositionECHO];
}

private memoryReadECHONormal(parentObj: GameBoyCore, address) {
	return parentObj.memory[address - 0x2000];
}

private memoryReadBAD(_parentObj: GameBoyCore, _address) {
	return 0xFF;
}

private VRAMDATAReadCGBCPU(parentObj: GameBoyCore, address) {
	//CPU Side Reading The VRAM (Optimized for GameBoy Color)
	return (parentObj.modeSTAT > 2) ? 0xFF : ((parentObj.currVRAMBank == 0) ? parentObj.memory[address] : parentObj.VRAM[address & 0x1FFF]);
}

private VRAMDATAReadDMGCPU(parentObj: GameBoyCore, address) {
	//CPU Side Reading The VRAM (Optimized for classic GameBoy)
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.memory[address];
}

private VRAMCHRReadCGBCPU(parentObj: GameBoyCore, address) {
	//CPU Side Reading the Character Data Map:
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.BGCHRCurrentBank[address & 0x7FF];
}

private VRAMCHRReadDMGCPU(parentObj: GameBoyCore, address) {
	//CPU Side Reading the Character Data Map:
	return (parentObj.modeSTAT > 2) ? 0xFF : parentObj.BGCHRBank1[address & 0x7FF];
}

private setCurrentMBC1ROMBank() {
	//Read the cartridge ROM data from RAM memory:
	switch (this.ROMBank1offs) {
		case 0x00:
		case 0x20:
		case 0x40:
		case 0x60:
			//Bank calls for 0x00, 0x20, 0x40, and 0x60 are really for 0x01, 0x21, 0x41, and 0x61.
			this.currentROMBank = (this.ROMBank1offs % this.ROMBankEdge) << 14;
			break;
		default:
			this.currentROMBank = ((this.ROMBank1offs % this.ROMBankEdge) - 1) << 14;
	}
}

private setCurrentMBC2AND3ROMBank() {
	//Read the cartridge ROM data from RAM memory:
	//Only map bank 0 to bank 1 here (MBC2 is like MBC1, but can only do 16 banks, so only the bank 0 quirk appears for MBC2):
	this.currentROMBank = Math.max((this.ROMBank1offs % this.ROMBankEdge) - 1, 0) << 14;
}

private setCurrentMBC5ROMBank() {
	//Read the cartridge ROM data from RAM memory:
	this.currentROMBank = ((this.ROMBank1offs % this.ROMBankEdge) - 1) << 14;
}

//Memory Writing:
public memoryWrite(address, data) {
	//Act as a wrapper for writing by compiled jumps to specific memory writing functions.
	this.memoryWriter[address](this, address, data);
}

//0xFFXX fast path:
public memoryHighWrite(address, data) {
	//Act as a wrapper for writing by compiled jumps to specific memory writing functions.
	this.memoryHighWriter[address](this, address, data);
}

private memoryWriteJumpCompile() {
	//Faster in some browsers, since we are doing less conditionals overall by implementing them in advance.
	for (var index = 0x0000; index <= 0xFFFF; index++) {
		if (index < 0x8000) {
			if (this.cMBC1) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC1WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.MBC1WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.MBC1WriteType;
				}
			}
			else if (this.cMBC2) {
				if (index < 0x1000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index >= 0x2100 && index < 0x2200) {
					this.memoryWriter[index] = this.MBC2WriteROMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else if (this.cMBC3) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC3WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.MBC3WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.MBC3WriteRTCLatch;
				}
			}
			else if (this.cMBC5 || this.cRUMBLE || this.cMBC7) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x3000) {
					this.memoryWriter[index] = this.MBC5WriteROMBankLow;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC5WriteROMBankHigh;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = (this.cRUMBLE) ? this.RUMBLEWriteRAMBank : this.MBC5WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else if (this.cHuC3) {
				if (index < 0x2000) {
					this.memoryWriter[index] = this.MBCWriteEnable;
				}
				else if (index < 0x4000) {
					this.memoryWriter[index] = this.MBC3WriteROMBank;
				}
				else if (index < 0x6000) {
					this.memoryWriter[index] = this.HuC3WriteRAMBank;
				}
				else {
					this.memoryWriter[index] = this.cartIgnoreWrite;
				}
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else if (index < 0x9000) {
			this.memoryWriter[index] = (this.cGBC) ? this.VRAMGBCDATAWrite : this.VRAMGBDATAWrite;
		}
		else if (index < 0x9800) {
			this.memoryWriter[index] = (this.cGBC) ? this.VRAMGBCDATAWrite : this.VRAMGBDATAUpperWrite;
		}
		else if (index < 0xA000) {
			this.memoryWriter[index] = (this.cGBC) ? this.VRAMGBCCHRMAPWrite : this.VRAMGBCHRMAPWrite;
		}
		else if (index < 0xC000) {
			if ((this.numRAMBanks == 1 / 16 && index < 0xA200) || this.numRAMBanks >= 1) {
				if (!this.cMBC3) {
					this.memoryWriter[index] = this.memoryWriteMBCRAM;
				}
				else {
					//MBC3 RTC + RAM:
					this.memoryWriter[index] = this.memoryWriteMBC3RAM;
				}
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else if (index < 0xE000) {
			if (this.cGBC && index >= 0xD000) {
				this.memoryWriter[index] = this.memoryWriteGBCRAM;
			}
			else {
				this.memoryWriter[index] = this.memoryWriteNormal;
			}
		}
		else if (index < 0xFE00) {
			if (this.cGBC && index >= 0xF000) {
				this.memoryWriter[index] = this.memoryWriteECHOGBCRAM;
			}
			else {
				this.memoryWriter[index] = this.memoryWriteECHONormal;
			}
		}
		else if (index <= 0xFEA0) {
			this.memoryWriter[index] = this.memoryWriteOAMRAM;
		}
		else if (index < 0xFF00) {
			if (this.cGBC) {											//Only GBC has access to this RAM.
				this.memoryWriter[index] = this.memoryWriteNormal;
			}
			else {
				this.memoryWriter[index] = this.cartIgnoreWrite;
			}
		}
		else {
			//Start the I/O initialization by filling in the slots as normal memory:
			this.memoryWriter[index] = this.memoryWriteNormal;
			this.memoryHighWriter[index & 0xFF] = this.memoryHighWriteNormal;
		}
	}
	this.registerWriteJumpCompile();				//Compile the I/O write functions separately...
}

private MBCWriteEnable(parentObj: GameBoyCore, _address, data) {
	//MBC RAM Bank Enable/Disable:
	parentObj.MBCRAMBanksEnabled = ((data & 0x0F) == 0x0A);	//If lower nibble is 0x0A, then enable, otherwise disable.
}

private MBC1WriteROMBank(parentObj: GameBoyCore, _address, data) {
	//MBC1 ROM bank switching:
	parentObj.ROMBank1offs = (parentObj.ROMBank1offs & 0x60) | (data & 0x1F);
	parentObj.setCurrentMBC1ROMBank();
}

private MBC1WriteRAMBank(parentObj: GameBoyCore, _address, data) {
	//MBC1 RAM bank switching
	if (parentObj.MBC1Mode) {
		//4/32 Mode
		parentObj.currMBCRAMBank = data & 0x03;
		parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
	}
	else {
		//16/8 Mode
		parentObj.ROMBank1offs = ((data & 0x03) << 5) | (parentObj.ROMBank1offs & 0x1F);
		parentObj.setCurrentMBC1ROMBank();
	}
}

private MBC1WriteType(parentObj: GameBoyCore, _address, data) {
	//MBC1 mode setting:
	parentObj.MBC1Mode = ((data & 0x1) == 0x1);
	if (parentObj.MBC1Mode) {
		parentObj.ROMBank1offs &= 0x1F;
		parentObj.setCurrentMBC1ROMBank();
	}
	else {
		parentObj.currMBCRAMBank = 0;
		parentObj.currMBCRAMBankPosition = -0xA000;
	}
}

private MBC2WriteROMBank(parentObj: GameBoyCore, _address, data) {
	//MBC2 ROM bank switching:
	parentObj.ROMBank1offs = data & 0x0F;
	parentObj.setCurrentMBC2AND3ROMBank();
}

private MBC3WriteROMBank(parentObj: GameBoyCore, _address, data) {
	//MBC3 ROM bank switching:
	parentObj.ROMBank1offs = data & 0x7F;
	parentObj.setCurrentMBC2AND3ROMBank();
}

private MBC3WriteRAMBank(parentObj: GameBoyCore, _address, data) {
	parentObj.currMBCRAMBank = data;
	if (data < 4) {
		//MBC3 RAM bank switching
		parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
	}
}

private MBC3WriteRTCLatch(parentObj: GameBoyCore, _address, data) {
	if (data == 0) {
		parentObj.RTCisLatched = false;
	}
	else if (!parentObj.RTCisLatched) {
		//Copy over the current RTC time for reading.
		parentObj.RTCisLatched = true;
		parentObj.latchedSeconds = parentObj.RTCSeconds | 0;
		parentObj.latchedMinutes = parentObj.RTCMinutes;
		parentObj.latchedHours = parentObj.RTCHours;
		parentObj.latchedLDays = (parentObj.RTCDays & 0xFF);
		parentObj.latchedHDays = parentObj.RTCDays >> 8;
	}
}

private MBC5WriteROMBankLow(parentObj: GameBoyCore, _address, data) {
	//MBC5 ROM bank switching:
	parentObj.ROMBank1offs = (parentObj.ROMBank1offs & 0x100) | data;
	parentObj.setCurrentMBC5ROMBank();
}

private MBC5WriteROMBankHigh(parentObj: GameBoyCore, _address, data) {
	//MBC5 ROM bank switching (by least significant bit):
	parentObj.ROMBank1offs  = ((data & 0x01) << 8) | (parentObj.ROMBank1offs & 0xFF);
	parentObj.setCurrentMBC5ROMBank();
}

private MBC5WriteRAMBank(parentObj: GameBoyCore, _address, data) {
	//MBC5 RAM bank switching
	parentObj.currMBCRAMBank = data & 0xF;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}

private RUMBLEWriteRAMBank(parentObj: GameBoyCore, _address, data) {
	//MBC5 RAM bank switching
	//Like MBC5, but bit 3 of the lower nibble is used for rumbling and bit 2 is ignored.
	parentObj.currMBCRAMBank = data & 0x03;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}

private HuC3WriteRAMBank(parentObj: GameBoyCore, _address, data) {
	//HuC3 RAM bank switching
	parentObj.currMBCRAMBank = data & 0x03;
	parentObj.currMBCRAMBankPosition = (parentObj.currMBCRAMBank << 13) - 0xA000;
}

private cartIgnoreWrite(_parentObj: GameBoyCore, _address, _data) {
	//We might have encountered illegal RAM writing or such, so just do nothing...
}

private memoryWriteNormal(parentObj: GameBoyCore, address, data) {
	parentObj.memory[address] = data;
}

private memoryHighWriteNormal(parentObj: GameBoyCore, address, data) {
	parentObj.memory[0xFF00 | address] = data;
}

private memoryWriteMBCRAM(parentObj: GameBoyCore, address, data) {
	if (parentObj.MBCRAMBanksEnabled || settings.mbc_enable_override) {
		parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition] = data;
	}
}

private memoryWriteMBC3RAM(parentObj: GameBoyCore, address, data) {
	if (parentObj.MBCRAMBanksEnabled || settings.mbc_enable_override) {
		switch (parentObj.currMBCRAMBank) {
			case 0x00:
			case 0x01:
			case 0x02:
			case 0x03:
				parentObj.MBCRam[address + parentObj.currMBCRAMBankPosition] = data;
				break;
			case 0x08:
				if (data < 60) {
					parentObj.RTCSeconds = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x09:
				if (data < 60) {
					parentObj.RTCMinutes = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x0A:
				if (data < 24) {
					parentObj.RTCHours = data;
				}
				else {
					cout("(Bank #" + parentObj.currMBCRAMBank + ") RTC write out of range: " + data, 1);
				}
				break;
			case 0x0B:
				parentObj.RTCDays = (data & 0xFF) | (parentObj.RTCDays & 0x100);
				break;
			case 0x0C:
				parentObj.RTCDayOverFlow = (data > 0x7F);
				parentObj.RTCHALT = (data & 0x40) == 0x40;
				parentObj.RTCDays = ((data & 0x1) << 8) | (parentObj.RTCDays & 0xFF);
				break;
			default:
				cout("Invalid MBC3 bank address selected: " + parentObj.currMBCRAMBank, 0);
		}
	}
}

private memoryWriteGBCRAM(parentObj: GameBoyCore, address, data) {
	parentObj.GBCMemory[address + parentObj.gbcRamBankPosition] = data;
}

private memoryWriteOAMRAM(parentObj: GameBoyCore, address, data) {
	if (parentObj.modeSTAT < 2) {		//OAM RAM cannot be written to in mode 2 & 3
		if (parentObj.memory[address] != data) {
			parentObj.graphicsJIT();
			parentObj.memory[address] = data;
		}
	}
}

private memoryWriteECHOGBCRAM(parentObj: GameBoyCore, address, data) {
	parentObj.GBCMemory[address + parentObj.gbcRamBankPositionECHO] = data;
}

private memoryWriteECHONormal(parentObj: GameBoyCore, address, data) {
	parentObj.memory[address - 0x2000] = data;
}

private VRAMGBDATAWrite(parentObj: GameBoyCore, address, data) {
	if (parentObj.modeSTAT < 3) {	//VRAM cannot be written to during mode 3
		if (parentObj.memory[address] != data) {
			//JIT the graphics render queue:
			parentObj.graphicsJIT();
			parentObj.memory[address] = data;
			parentObj.generateGBOAMTileLine(address);
		}
	}
}

private VRAMGBDATAUpperWrite(parentObj: GameBoyCore, address, data) {
	if (parentObj.modeSTAT < 3) {	//VRAM cannot be written to during mode 3
		if (parentObj.memory[address] != data) {
			//JIT the graphics render queue:
			parentObj.graphicsJIT();
			parentObj.memory[address] = data;
			parentObj.generateGBTileLine(address);
		}
	}
}

private VRAMGBCDATAWrite(parentObj: GameBoyCore, address, data) {
	if (parentObj.modeSTAT < 3) {	//VRAM cannot be written to during mode 3
		if (parentObj.currVRAMBank == 0) {
			if (parentObj.memory[address] != data) {
				//JIT the graphics render queue:
				parentObj.graphicsJIT();
				parentObj.memory[address] = data;
				parentObj.generateGBCTileLineBank1(address);
			}
		}
		else {
			address &= 0x1FFF;
			if (parentObj.VRAM[address] != data) {
				//JIT the graphics render queue:
				parentObj.graphicsJIT();
				parentObj.VRAM[address] = data;
				parentObj.generateGBCTileLineBank2(address);
			}
		}
	}
}

private VRAMGBCHRMAPWrite(parentObj: GameBoyCore, address, data) {
	if (parentObj.modeSTAT < 3) {	//VRAM cannot be written to during mode 3
		address &= 0x7FF;
		if (parentObj.BGCHRBank1[address] != data) {
			//JIT the graphics render queue:
			parentObj.graphicsJIT();
			parentObj.BGCHRBank1[address] = data;
		}
	}
}

private VRAMGBCCHRMAPWrite(parentObj: GameBoyCore, address, data) {
	if (parentObj.modeSTAT < 3) {	//VRAM cannot be written to during mode 3
		address &= 0x7FF;
		if (parentObj.BGCHRCurrentBank[address] != data) {
			//JIT the graphics render queue:
			parentObj.graphicsJIT();
			parentObj.BGCHRCurrentBank[address] = data;
		}
	}
}

private DMAWrite(tilesToTransfer) {
	if (!this.halt) {
		//Clock the CPU for the DMA transfer (CPU is halted during the transfer):
		this.CPUTicks += 4 | ((tilesToTransfer << 5) << this.doubleSpeedShifter);
	}
	//Source address of the transfer:
	var source = (this.memory[0xFF51] << 8) | this.memory[0xFF52];
	//Destination address in the VRAM memory range:
	var destination = (this.memory[0xFF53] << 8) | this.memory[0xFF54];
	//Creating some references:
	var memoryReader = this.memoryReader;
	//JIT the graphics render queue:
	this.graphicsJIT();
	var memory = this.memory;
	//Determining which bank we're working on so we can optimize:
	if (this.currVRAMBank == 0) {
		//DMA transfer for VRAM bank 0:
		do {
			if (destination < 0x1800) {
				memory[0x8000 | destination] = memoryReader[source](this, source++);
				memory[0x8001 | destination] = memoryReader[source](this, source++);
				memory[0x8002 | destination] = memoryReader[source](this, source++);
				memory[0x8003 | destination] = memoryReader[source](this, source++);
				memory[0x8004 | destination] = memoryReader[source](this, source++);
				memory[0x8005 | destination] = memoryReader[source](this, source++);
				memory[0x8006 | destination] = memoryReader[source](this, source++);
				memory[0x8007 | destination] = memoryReader[source](this, source++);
				memory[0x8008 | destination] = memoryReader[source](this, source++);
				memory[0x8009 | destination] = memoryReader[source](this, source++);
				memory[0x800A | destination] = memoryReader[source](this, source++);
				memory[0x800B | destination] = memoryReader[source](this, source++);
				memory[0x800C | destination] = memoryReader[source](this, source++);
				memory[0x800D | destination] = memoryReader[source](this, source++);
				memory[0x800E | destination] = memoryReader[source](this, source++);
				memory[0x800F | destination] = memoryReader[source](this, source++);
				this.generateGBCTileBank1(destination);
				destination += 0x10;
			}
			else {
				destination &= 0x7F0;
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank1[destination++] = memoryReader[source](this, source++);
				destination = (destination + 0x1800) & 0x1FF0;
			}
			source &= 0xFFF0;
			--tilesToTransfer;
		} while (tilesToTransfer > 0);
	}
	else {
		var VRAM = this.VRAM;
		//DMA transfer for VRAM bank 1:
		do {
			if (destination < 0x1800) {
				VRAM[destination] = memoryReader[source](this, source++);
				VRAM[destination | 0x1] = memoryReader[source](this, source++);
				VRAM[destination | 0x2] = memoryReader[source](this, source++);
				VRAM[destination | 0x3] = memoryReader[source](this, source++);
				VRAM[destination | 0x4] = memoryReader[source](this, source++);
				VRAM[destination | 0x5] = memoryReader[source](this, source++);
				VRAM[destination | 0x6] = memoryReader[source](this, source++);
				VRAM[destination | 0x7] = memoryReader[source](this, source++);
				VRAM[destination | 0x8] = memoryReader[source](this, source++);
				VRAM[destination | 0x9] = memoryReader[source](this, source++);
				VRAM[destination | 0xA] = memoryReader[source](this, source++);
				VRAM[destination | 0xB] = memoryReader[source](this, source++);
				VRAM[destination | 0xC] = memoryReader[source](this, source++);
				VRAM[destination | 0xD] = memoryReader[source](this, source++);
				VRAM[destination | 0xE] = memoryReader[source](this, source++);
				VRAM[destination | 0xF] = memoryReader[source](this, source++);
				this.generateGBCTileBank2(destination);
				destination += 0x10;
			}
			else {
				destination &= 0x7F0;
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				this.BGCHRBank2[destination++] = memoryReader[source](this, source++);
				destination = (destination + 0x1800) & 0x1FF0;
			}
			source &= 0xFFF0;
			--tilesToTransfer;
		} while (tilesToTransfer > 0);
	}
	//Update the HDMA registers to their next addresses:
	memory[0xFF51] = source >> 8;
	memory[0xFF52] = source & 0xF0;
	memory[0xFF53] = destination >> 8;
	memory[0xFF54] = destination & 0xF0;
}

private registerWriteJumpCompile() {
	//I/O Registers (GB + GBC):
	//JoyPad
	this.memoryHighWriter[0] = this.memoryWriter[0xFF00] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF00] = (data & 0x30) | ((((data & 0x20) == 0) ? (parentObj.JoyPad >> 4) : 0xF) & (((data & 0x10) == 0) ? (parentObj.JoyPad & 0xF) : 0xF));
	}
	//SB (Serial Transfer Data)
	this.memoryHighWriter[0x1] = this.memoryWriter[0xFF01] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.memory[0xFF02] < 0x80) {	//Cannot write while a serial transfer is active.
			parentObj.memory[0xFF01] = data;
		}
	}
	//SC (Serial Transfer Control):
	this.memoryHighWriter[0x2] = this.memoryHighWriteNormal;
	this.memoryWriter[0xFF02] = this.memoryWriteNormal;
	//Unmapped I/O:
	this.memoryHighWriter[0x3] = this.memoryWriter[0xFF03] = this.cartIgnoreWrite;
	//DIV
	this.memoryHighWriter[0x4] = this.memoryWriter[0xFF04] = function (parentObj: GameBoyCore, _address, _data) {
		parentObj.DIVTicks &= 0xFF;	//Update DIV for realignment.
		parentObj.memory[0xFF04] = 0;
	}
	//TIMA
	this.memoryHighWriter[0x5] = this.memoryWriter[0xFF05] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF05] = data;
	}
	//TMA
	this.memoryHighWriter[0x6] = this.memoryWriter[0xFF06] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF06] = data;
	}
	//TAC
	this.memoryHighWriter[0x7] = this.memoryWriter[0xFF07] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF07] = data & 0x07;
		parentObj.TIMAEnabled = (data & 0x04) == 0x04;
		parentObj.TACClocker = Math.pow(4, ((data & 0x3) != 0) ? (data & 0x3) : 4) << 2;	//TODO: Find a way to not make a conditional in here...
	}
	//Unmapped I/O:
	this.memoryHighWriter[0x8] = this.memoryWriter[0xFF08] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x9] = this.memoryWriter[0xFF09] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xA] = this.memoryWriter[0xFF0A] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xB] = this.memoryWriter[0xFF0B] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xC] = this.memoryWriter[0xFF0C] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xD] = this.memoryWriter[0xFF0D] = this.cartIgnoreWrite;
	this.memoryHighWriter[0xE] = this.memoryWriter[0xFF0E] = this.cartIgnoreWrite;
	//IF (Interrupt Request)
	this.memoryHighWriter[0xF] = this.memoryWriter[0xFF0F] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.interruptsRequested = data;
		parentObj.checkIRQMatching();
	}
	//NR10:
	this.memoryHighWriter[0x10] = this.memoryWriter[0xFF10] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel1decreaseSweep && (data & 0x08) == 0) {
				if (parentObj.channel1Swept) {
					parentObj.channel1SweepFault = true;
				}
			}
			parentObj.channel1lastTimeSweep = (data & 0x70) >> 4;
			parentObj.channel1frequencySweepDivider = data & 0x07;
			parentObj.channel1decreaseSweep = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF10] = data;
			parentObj.channel1EnableCheck();
		}
	}
	//NR11:
	this.memoryHighWriter[0x11] = this.memoryWriter[0xFF11] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			else {
				data &= 0x3F;
			}
			parentObj.channel1CachedDuty = parentObj.dutyLookup[data >> 6];
			parentObj.channel1totalLength = 0x40 - (data & 0x3F);
			parentObj.memory[0xFF11] = data;
			parentObj.channel1EnableCheck();
		}
	}
	//NR12:
	this.memoryHighWriter[0x12] = this.memoryWriter[0xFF12] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel1Enabled && parentObj.channel1envelopeSweeps == 0) {
				//Zombie Volume PAPU Bug:
				if (((parentObj.memory[0xFF12] ^ data) & 0x8) == 0x8) {
					if ((parentObj.memory[0xFF12] & 0x8) == 0) {
						if ((parentObj.memory[0xFF12] & 0x7) == 0x7) {
							parentObj.channel1envelopeVolume += 2;
						}
						else {
							++parentObj.channel1envelopeVolume;
						}
					}
					parentObj.channel1envelopeVolume = (16 - parentObj.channel1envelopeVolume) & 0xF;
				}
				else if ((parentObj.memory[0xFF12] & 0xF) == 0x8) {
					parentObj.channel1envelopeVolume = (1 + parentObj.channel1envelopeVolume) & 0xF;
				}
				parentObj.channel1OutputLevelCache();
			}
			parentObj.channel1envelopeType = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF12] = data;
			parentObj.channel1VolumeEnableCheck();
		}
	}
	//NR13:
	this.memoryHighWriter[0x13] = this.memoryWriter[0xFF13] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel1frequency = (parentObj.channel1frequency & 0x700) | data;
			parentObj.channel1FrequencyTracker = (0x800 - parentObj.channel1frequency) << 2;
		}
	}
	//NR14:
	this.memoryHighWriter[0x14] = this.memoryWriter[0xFF14] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel1consecutive = ((data & 0x40) == 0x0);
			parentObj.channel1frequency = ((data & 0x7) << 8) | (parentObj.channel1frequency & 0xFF);
			parentObj.channel1FrequencyTracker = (0x800 - parentObj.channel1frequency) << 2;
			if (data > 0x7F) {
				//Reload 0xFF10:
				parentObj.channel1timeSweep = parentObj.channel1lastTimeSweep;
				parentObj.channel1Swept = false;
				//Reload 0xFF12:
				var nr12 = parentObj.memory[0xFF12];
				parentObj.channel1envelopeVolume = nr12 >> 4;
				parentObj.channel1OutputLevelCache();
				parentObj.channel1envelopeSweepsLast = (nr12 & 0x7) - 1;
				if (parentObj.channel1totalLength == 0) {
					parentObj.channel1totalLength = 0x40;
				}
				if (parentObj.channel1lastTimeSweep > 0 || parentObj.channel1frequencySweepDivider > 0) {
					parentObj.memory[0xFF26] |= 0x1;
				}
				else {
					parentObj.memory[0xFF26] &= 0xFE;
				}
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x1;
				}
				parentObj.channel1ShadowFrequency = parentObj.channel1frequency;
				//Reset frequency overflow check + frequency sweep type check:
				parentObj.channel1SweepFault = false;
				//Supposed to run immediately:
				parentObj.channel1AudioSweepPerformDummy();
			}
			parentObj.channel1EnableCheck();
			parentObj.memory[0xFF14] = data;
		}
	}
	//NR20 (Unused I/O):
	this.memoryHighWriter[0x15] = this.memoryWriter[0xFF15] = this.cartIgnoreWrite;
	//NR21:
	this.memoryHighWriter[0x16] = this.memoryWriter[0xFF16] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			else {
				data &= 0x3F;
			}
			parentObj.channel2CachedDuty = parentObj.dutyLookup[data >> 6];
			parentObj.channel2totalLength = 0x40 - (data & 0x3F);
			parentObj.memory[0xFF16] = data;
			parentObj.channel2EnableCheck();
		}
	}
	//NR22:
	this.memoryHighWriter[0x17] = this.memoryWriter[0xFF17] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel2Enabled && parentObj.channel2envelopeSweeps == 0) {
				//Zombie Volume PAPU Bug:
				if (((parentObj.memory[0xFF17] ^ data) & 0x8) == 0x8) {
					if ((parentObj.memory[0xFF17] & 0x8) == 0) {
						if ((parentObj.memory[0xFF17] & 0x7) == 0x7) {
							parentObj.channel2envelopeVolume += 2;
						}
						else {
							++parentObj.channel2envelopeVolume;
						}
					}
					parentObj.channel2envelopeVolume = (16 - parentObj.channel2envelopeVolume) & 0xF;
				}
				else if ((parentObj.memory[0xFF17] & 0xF) == 0x8) {
					parentObj.channel2envelopeVolume = (1 + parentObj.channel2envelopeVolume) & 0xF;
				}
				parentObj.channel2OutputLevelCache();
			}
			parentObj.channel2envelopeType = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF17] = data;
			parentObj.channel2VolumeEnableCheck();
		}
	}
	//NR23:
	this.memoryHighWriter[0x18] = this.memoryWriter[0xFF18] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel2frequency = (parentObj.channel2frequency & 0x700) | data;
			parentObj.channel2FrequencyTracker = (0x800 - parentObj.channel2frequency) << 2;
		}
	}
	//NR24:
	this.memoryHighWriter[0x19] = this.memoryWriter[0xFF19] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (data > 0x7F) {
				//Reload 0xFF17:
				var nr22 = parentObj.memory[0xFF17];
				parentObj.channel2envelopeVolume = nr22 >> 4;
				parentObj.channel2OutputLevelCache();
				parentObj.channel2envelopeSweepsLast = (nr22 & 0x7) - 1;
				if (parentObj.channel2totalLength == 0) {
					parentObj.channel2totalLength = 0x40;
				}
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x2;
				}
			}
			parentObj.channel2consecutive = ((data & 0x40) == 0x0);
			parentObj.channel2frequency = ((data & 0x7) << 8) | (parentObj.channel2frequency & 0xFF);
			parentObj.channel2FrequencyTracker = (0x800 - parentObj.channel2frequency) << 2;
			parentObj.memory[0xFF19] = data;
			parentObj.channel2EnableCheck();
		}
	}
	//NR30:
	this.memoryHighWriter[0x1A] = this.memoryWriter[0xFF1A] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (!parentObj.channel3canPlay && data >= 0x80) {
				parentObj.channel3lastSampleLookup = 0;
				parentObj.channel3UpdateCache();
			}
			parentObj.channel3canPlay = (data > 0x7F);
			if (parentObj.channel3canPlay && parentObj.memory[0xFF1A] > 0x7F && !parentObj.channel3consecutive) {
				parentObj.memory[0xFF26] |= 0x4;
			}
			parentObj.memory[0xFF1A] = data;
			//parentObj.channel3EnableCheck();
		}
	}
	//NR31:
	this.memoryHighWriter[0x1B] = this.memoryWriter[0xFF1B] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			parentObj.channel3totalLength = 0x100 - data;
			parentObj.channel3EnableCheck();
		}
	}
	//NR32:
	this.memoryHighWriter[0x1C] = this.memoryWriter[0xFF1C] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			data &= 0x60;
			parentObj.memory[0xFF1C] = data;
			parentObj.channel3patternType = (data == 0) ? 4 : ((data >> 5) - 1);
		}
	}
	//NR33:
	this.memoryHighWriter[0x1D] = this.memoryWriter[0xFF1D] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel3frequency = (parentObj.channel3frequency & 0x700) | data;
			parentObj.channel3FrequencyPeriod = (0x800 - parentObj.channel3frequency) << 1;
		}
	}
	//NR34:
	this.memoryHighWriter[0x1E] = this.memoryWriter[0xFF1E] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (data > 0x7F) {
				if (parentObj.channel3totalLength == 0) {
					parentObj.channel3totalLength = 0x100;
				}
				parentObj.channel3lastSampleLookup = 0;
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x4;
				}
			}
			parentObj.channel3consecutive = ((data & 0x40) == 0x0);
			parentObj.channel3frequency = ((data & 0x7) << 8) | (parentObj.channel3frequency & 0xFF);
			parentObj.channel3FrequencyPeriod = (0x800 - parentObj.channel3frequency) << 1;
			parentObj.memory[0xFF1E] = data;
			parentObj.channel3EnableCheck();
		}
	}
	//NR40 (Unused I/O):
	this.memoryHighWriter[0x1F] = this.memoryWriter[0xFF1F] = this.cartIgnoreWrite;
	//NR41:
	this.memoryHighWriter[0x20] = this.memoryWriter[0xFF20] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled || !parentObj.cGBC) {
			if (parentObj.soundMasterEnabled) {
				parentObj.audioJIT();
			}
			parentObj.channel4totalLength = 0x40 - (data & 0x3F);
			parentObj.channel4EnableCheck();
		}
	}
	//NR42:
	this.memoryHighWriter[0x21] = this.memoryWriter[0xFF21] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			if (parentObj.channel4Enabled && parentObj.channel4envelopeSweeps == 0) {
				//Zombie Volume PAPU Bug:
				if (((parentObj.memory[0xFF21] ^ data) & 0x8) == 0x8) {
					if ((parentObj.memory[0xFF21] & 0x8) == 0) {
						if ((parentObj.memory[0xFF21] & 0x7) == 0x7) {
							parentObj.channel4envelopeVolume += 2;
						}
						else {
							++parentObj.channel4envelopeVolume;
						}
					}
					parentObj.channel4envelopeVolume = (16 - parentObj.channel4envelopeVolume) & 0xF;
				}
				else if ((parentObj.memory[0xFF21] & 0xF) == 0x8) {
					parentObj.channel4envelopeVolume = (1 + parentObj.channel4envelopeVolume) & 0xF;
				}
				parentObj.channel4currentVolume = parentObj.channel4envelopeVolume << parentObj.channel4VolumeShifter;
			}
			parentObj.channel4envelopeType = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF21] = data;
			parentObj.channel4UpdateCache();
			parentObj.channel4VolumeEnableCheck();
		}
	}
	//NR43:
	this.memoryHighWriter[0x22] = this.memoryWriter[0xFF22] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.channel4FrequencyPeriod = Math.max((data & 0x7) << 4, 8) << (data >> 4);
			var bitWidth = (data & 0x8);
			if ((bitWidth == 0x8 && parentObj.channel4BitRange == 0x7FFF) || (bitWidth == 0 && parentObj.channel4BitRange == 0x7F)) {
				parentObj.channel4lastSampleLookup = 0;
				parentObj.channel4BitRange = (bitWidth == 0x8) ? 0x7F : 0x7FFF;
				parentObj.channel4VolumeShifter = (bitWidth == 0x8) ? 7 : 15;
				parentObj.channel4currentVolume = parentObj.channel4envelopeVolume << parentObj.channel4VolumeShifter;
				parentObj.noiseSampleTable = (bitWidth == 0x8) ? parentObj.LSFR7Table : parentObj.LSFR15Table;
			}
			parentObj.memory[0xFF22] = data;
			parentObj.channel4UpdateCache();
		}
	}
	//NR44:
	this.memoryHighWriter[0x23] = this.memoryWriter[0xFF23] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled) {
			parentObj.audioJIT();
			parentObj.memory[0xFF23] = data;
			parentObj.channel4consecutive = ((data & 0x40) == 0x0);
			if (data > 0x7F) {
				var nr42 = parentObj.memory[0xFF21];
				parentObj.channel4envelopeVolume = nr42 >> 4;
				parentObj.channel4currentVolume = parentObj.channel4envelopeVolume << parentObj.channel4VolumeShifter;
				parentObj.channel4envelopeSweepsLast = (nr42 & 0x7) - 1;
				if (parentObj.channel4totalLength == 0) {
					parentObj.channel4totalLength = 0x40;
				}
				if ((data & 0x40) == 0x40) {
					parentObj.memory[0xFF26] |= 0x8;
				}
			}
			parentObj.channel4EnableCheck();
		}
	}
	//NR50:
	this.memoryHighWriter[0x24] = this.memoryWriter[0xFF24] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled && parentObj.memory[0xFF24] != data) {
			parentObj.audioJIT();
			parentObj.memory[0xFF24] = data;
			parentObj.VinLeftChannelMasterVolume = ((data >> 4) & 0x07) + 1;
			parentObj.VinRightChannelMasterVolume = (data & 0x07) + 1;
			parentObj.mixerOutputLevelCache();
		}
	}
	//NR51:
	this.memoryHighWriter[0x25] = this.memoryWriter[0xFF25] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.soundMasterEnabled && parentObj.memory[0xFF25] != data) {
			parentObj.audioJIT();
			parentObj.memory[0xFF25] = data;
			parentObj.rightChannel1 = ((data & 0x01) == 0x01);
			parentObj.rightChannel2 = ((data & 0x02) == 0x02);
			parentObj.rightChannel3 = ((data & 0x04) == 0x04);
			parentObj.rightChannel4 = ((data & 0x08) == 0x08);
			parentObj.leftChannel1 = ((data & 0x10) == 0x10);
			parentObj.leftChannel2 = ((data & 0x20) == 0x20);
			parentObj.leftChannel3 = ((data & 0x40) == 0x40);
			parentObj.leftChannel4 = (data > 0x7F);
			parentObj.channel1OutputLevelCache();
			parentObj.channel2OutputLevelCache();
			parentObj.channel3OutputLevelCache();
			parentObj.channel4OutputLevelCache();
		}
	}
	//NR52:
	this.memoryHighWriter[0x26] = this.memoryWriter[0xFF26] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.audioJIT();
		if (!parentObj.soundMasterEnabled && data > 0x7F) {
			parentObj.memory[0xFF26] = 0x80;
			parentObj.soundMasterEnabled = true;
			parentObj.initializeAudioStartState();
		}
		else if (parentObj.soundMasterEnabled && data < 0x80) {
			parentObj.memory[0xFF26] = 0;
			parentObj.soundMasterEnabled = false;
			//GBDev wiki says the registers are written with zeros on power off:
			for (var index = 0xFF10; index < 0xFF26; index++) {
				parentObj.memoryWriter[index](parentObj, index, 0);
			}
		}
	}
	//0xFF27 to 0xFF2F don't do anything...
	this.memoryHighWriter[0x27] = this.memoryWriter[0xFF27] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x28] = this.memoryWriter[0xFF28] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x29] = this.memoryWriter[0xFF29] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2A] = this.memoryWriter[0xFF2A] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2B] = this.memoryWriter[0xFF2B] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2C] = this.memoryWriter[0xFF2C] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2D] = this.memoryWriter[0xFF2D] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2E] = this.memoryWriter[0xFF2E] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x2F] = this.memoryWriter[0xFF2F] = this.cartIgnoreWrite;
	//WAVE PCM RAM:
	this.memoryHighWriter[0x30] = this.memoryWriter[0xFF30] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0, data);
	}
	this.memoryHighWriter[0x31] = this.memoryWriter[0xFF31] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x1, data);
	}
	this.memoryHighWriter[0x32] = this.memoryWriter[0xFF32] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x2, data);
	}
	this.memoryHighWriter[0x33] = this.memoryWriter[0xFF33] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x3, data);
	}
	this.memoryHighWriter[0x34] = this.memoryWriter[0xFF34] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x4, data);
	}
	this.memoryHighWriter[0x35] = this.memoryWriter[0xFF35] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x5, data);
	}
	this.memoryHighWriter[0x36] = this.memoryWriter[0xFF36] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x6, data);
	}
	this.memoryHighWriter[0x37] = this.memoryWriter[0xFF37] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x7, data);
	}
	this.memoryHighWriter[0x38] = this.memoryWriter[0xFF38] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x8, data);
	}
	this.memoryHighWriter[0x39] = this.memoryWriter[0xFF39] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0x9, data);
	}
	this.memoryHighWriter[0x3A] = this.memoryWriter[0xFF3A] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0xA, data);
	}
	this.memoryHighWriter[0x3B] = this.memoryWriter[0xFF3B] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0xB, data);
	}
	this.memoryHighWriter[0x3C] = this.memoryWriter[0xFF3C] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0xC, data);
	}
	this.memoryHighWriter[0x3D] = this.memoryWriter[0xFF3D] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0xD, data);
	}
	this.memoryHighWriter[0x3E] = this.memoryWriter[0xFF3E] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0xE, data);
	}
	this.memoryHighWriter[0x3F] = this.memoryWriter[0xFF3F] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.channel3WriteRAM(0xF, data);
	}
	//SCY
	this.memoryHighWriter[0x42] = this.memoryWriter[0xFF42] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.backgroundY != data) {
			parentObj.midScanLineJIT();
			parentObj.backgroundY = data;
		}
	}
	//SCX
	this.memoryHighWriter[0x43] = this.memoryWriter[0xFF43] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.backgroundX != data) {
			parentObj.midScanLineJIT();
			parentObj.backgroundX = data;
		}
	}
	//LY
	this.memoryHighWriter[0x44] = this.memoryWriter[0xFF44] = function (parentObj: GameBoyCore, _address, _data) {
		//Read Only:
		if (parentObj.LCDisOn) {
			//Gambatte says to do this:
			parentObj.modeSTAT = 2;
			parentObj.midScanlineOffset = -1;
			parentObj.totalLinesPassed = parentObj.currentX = parentObj.queuedScanLines = parentObj.lastUnrenderedLine = parentObj.LCDTicks = parentObj.STATTracker = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
		}
	}
	//LYC
	this.memoryHighWriter[0x45] = this.memoryWriter[0xFF45] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.memory[0xFF45] != data) {
			parentObj.memory[0xFF45] = data;
			if (parentObj.LCDisOn) {
				parentObj.matchLYC();	//Get the compare of the first scan line.
			}
		}
	}
	//WY
	this.memoryHighWriter[0x4A] = this.memoryWriter[0xFF4A] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.windowY != data) {
			parentObj.midScanLineJIT();
			parentObj.windowY = data;
		}
	}
	//WX
	this.memoryHighWriter[0x4B] = this.memoryWriter[0xFF4B] = function (parentObj: GameBoyCore, _address, data) {
		if (parentObj.memory[0xFF4B] != data) {
			parentObj.midScanLineJIT();
			parentObj.memory[0xFF4B] = data;
			parentObj.windowX = data - 7;
		}
	}
	this.memoryHighWriter[0x72] = this.memoryWriter[0xFF72] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF72] = data;
	}
	this.memoryHighWriter[0x73] = this.memoryWriter[0xFF73] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF73] = data;
	}
	this.memoryHighWriter[0x75] = this.memoryWriter[0xFF75] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.memory[0xFF75] = data;
	}
	this.memoryHighWriter[0x76] = this.memoryWriter[0xFF76] = this.cartIgnoreWrite;
	this.memoryHighWriter[0x77] = this.memoryWriter[0xFF77] = this.cartIgnoreWrite;
	//IE (Interrupt Enable)
	this.memoryHighWriter[0xFF] = this.memoryWriter[0xFFFF] = function (parentObj: GameBoyCore, _address, data) {
		parentObj.interruptsEnabled = data;
		parentObj.checkIRQMatching();
	}
	this.recompileModelSpecificIOWriteHandling();
	this.recompileBootIOWriteHandling();
}

private recompileModelSpecificIOWriteHandling() {
	if (this.cGBC) {
		//GameBoy Color Specific I/O:
		//SC (Serial Transfer Control Register)
		this.memoryHighWriter[0x2] = this.memoryWriter[0xFF02] = function (parentObj: GameBoyCore, _address, data) {
			if (((data & 0x1) == 0x1)) {
				//Internal clock:
				parentObj.memory[0xFF02] = (data & 0x7F);
				parentObj.serialTimer = ((data & 0x2) == 0) ? 4096 : 128;	//Set the Serial IRQ counter.
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = ((data & 0x2) == 0) ? 512 : 16;	//Set the transfer data shift counter.
			}
			else {
				//External clock:
				parentObj.memory[0xFF02] = data;
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = parentObj.serialTimer = 0;	//Zero the timers, since we're emulating as if nothing is connected.
			}
		}
		this.memoryHighWriter[0x40] = this.memoryWriter[0xFF40] = function (parentObj: GameBoyCore, _address, data) {
			if (parentObj.memory[0xFF40] != data) {
				parentObj.midScanLineJIT();
				var temp_var = (data > 0x7F);
				if (temp_var != parentObj.LCDisOn) {
					//When the display mode changes...
					parentObj.LCDisOn = temp_var;
					parentObj.memory[0xFF41] &= 0x78;
					parentObj.midScanlineOffset = -1;
					parentObj.totalLinesPassed = parentObj.currentX = parentObj.queuedScanLines = parentObj.lastUnrenderedLine = parentObj.STATTracker = parentObj.LCDTicks = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
					if (parentObj.LCDisOn) {
						parentObj.modeSTAT = 2;
						parentObj.matchLYC();	//Get the compare of the first scan line.
						parentObj.LCDCONTROL = parentObj.LINECONTROL;
					}
					else {
						parentObj.modeSTAT = 0;
						parentObj.LCDCONTROL = parentObj.DISPLAYOFFCONTROL;
						parentObj.DisplayShowOff();
					}
					parentObj.interruptsRequested &= 0xFD;
				}
				parentObj.gfxWindowCHRBankPosition = ((data & 0x40) == 0x40) ? 0x400 : 0;
				parentObj.gfxWindowDisplay = ((data & 0x20) == 0x20);
				parentObj.gfxBackgroundBankOffset = ((data & 0x10) == 0x10) ? 0 : 0x80;
				parentObj.gfxBackgroundCHRBankPosition = ((data & 0x08) == 0x08) ? 0x400 : 0;
				parentObj.gfxSpriteNormalHeight = ((data & 0x04) == 0);
				parentObj.gfxSpriteShow = ((data & 0x02) == 0x02);
				parentObj.BGPriorityEnabled = ((data & 0x01) == 0x01);
				parentObj.priorityFlaggingPathRebuild();	//Special case the priority flagging as an optimization.
				parentObj.memory[0xFF40] = data;
			}
		}
		this.memoryHighWriter[0x41] = this.memoryWriter[0xFF41] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.LYCMatchTriggerSTAT = ((data & 0x40) == 0x40);
			parentObj.mode2TriggerSTAT = ((data & 0x20) == 0x20);
			parentObj.mode1TriggerSTAT = ((data & 0x10) == 0x10);
			parentObj.mode0TriggerSTAT = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF41] = data & 0x78;
		}
		this.memoryHighWriter[0x46] = this.memoryWriter[0xFF46] = function (parentObj: GameBoyCore, address, data) {
			parentObj.memory[0xFF46] = data;
			if (data < 0xE0) {
				data <<= 8;
				address = 0xFE00;
				var stat = parentObj.modeSTAT;
				parentObj.modeSTAT = 0;
				var newData = 0;
				do {
					newData = parentObj.memoryReader[data](parentObj, data++);
					if (newData != parentObj.memory[address]) {
						//JIT the graphics render queue:
						parentObj.modeSTAT = stat;
						parentObj.graphicsJIT();
						parentObj.modeSTAT = 0;
						parentObj.memory[address++] = newData;
						break;
					}
				} while (++address < 0xFEA0);
				if (address < 0xFEA0) {
					do {
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
					} while (address < 0xFEA0);
				}
				parentObj.modeSTAT = stat;
			}
		}
		//KEY1
		this.memoryHighWriter[0x4D] = this.memoryWriter[0xFF4D] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.memory[0xFF4D] = (data & 0x7F) | (parentObj.memory[0xFF4D] & 0x80);
		}
		this.memoryHighWriter[0x4F] = this.memoryWriter[0xFF4F] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.currVRAMBank = data & 0x01;
			if (parentObj.currVRAMBank > 0) {
				parentObj.BGCHRCurrentBank = parentObj.BGCHRBank2;
			}
			else {
				parentObj.BGCHRCurrentBank = parentObj.BGCHRBank1;
			}
			//Only writable by GBC.
		}
		this.memoryHighWriter[0x51] = this.memoryWriter[0xFF51] = function (parentObj: GameBoyCore, _address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF51] = data;
			}
		}
		this.memoryHighWriter[0x52] = this.memoryWriter[0xFF52] = function (parentObj: GameBoyCore, _address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF52] = data & 0xF0;
			}
		}
		this.memoryHighWriter[0x53] = this.memoryWriter[0xFF53] = function (parentObj: GameBoyCore, _address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF53] = data & 0x1F;
			}
		}
		this.memoryHighWriter[0x54] = this.memoryWriter[0xFF54] = function (parentObj: GameBoyCore, _address, data) {
			if (!parentObj.hdmaRunning) {
				parentObj.memory[0xFF54] = data & 0xF0;
			}
		}
		this.memoryHighWriter[0x55] = this.memoryWriter[0xFF55] = function (parentObj: GameBoyCore, _address, data) {
			if (!parentObj.hdmaRunning) {
				if ((data & 0x80) == 0) {
					//DMA
					parentObj.DMAWrite((data & 0x7F) + 1);
					parentObj.memory[0xFF55] = 0xFF;	//Transfer completed.
				}
				else {
					//H-Blank DMA
					parentObj.hdmaRunning = true;
					parentObj.memory[0xFF55] = data & 0x7F;
				}
			}
			else if ((data & 0x80) == 0) {
				//Stop H-Blank DMA
				parentObj.hdmaRunning = false;
				parentObj.memory[0xFF55] |= 0x80;
			}
			else {
				parentObj.memory[0xFF55] = data & 0x7F;
			}
		}
		this.memoryHighWriter[0x68] = this.memoryWriter[0xFF68] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.memory[0xFF69] = parentObj.gbcBGRawPalette[data & 0x3F];
			parentObj.memory[0xFF68] = data;
		}
		this.memoryHighWriter[0x69] = this.memoryWriter[0xFF69] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.updateGBCBGPalette(parentObj.memory[0xFF68] & 0x3F, data);
			if (parentObj.memory[0xFF68] > 0x7F) { // high bit = autoincrement
				var next = ((parentObj.memory[0xFF68] + 1) & 0x3F);
				parentObj.memory[0xFF68] = (next | 0x80);
				parentObj.memory[0xFF69] = parentObj.gbcBGRawPalette[next];
			}
			else {
				parentObj.memory[0xFF69] = data;
			}
		}
		this.memoryHighWriter[0x6A] = this.memoryWriter[0xFF6A] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.memory[0xFF6B] = parentObj.gbcOBJRawPalette[data & 0x3F];
			parentObj.memory[0xFF6A] = data;
		}
		this.memoryHighWriter[0x6B] = this.memoryWriter[0xFF6B] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.updateGBCOBJPalette(parentObj.memory[0xFF6A] & 0x3F, data);
			if (parentObj.memory[0xFF6A] > 0x7F) { // high bit = autoincrement
				var next = ((parentObj.memory[0xFF6A] + 1) & 0x3F);
				parentObj.memory[0xFF6A] = (next | 0x80);
				parentObj.memory[0xFF6B] = parentObj.gbcOBJRawPalette[next];
			}
			else {
				parentObj.memory[0xFF6B] = data;
			}
		}
		//SVBK
		this.memoryHighWriter[0x70] = this.memoryWriter[0xFF70] = function (parentObj: GameBoyCore, _address, data) {
			var addressCheck = (parentObj.memory[0xFF51] << 8) | parentObj.memory[0xFF52];	//Cannot change the RAM bank while WRAM is the source of a running HDMA.
			if (!parentObj.hdmaRunning || addressCheck < 0xD000 || addressCheck >= 0xE000) {
				parentObj.gbcRamBank = Math.max(data & 0x07, 1);	//Bank range is from 1-7
				parentObj.gbcRamBankPosition = ((parentObj.gbcRamBank - 1) << 12) - 0xD000;
				parentObj.gbcRamBankPositionECHO = parentObj.gbcRamBankPosition - 0x2000;
			}
			parentObj.memory[0xFF70] = data;	//Bit 6 cannot be written to.
		}
		this.memoryHighWriter[0x74] = this.memoryWriter[0xFF74] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.memory[0xFF74] = data;
		}
	}
	else {
		//Fill in the GameBoy Color I/O registers as normal RAM for GameBoy compatibility:
		//SC (Serial Transfer Control Register)
		this.memoryHighWriter[0x2] = this.memoryWriter[0xFF02] = function (parentObj: GameBoyCore, _address, data) {
			if (((data & 0x1) == 0x1)) {
				//Internal clock:
				parentObj.memory[0xFF02] = (data & 0x7F);
				parentObj.serialTimer = 4096;	//Set the Serial IRQ counter.
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = 512;	//Set the transfer data shift counter.
			}
			else {
				//External clock:
				parentObj.memory[0xFF02] = data;
				parentObj.serialShiftTimer = parentObj.serialShiftTimerAllocated = parentObj.serialTimer = 0;	//Zero the timers, since we're emulating as if nothing is connected.
			}
		}
		this.memoryHighWriter[0x40] = this.memoryWriter[0xFF40] = function (parentObj: GameBoyCore, _address, data) {
			if (parentObj.memory[0xFF40] != data) {
				parentObj.midScanLineJIT();
				var temp_var = (data > 0x7F);
				if (temp_var != parentObj.LCDisOn) {
					//When the display mode changes...
					parentObj.LCDisOn = temp_var;
					parentObj.memory[0xFF41] &= 0x78;
					parentObj.midScanlineOffset = -1;
					parentObj.totalLinesPassed = parentObj.currentX = parentObj.queuedScanLines = parentObj.lastUnrenderedLine = parentObj.STATTracker = parentObj.LCDTicks = parentObj.actualScanLine = parentObj.memory[0xFF44] = 0;
					if (parentObj.LCDisOn) {
						parentObj.modeSTAT = 2;
						parentObj.matchLYC();	//Get the compare of the first scan line.
						parentObj.LCDCONTROL = parentObj.LINECONTROL;
					}
					else {
						parentObj.modeSTAT = 0;
						parentObj.LCDCONTROL = parentObj.DISPLAYOFFCONTROL;
						parentObj.DisplayShowOff();
					}
					parentObj.interruptsRequested &= 0xFD;
				}
				parentObj.gfxWindowCHRBankPosition = ((data & 0x40) == 0x40) ? 0x400 : 0;
				parentObj.gfxWindowDisplay = (data & 0x20) == 0x20;
				parentObj.gfxBackgroundBankOffset = ((data & 0x10) == 0x10) ? 0 : 0x80;
				parentObj.gfxBackgroundCHRBankPosition = ((data & 0x08) == 0x08) ? 0x400 : 0;
				parentObj.gfxSpriteNormalHeight = ((data & 0x04) == 0);
				parentObj.gfxSpriteShow = (data & 0x02) == 0x02;
				parentObj.bgEnabled = ((data & 0x01) == 0x01);
				parentObj.memory[0xFF40] = data;
			}
		}
		this.memoryHighWriter[0x41] = this.memoryWriter[0xFF41] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.LYCMatchTriggerSTAT = ((data & 0x40) == 0x40);
			parentObj.mode2TriggerSTAT = ((data & 0x20) == 0x20);
			parentObj.mode1TriggerSTAT = ((data & 0x10) == 0x10);
			parentObj.mode0TriggerSTAT = ((data & 0x08) == 0x08);
			parentObj.memory[0xFF41] = data & 0x78;
			if ((!parentObj.usedBootROM || !parentObj.usedGBCBootROM) && parentObj.LCDisOn && parentObj.modeSTAT < 2) {
				parentObj.interruptsRequested |= 0x2;
				parentObj.checkIRQMatching();
			}
		}
		this.memoryHighWriter[0x46] = this.memoryWriter[0xFF46] = function (parentObj: GameBoyCore, address, data) {
			parentObj.memory[0xFF46] = data;
			if (data > 0x7F && data < 0xE0) {	//DMG cannot DMA from the ROM banks.
				data <<= 8;
				address = 0xFE00;
				var stat = parentObj.modeSTAT;
				parentObj.modeSTAT = 0;
				var newData = 0;
				do {
					newData = parentObj.memoryReader[data](parentObj, data++);
					if (newData != parentObj.memory[address]) {
						//JIT the graphics render queue:
						parentObj.modeSTAT = stat;
						parentObj.graphicsJIT();
						parentObj.modeSTAT = 0;
						parentObj.memory[address++] = newData;
						break;
					}
				} while (++address < 0xFEA0);
				if (address < 0xFEA0) {
					do {
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
						parentObj.memory[address++] = parentObj.memoryReader[data](parentObj, data++);
					} while (address < 0xFEA0);
				}
				parentObj.modeSTAT = stat;
			}
		}
		this.memoryHighWriter[0x47] = this.memoryWriter[0xFF47] = function (parentObj: GameBoyCore, _address, data) {
			if (parentObj.memory[0xFF47] != data) {
				parentObj.midScanLineJIT();
				parentObj.updateGBBGPalette(data);
				parentObj.memory[0xFF47] = data;
			}
		}
		this.memoryHighWriter[0x48] = this.memoryWriter[0xFF48] = function (parentObj: GameBoyCore, _address, data) {
			if (parentObj.memory[0xFF48] != data) {
				parentObj.midScanLineJIT();
				parentObj.updateGBOBJPalette(0, data);
				parentObj.memory[0xFF48] = data;
			}
		}
		this.memoryHighWriter[0x49] = this.memoryWriter[0xFF49] = function (parentObj: GameBoyCore, _address, data) {
			if (parentObj.memory[0xFF49] != data) {
				parentObj.midScanLineJIT();
				parentObj.updateGBOBJPalette(4, data);
				parentObj.memory[0xFF49] = data;
			}
		}
		this.memoryHighWriter[0x4D] = this.memoryWriter[0xFF4D] = function (parentObj: GameBoyCore, _address, data) {
			parentObj.memory[0xFF4D] = data;
		}
		this.memoryHighWriter[0x4F] = this.memoryWriter[0xFF4F] = this.cartIgnoreWrite;	//Not writable in DMG mode.
		this.memoryHighWriter[0x55] = this.memoryWriter[0xFF55] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x68] = this.memoryWriter[0xFF68] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x69] = this.memoryWriter[0xFF69] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x6A] = this.memoryWriter[0xFF6A] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x6B] = this.memoryWriter[0xFF6B] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x6C] = this.memoryWriter[0xFF6C] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x70] = this.memoryWriter[0xFF70] = this.cartIgnoreWrite;
		this.memoryHighWriter[0x74] = this.memoryWriter[0xFF74] = this.cartIgnoreWrite;
	}
}

private recompileBootIOWriteHandling() {
	//Boot I/O Registers:
	if (this.inBootstrap) {
		this.memoryHighWriter[0x50] = this.memoryWriter[0xFF50] = function (parentObj: GameBoyCore, _address, data) {
			cout("Boot ROM reads blocked: Bootstrap process has ended.", 0);
			parentObj.inBootstrap = false;
			parentObj.disableBootROM();			//Fill in the boot ROM ranges with ROM  bank 0 ROM ranges
			parentObj.memory[0xFF50] = data;	//Bits are sustained in memory?
		}
		if (this.cGBC) {
			this.memoryHighWriter[0x6C] = this.memoryWriter[0xFF6C] = function (parentObj: GameBoyCore, _address, data) {
				if (parentObj.inBootstrap) {
					parentObj.cGBC = ((data & 0x1) == 0);
					//Exception to the GBC identifying code:
					if (parentObj.name + parentObj.gameCode + parentObj.ROM[0x143] == "Game and Watch 50") {
						parentObj.cGBC = true;
						cout("Created a boot exception for Game and Watch Gallery 2 (GBC ID byte is wrong on the cartridge).", 1);
					}
					cout("Booted to GBC Mode: " + parentObj.cGBC, 0);
				}
				parentObj.memory[0xFF6C] = data;
			}
		}
	}
	else {
		//Lockout the ROMs from accessing the BOOT ROM control register:
		this.memoryHighWriter[0x50] = this.memoryWriter[0xFF50] = this.cartIgnoreWrite;
	}
}

}
