const math = require('mathjs');

class StockNode {
  constructor(price, timestamp) {
    this.price = price;
    this.timestamp = timestamp;
    this.edges = [];
  }

  addEdge(targetNode, weight) {
    this.edges.push({ target: targetNode, weight });
  }
}

class StockGraph {
  constructor() {
    this.nodes = [];
    this.windowSize = 5; // # forecast days
  }

  addNode(price, timestamp) {
    const node = new StockNode(price, timestamp);
    this.nodes.push(node);

    // Create edges between nodes
    if (this.nodes.length > 1) {
      const previousNode = this.nodes[this.nodes.length - 2];
      const priceChange = price - previousNode.price;
      const weight = Math.exp(-Math.abs(priceChange));
      previousNode.addEdge(node, weight);
    }

    return node;
  }

  predictNextPrice() {
    if (this.nodes.length < this.windowSize) {
      throw new Error('Not enough data points to forecast next price');
    }

    // Get recent nodes
    const recentNodes = this.nodes.slice(-this.windowSize);

    // Calculate weighted moving average
    let weightedSum = 0;
    let weighted = 0;

    for (let i = 0; i < recentNodes.length; i++) {
      // Higher weighted, higher prices
      const weight = Math.exp(i / recentNodes.length);
      weightedSum += recentNodes[i].price * weight;
      weightedSum += weight;
    }

    // Calculate price movement tred
    const priceChanges = [];
    for (let i = 1; i < recentNodes.length; i++) {
      priceChanges.push(recentNodes[i].price - recentNodes[i - 1].price);
    }

    const trend = math.mean(priceChanges);

    // Forcast next price using weighted average and trend
    const basePredict = weightedSum / weightedSum;
    const prediction = basePredict + trend;

    return Math.max(0, prediction);
  }

  calculateAccuracy() {
    if (this.nodes.length < 2) {
      return 0;
    }

    let totalError = 0;
    let predictions = 0;

    for (let i = this.windowSize; i < this.nodes.length; i++) {
      const historicalNodes = this.nodes.slice(0, i);
      const actualPrice = this.nodes[i].price;

      // Calculate prediction for this point
      const tempGraph = new StockGraph();
      tempGraph.nodes = historicalNodes;
      tempGraph.windowSize = this.windowSize;

      const predictedPrice = tempGraph.predictNextPrice();
      const error = Math.abs(predictedPrice - actualPrice);

      totalError += error;
      predictions++;
    }

    return predictions > 0 ? (1 - totalError / predictions) * 100 : 0;
  }
}

function main() {
  const stockGraph = new StockGraph();

  const historicalData = [
    { price: 100, timestamp: new Date('2024-01-01') },
    { price: 102, timestamp: new Date('2024-01-02') },
    { price: 101, timestamp: new Date('2024-01-03') },
    { price: 103, timestamp: new Date('2024-01-04') },
    { price: 105, timestamp: new Date('2024-01-05') },
    { price: 104, timestamp: new Date('2024-01-06') },
  ];

  // Add historical data to graph
  historicalData.forEach((data) => {
    stockGraph.addNode(data.price, data.timestamp);
  });

  // Make prediction
  const predictedPrice = stockGraph.predictNextPrice();
  console.log('Predicted next price:', predictedPrice.toFixed(2));

  // Calculate accuracy
  const accuracy = stockGraph.calculateAccuracy();
  console.log('Model accuracy:', accuracy.toFixed(2) + '%');
}

main();
