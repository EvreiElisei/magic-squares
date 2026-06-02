import ColorBoard from "./colorBoard.js";
import { SELECTORS, DEFAULTS, DEFAULT_COLORS } from "./constants.js";

// Конфигурация с явными значениями
const boardConfig = {
	selectors: SELECTORS,
	sizing: {
		width: 20,
		height: 20,
	},
	squareSize: DEFAULTS.squareSize,
	colors: [...DEFAULT_COLORS],
	normalColor: DEFAULTS.normalColor,
	boxShadowColor: DEFAULTS.boxShadowColor,
	resetDelay: DEFAULTS.resetDelay,
};

// Создание доски
const board = new ColorBoard(1, boardConfig);
