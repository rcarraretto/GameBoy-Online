const { cout } = require('./terminal');

function addEvent(sEvent, oElement, fListener) {
	try {
		oElement.addEventListener(sEvent, fListener, false);
		cout("In addEvent() : Standard addEventListener() called to add a(n) \"" + sEvent + "\" event.", -1);
	}
	catch (error) {
		console.error(error);
		oElement.attachEvent("on" + sEvent, fListener);	//Pity for IE.
		cout("In addEvent() : Nonstandard attachEvent() called to add an \"on" + sEvent + "\" event.", -1);
	}
}
function removeEvent(sEvent, oElement, fListener) {
	try {
		oElement.removeEventListener(sEvent, fListener, false);
		cout("In removeEvent() : Standard removeEventListener() called to remove a(n) \"" + sEvent + "\" event.", -1);
	}
	catch (error) {
		oElement.detachEvent("on" + sEvent, fListener);	//Pity for IE.
		cout("In removeEvent() : Nonstandard detachEvent() called to remove an \"on" + sEvent + "\" event.", -1);
	}
}

function isSameNode(oCheck1, oCheck2) {
	return (typeof oCheck1.isSameNode == "function") ? oCheck1.isSameNode(oCheck2) : (oCheck1 === oCheck2);
}

//Some wrappers and extensions for non-DOM3 browsers:
function isDescendantOf(ParentElement, toCheck) {
	if (!ParentElement || !toCheck) {
		return false;
	}
	//Verify an object as either a direct or indirect child to another object.
	function traverseTree(domElement) {
		while (domElement != null) {
			if (domElement.nodeType == 1) {
				if (isSameNode(domElement, toCheck)) {
					return true;
				}
				if (hasChildNodes(domElement)) {
					if (traverseTree(domElement.firstChild)) {
						return true;
					}
				}
			}
			domElement = domElement.nextSibling;
		}
		return false;
	}
	return traverseTree(ParentElement.firstChild);
}

function hasChildNodes(oElement) {
	return (typeof oElement.hasChildNodes == "function") ? oElement.hasChildNodes() : ((oElement.firstChild != null) ? true : false);
}

function popupMenu(oClick, oMenu) {
	this.clickElement = oClick;
	this.menuElement = oMenu;
	var thisObj2 = this;
	this.eventHandle = [
		function (event) { thisObj2.startPopup(event); },
		function (event) { thisObj2.endPopup(event); }
	];
	this.open = false;
	addEvent("click", this.clickElement, this.eventHandle[0]);
}
popupMenu.prototype.startPopup = function (event) {
	if (!this.open) {
		this.open = true;
		this.menuElement.style.display = "block";
		removeEvent("click", this.clickElement, this.eventHandle[0]);
		this.position(event);
		addEvent("mouseout", this.menuElement, this.eventHandle[1]);
	}
}
popupMenu.prototype.endPopup = function (event) {
	if (this.open) {
		if (mouseLeaveVerify(this.menuElement, event)) {
			this.open = false;
			this.menuElement.style.display = "none";
			removeEvent("mouseout", this.menuElement, this.eventHandle[1]);
			addEvent("click", this.clickElement, this.eventHandle[0]);
		}
	}
}
popupMenu.prototype.position = function (event) {
	if (this.open) {
		this.menuElement.style.left = (pageXCoord(event) - 5) + "px";
		this.menuElement.style.top = (pageYCoord(event) - 5) + "px";
	}
}

function pageXCoord(event) {
	if (typeof event.pageX == "undefined") {
		return event.clientX + document.documentElement.scrollLeft;
	}
	return event.pageX;
}

function pageYCoord(event) {
	if (typeof event.pageY == "undefined") {
		return event.clientY + document.documentElement.scrollTop;
	}
	return event.pageY;
}

function mouseLeaveVerify(oElement, event) {
	//Hook target element with onmouseout and use this function to verify onmouseleave.
	return isDescendantOf(oElement, (typeof event.target != "undefined") ? event.target : event.srcElement) && !isDescendantOf(oElement, (typeof event.relatedTarget != "undefined") ? event.relatedTarget : event.toElement);
}

function showAlert(error) {
	console.error(error);
	alert('Unexpected error');
}

module.exports = {
	addEvent,
	removeEvent,
	isSameNode,
	isDescendantOf,
	popupMenu,
	showAlert,
};
