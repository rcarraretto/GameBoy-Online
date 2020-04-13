import { io } from './GameBoyIO';
import { findValue, findKey, checkStorageLength, deleteValue } from './local-storage';
import { windowCreate, windowStacks } from './windowStack';
import { addEvent, popupMenu, showAlert } from './util';

const { cout, clear_terminal } = require('./terminal');
const settings = require('./settings');

var inFullscreen = false;
var mainCanvas = null;
var fullscreenCanvas = null;
var showAsMinimal = false;
var keyZones = [
	["right", [39]],
	["left", [37]],
	["up", [38]],
	["down", [40]],
	["a", [88, 74]],
	["b", [90, 81, 89]],
	["select", [16]],
	["start", [13]]
];
export function windowingInitialize() {
	cout("windowingInitialize() called.", 0);
	windowStacks[0] = windowCreate("GameBoy", true);
	windowStacks[1] = windowCreate("terminal", false);
	windowStacks[2] = windowCreate("about", false);
	windowStacks[3] = windowCreate("settings", false);
	windowStacks[4] = windowCreate("input_select", false);
	windowStacks[5] = windowCreate("instructions", false);
	windowStacks[6] = windowCreate("local_storage_popup", false);
	windowStacks[7] = windowCreate("local_storage_listing", false);
	windowStacks[8] = windowCreate("freeze_listing", false);
	windowStacks[9] = windowCreate("save_importer", false);
	mainCanvas = document.getElementById("mainCanvas");
	fullscreenCanvas = document.getElementById("fullscreen");
	try {
		//Hook the GUI controls.
		registerGUIEvents();
	}
	catch (error) {
		cout("Fatal windowing error: \"" + error.message + "\" file:" + error.fileName + " line: " + error.lineNumber, 2);
	}
	//Update the settings to the emulator's default:
	setChecked("enable_sound", settings[0]);
	setChecked("enable_gbc_bios", settings[1]);
	setChecked("disable_colors", settings[2]);
	setChecked("rom_only_override", settings[9]);
	setChecked("mbc_enable_override", settings[10]);
	setChecked("enable_colorization", settings[4]);
	setChecked("do_minimal", showAsMinimal);
	setChecked("software_resizing", settings[12]);
	setChecked("typed_arrays_disallow", settings[5]);
	setChecked("gb_boot_rom_utilized", settings[11]);
	setChecked("resize_smoothing", settings[13]);
	setChecked("channel1", settings[14][0]);
	setChecked("channel2", settings[14][1]);
	setChecked("channel3", settings[14][2]);
	setChecked("channel4", settings[14][3]);
}
function registerGUIEvents() {
	cout("In registerGUIEvents() : Registering GUI Events.", -1);
	addEvent("click", document.getElementById("terminal_clear_button"), clear_terminal);
	addEvent("click", document.getElementById("local_storage_list_refresh_button"), refreshStorageListing);
	addEvent("click", document.getElementById("terminal_close_button"), function () { windowStacks[1].hide() });
	addEvent("click", document.getElementById("about_close_button"), function () { windowStacks[2].hide() });
	addEvent("click", document.getElementById("settings_close_button"), function () { windowStacks[3].hide() });
	addEvent("click", document.getElementById("input_select_close_button"), function () { windowStacks[4].hide() });
	addEvent("click", document.getElementById("instructions_close_button"), function () { windowStacks[5].hide() });
	addEvent("click", document.getElementById("local_storage_list_close_button"), function () { windowStacks[7].hide() });
	addEvent("click", document.getElementById("local_storage_popup_close_button"), function () { windowStacks[6].hide() });
	addEvent("click", document.getElementById("save_importer_close_button"), function () { windowStacks[9].hide() });
	addEvent("click", document.getElementById("freeze_list_close_button"), function () { windowStacks[8].hide() });
	addEvent("click", document.getElementById("GameBoy_about_menu"), function () { windowStacks[2].show() });
	addEvent("click", document.getElementById("GameBoy_settings_menu"), function () { windowStacks[3].show() });
	addEvent("click", document.getElementById("local_storage_list_menu"), function () { refreshStorageListing(); windowStacks[7].show(); });
	addEvent("click", document.getElementById("freeze_list_menu"), function () { refreshFreezeListing(); windowStacks[8].show(); });
	addEvent("click", document.getElementById("view_importer"), function () { windowStacks[9].show() });
	addEvent("keydown", document, keyDown);
	addEvent("keyup", document,  function (event) {
		if (event.keyCode == 27) {
			//Fullscreen on/off
			fullscreenPlayer();
		}
		else {
			//Control keys / other
			keyUp(event);
		}
	});
	addEvent("MozOrientation", window, io.GameBoyGyroSignalHandler);
	addEvent("deviceorientation", window, io.GameBoyGyroSignalHandler);
	new popupMenu(document.getElementById("GameBoy_file_menu"), document.getElementById("GameBoy_file_popup"));
	addEvent("click", document.getElementById("data_uri_clicker"), function () {
		var datauri = prompt("Please input the ROM image's Base 64 Encoded Text:", "");
		if (datauri != null && datauri.length > 0) {
			try {
				cout(Math.floor(datauri.length * 3 / 4) + " bytes of data submitted by form (text length of " + datauri.length + ").", 0);
				initPlayer();
				io.start(mainCanvas, base64_decode(datauri));
			}
			catch (error) {
				showAlert(error);
			}
		}
	});
	addEvent("click", document.getElementById("set_volume"), function () {
		if (io.GameBoyEmulatorInitialized()) {
			var volume = prompt("Set the volume here:", "1.0");
			if (volume != null && volume.length > 0) {
				settings[3] = Math.min(Math.max(parseFloat(volume), 0), 1);
				io.getGameboy().changeVolume();
			}
		}
	});
	addEvent("click", document.getElementById("set_speed"), function () {
		if (io.GameBoyEmulatorInitialized()) {
			var speed = prompt("Set the emulator speed here:", "1.0");
			if (speed != null && speed.length > 0) {
				io.getGameboy().setSpeed(Math.max(parseFloat(speed), 0.001));
			}
		}
	});
	addEvent("click", document.getElementById("internal_file_clicker"), function () {
		var file_opener = document.getElementById("local_file_open");
		windowStacks[4].show();
		file_opener.click();
	});
	addEvent("blur", document.getElementById("input_select"), function () {
		windowStacks[4].hide();
	});
	addEvent("change", document.getElementById("local_file_open"), function () {
		windowStacks[4].hide();
		if (typeof this.files != "undefined") {
			try {
				if (this.files.length >= 1) {
					cout("Reading the local file \"" + this.files[0].name + "\"", 0);
					try {
						//Gecko 1.9.2+ (Standard Method)
						var binaryHandle = new FileReader();
						binaryHandle.onload = function () {
							if (this.readyState == 2) {
								cout("file loaded.", 0);
								try {
									initPlayer();
									io.start(mainCanvas, this.result);
								}
								catch (error) {
									showAlert(error);
								}
							}
							else {
								cout("loading file, please wait...", 0);
							}
						}
						binaryHandle.readAsBinaryString(this.files[this.files.length - 1]);
					}
					catch (error) {
						cout("Browser does not support the FileReader object, falling back to the non-standard File object access,", 2);
						//Gecko 1.9.0, 1.9.1 (Non-Standard Method)
						var romImageString = this.files[this.files.length - 1].getAsBinary();
						try {
							initPlayer();
							io.start(mainCanvas, romImageString);
						}
						catch (error) {
							showAlert(error);
						}

					}
				}
				else {
					cout("Incorrect number of files selected for local loading.", 1);
				}
			}
			catch (error) {
				cout("Could not load in a locally stored ROM file.", 2);
			}
		}
		else {
			cout("could not find the handle on the file to open.", 2);
		}
	});
	addEvent("change", document.getElementById("save_open"), function () {
		windowStacks[9].hide();
		if (typeof this.files != "undefined") {
			try {
				if (this.files.length >= 1) {
					cout("Reading the local file \"" + this.files[0].name + "\" for importing.", 0);
					try {
						//Gecko 1.9.2+ (Standard Method)
						var binaryHandle = new FileReader();
						binaryHandle.onload = function () {
							if (this.readyState == 2) {
								cout("file imported.", 0);
								try {
									io.import_save(this.result);
									refreshStorageListing();
								}
								catch (error) {
									showAlert(error);
								}
							}
							else {
								cout("importing file, please wait...", 0);
							}
						}
						binaryHandle.readAsBinaryString(this.files[this.files.length - 1]);
					}
					catch (error) {
						cout("Browser does not support the FileReader object, falling back to the non-standard File object access,", 2);
						//Gecko 1.9.0, 1.9.1 (Non-Standard Method)
						var romImageString = this.files[this.files.length - 1].getAsBinary();
						try {
							io.import_save(romImageString);
							refreshStorageListing();
						}
						catch (error) {
							showAlert(error);
						}

					}
				}
				else {
					cout("Incorrect number of files selected for local loading.", 1);
				}
			}
			catch (error) {
				cout("Could not load in a locally stored ROM file.", 2);
			}
		}
		else {
			cout("could not find the handle on the file to open.", 2);
		}
	});
	addEvent("click", document.getElementById("restart_cpu_clicker"), function () {
		if (io.GameBoyEmulatorInitialized()) {
			try {
				if (!io.getGameboy().fromSaveState) {
					initPlayer();
					io.start(mainCanvas, io.getGameboy().getROMImage());
				}
				else {
					initPlayer();
					io.openState(io.getGameboy().savedStateFileName, mainCanvas);
				}
			}
			catch (error) {
				showAlert(error);
			}
		}
		else {
			cout("Could not restart, as a previous emulation session could not be found.", 1);
		}
	});
	addEvent("click", document.getElementById("run_cpu_clicker"), function () {
		io.run();
	});
	addEvent("click", document.getElementById("kill_cpu_clicker"), function () {
		io.pause();
	});
	addEvent("click", document.getElementById("save_state_clicker"), function () {
		io.save();
	});
	addEvent("click", document.getElementById("save_SRAM_state_clicker"), function () {
		io.saveSRAM();
	});
	addEvent("click", document.getElementById("enable_sound"), function () {
		settings[0] = isChecked("enable_sound");
		if (io.GameBoyEmulatorInitialized()) {
			io.getGameboy().initSound();
		}
	});
	addEvent("click", document.getElementById("disable_colors"), function () {
		settings[2] = isChecked("disable_colors");
	});
	addEvent("click", document.getElementById("rom_only_override"), function () {
		settings[9] = isChecked("rom_only_override");
	});
	addEvent("click", document.getElementById("mbc_enable_override"), function () {
		settings[10] = isChecked("mbc_enable_override");
	});
	addEvent("click", document.getElementById("enable_gbc_bios"), function () {
		settings[1] = isChecked("enable_gbc_bios");
	});
	addEvent("click", document.getElementById("enable_colorization"), function () {
		settings[4] = isChecked("enable_colorization");
	});
	addEvent("click", document.getElementById("do_minimal"), function () {
		showAsMinimal = isChecked("do_minimal");
		fullscreenCanvas.className = (showAsMinimal) ? "minimum" : "maximum";
	});
	addEvent("click", document.getElementById("software_resizing"), function () {
		settings[12] = isChecked("software_resizing");
		if (io.GameBoyEmulatorInitialized()) {
			io.initLCD();
		}
	});
	addEvent("click", document.getElementById("typed_arrays_disallow"), function () {
		settings[5] = isChecked("typed_arrays_disallow");
	});
	addEvent("click", document.getElementById("gb_boot_rom_utilized"), function () {
		settings[11] = isChecked("gb_boot_rom_utilized");
	});
	addEvent("click", document.getElementById("resize_smoothing"), function () {
		settings[13] = isChecked("resize_smoothing");
		if (io.GameBoyEmulatorInitialized()) {
			io.initLCD();
		}
	});
	addEvent("click", document.getElementById("channel1"), function () {
		settings[14][0] = isChecked("channel1");
	});
	addEvent("click", document.getElementById("channel2"), function () {
		settings[14][1] = isChecked("channel2");
	});
	addEvent("click", document.getElementById("channel3"), function () {
		settings[14][2] = isChecked("channel3");
	});
	addEvent("click", document.getElementById("channel4"), function () {
		settings[14][3] = isChecked("channel4");
	});
	addEvent("click", document.getElementById("view_fullscreen"), fullscreenPlayer);
	new popupMenu(document.getElementById("GameBoy_view_menu"), document.getElementById("GameBoy_view_popup"));
	addEvent("click", document.getElementById("view_terminal"), function () { windowStacks[1].show() });
	addEvent("click", document.getElementById("view_instructions"), function () { windowStacks[5].show() });
	addEvent("mouseup", document.getElementById("gfx"), io.initNewCanvasSize);
	addEvent("resize", window, io.initNewCanvasSize);
	addEvent("unload", window, function () {
		io.autoSave();
	});
}

