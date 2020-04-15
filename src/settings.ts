export const settings = {
    enable_sound: true,
    channels: [true, true, true, true],
    volume: 1,
    // Audio buffer minimum span amount over x interpreter iterations.
    audio_buffer_min: 10,
    // Audio buffer maximum span amount over x interpreter iterations.
    audio_buffer_max: 20,

    // Interval for the emulator loop.
    loop_interval: 8,

    // Boot with boot ROM first?
    enable_gbc_bios: true,
    // Use the GameBoy boot ROM instead of the GameBoy Color boot ROM.
    gb_boot_rom_utilized: false,

    // Give priority to GameBoy mode
    disable_colors: false,
    // Colorize GB mode?
    enable_colorization: true,

    // Override to allow for MBC1 instead of ROM only (compatibility for broken 3rd-party cartridges).
    rom_only_override: false,
    // Override MBC RAM disabling and always allow reading and writing to the banks.
    mbc_enable_override: false,

    // Scale the canvas in JS, or let the browser scale the canvas?
    software_resizing: false,
    // Use image smoothing based scaling?
    resize_smoothing: true,

    // Disallow typed arrays?
    typed_arrays_disallow: false,
};
