const selectors = {
	container: "[data-js-container]",
	square: "[data-js-square]",
};

const sizing = {
	width: 20,
	height: 20,
};

const color = ["#113093", "#2858E3", "#B73EC2", "#741E47", "#B32B35"];
const normalColor = "#1d1d1d";
const boxShadowColor = "#000";
const colorLength = color.length;
const container = document.querySelector(selectors.container);
const square = `<div class="square" data-js-square></div>`;
const gridTemplate = `repeat(${sizing.width}, 1fr)`;
const timeouts = new Map();

function getRandomColor(length) {
	const randomColorIndex = Math.floor(Math.random() * length);
	return color[randomColorIndex];
}

function createBoard(sizing) {
	container.style.gridTemplateColumns = gridTemplate;
	let board = "";
	for (let y = 0; y < sizing.height; y++) {
		for (let x = 0; x < sizing.width; x++) {
			board += square;
		}
	}
	container.innerHTML = board;
}

createBoard(sizing);
const squares = document.querySelectorAll(selectors.square);

function removeColor(square) {
	square.style.backgroundColor = normalColor;
	square.style.boxShadow = `0 0 2px ${boxShadowColor}`;
}

function setColor() {
	const color = getRandomColor(colorLength);
	const square = this;
	if (timeouts.has(square)) {
		clearTimeout(timeouts.get(square));
	}
	square.style.backgroundColor = color;
	square.style.boxShadow = `0 0 2px ${color}, 0 0 10px ${color}`;
	const timeoutId = setTimeout(() => {
		removeColor(square);
		timeouts.delete(square);
	}, 3000);
	timeouts.set(square, timeoutId);
}

squares.forEach((square) => {
	square.addEventListener("mouseenter", setColor);
});

//