const isChecked = (id: string): boolean => {
	return (document.getElementById(id) as HTMLInputElement).checked;
}

const setChecked = (id: string, value: boolean): void => {
	(document.getElementById(id) as HTMLInputElement).checked = value;
};

function keyDown(event) {
	var keyCode = event.keyCode;
	var keyMapLength = keyZones.length;
	for (var keyMapIndex = 0; keyMapIndex < keyMapLength; ++keyMapIndex) {
		var keyCheck = keyZones[keyMapIndex];
		var keysMapped = keyCheck[1];
		var keysTotal = keysMapped.length;
		for (var index = 0; index < keysTotal; ++index) {
			if (keysMapped[index] == keyCode) {
				io.GameBoyKeyDown(keyCheck[0]);
				try {
					event.preventDefault();
				}
				catch (error) { }
			}
		}
	}
}
function keyUp(event) {
	var keyCode = event.keyCode;
	var keyMapLength = keyZones.length;
	for (var keyMapIndex = 0; keyMapIndex < keyMapLength; ++keyMapIndex) {
		var keyCheck = keyZones[keyMapIndex];
		var keysMapped = keyCheck[1];
		var keysTotal = keysMapped.length;
		for (var index = 0; index < keysTotal; ++index) {
			if (keysMapped[index] == keyCode) {
				io.GameBoyKeyUp(keyCheck[0]);
				try {
					event.preventDefault();
				}
				catch (error) { }
			}
		}
	}
}
function initPlayer() {
	document.getElementById("title").style.display = "none";
	document.getElementById("port_title").style.display = "none";
	document.getElementById("fullscreenContainer").style.display = "none";
}
function fullscreenPlayer() {
	if (io.GameBoyEmulatorInitialized()) {
		if (!inFullscreen) {
			io.getGameboy().canvas = fullscreenCanvas;
			fullscreenCanvas.className = (showAsMinimal) ? "minimum" : "maximum";
			document.getElementById("fullscreenContainer").style.display = "block";
			windowStacks[0].hide();
		}
		else {
			io.getGameboy().canvas = mainCanvas;
			document.getElementById("fullscreenContainer").style.display = "none";
			windowStacks[0].show();
		}
		io.initLCD();
		inFullscreen = !inFullscreen;
	}
	else {
		cout("Cannot go into fullscreen mode.", 2);
	}
}

