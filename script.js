// script.js

// Global Variables
let currentCategory = '';
let currentAlgorithm = '';
let array = [];
let isRunning = false;
let isPaused = false;
let animationSpeed = 50;
let comparisons = 0;
let swaps = 0;

// Grid variables for pathfinding
let grid = [];
let startNode = null;
let endNode = null;
let wallMode = false;
let gridRows = 20;
let gridCols = 30;

// Algorithm definitions
const algorithms = {
    searching: [
        { name: 'Linear Search', function: linearSearch, complexity: { time: 'O(n)', space: 'O(1)' } },
        { name: 'Binary Search', function: binarySearch, complexity: { time: 'O(log n)', space: 'O(1)' } },
        { name: 'Depth-First Search', function: dfsArray, complexity: { time: 'O(n)', space: 'O(n)' } },
        { name: 'Breadth-First Search', function: bfsArray, complexity: { time: 'O(n)', space: 'O(n)' } }
    ],
    sorting: [
        { name: 'Bubble Sort', function: bubbleSort, complexity: { time: 'O(n²)', space: 'O(1)' } },
        { name: 'Selection Sort', function: selectionSort, complexity: { time: 'O(n²)', space: 'O(1)' } },
        { name: 'Insertion Sort', function: insertionSort, complexity: { time: 'O(n²)', space: 'O(1)' } },
        { name: 'Merge Sort', function: mergeSort, complexity: { time: 'O(n log n)', space: 'O(n)' } },
        { name: 'Quick Sort', function: quickSort, complexity: { time: 'O(n log n)', space: 'O(log n)' } },
        { name: 'Heap Sort', function: heapSort, complexity: { time: 'O(n log n)', space: 'O(1)' } }
    ],
    pathfinding: [
        { name: "Dijkstra's Algorithm", function: dijkstra, complexity: { time: 'O((V + E) log V)', space: 'O(V)' } },
        { name: 'A* Algorithm', function: aStar, complexity: { time: 'O((V + E) log V)', space: 'O(V)' } },
        { name: 'BFS Pathfinding', function: bfsPath, complexity: { time: 'O(V + E)', space: 'O(V)' } },
        { name: 'DFS Pathfinding', function: dfsPath, complexity: { time: 'O(V + E)', space: 'O(V)' } }
    ]
};

// Screen Navigation Functions
function showCategoryScreen(category) {
    currentCategory = category;
    document.getElementById('welcomeScreen').classList.remove('active');
    document.getElementById('selectionScreen').classList.add('active');
    
    const title = document.getElementById('categoryTitle');
    title.textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' Algorithms';
    
    const listContainer = document.getElementById('algorithmList');
    listContainer.innerHTML = '';
    
    algorithms[category].forEach(algo => {
        const btn = document.createElement('button');
        btn.className = 'algo-btn';
        btn.textContent = algo.name;
        btn.onclick = () => selectAlgorithm(algo);
        listContainer.appendChild(btn);
    });
}

function selectAlgorithm(algo) {
    currentAlgorithm = algo;
    document.getElementById('selectionScreen').classList.remove('active');
    document.getElementById('visualizationScreen').classList.add('active');
    document.getElementById('algorithmTitle').textContent = algo.name;
    
    // Update complexity display
    document.getElementById('timeComplexity').textContent = algo.complexity.time;
    document.getElementById('spaceComplexity').textContent = algo.complexity.space;
    
    // Show/hide appropriate controls
    document.getElementById('searchControls').style.display = 
        currentCategory === 'searching' ? 'flex' : 'none';
    document.getElementById('pathControls').style.display = 
        currentCategory === 'pathfinding' ? 'flex' : 'none';
    
    // Show/hide visualization containers
    document.getElementById('arrayContainer').style.display = 
        currentCategory === 'pathfinding' ? 'none' : 'flex';
    document.getElementById('gridContainer').style.display = 
        currentCategory === 'pathfinding' ? 'grid' : 'none';
    
    if (currentCategory === 'pathfinding') {
        initializeGrid();
    } else {
        generateNewArray();
    }
}

