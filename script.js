const selectors = {
	container: "[data-js-container]",
	square: "[data-js-square]",
	inner: "data-js-inner",
};

const sizing = {
	width: 20,
	height: 20,
};

const colors = ["#113093", "#2858E3", "#B73EC2", "#741E47", "#B32B35"];
const normalColor = "#1d1d1d";
const boxShadowColor = "#000";
const colorLength = colors.length;
const resetDelay = 3000;
class ColorBoard {
	constructor(selectors, sizing, colors, normalColor, boxShadowColor, resetDelay = 3000) {
		this.selectors = selectors;
		this.sizing = sizing;
		this.colors = colors;
		this.normalColor = normalColor;
		this.resetDelay = resetDelay;
		this.timeouts = new Map();
		this.container = null;
		this.inner = document.createElement("div");
		this.squares = [];
		this.boxShadowColor = boxShadowColor;
		this.init();
	}

	init() {
		this.inner.className = "inner";
		this.inner.setAttribute(selectors.inner, "");
		this.container = document.querySelector(this.selectors.container);
		if (!this.container) {
			console.error("Container not found!");
			return;
		}

		this.createBoard();
		this.attachEvents();
	}

	getRandomColorFromArray() {
		const randomIndex = Math.floor(Math.random() * this.colors.length);
		return this.colors[randomIndex];
	}

	createBoard() {
		const width = this.sizing.width;
		const height = this.sizing.height;
		this.inner.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

		const totalSquares = height * width;
		const squaresHTML = Array(totalSquares)
			.fill(`<div class="square" data-js-square></div>`)
			.join("");

		this.inner.innerHTML = squaresHTML;
		this.container.appendChild(this.inner);
		this.squares = Array.from(this.container.querySelectorAll(this.selectors.square));
	}

	getNormalColor(square) {
		square.style.backgroundColor = this.normalColor;
		square.style.boxShadow = `0 0 2px ${this.boxShadowColor}`;
	}

	handleMouseEnter(square) {
		if (this.timeouts.has(square)) {
			clearTimeout(this.timeouts.get(square));
		}
		const color = this.getRandomColorFromArray();
		square.style.backgroundColor = color;
		square.style.boxShadow = `0 0 2px ${color}, 0 0 10px ${color}`;

		const timeoutId = setTimeout(() => {
			this.getNormalColor(square);
			this.timeouts.delete(square);
		}, this.resetDelay);

		this.timeouts.set(square, timeoutId);
	}

	attachEvents() {
		this.squares = document.querySelectorAll(this.selectors.square);

		this.squares.forEach((square) => {
			square.addEventListener("mouseenter", () => this.handleMouseEnter(square));
		});
	}

	clearSquareTimer(square) {
		if (this.timeouts.has(square)) {
			clearTimeout(this.timeouts.get(square));
			this.timeouts.delete(square);
		}
	}

	clearAllTimers() {
		this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
		this.timeouts.clear();
	}

	resetBoard() {
		// ??????
		this.clearAllTimers();

		this.squares.forEach((square) => {
			this.getNormalColor(square);
		});
	}

	resizeBoard(newWidth, newHeight) {
		// сделать использование через интерфейс
		this.sizing.width = newWidth;
		this.sizing.height = newHeight;

		this.clearAllTimers();

		this.createBoard();
		this.attachEvents();
	}

	destroyBoard() {
		this.clearAllTimers();

		this.container.removeEventListener("mouseenter", () => this.handleContainerMouseEnter);
		this.handleContainerMouseEnter = null;
		this.container.innerHTML = "";
		this.container = null;
		this.timeouts.clear();
	}

	addColor(color) {
		this.colors.push(color);
	}

	setResetDelay(delay) {
		this.resetDelay = delay;
	}
}

const board = new ColorBoard(selectors, sizing, colors, normalColor, boxShadowColor, resetDelay);
const board1 = new ColorBoard(selectors, sizing, colors, normalColor, boxShadowColor, resetDelay);