// @ts-ignore
function runFreeze(keyName) {
	try {
		windowStacks[8].hide();
		initPlayer();
		io.openState(keyName, mainCanvas);
	}
	catch (error) {
		cout("A problem with attempting to open the selected save state occurred.", 2);
	}
}

function outputLocalStorageLink(keyName, dataFound, downloadName) {
	return generateDownloadLink("data:application/octet-stream;base64," + dataFound, keyName, downloadName);
}
function refreshFreezeListing() {
	var storageListMasterDivSub = document.getElementById("freezeListingMasterContainerSub");
	var storageListMasterDiv = document.getElementById("freezeListingMasterContainer");
	storageListMasterDiv.removeChild(storageListMasterDivSub);
	storageListMasterDivSub = document.createElement("div");
	storageListMasterDivSub.id = "freezeListingMasterContainerSub";
	var keys = getLocalStorageKeys();
	while (keys.length > 0) {
		let key = keys.shift();
		if (key.substring(0, 7) == "FREEZE_") {
			storageListMasterDivSub.appendChild(outputFreezeStateRequestLink(key));
		}
	}
	storageListMasterDiv.appendChild(storageListMasterDivSub);
}
function outputFreezeStateRequestLink(keyName) {
	var linkNode = generateLink("javascript:runFreeze(\"" + keyName + "\")", keyName);
	var storageContainerDiv = document.createElement("div");
	storageContainerDiv.className = "storageListingContainer";
	storageContainerDiv.appendChild(linkNode)
	return storageContainerDiv;
}
function refreshStorageListing() {
	var storageListMasterDivSub = document.getElementById("storageListingMasterContainerSub");
	var storageListMasterDiv = document.getElementById("storageListingMasterContainer");
	storageListMasterDiv.removeChild(storageListMasterDivSub);
	storageListMasterDivSub = document.createElement("div");
	storageListMasterDivSub.id = "storageListingMasterContainerSub";
	var keys = getLocalStorageKeys();
	var blobPairs = [];
	for (var index = 0; index < keys.length; ++index) {
		blobPairs[index] = getBlobPreEncoded(keys[index]);
		storageListMasterDivSub.appendChild(outputLocalStorageRequestLink(keys[index]));
	}
	storageListMasterDiv.appendChild(storageListMasterDivSub);
	const linkToManipulate = document.getElementById("download_local_storage_dba") as HTMLAnchorElement;
	linkToManipulate.href = "data:application/octet-stream;base64," + base64(io.generateMultiBlob(blobPairs));
	linkToManipulate.download = "gameboy_color_saves.export";
}
function getBlobPreEncoded(keyName) {
	if (keyName.substring(0, 9) == "B64_SRAM_") {
		return [keyName.substring(4), base64_decode(findValue(keyName))];
	}
	else if (keyName.substring(0, 5) == "SRAM_") {
		return [keyName, convertToBinary(findValue(keyName))];
	}
	else {
		return [keyName, JSON.stringify(findValue(keyName))];
	}
}
function outputLocalStorageRequestLink(keyName) {
	var linkNode = generateLink("javascript:popupStorageDialog(\"" + keyName + "\")", keyName);
	var storageContainerDiv = document.createElement("div");
	storageContainerDiv.className = "storageListingContainer";
	storageContainerDiv.appendChild(linkNode)
	return storageContainerDiv;
}