function goBack() {
    document.getElementById('selectionScreen').classList.remove('active');
    document.getElementById('welcomeScreen').classList.add('active');
}

function backToSelection() {
    resetVisualization();
    document.getElementById('visualizationScreen').classList.remove('active');
    document.getElementById('selectionScreen').classList.add('active');
}

// Array Generation and Display
function generateNewArray() {
    const size = parseInt(document.getElementById('arraySize').value);
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 100) + 1);
    }
    displayArray();
    resetStats();
}

function displayArray() {
    const container = document.getElementById('arrayContainer');
    container.innerHTML = '';
    
    if (array.length === 0) return;
    const maxVal = Math.max(...array);
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        // Use percentage height (so bars scale nicely)
        bar.style.height = `${(value / maxVal) * 100}%`;
        bar.setAttribute('data-index', index);
        container.appendChild(bar);
    });
}

// Control Functions
function updateArraySize() {
    const size = document.getElementById('arraySize').value;
    document.getElementById('arraySizeValue').textContent = size;
    if (!isRunning) {
        generateNewArray();
    }
}

function updateSpeed() {
    const speed = document.getElementById('speed').value;
    document.getElementById('speedValue').textContent = speed;
    animationSpeed = parseInt(speed);
}

function startVisualization() {
    if (isRunning) return;
    
    isRunning = true;
    isPaused = false;
    resetStats();
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('generateBtn').disabled = true;
    
    if (currentAlgorithm && currentAlgorithm.function) {
        // start the chosen algorithm (many are async)
        const fn = currentAlgorithm.function;
        // call without awaiting so startVisualization can return — fn will check isRunning internally
        fn();
    }
}

function pauseVisualization() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
}

function resetVisualization() {
    isRunning = false;
    isPaused = false;
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    const bars = document.querySelectorAll('.array-bar');
    bars.forEach(bar => {
        bar.classList.remove('comparing', 'swapping', 'sorted', 'found', 'searching');
    });
    
    if (currentCategory === 'pathfinding') {
        clearPathfinding();
    }
    
    resetStats();
}

function resetStats() {
    comparisons = 0;
    swaps = 0;
    document.getElementById('comparisons').textContent = '0';
    document.getElementById('swaps').textContent = '0';
}

// Utility Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForUnpause() {
    while (isPaused && isRunning) {
        await sleep(100);
    }
}

async function compareElements(i, j) {
    comparisons++;
    document.getElementById('comparisons').textContent = comparisons;
    
    const bars = document.querySelectorAll('.array-bar');
    if (!bars[i] || !bars[j]) return;
    bars[i].classList.add('comparing');
    bars[j].classList.add('comparing');
    
    await sleep(animationSpeed);
    await waitForUnpause();
    
    bars[i].classList.remove('comparing');
    bars[j].classList.remove('comparing');
}

async function swapElements(i, j) {
    swaps++;
    document.getElementById('swaps').textContent = swaps;
    
    const bars = document.querySelectorAll('.array-bar');
    if (!bars[i] || !bars[j]) return;
    bars[i].classList.add('swapping');
    bars[j].classList.add('swapping');
    
    await sleep(animationSpeed);
    await waitForUnpause();
    
    // Swap in array
    [array[i], array[j]] = [array[j], array[i]];
    
    // Update display
    displayArray();
}

async function markSorted(index) {
    const bars = document.querySelectorAll('.array-bar');
    if (bars[index]) bars[index].classList.add('sorted');
}

async function markFound(index) {
    const bars = document.querySelectorAll('.array-bar');
    if (bars[index]) bars[index].classList.add('found');
}

async function markSearching(index) {
    const bars = document.querySelectorAll('.array-bar');
    if (bars[index]) {
        bars[index].classList.add('searching');
        await sleep(animationSpeed);
        await waitForUnpause();
        bars[index].classList.remove('searching');
    }
}

// SEARCHING ALGORITHMS

async function linearSearch() {
    const searchValue = parseInt(document.getElementById('searchValue').value);
    
    for (let i = 0; i < array.length && isRunning; i++) {
        await markSearching(i);
        comparisons++;
        document.getElementById('comparisons').textContent = comparisons;
        
        if (array[i] === searchValue) {
            await markFound(i);
            break;
        }
    }
    
    resetVisualization();
}

