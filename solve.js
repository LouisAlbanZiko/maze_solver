async function solve_maze(
	w,				// width of the grid
	h,				// height of the grid
	maze_grid,		// the array containing the maze in 0 (wall) or 1 (path) representation; data at a specific position is accessed like so: maze_grid[x + y * W]
	defer			// function to be used for rendering
) {
	let visited_grid = Array(w * h).fill(false);
	for(let x = 0; x < w; x++) { // go through the first row to find the entries to the maze
		if(maze_grid[x + 0 * W] == 1) { // if cell is a path
			let current_path = [ {x: x, y: 0} ]; 
			let path_found = await solve_dfs(x, 0, visited_grid, current_path, w, h, maze_grid, defer); // call depth first search
			if(path_found) {
				return current_path;
			}
		}
	}
	return [];
}

async function solve_dfs(
	x,				// current x coordinate to look at
	y,				// current y coordinate to look at
	visited_grid,	// grid of booleans marking whether we have visited the position
	current_path,	// array of vertices of the path we curently are on

	// same as for solve_maze
	w,
	h,
	maze_grid,
	defer
) {
	if (y == h - 1) { // if on last row
		return true; // exit found
	}

	visited_grid[x + y * w] = true; // set current position as visited

	const directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];
	for(let [xdir, ydir] of directions) {
		let xnew = x + xdir;
		if(xnew < 0 || xnew >= w) { continue; }

		let ynew = y + ydir;
		if(ynew < 0 || ynew >= h) { continue; }

		let indexnew = xnew + ynew * w;
		if(maze_grid[indexnew] === 1 && visited_grid[indexnew] === false) { // if new position is empty and hasn't been visited before
			current_path.push({ x: xnew, y: ynew }); // add new position to array of positions

			let path_found = await defer(async () => {
				return await solve_dfs(xnew, ynew, visited_grid, current_path, w, h, maze_grid, defer);
			}, visited_grid, current_path) // wrap the recursive call in defer for rendering

			if(path_found) {
				return true;
			}
			
			current_path.pop(); // if the path is a dead end remove position from array of positions
		}

	}
	// dead end return false
	return false;
}