// @ts-ignore
function popupStorageDialog(keyName) {
	var subContainer = document.getElementById("storagePopupMasterContainer");
	var parentContainer = document.getElementById("storagePopupMasterParent");
	parentContainer.removeChild(subContainer);
	subContainer = document.createElement("div");
	subContainer.id = "storagePopupMasterContainer";
	parentContainer.appendChild(subContainer);
	var downloadDiv = document.createElement("div");
	downloadDiv.id = "storagePopupDownload";
	if (keyName.substring(0, 9) == "B64_SRAM_") {
		var downloadDiv2 = document.createElement("div");
		downloadDiv2.id = "storagePopupDownloadRAW";
		downloadDiv2.appendChild(outputLocalStorageLink("Download RAW save data.", findValue(keyName), keyName));
		subContainer.appendChild(downloadDiv2);
		downloadDiv.appendChild(outputLocalStorageLink("Download in import compatible format.", base64(io.generateBlob(keyName.substring(4), base64_decode(findValue(keyName)))), keyName));
	}
	else if (keyName.substring(0, 5) == "SRAM_") {
		var downloadDiv2 = document.createElement("div");
		downloadDiv2.id = "storagePopupDownloadRAW";
		downloadDiv2.appendChild(outputLocalStorageLink("Download RAW save data.", base64(convertToBinary(findValue(keyName))), keyName));
		subContainer.appendChild(downloadDiv2);
		downloadDiv.appendChild(outputLocalStorageLink("Download in import compatible format.", base64(io.generateBlob(keyName, convertToBinary(findValue(keyName)))), keyName));
	}
	else {
		downloadDiv.appendChild(outputLocalStorageLink("Download in import compatible format.", base64(io.generateBlob(keyName, JSON.stringify(findValue(keyName)))), keyName));
	}
	var deleteLink = generateLink("javascript:deleteStorageSlot(\"" + keyName + "\")", "Delete data item from HTML5 local storage.");
	deleteLink.id = "storagePopupDelete";
	subContainer.appendChild(downloadDiv);
	subContainer.appendChild(deleteLink);
	windowStacks[6].show();
}

