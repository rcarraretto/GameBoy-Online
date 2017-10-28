describe("gameboy", function() {
  it("initial values", function() {
    var core = new GameBoyCore();
    expect(core.registerA).to.equal(1);
  });
});