async function binarySearch() {
    // First sort the array for binary search
    array.sort((a, b) => a - b);
    displayArray();
    
    const searchValue = parseInt(document.getElementById('searchValue').value);
    let left = 0;
    let right = array.length - 1;
    
    while (left <= right && isRunning) {
        const mid = Math.floor((left + right) / 2);
        await markSearching(mid);
        comparisons++;
        document.getElementById('comparisons').textContent = comparisons;
        
        if (array[mid] === searchValue) {
            await markFound(mid);
            break;
        } else if (array[mid] < searchValue) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    resetVisualization();
}

async function dfsArray() {
    if (array.length === 0) {
        resetVisualization();
        return;
    }
    const searchValue = parseInt(document.getElementById('searchValue').value);
    const stack = [0];
    const visited = new Set();
    
    while (stack.length > 0 && isRunning) {
        const index = stack.pop();
        
        if (index < 0 || index >= array.length) continue;
        if (visited.has(index)) continue;
        visited.add(index);
        
        await markSearching(index);
        comparisons++;
        document.getElementById('comparisons').textContent = comparisons;
        
        if (array[index] === searchValue) {
            await markFound(index);
            break;
        }
        
        // Add adjacent indices (treating array as a binary tree for demo)
        if (index * 2 + 2 < array.length) stack.push(index * 2 + 2);
        if (index * 2 + 1 < array.length) stack.push(index * 2 + 1);
    }
    
    resetVisualization();
}

async function bfsArray() {
    if (array.length === 0) {
        resetVisualization();
        return;
    }
    const searchValue = parseInt(document.getElementById('searchValue').value);
    const queue = [0];
    const visited = new Set();
    
    while (queue.length > 0 && isRunning) {
        const index = queue.shift();
        
        if (index < 0 || index >= array.length) continue;
        if (visited.has(index)) continue;
        visited.add(index);
        
        await markSearching(index);
        comparisons++;
        document.getElementById('comparisons').textContent = comparisons;
        
        if (array[index] === searchValue) {
            await markFound(index);
            break;
        }
        
        // Add adjacent indices (treating array as a binary tree for demo)
        if (index * 2 + 1 < array.length) queue.push(index * 2 + 1);
        if (index * 2 + 2 < array.length) queue.push(index * 2 + 2);
    }
    
    resetVisualization();
}

// SORTING ALGORITHMS

async function bubbleSort() {
    for (let i = 0; i < array.length - 1 && isRunning; i++) {
        for (let j = 0; j < array.length - i - 1 && isRunning; j++) {
            await compareElements(j, j + 1);
            
            if (array[j] > array[j + 1]) {
                await swapElements(j, j + 1);
            }
        }
        await markSorted(array.length - i - 1);
    }
    if (isRunning) await markSorted(0);
    resetVisualization();
}

async function selectionSort() {
    for (let i = 0; i < array.length - 1 && isRunning; i++) {
        let minIdx = i;
        
        for (let j = i + 1; j < array.length && isRunning; j++) {
            await compareElements(minIdx, j);
            
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        
        if (minIdx !== i) {
            await swapElements(i, minIdx);
        }
        await markSorted(i);
    }
    if (isRunning) await markSorted(array.length - 1);
    resetVisualization();
}

async function insertionSort() {
    for (let i = 1; i < array.length && isRunning; i++) {
        let j = i;
        
        while (j > 0 && isRunning) {
            await compareElements(j - 1, j);
            
            if (array[j - 1] > array[j]) {
                await swapElements(j - 1, j);
                j--;
            } else {
                break;
            }
        }
        await markSorted(i);
    }
    if (isRunning) await markSorted(0);
    resetVisualization();
}

async function mergeSort() {
    await mergeSortHelper(0, array.length - 1);
    
    // Mark all as sorted
    for (let i = 0; i < array.length; i++) {
        await markSorted(i);
    }
    resetVisualization();
}

async function mergeSortHelper(start, end) {
    if (start >= end || !isRunning) return;
    
    const mid = Math.floor((start + end) / 2);
    await mergeSortHelper(start, mid);
    await mergeSortHelper(mid + 1, end);
    await merge(start, mid, end);
}

async function merge(start, mid, end) {
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    
    let i = 0, j = 0, k = start;
    
    while (i < left.length && j < right.length && isRunning) {
        await compareElements(start + i, mid + 1 + j);
        
        if (left[i] <= right[j]) {
            array[k] = left[i];
            i++;
        } else {
            array[k] = right[j];
            j++;
        }
        k++;
        displayArray();
        await sleep(animationSpeed);
        await waitForUnpause();
    }
    
    while (i < left.length && isRunning) {
        array[k] = left[i];
        i++;
        k++;
        displayArray();
        await sleep(animationSpeed);
        await waitForUnpause();
    }
    
    while (j < right.length && isRunning) {
        array[k] = right[j];
        j++;
        k++;
        displayArray();
        await sleep(animationSpeed);
        await waitForUnpause();
    }
}

async function quickSort() {
    await quickSortHelper(0, array.length - 1);
    
    // Mark all as sorted
    for (let i = 0; i < array.length; i++) {
        await markSorted(i);
    }
    resetVisualization();
}

async function quickSortHelper(low, high) {
    if (low < high && isRunning) {
        const pi = await partition(low, high);
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
    }
}

async function partition(low, high) {
    const pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high && isRunning; j++) {
        await compareElements(j, high);
        
        if (array[j] < pivot) {
            i++;
            if (i !== j) {
                await swapElements(i, j);
            }
        }
    }
    
    if (i + 1 !== high) {
        await swapElements(i + 1, high);
    }
    
    return i + 1;
}

async function heapSort() {
    // Build max heap
    for (let i = Math.floor(array.length / 2) - 1; i >= 0 && isRunning; i--) {
        await heapify(array.length, i);
    }
    
    // Extract elements from heap
    for (let i = array.length - 1; i > 0 && isRunning; i--) {
        await swapElements(0, i);
        await markSorted(i);
        await heapify(i, 0);
    }
    
    if (isRunning) await markSorted(0);
    resetVisualization();
}

async function heapify(n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && isRunning) {
        await compareElements(left, largest);
        if (array[left] > array[largest]) {
            largest = left;
        }
    }
    
    if (right < n && isRunning) {
        await compareElements(right, largest);
        if (array[right] > array[largest]) {
            largest = right;
        }
    }
    
    if (largest !== i && isRunning) {
        await swapElements(i, largest);
        await heapify(n, largest);
    }
}