function convertToBinary(jsArray) {
	var length = jsArray.length;
	var binString = "";
	for (var indexBin = 0; indexBin < length; indexBin++) {
		binString += String.fromCharCode(jsArray[indexBin]);
	}
	return binString;
}

// @ts-ignore
function deleteStorageSlot(keyName) {
	deleteValue(keyName);
	windowStacks[6].hide();
	refreshStorageListing();
}
function generateLink(address, textData) {
	var link = document.createElement("a");
	link.href = address;
	link.appendChild(document.createTextNode(textData));
	return link;
}
function generateDownloadLink(address, textData, keyName) {
	var link = generateLink(address, textData);
	link.download = keyName + ".sav";
	return link;
}
function getLocalStorageKeys() {
	var storageLength = checkStorageLength();
	var keysFound = [];
	var index = 0;
	var nextKey = null;
	while (index < storageLength) {
		nextKey = findKey(index++);
		if (nextKey !== null && nextKey.length > 0) {
			if (nextKey.substring(0, 5) == "SRAM_" || nextKey.substring(0, 9) == "B64_SRAM_" || nextKey.substring(0, 7) == "FREEZE_" || nextKey.substring(0, 4) == "RTC_") {
				keysFound.push(nextKey);
			}
		}
		else {
			break;
		}
	}
	return keysFound;
}
