import { SELECTORS, STYLE_CLASSES, DEFAULTS, DEFAULT_COLORS, DOM_HElPERS } from "./constants.js";

class ColorBoard {
	constructor(id, config = {}) {
		this.id = id;

		const {
			selectors = SELECTORS,
			sizing = { width: DEFAULTS.width, height: DEFAULTS.height },
			colors = [...DEFAULT_COLORS],
			normalColor = DEFAULTS.normalColor,
			boxShadowColor = DEFAULTS.boxShadowColor,
			resetDelay = DEFAULTS.resetDelay,
			squareSize = DEFAULTS.squareSize,
		} = config;

		this.selectors = selectors;
		this.sizing = { ...sizing };
		this.defaultSizing = { ...sizing };
		this.colors = [...colors];
		this.defaultColors = [...colors];
		this.normalColor = normalColor;
		this.boxShadowColor = boxShadowColor;
		this.resetDelay = resetDelay;
		this.squareSize = squareSize;

		this.timeouts = new Map();
		this.container = null;
		this.board = null;
		this.inner = null;
		this.squares = [];
		this.controlPanel = null;

		this.init();
	}

	init() {
		this.container = document.querySelector(DOM_HElPERS.sel(this.selectors.container));
		if (!this.container) {
			console.error(`Container ${this.selectors.container} not found!`);
			return;
		}

		this.createBoardElements();
		this.createBoard();
		this.createControlPanel();
		this.attachEvents();
	}

	createBoardElements() {
		this.board = document.createElement("div");
		this.board.className = STYLE_CLASSES.board;
		this.board.setAttribute(this.selectors.board, this.id);

		this.inner = document.createElement("div");
		this.inner.className = STYLE_CLASSES.inner;
		this.inner.setAttribute(this.selectors.inner, "");
	}

	createBoard() {
		const { width, height } = this.sizing;
		const squareSize = this.squareSize;
		this.inner.style.gridTemplateColumns = `repeat(${width}, ${squareSize}px)`;

		const totalSquares = height * width;
		const squaresHTML = Array(totalSquares)
			.fill(`<div class="${STYLE_CLASSES.square}" ${this.selectors.square}></div>`)
			.join("");

		this.inner.innerHTML = squaresHTML;
		this.board.innerHTML = "";
		this.board.appendChild(this.inner);
		this.container.appendChild(this.board);

		this.refreshSquares();
	}

	createControlPanel() {
		const boardElement = document.querySelector(`[${this.selectors.board}="${this.id}"]`);
		if (!boardElement) return;

		this.controlPanel = document.createElement("div");
		this.controlPanel.className = STYLE_CLASSES.controlPanel;
		this.controlPanel.setAttribute(this.selectors.controlPanel, "");

		this.controlPanel.innerHTML = this.getControlPanelHTML();
		boardElement.appendChild(this.controlPanel);

		this.attachControlEvents();
		this.updateColorList();
	}

	getControlPanelHTML() {
		return `
		<h2>🎮 Доска #${this.id}</h2>
      
    	 <div class="control-group">
        <label for="${this.selectors.ui.widthInput}">Размер сетки:</label>
        <input id="${this.selectors.ui.widthInput}" type="number" ${this.selectors.ui.widthInput} min="1" max="50" value="${this.sizing.width}">
        <span>×</span>
        <input id="${this.selectors.ui.heightInput}" type="number" ${this.selectors.ui.heightInput} min="1" max="50" value="${this.sizing.height}">
        <button data-action="resize">Изменить</button>
      </div>

      <div class="control-group">
        <label for="${this.selectors.ui.newColorInput}">Добавить цвет:</label>
        <input id="${this.selectors.ui.newColorInput}" type="color" ${this.selectors.ui.newColorInput} value="#FF6B6B">
        <button data-action="add-color">➕ Добавить</button>
      </div>

      <div class="control-group">
			 <div class="control-group-inner">
			 	<h3>Палитра:</h3>
        <ul  class="${STYLE_CLASSES.colorList}" ${this.selectors.ui.colorList}></ul>
			 </div>
        
      </div>

      <div class="control-group">
        <label for="${this.selectors.ui.delayRange}">Задержка сброса:</label>
        <input id="${this.selectors.ui.delayRange}" type="range" ${this.selectors.ui.delayRange} min="500" max="5000" step="100" value="${this.resetDelay}">
        <span data-control="delay-value">${this.resetDelay}ms</span>
      </div>

      <div class="control-group">
        <button data-action="reset-board">🔄 Сбросить доску</button>
        <button data-action="reset-colors">🎨 Сбросить цвета</button>
      </div>
		`;
	}

