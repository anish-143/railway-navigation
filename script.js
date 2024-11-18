const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// Updated graph representation ensuring connectivity
const graph = {
    "Platform 1": { "Platform 2": 4, "Restroom 1": 3 },
    "Platform 2": { "Platform 1": 4, "Platform 3": 2, "Ticket Counter": 5 },
    "Platform 3": { "Platform 2": 2, "Food Court 1": 6, "Platform 4": 2 },
    "Restroom 1": { "Platform 1": 3, "Ticket Counter": 4 },
    "Ticket Counter": { "Restroom 1": 4, "Platform 2": 5, "Food Court 1": 7 },
    "Food Court 1": { "Platform 3": 6, "Ticket Counter": 7, "Platform 5": 3 },
    "Platform 4": { "Platform 3": 2, "Food Court 2": 4 },
    "Platform 5": { "Food Court 1": 3, "Restroom 2": 2, "Platform 6": 3 },
    "Restroom 2": { "Platform 5": 2, "Food Court 2": 5 },
    "Food Court 2": { "Platform 4": 4, "Restroom 2": 5, "Platform 7": 6 },
    "Platform 6": { "Platform 5": 3, "Food Court 3": 4 },
    "Platform 7": { "Food Court 2": 6, "Platform 8": 4 },
    "Food Court 3": { "Platform 6": 4, "Restroom 3": 2 },
    "Restroom 3": { "Food Court 3": 2, "Platform 9": 3 },
    "Platform 8": { "Platform 7": 4, "Platform 9": 2 },
    "Platform 9": { "Platform 8": 2, "Restroom 3": 3, "Platform 10": 5 },
    "Platform 10": { "Platform 9": 5, "Food Court 4": 6 },
    "Food Court 4": { "Platform 10": 6 }
};

// Node positions for rendering
const positions = {
    "Platform 1": { x: 100, y: 100 },
    "Platform 2": { x: 300, y: 100 },
    "Platform 3": { x: 500, y: 100 },
    "Restroom 1": { x: 100, y: 300 },
    "Ticket Counter": { x: 300, y: 300 },
    "Food Court 1": { x: 500, y: 300 },
    "Platform 4": { x: 700, y: 100 },
    "Platform 5": { x: 700, y: 300 },
    "Restroom 2": { x: 100, y: 500 },
    "Food Court 2": { x: 300, y: 500 },
    "Platform 6": { x: 500, y: 500 },
    "Platform 7": { x: 700, y: 500 },
    "Food Court 3": { x: 100, y: 700 },
    "Restroom 3": { x: 300, y: 700 },
    "Platform 8": { x: 500, y: 700 },
    "Platform 9": { x: 700, y: 700 },
    "Platform 10": { x: 500, y: 900 },
    "Food Court 4": { x: 700, y: 900 }
};

// Populate dropdowns
const nodes = Object.keys(graph);
const startNodeSelect = document.getElementById("startNode");
const endNodeSelect = document.getElementById("endNode");

nodes.forEach(node => {
    const option1 = document.createElement("option");
    option1.value = node;
    option1.textContent = node;
    startNodeSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = node;
    option2.textContent = node;
    endNodeSelect.appendChild(option2);
});

// Draw the graph
function drawGraph(highlightedPath = [], highlightedEdges = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    Object.keys(graph).forEach(node => {
        Object.keys(graph[node]).forEach(neighbor => {
            const { x: x1, y: y1 } = positions[node];
            const { x: x2, y: y2 } = positions[neighbor];
            const isHighlighted = highlightedEdges.some(
                edge =>
                    (edge[0] === node && edge[1] === neighbor) ||
                    (edge[1] === node && edge[0] === neighbor)
            );

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = isHighlighted ? "blue" : "#aaa";
            ctx.lineWidth = isHighlighted ? 3 : 1;
            ctx.stroke();

            // Draw weight
            ctx.fillStyle = "#000";
            const weightX = (x1 + x2) / 2;
            const weightY = (y1 + y2) / 2;
            ctx.fillText(graph[node][neighbor], weightX, weightY);
        });
    });

    // Draw nodes with rectangular labels
    Object.keys(positions).forEach(node => {
        const { x, y } = positions[node];
        ctx.beginPath();
        ctx.fillStyle = highlightedPath.includes(node) ? "#ff5722" : "#4caf50";
        ctx.fillRect(x - 40, y - 20, 80, 40); // Draw rectangle
        ctx.strokeStyle = "#333";
        ctx.strokeRect(x - 40, y - 20, 80, 40); // Draw rectangle border

        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node, x, y);
    });
}

// Dijkstra's algorithm
function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const priorityQueue = [[start, 0]];

    // Initialize distances
    for (let node in graph) {
        distances[node] = Infinity;
    }
    distances[start] = 0;

    while (priorityQueue.length > 0) {
        const [currentNode, currentDistance] = priorityQueue.shift();

        if (visited.has(currentNode)) continue;
        visited.add(currentNode);

        for (let neighbor in graph[currentNode]) {
            const distance = graph[currentNode][neighbor];
            const totalDistance = currentDistance + distance;

            if (totalDistance < distances[neighbor]) {
                distances[neighbor] = totalDistance;
                previous[neighbor] = currentNode;
                priorityQueue.push([neighbor, totalDistance]);
            }
        }

        // Sort queue by distance
        priorityQueue.sort((a, b) => a[1] - b[1]);
    }

    // Reconstruct path
    const path = [];
    const edges = [];
    let current = end;
    while (current) {
        path.unshift(current);
        if (previous[current]) {
            edges.push([current, previous[current]]);
        }
        current = previous[current];
    }

    return { distance: distances[end], path, edges };
}

// Find shortest path button
document.getElementById("findPath").addEventListener("click", () => {
    const start = startNodeSelect.value;
    const end = endNodeSelect.value;

    if (start && end && start !== end) {
        const { distance, path, edges } = dijkstra(graph, start, end);
        document.getElementById("result").textContent = 
            `Shortest distance from ${start} to ${end}: ${distance}`;
        drawGraph(path, edges);
    } else {
        document.getElementById("result").textContent = 
            "Please select different start and end locations.";
    }
});

// Initial graph rendering
drawGraph();
