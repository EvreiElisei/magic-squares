const selectors = {
	container: "[data-js-container]",
	square: "[data-js-square]",
	inner: "data-js-inner",
	board: "data-js-board",
	controlPanel: "data-js-control-panel",
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
	constructor(id, selectors, sizing, colors, normalColor, boxShadowColor, resetDelay = 3000) {
		this.id = id;
		this.selectors = selectors;
		this.sizing = { ...sizing };
		this.colors = [...colors];
		this.defaultColors = [...colors];
		this.defaultSizing = { ...sizing };
		this.normalColor = normalColor;
		this.resetDelay = resetDelay;
		this.timeouts = new Map();
		this.container = null;
		this.board = document.createElement("div");
		this.inner = document.createElement("div");
		this.squares = [];
		this.boxShadowColor = boxShadowColor;
		this.controlPanel = null;
		this.init();
	}

	init() {
		this.board.className = "board";
		this.board.setAttribute(this.selectors.board, this.id);

		this.inner.className = "inner";
		this.inner.setAttribute(this.selectors.inner, "");

		this.container = document.querySelector(this.selectors.container);
		if (!this.container) {
			console.error("Container not found!");
			return;
		}

		this.createBoard();
		this.attachEvents();
		this.createControlPanel();
	}

	createControlPanel() {
		const panelContainer = document.querySelector(`[${this.selectors.board}="${this.id}"]`);
		this.controlPanel = document.createElement("div");
		this.controlPanel.className = "control-panel";
		this.controlPanel.setAttribute(selectors.controlPanel, "");
		this.controlPanel.innerHTML = `
			<h2>🎮 Доска #${this.id}</h3>
			
			<div class="control-group">
				<label>Размер сетки:</label>
				<input type="number" class="width-input" min="1" max="50" value="${this.sizing.width}">
				<span>×</span>
				<input type="number" class="height-input" min="1" max="50" value="${this.sizing.height}">
				<button class="resize-btn">Изменить</button>
			</div>

			<div class="control-group">
				<label>Добавить цвет:</label>
				<input type="color" class="new-color" value="#FF6B6B">
				<button class="add-color-btn">➕ Добавить</button>
			</div>

			<div class="control-group">
				<label>Палитра:</label>
				<ul class="color-list">
					
				</ul>
			</div>

			<div class="control-group">
				<label>Задержка сброса:</label>
				<input type="range" class="delay-range" min="500" max="5000" step="100" value="${this.resetDelay}">
				<span class="delay-value">${this.resetDelay}ms</span>
			</div>

			<div class="control-group">
				<button class="reset-board-btn">🔄 Сбросить доску</button>
				<button class="reset-colors-btn">🎨 Сбросить цвета</button>
			</div>

			
		`;
		panelContainer.appendChild(this.controlPanel);
		this.attachControlEvents();
		this.updateColorList();
	}

	attachControlEvents() {
		if (!this.controlPanel) return;

		const resizeBtn = this.controlPanel.querySelector(".resize-btn");
		const widthInput = this.controlPanel.querySelector(".width-input");
		const heightInput = this.controlPanel.querySelector(".height-input");

		resizeBtn.addEventListener("click", () => {
			const newWidth = parseInt(widthInput.value);
			const newHeight = parseInt(heightInput.value);
			if (newHeight > 0 && newWidth > 0) {
				this.resizeBoard(newWidth, newHeight);
			}
		});

		const addColorBtn = this.controlPanel.querySelector(".add-color-btn");
		const newColorInput = this.controlPanel.querySelector(".new-color");
		const resetBoardBtn = this.controlPanel.querySelector(".reset-board-btn");
		const resetColorsBtn = this.controlPanel.querySelector(".reset-colors-btn");
		const delayRange = this.controlPanel.querySelector(".delay-range");
		const delayValue = this.controlPanel.querySelector(".delay-value");

		delayRange.addEventListener("input", (event) => {
			const newDelay = parseInt(event.target.value);
			delayValue.textContent = `${newDelay}ms`;
			this.setResetDelay(newDelay);
		});
		addColorBtn.addEventListener("click", () => {
			const newColor = newColorInput.value;
			this.addColor(newColor);
			this.updateColorList();
		});

		resetBoardBtn.addEventListener("click", () => {
			this.resizeBoard(this.defaultSizing.width, this.defaultSizing.height);
		});
		resetColorsBtn.addEventListener("click", () => {
			this.resetColors();
		});
	}

	updateColorList() {
		if (!this.controlPanel) return;

		const colorList = this.controlPanel.querySelector(".color-list");
		if (!colorList) return;

		colorList.innerHTML = "";

		this.colors.forEach((color, index) => {
			const colorItem = document.createElement("li");
			colorItem.classList = "color-item";

			const input = document.createElement("input");
			input.classList = "color-item-box";
			input.type = "color";
			input.value = color;
			input.id = `color-input-${index}`;

			const label = document.createElement("label");
			label.classList = "color-item-label";
			label.textContent = color;
			label.for = `color-iput-${index}`;

			input.addEventListener("change", (event) => {
				this.colors[index] = event.target.value;
				label.textContent = event.target.value;
			});

			colorItem.addEventListener("dblclick", (event) => {
				if (this.colors.length > 1) {
					this.colors.splice(index, 1);
					this.updateColorList();
				} else {
					alert("Нельзя удалить последний цвет!");
				}
			});

			colorItem.appendChild(input);
			colorItem.appendChild(label);
			colorList.appendChild(colorItem);
		});
	}

	getRandomColorFromArray() {
		const randomIndex = Math.floor(Math.random() * this.colors.length);
		return this.colors[randomIndex];
	}

	createBoard() {
		const width = this.sizing.width;
		const height = this.sizing.height;
		this.inner.style.gridTemplateColumns = `repeat(${width}, 16px)`;

		const totalSquares = height * width;
		const squaresHTML = Array(totalSquares)
			.fill(`<div class="square" data-js-square></div>`)
			.join("");

		this.inner.innerHTML = squaresHTML;

		this.board.innerHTML = "";
		this.board.appendChild(this.inner);
		this.container.appendChild(this.board);
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

	resizeBoard(newWidth, newHeight) {
		// сделать использование через интерфейс
		this.sizing.width = newWidth;
		this.sizing.height = newHeight;

		this.clearAllTimers();

		this.init();
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

	resetColors() {
		this.colors = [...this.defaultColors];
		console.log(this.defaultColors);
		this.updateColorList();
	}
}

const board = new ColorBoard(1, selectors, sizing, colors, normalColor, boxShadowColor, resetDelay);
