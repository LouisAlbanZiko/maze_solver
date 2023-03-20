document.addEventListener('DOMContentLoaded', OnLoad, false);

const MAZE_COLORS = ['#101010',		'#C0C0C0',		'#336FE8',			'#39C934'			];
const MAZE_STATE =  {'WALL' : 0,	'PATH' : 1,		'VISITED' : 2,		'CURRENT_PATH' : 3	};
const MAZE_STATE_LIST = [];
Object.keys(MAZE_STATE).forEach(key => MAZE_STATE_LIST.push(key));

var CTX, CANVAS, MAZE_GRID;
let W = 100;
let H = 100;

function OnLoad() {
	CANVAS = document.getElementById('canvas');
	CTX = CANVAS.getContext("2d", { alpha: false });

	gen_grid();
	console.log(MAZE_GRID);
	draw_grid();
}

function gen_grid() {
	MAZE_GRID = Array(W * H).fill(0);

	let xMainPath = getRandomInt(0, W);
	dfs(xMainPath, 0, 0, true);

	let chance = 2;
	for(let x = 0; x < W; x++) {
		if(MAZE_GRID[x] == 0) {
			if(happens(chance)) {
				dfs(x, 0, 0, false);
				chance = 2;
			} else {
				chance += 0.1;
			}
		}
	}
}

function dfs(x, y, depth, main_path=false) {
	if((main_path && (y == H - 1)) || (!main_path && (y > H - H / 6))) { return; }

	MAZE_GRID[x + y * W] = 1;

	const directions = [[0, 1, 50], [-1, 0, 20], [1, 0, 20], [0, -1, 10]];
	let rand_nr = getRandomInt(0, 100);
	let start_nr = 0;
	for(let [xdir, ydir, chance] of directions) {
		let path_length = getRandomInt(1, Math.min(W * 0.2, H * 0.2, 15));

		let xnew = x + xdir * path_length;
		while(xnew < 0 || xnew >= W) { path_length--; xnew = x + xdir * path_length; }

		let ynew = y + ydir * path_length;
		while(ynew < 0 || ynew >= H) { path_length--; ynew = y + ydir * path_length; }

		if(rand_nr < start_nr + chance) {
			for(let diff = 1; diff <= path_length; diff++) {
				MAZE_GRID[(x + xdir * diff) + (y + ydir * diff) * W] = 1;
			}
			dfs(xnew, ynew, depth + 1, main_path);
			if(main_path && happens(5)) {
				dfs(x, y, depth + 1, false);
			}
			break;
		}
		start_nr += chance;
	}
	/*let dir_index, xnew, ynew, xdir, ydir, path_length;
	do {
		path_length = getRandomInt(1, Math.min(W * 0.1, H * 0.1, 15));
		dir_index = getRandomInt(0, directions.length);

		let dir = directions[dir_index]
		xdir = dir[0];
		ydir = dir[1];

		xnew = x + xdir * path_length;
		while(xnew < 0 || xnew >= W) { path_length--; xnew = x + xdir * path_length; }

		ynew = y + ydir * path_length;
		while(ynew < 0 || ynew >= H) { path_length--; ynew = y + ydir * path_length; }

		directions.splice(dir_index, 1);
	} while(directions.length !== 0 && MAZE_GRID[xnew + ynew * W] !== 0)
	
	if(directions.length !== 0) {
		for(let diff = 1; diff <= path_length; diff++) {
			MAZE_GRID[(x + xdir * diff) + (y + ydir * diff) * W] = 1;
		}
		dfs(xnew, ynew, false);
		if(main_path && directions.length > 2 && happens(10)) {
			dfs(x, y);
		}
	}*/
}

function generate() {
	VISITED_GRID = [];
	CURRENT_PATH = [];
	gen_grid();
	window.requestAnimationFrame(draw_grid);
}

let TIME = 1000 / 60;
let VISITED_GRID, CURRENT_PATH;
async function solve() {
	let path = await solve_maze(W, H, MAZE_GRID, async (callback, visited_grid, current_path) => {
		return await new Promise(async (resolve, reject) => {
			VISITED_GRID = visited_grid;
			CURRENT_PATH = current_path;
			window.requestAnimationFrame(async () => {
				draw_grid();
				draw_visited_grid(VISITED_GRID);
				draw_current_path(CURRENT_PATH);
			});
			setTimeout(async () => {
				let val = await callback();
				window.requestAnimationFrame(async () => {
					draw_grid();
					draw_visited_grid(VISITED_GRID);
					draw_current_path(CURRENT_PATH);
				});
				setTimeout(async () => {
					resolve(val);
				}, TIME);
			}, TIME);
		});
	});
	console.log(path);
}

function draw_grid() {
	CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
	let cell_width = CANVAS.width / W;
	let cell_height = CANVAS.height / H;
	for(let y = 0; y < H; y++) {
		for(let x = 0; x < W; x++) {
			CTX.fillStyle = MAZE_COLORS[MAZE_GRID[x + y * W]];
			CTX.fillRect(x * cell_width, y * cell_height, cell_width, cell_height);
		}
	}
}

function draw_visited_grid(grid) {
	let cell_width = CANVAS.width / W;
	let cell_height = CANVAS.height / H;
	for(let y = 0; y < H; y++) {
		for(let x = 0; x < W; x++) {
			if (grid[x + y * W]) {
				CTX.fillStyle = MAZE_COLORS[MAZE_STATE['VISITED']];
				CTX.fillRect(x * cell_width, y * cell_height, cell_width, cell_height);
			}
		}
	}
}

function draw_current_path(path) {
	let cell_width = CANVAS.width / W;
	let cell_height = CANVAS.height / H;
	for(let i = 0; i < path.length; i++) {
		let pos = path[i];
		CTX.fillStyle = MAZE_COLORS[MAZE_STATE['CURRENT_PATH']];
		CTX.fillRect(pos.x * cell_width, pos.y * cell_height, cell_width, cell_height);
	}
}

function normal_distribution(nr) {
	return nr;
}

function happens(percent, distribution = normal_distribution) {
	return distribution(getRandomInt(0, 100)) < percent;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


