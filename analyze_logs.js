const fs = require('fs');
const Table = require('cli-table3');

// Function to parse the log data and extract relevant information
function parseLogData(logData) {
  const lines = logData.split('\n');
  const apiCalls = [];

  for (const line of lines) {
    const match = line.match(
      /(\d{4}-\d{2}-\d{2} \d{2}:\d{2} \+\d{2}:\d{2}).+"(\w+) .+ HTTP\/1.\d" (\d+) .+/
    );

    if (!match) {
      // Skip lines that do not match the expected pattern
      continue;
    }

    const [, timestamp, endpoint, statusCode] = match;

    apiCalls.push({
      timestamp,
      endpoint,
      statusCode: parseInt(statusCode),
    });
  }

  return apiCalls;
}

// Function to get API call count for each status code
function getStatusCodeCount(apiCalls) {
  const statusCodeCountMap = new Map();

  for (const call of apiCalls) {
    const { statusCode } = call;
    if (!statusCodeCountMap.has(statusCode)) {
      statusCodeCountMap.set(statusCode, 0);
    }
    statusCodeCountMap.set(statusCode, statusCodeCountMap.get(statusCode) + 1);
  }

  return statusCodeCountMap;
}

// Function to display the results in a formatted table
function displayResults(statusCodeCountMap) {
    const formattedData = Array.from(statusCodeCountMap.entries()).map(
      ([statusCode, count]) => ({
        statusCode,
        count,
      })
    );
  
    const statusCodes = {
      500: 'Server Error',
      404: 'Not Found',
      200: 'OK',
      304: 'Not Changed',
    };
  
    const formattedTableData = formattedData
      .filter((data) => statusCodes[data.statusCode]) // Filter out unwanted status codes
      .map((data) => ({
        Status: statusCodes[data.statusCode],
        statusCode: data.statusCode,
        count: data.count,
      }));
  
    // Create a new table instance
    const table = new Table({
      head: ["(index)", "statusCode", "count"],
    });
  
    // Add data to the table
    formattedTableData.forEach(({ Status, statusCode, count }) => {
      table.push([Status, statusCode, count]);
    });
  
    // Display the table
    console.log(table.toString());
  }
  

// Main function to read the log file and process the data
function analyzeLogFile(logFilePath) {
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the log file:', err);
      return;
    }

    const apiCalls = parseLogData(data);
    const statusCodeCountMap = getStatusCodeCount(apiCalls);

    displayResults(statusCodeCountMap);
  });
}

//Array of file path
const logFilePath = ['logs/prod-api-prod-out.log', 'logs/api-dev-out.log', 'logs/api-prod-out.log']

// Executing each log file.
logFilePath.forEach(path => {
    // function with parameter with the path to log file.
    analyzeLogFile(path);
});