// PATHFINDING ALGORITHMS

function initializeGrid() {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    
    grid = [];
    
    for (let i = 0; i < gridRows; i++) {
        grid[i] = [];
        for (let j = 0; j < gridCols; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.onclick = () => handleCellClick(i, j);
            container.appendChild(cell);
            
            grid[i][j] = {
                row: i,
                col: j,
                isWall: false,
                isStart: false,
                isEnd: false,
                element: cell
            };
        }
    }
    
    // Set default start and end
    setCell(5, 5, 'start');
    setCell(gridRows - 5, gridCols - 5, 'end');
}

function handleCellClick(row, col) {
    if (wallMode && !grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].isWall = !grid[row][col].isWall;
        grid[row][col].element.classList.toggle('wall');
    }
}

function setStartNode() {
    wallMode = false;
    // Clear previous start
    if (startNode) {
        startNode.isStart = false;
        startNode.element.classList.remove('start');
    }
    
    // Set click handler to set new start
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.onclick = function() {
            const row = parseInt(this.dataset.row);
            const col = parseInt(this.dataset.col);
            setCell(row, col, 'start');
            
            // Reset click handlers
            cells.forEach(c => {
                c.onclick = () => handleCellClick(
                    parseInt(c.dataset.row), 
                    parseInt(c.dataset.col)
                );
            });
        };
    });
}

