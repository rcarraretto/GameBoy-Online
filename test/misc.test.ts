import { expect } from "chai";
import { GameBoyCore } from "../src/GameBoyCore";

describe("misc", function () {
    var core;

    beforeEach(function () {
        core = new GameBoyCore();
        core.setupRAM();
    });

    it("initial values", function () {
        expect(core.registerA).to.equal(1);
    });
});