	attachControlEvents() {
		if (!this.controlPanel) return;

		this.controlPanel.addEventListener("click", (event) => {
			const action = event.target.dataset.action;

			switch (action) {
				case "resize":
					this.handleResize();
					break;
				case "add-color":
					this.handleAddColor();
					break;
				case "reset-board":
					this.resizeBoard(this.defaultSizing.width, this.defaultSizing.height);
					break;
				case "reset-colors":
					this.resetColors();
					break;
			}
		});

		const delayRange = this.controlPanel.querySelector(
			DOM_HElPERS.sel(this.selectors.ui.delayRange),
		);
		if (delayRange) {
			delayRange.addEventListener("input", (event) => {
				const newDelay = parseInt(event.target.value);
				this.setResetDelay(newDelay);
				this.updateDelayValue(newDelay);
			});
		}
	}

	handleResize() {
		const widthInput = this.controlPanel.querySelector(
			DOM_HElPERS.sel(this.selectors.ui.widthInput),
		);
		const heightInput = this.controlPanel.querySelector(
			DOM_HElPERS.sel(this.selectors.ui.heightInput),
		);

		const newWidth = parseInt(widthInput?.value);
		const newHeight = parseInt(heightInput?.value);

		if (newHeight > 0 && newWidth > 0) {
			this.resizeBoard(newWidth, newHeight);
		}
	}

	handleAddColor() {
		const newColorInput = this.controlPanel.querySelector(
			DOM_HElPERS.sel(this.selectors.ui.newColorInput),
		);
		if (newColorInput) {
			this.addColor(newColorInput.value);
			this.updateColorList();
		}
	}

	updateDelayValue(delay) {
		const delayValue = this.controlPanel.querySelector(
			DOM_HElPERS.sel(this.selectors.ui.delayValue),
		);
		if (delayValue) {
			delayValue.textContent = `${delay}ms`;
		}
	}

	updateColorList() {
		const colorList = this.controlPanel?.querySelector(
			DOM_HElPERS.sel(this.selectors.ui.colorList),
		);
		if (!colorList) return;

		colorList.innerHTML = "";

		this.colors.forEach((color, index) => {
			const colorItem = this.createColorItem(color, index);
			colorList.appendChild(colorItem);
		});
	}

	createColorItem(color, index) {
		const colorItem = document.createElement("li");
		colorItem.className = STYLE_CLASSES.colorItem;
		colorItem.setAttribute(this.selectors.setAttribute.attr, this.selectors.setAttribute.colorItem);

		const input = document.createElement("input");
		input.type = "color";
		input.value = color;
		input.setAttribute(this.selectors.setAttribute.attr, this.selectors.setAttribute.colorInput);

		const label = document.createElement("label");
		label.textContent = color;
		label.setAttribute(this.selectors.setAttribute.attr, this.selectors.setAttribute.colorLabel);

		input.addEventListener("change", (event) => {
			this.colors[index] = event.target.value;
			label.textContent = event.target.value;
		});

		colorItem.addEventListener("dblclick", () => {
			if (this.colors.length > 1) {
				this.colors.splice(index, 1);
				this.updateColorList();
			} else {
				console.warn("Нельзя удалить последний цвет!");
			}
		});

		colorItem.append(input, label);
		return colorItem;
	}

	refreshSquares() {
		this.squares = Array.from(
			this.container.querySelectorAll(DOM_HElPERS.sel(this.selectors.square)),
		);
	}

	getRandomColor() {
		const randomIndex = Math.floor(Math.random() * this.colors.length);
		return this.colors[randomIndex];
	}

	setNormalStyle(square) {
		square.style.backgroundColor = this.normalColor;
		square.style.boxShadow = `0 0 2px ${this.boxShadowColor}`;
	}

	setHiglightStyle(square, color) {
		square.style.backgroundColor = color;
		square.style.boxShadow = `0 0 2px ${color}, 0 0 10px ${color}`;
	}

	handleMouseEnter(square) {
		this.clearSquareTimer(square);

		const color = this.getRandomColor();
		this.setHiglightStyle(square, color);

		const timeoutId = setTimeout(() => {
			this.setNormalStyle(square);
			this.timeouts.delete(square);
		}, this.resetDelay);

		this.timeouts.set(square, timeoutId);
	}

	attachEvents() {
		this.squares.forEach((square) => {
			square.addEventListener("mouseenter", () => this.handleMouseEnter(square));
		});
	}

	clearSquareTimer(square) {
		const timeoutId = this.timeouts.get(square);
		if (timeoutId) {
			clearTimeout(timeoutId);
			this.timeouts.delete(square);
		}
	}

	clearAllTimers() {
		this.timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
		this.timeouts.clear();
	}

	resizeBoard(newWidth, newHeight) {
		this.sizing = { width: newWidth, height: newHeight };
		this.clearAllTimers();
		this.createBoard();
		this.attachEvents();
		this.createControlPanel();
	}

	addColor(color) {
		if (color && !this.colors.includes(color)) {
			this.colors.push(color);
		}
	}

	setResetDelay(delay) {
		if (delay >= 500 && delay <= 5000) {
			this.resetDelay = delay;
		}
	}

	resetColors() {
		this.colors = [...this.defaultColors];
		this.updateColorList();
	}
}

export default ColorBoard;