function setEndNode() {
    wallMode = false;
    // Clear previous end
    if (endNode) {
        endNode.isEnd = false;
        endNode.element.classList.remove('end');
    }
    
    // Set click handler to set new end
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.onclick = function() {
            const row = parseInt(this.dataset.row);
            const col = parseInt(this.dataset.col);
            setCell(row, col, 'end');
            
            // Reset click handlers
            cells.forEach(c => {
                c.onclick = () => handleCellClick(
                    parseInt(c.dataset.row), 
                    parseInt(c.dataset.col)
                );
            });
        };
    });
}

function setCell(row, col, type) {
    const cell = grid[row][col];
    
    if (type === 'start') {
        if (startNode) {
            startNode.isStart = false;
            startNode.element.classList.remove('start');
        }
        cell.isStart = true;
        cell.isWall = false;
        cell.element.classList.add('start');
        cell.element.classList.remove('wall');
        startNode = cell;
    } else if (type === 'end') {
        if (endNode) {
            endNode.isEnd = false;
            endNode.element.classList.remove('end');
        }
        cell.isEnd = true;
        cell.isWall = false;
        cell.element.classList.add('end');
        cell.element.classList.remove('wall');
        endNode = cell;
    }
}

function toggleWallMode() {
    wallMode = !wallMode;
}

function clearWalls() {
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            if (grid[i][j].isWall) {
                grid[i][j].isWall = false;
                grid[i][j].element.classList.remove('wall');
            }
        }
    }
}

function clearPathfinding() {
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            grid[i][j].element.classList.remove('visited', 'path');
        }
    }
}

function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;
    
    // Up, Right, Down, Left
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < gridRows && 
            newCol >= 0 && newCol < gridCols && 
            !grid[newRow][newCol].isWall) {
            neighbors.push(grid[newRow][newCol]);
        }
    }
    
    return neighbors;
}

async function visualizePath(path) {
    for (let i = 0; i < path.length && isRunning; i++) {
        if (!path[i].isStart && !path[i].isEnd) {
            path[i].element.classList.add('path');
            await sleep(animationSpeed);
            await waitForUnpause();
        }
    }
}

async function dijkstra() {
    if (!startNode || !endNode) {
        resetVisualization();
        return;
    }
    
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    // Initialize distances
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            const key = `${i},${j}`;
            distances[key] = Infinity;
            previous[key] = null;
            unvisited.add(key);
        }
    }
    
    distances[`${startNode.row},${startNode.col}`] = 0;
    
    while (unvisited.size > 0 && isRunning) {
        // Find minimum distance node
        let minNode = null;
        let minDist = Infinity;
        
        for (const key of unvisited) {
            if (distances[key] < minDist) {
                minDist = distances[key];
                minNode = key;
            }
        }
        
        if (minNode === null || minDist === Infinity) break;
        
        unvisited.delete(minNode);
        const [row, col] = minNode.split(',').map(Number);
        const current = grid[row][col];
        
        if (current === endNode) {
            // Reconstruct path
            const path = [];
            let nodeKey = `${current.row},${current.col}`;
            while (nodeKey) {
                const [r, c] = nodeKey.split(',').map(Number);
                path.unshift(grid[r][c]);
                nodeKey = previous[nodeKey];
            }
            await visualizePath(path);
            break;
        }
        
        if (!current.isStart && !current.isEnd) {
            current.element.classList.add('visited');
            await sleep(animationSpeed);
            await waitForUnpause();
        }
        
        // Update neighbors
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            const alt = distances[minNode] + 1;
            
            if (alt < distances[neighborKey]) {
                distances[neighborKey] = alt;
                previous[neighborKey] = minNode;
            }
        }
    }
    
    resetVisualization();
}

function heuristic(node1, node2) {
    // Manhattan distance
    return Math.abs(node1.row - node2.row) + Math.abs(node1.col - node2.col);
}

