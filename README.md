# JavaScript GameBoy Color Emulator

**Copyright (C) 2010 - 2016 Grant Galitz**

A GameBoy Color emulator that utilizes HTML5 canvas and JavaScript audio APIs to provide a full emulation of the console.

**License:**

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## CPU instruction set accuracy test results (Blargg's cpu_instrs.gb test ROM):

* **GameBoy Online:**

	![GameBoy Online (This emulator)](http://i.imgur.com/ivs7F.png "Passes")
* **Visual Boy Advance 1.7.2:**

	![Visual Boy Advance 1.7.2](http://i.imgur.com/NYnYu.png "Fails")
* **KiGB:**

	![KiGB](http://i.imgur.com/eYHDH.png "Fails")
* **Gambatte:**

	![Gambatte](http://i.imgur.com/vGHFz.png "Passes")

## Install

`npm install`

## Test

`npm test`

## Dev

`npm run dev`
