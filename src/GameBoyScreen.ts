import { settings } from "./settings";
import { cout } from "./terminal";
import { getTypedArray } from "./typed-array";
import { Resize } from "./resize";

export class GameBoyScreen {
    private canvas: HTMLCanvasElement;
    private canvasOffscreen: HTMLCanvasElement;
    private canvasBuffer: ImageData;
    private drawContextOffscreen: CanvasRenderingContext2D;
    private drawContextOnscreen: CanvasRenderingContext2D;

    // Variables used for scaling in JS
    private onscreenWidth: number;
    private onscreenHeight: number;
    private offscreenWidth: number;
    private offscreenHeight: number;
    private offscreenRGBCount: number;
    private resizePathClear: boolean = true;

    private resizer: any;
    // The secondary gfx buffer that holds the converted RGBA values
    private swizzledFrame: any[];

    // Throttle how many draws we can do to once per iteration
    private drewFrame: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.onscreenWidth = this.offscreenWidth = 160;
        this.onscreenHeight = this.offscreenHeight = 144;
        this.offscreenRGBCount = this.onscreenWidth * this.onscreenHeight * 4;
    }

    public setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
    }

    public initLCD() {
        this.recomputeDimension();
        if (this.offscreenRGBCount != 92160) {
            //Only create the resizer handle if we need it:
            this.compileResizeFrameBufferFunction();
        } else {
            //Resizer not needed:
            this.resizer = null;
        }
        try {
            this.canvasOffscreen = document.createElement("canvas");
            this.canvasOffscreen.width = this.offscreenWidth;
            this.canvasOffscreen.height = this.offscreenHeight;
            this.drawContextOffscreen = this.canvasOffscreen.getContext("2d");
            this.drawContextOnscreen = this.canvas.getContext("2d");
            this.canvas.setAttribute(
                "style",
                (this.canvas.getAttribute("style") || "") +
                    "; image-rendering: " +
                    (settings.resize_smoothing ? "auto" : "-webkit-optimize-contrast") +
                    ";" +
                    "image-rendering: " +
                    (settings.resize_smoothing ? "optimizeQuality" : "-o-crisp-edges") +
                    ";" +
                    "image-rendering: " +
                    (settings.resize_smoothing ? "optimizeQuality" : "-moz-crisp-edges") +
                    ";" +
                    "-ms-interpolation-mode: " +
                    (settings.resize_smoothing ? "bicubic" : "nearest-neighbor") +
                    ";",
            );
            (this.drawContextOffscreen as any).webkitImageSmoothingEnabled = settings.resize_smoothing;
            (this.drawContextOffscreen as any).mozImageSmoothingEnabled = settings.resize_smoothing;
            (this.drawContextOnscreen as any).webkitImageSmoothingEnabled = settings.resize_smoothing;
            (this.drawContextOnscreen as any).mozImageSmoothingEnabled = settings.resize_smoothing;
            //Get a CanvasPixelArray buffer:
            try {
                this.canvasBuffer = this.drawContextOffscreen.createImageData(
                    this.offscreenWidth,
                    this.offscreenHeight,
                );
            } catch (error) {
                cout('Falling back to the getImageData initialization (Error "' + error.message + '").', 1);
                this.canvasBuffer = this.drawContextOffscreen.getImageData(
                    0,
                    0,
                    this.offscreenWidth,
                    this.offscreenHeight,
                );
            }
            var index = this.offscreenRGBCount;
            while (index > 0) {
                this.canvasBuffer.data[(index -= 4)] = 0xf8;
                this.canvasBuffer.data[index + 1] = 0xf8;
                this.canvasBuffer.data[index + 2] = 0xf8;
                this.canvasBuffer.data[index + 3] = 0xff;
            }
            this.graphicsBlit();
            this.canvas.style.visibility = "visible";
            if (this.swizzledFrame == null) {
                this.swizzledFrame = getTypedArray(69120, 0xff, "uint8");
            }
            //Test the draw system and browser vblank latching:
            this.drewFrame = true; //Copy the latest graphics to buffer.
            this.requestDraw();
        } catch (error) {
            throw new Error(
                "HTML5 Canvas support required: " +
                    error.message +
                    "file: " +
                    error.fileName +
                    ", line: " +
                    error.lineNumber,
            );
        }
    }

    private recomputeDimension() {
        //Cache some dimension info:
        this.onscreenWidth = this.canvas.width;
        this.onscreenHeight = this.canvas.height;
        if (
            navigator.userAgent.toLowerCase().indexOf("gecko") != -1 &&
            navigator.userAgent.toLowerCase().indexOf("like gecko") == -1
        ) {
            //Firefox slowness hack:
            this.canvas.width = this.onscreenWidth = !settings.software_resizing ? 160 : this.canvas.width;
            this.canvas.height = this.onscreenHeight = !settings.software_resizing ? 144 : this.canvas.height;
        } else {
            this.onscreenWidth = this.canvas.width;
            this.onscreenHeight = this.canvas.height;
        }
        this.offscreenWidth = !settings.software_resizing ? 160 : this.canvas.width;
        this.offscreenHeight = !settings.software_resizing ? 144 : this.canvas.height;
        this.offscreenRGBCount = this.offscreenWidth * this.offscreenHeight * 4;
    }

    private compileResizeFrameBufferFunction() {
        if (this.offscreenRGBCount > 0) {
            this.resizer = new Resize(
                160,
                144,
                this.offscreenWidth,
                this.offscreenHeight,
                false,
                settings.resize_smoothing,
            );
        }
    }

    public initNewCanvas(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    public initNewCanvasSize(software_resizing: boolean): void {
        if (!software_resizing) {
            if (this.onscreenWidth != 160 || this.onscreenHeight != 144) {
                this.initLCD();
            }
        } else {
            if (this.onscreenWidth != this.canvas.clientWidth || this.onscreenHeight != this.canvas.clientHeight) {
                this.initLCD();
            }
        }
    }

    public requestDraw() {
        if (this.drewFrame) {
            this.dispatchDraw();
        }
    }

    private dispatchDraw() {
        if (this.offscreenRGBCount > 0) {
            //We actually updated the graphics internally, so copy out:
            if (this.offscreenRGBCount == 92160) {
                this.processDraw(this.swizzledFrame);
            } else {
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

    private resizeFrameBuffer() {
        //Resize in javascript with resize.js:
        if (this.resizePathClear) {
            this.resizePathClear = false;
            this.resizer.resize(this.swizzledFrame);
        }
    }

    private graphicsBlit() {
        if (this.offscreenWidth == this.onscreenWidth && this.offscreenHeight == this.onscreenHeight) {
            this.drawContextOnscreen.putImageData(this.canvasBuffer, 0, 0);
        } else {
            this.drawContextOffscreen.putImageData(this.canvasBuffer, 0, 0);
            this.drawContextOnscreen.drawImage(this.canvasOffscreen, 0, 0, this.onscreenWidth, this.onscreenHeight);
        }
    }

    public clearFrameBuffer(colored: boolean) {
        var bufferIndex = 0;
        var frameBuffer = this.swizzledFrame;
        if (colored) {
            while (bufferIndex < 69120) {
                frameBuffer[bufferIndex++] = 248;
            }
        } else {
            while (bufferIndex < 69120) {
                frameBuffer[bufferIndex++] = 239;
                frameBuffer[bufferIndex++] = 255;
                frameBuffer[bufferIndex++] = 222;
            }
        }
        this.drewFrame = true;
    }

    public prepareFrame(frameBuffer: any[]) {
        //Copy the internal frame buffer to the output buffer:
        this.swizzleFrameBuffer(frameBuffer);
        this.drewFrame = true;
    }

    private swizzleFrameBuffer(frameBuffer: any[]) {
        //Convert our dirty 24-bit (24-bit, with internal render flags above it) framebuffer to an 8-bit buffer with separate indices for the RGB channels:
        var swizzledFrame = this.swizzledFrame;
        var bufferIndex = 0;
        for (var canvasIndex = 0; canvasIndex < 69120; ) {
            swizzledFrame[canvasIndex++] = (frameBuffer[bufferIndex] >> 16) & 0xff; //Red
            swizzledFrame[canvasIndex++] = (frameBuffer[bufferIndex] >> 8) & 0xff; //Green
            swizzledFrame[canvasIndex++] = frameBuffer[bufferIndex++] & 0xff; //Blue
        }
    }
}