async function aStar() {
    if (!startNode || !endNode) {
        resetVisualization();
        return;
    }
    
    const openSet = new Set([`${startNode.row},${startNode.col}`]);
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const previous = {};
    
    // Initialize scores
    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            const key = `${i},${j}`;
            gScore[key] = Infinity;
            fScore[key] = Infinity;
        }
    }
    
    gScore[`${startNode.row},${startNode.col}`] = 0;
    fScore[`${startNode.row},${startNode.col}`] = heuristic(startNode, endNode);
    
    while (openSet.size > 0 && isRunning) {
        // Find node with lowest fScore
        let currentKey = null;
        let lowestF = Infinity;
        
        for (const key of openSet) {
            if (fScore[key] < lowestF) {
                lowestF = fScore[key];
                currentKey = key;
            }
        }
        
        if (!currentKey) break;
        
        const [row, col] = currentKey.split(',').map(Number);
        const current = grid[row][col];
        
        if (current === endNode) {
            // Reconstruct path
            const path = [];
            let nodeKey = `${current.row},${current.col}`;
            while (nodeKey) {
                const [r, c] = nodeKey.split(',').map(Number);
                path.unshift(grid[r][c]);
                nodeKey = previous[nodeKey];
            }
            await visualizePath(path);
            break;
        }
        
        openSet.delete(currentKey);
        closedSet.add(currentKey);
        
        if (!current.isStart && !current.isEnd) {
            current.element.classList.add('visited');
            await sleep(animationSpeed);
            await waitForUnpause();
        }
        
        // Check neighbors
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            
            if (closedSet.has(neighborKey)) continue;
            
            const tentativeG = gScore[currentKey] + 1;
            
            if (!openSet.has(neighborKey)) {
                openSet.add(neighborKey);
            } else if (tentativeG >= gScore[neighborKey]) {
                continue;
            }
            
            previous[neighborKey] = currentKey;
            gScore[neighborKey] = tentativeG;
            fScore[neighborKey] = gScore[neighborKey] + heuristic(neighbor, endNode);
        }
    }
    
    resetVisualization();
}

async function bfsPath() {
    if (!startNode || !endNode) {
        resetVisualization();
        return;
    }
    
    const queue = [startNode];
    const visited = new Set([`${startNode.row},${startNode.col}`]);
    const previous = {};
    
    while (queue.length > 0 && isRunning) {
        const current = queue.shift();
        
        if (!current.isStart && !current.isEnd) {
            current.element.classList.add('visited');
            await sleep(animationSpeed);
            await waitForUnpause();
        }
        
        if (current === endNode) {
            // Reconstruct path
            const path = [];
            let key = `${current.row},${current.col}`;
            while (key) {
                const [r, c] = key.split(',').map(Number);
                path.unshift(grid[r][c]);
                key = previous[key];
            }
            await visualizePath(path);
            break;
        }
        
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                previous[neighborKey] = `${current.row},${current.col}`;
                queue.push(neighbor);
            }
        }
    }
    
    resetVisualization();
}

async function dfsPath() {
    if (!startNode || !endNode) {
        resetVisualization();
        return;
    }
    
    const stack = [startNode];
    const visited = new Set([`${startNode.row},${startNode.col}`]);
    const previous = {};
    
    while (stack.length > 0 && isRunning) {
        const current = stack.pop();
        
        if (!current.isStart && !current.isEnd) {
            current.element.classList.add('visited');
            await sleep(animationSpeed);
            await waitForUnpause();
        }
        
        if (current === endNode) {
            // Reconstruct path
            const path = [];
            let key = `${current.row},${current.col}`;
            while (key) {
                const [r, c] = key.split(',').map(Number);
                path.unshift(grid[r][c]);
                key = previous[key];
            }
            await visualizePath(path);
            break;
        }
        
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                previous[neighborKey] = `${current.row},${current.col}`;
                stack.push(neighbor);
            }
        }
    }
    
    resetVisualization();
}

// Initialize UI values and set up initial array/grid on window load
window.onload = function() {
    // Initialize displayed values for controls
    const size = document.getElementById('arraySize').value;
    document.getElementById('arraySizeValue').textContent = size;
    const speed = document.getElementById('speed').value;
    document.getElementById('speedValue').textContent = speed;
    animationSpeed = parseInt(speed);
    
    // Buttons default states
    document.getElementById('pauseBtn').disabled = true;
    
    // Create initial array so user sees something
    generateNewArray();
    
    // Ensure grid not visible until chosen
    document.getElementById('gridContainer').style.display = 'none';
};
