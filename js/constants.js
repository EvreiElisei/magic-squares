export const SELECTORS = {
	container: "data-js-container",
	square: "data-js-square",
	inner: "data-js-inner",
	board: "data-js-board",
	controlPanel: "data-js-control-panel",

	ui: {
		resizeBtn: "data-action='resize'",
		addColorBtn: "data-action='add-color'",
		resetColorsBtn: "data-action='reset-colors'",
		resetBoardBtn: "data-action='reset-board'",
		widthInput: "data-control='width'",
		heightInput: "data-control='height'",
		newColorInput: "data-control='new-color'",
		delayRange: "data-control='delay-range'",
		delayValue: "data-control='delay-value'",
		colorList: "data-component='color-list'",
	},
	setAttribute: {
		attr: "data-component",
		colorItem: "colorItem",
		colorInput: "color-input",
		colorLabel: "color-label",
	},
};

export const STYLE_CLASSES = {
	board: "board",
	inner: "inner",
	square: "square",
	controlPanel: "control-panel",
	colorItem: "color-item",
	colorList: "color-list",
};

export const DEFAULTS = {
	squareSize: 16,
	width: 20,
	height: 20,
	resetDelay: 3000,
	normalColor: "#1d1d1d",
	boxShadowColor: "#000",
};

export const DEFAULT_COLORS = ["#1F1AB2", "#DE0052", "#78E700", "#FFC200"];

export const DOM_HElPERS = {
	attr: (name) => name,
	sel: (name) => `[${name}]`,
};
