const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE3MjMwOTU4MDAsImV4cCI6MTcyMzE2MzQyMCwibmJmIjoxNzIzMDk1ODAwLCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCbXRGcjRWSGhScGFOWnNQQ0VNZ3VQalltRVU3bnhFVFEtU3FSMVpBYUp1S1g4QjNUZ0RCQUUyOVhoOXdIYllfZ1FUU0YxbXIxbjR1OTRjVFJkN19CdklqdUlkbC13cHJGYmFkbWJ0dWJKYzVzYTVBND0iLCJkaXNwbGF5X25hbWUiOiJMT0tFU0ggVEFMTFVSSSIsIm9tcyI6IksxIiwiaHNtX2tleSI6IjgzZmZjNDBhNDBhNmMzMmVhODEyZmZlNjg4MDg2ZjA2NGE2NTU4OGU5NTEyNjdhOTA4MDQzMjU3IiwiZnlfaWQiOiJZTDAwMTM3IiwiYXBwVHlwZSI6MTAwLCJwb2FfZmxhZyI6Ik4ifQ.G6b1TIdSttuQdDn83dkpd9p2l3dkmhGEwDJ4Pa9yJT4";

const chartProperties = {
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    fixLeftEdge: true,
    borderVisible: false,
  }
};
const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement, {
  width: domElement.clientWidth,
  height: domElement.clientHeight,
  ...chartProperties
});
const candleSeries = chart.addCandlestickSeries();
const hoverInfo = document.getElementById('hover-info');
const spinner = document.getElementById('spinner');

let currentOHLC = {};
// Function to resize the chart
function resizeChart() {
  chart.resize(domElement.clientWidth, domElement.clientHeight);
}

// Resize the chart initially
resizeChart();

// Use ResizeObserver to detect size changes
const resizeObserver = new ResizeObserver(() => {
  resizeChart();
});

// Start observing the container
resizeObserver.observe(domElement);

// Optionally: Handle window resize event as a fallback
window.addEventListener('resize', resizeChart);

// Helper function to parse date-time string to Unix timestamp in seconds
function parseDateTimeToUnix(dateTime) {
  const [datePart, timePart] = dateTime.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second);
  const offset = (5 * 60 * 60 * 1000) + (30 * 60 * 1000);
  const newDate = new Date(date.getTime() + offset);
  return Math.floor(newDate.getTime() / 1000);
}

function showSpinner() {
  spinner.style.display = 'block';
}

function hideSpinner() {
  spinner.style.display = 'none';
}

// Function to fetch and process data from backend
async function fetchData(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/stock-data?symbol=${symbol}&interval=${interval}`);
    const data = await response.json();
    const cdata = data.map(d => ({
      time: parseDateTimeToUnix(d.Date),
      open: parseFloat(d.Open),
      high: parseFloat(d.High),
      low: parseFloat(d.Low),
      close: parseFloat(d.Close)
    }));
    console.log(data);
    candleSeries.setData(cdata);
    const lastCandle = cdata[cdata.length - 1];
    hideSpinner();
    return lastCandle;
  } catch (error) {
    log(error);
    hideSpinner();
  }
}

// Function to update table cells
function updateTable(symbol, last, chg, chgPct) {
  const table = document.getElementById('stock-table');
  const rows = table.querySelectorAll('.stock-row');
  
  rows.forEach(row => {
    if (row.getAttribute('data-symbol') === symbol) {
      row.querySelector('td:nth-child(2)').textContent = last;
      row.querySelector('td:nth-child(3)').textContent = chg >= 0 ? `+${chg}` : chg;
      row.querySelector('td:nth-child(4)').textContent = `${chgPct}%`;
    }
  });
}

async function selectStock(row) {
  var rows = document.getElementsByClassName('stock-row');
  
  for (var i = 0; i < rows.length; i++) {
      rows[i].classList.remove('selected');
  }
  
  row.classList.add('selected');
  var stockName = row.getElementsByTagName('td')[0].innerText;
  document.getElementById('selected-stock').textContent = stockName;
  const interval = document.getElementById('interval-select').value;
  const symbol = row.getAttribute('data-symbol');
  fetchData(symbol, interval);
  const lastCandle = await fetchData(symbol, interval);
  if (lastCandle) {
    skt.unsubscribe([symbol], false, 1);
    skt.subscribe([symbol], false, 1);
    currentOHLC[lastCandle.time] = lastCandle;
    console.log(currentOHLC[lastCandle.time]);
    console.log(lastCandle);
  }
  srLineSeries.forEach(series => chart.removeSeries(series));
  srLineSeries = [];
  trendlineSeries.forEach(series => chart.removeSeries(series));
  trendlineSeries = [];
  ibars.forEach(series => chart.removeSeries(series));
  ibars = [];
  vShapes.forEach(series => chart.removeSeries(series));
  vShapes = [];
  headAndShoulders.forEach(series => chart.removeSeries(series));
  headAndShoulders = [];
  doubleTops.forEach(series => chart.removeSeries(series));
  doubleTops = [];
  cupAndHandle.forEach(series => chart.removeSeries(series));
  cupAndHandle = [];
  emaSeries.forEach(series => chart.removeSeries(series));
  emaSeries = [];
  if (selectedOptions.includes('sup-res')) {
    await fetchAndDrawSupportResistance(symbol, interval);
  }
  if (selectedOptions.includes('trlines')) {
    await fetchAndDrawTrendlines(symbol, interval);
  }
  if (selectedOptions.includes('ibarss')) {
    await fetchAndDrawIbars(symbol, interval);
  }
  if (selectedOptions.includes('vshape')) {
    await fetchAndDrawIbars(symbol, interval);
  }
  if (selectedOptions.includes('head-and-shoulders')) {
    await fetchAndDrawHeadAndShoulders(symbol, interval);
  }
  if (selectedOptions.includes('double-tops')) {
    await fetchAndDrawDoubleTops(symbol, interval);
  }
  if (selectedOptions.includes('cupandhandle')) {
    await fetchAndDrawCupAndHandle(symbol, interval);
  }
  if (selectedOptions.includes('ema')) {
    await fetchAndDrawEma(symbol, interval);
  }
}
let emaSeries = {};

// Utility function to parse date time to Unix timestamp
function parseDateTimeToUnix(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return Math.floor(date.getTime() / 1000);
}

// Fetch and draw EMA data
async function fetchAndDrawEma(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/ema-series?symbol=${symbol}&interval=${interval}`);
    const emaData = await response.json();

    // Clear existing EMA series
    Object.values(emaSeries).forEach(series => chart.removeSeries(series));

    emaSeries = {}; // Reset emaSeries

    if (emaData.length > 0) {
      const emaColors = {
        EMA5: 'blue',
        EMA10: 'green',
        EMA20: 'red',
        EMA50: 'purple',
        EMA100: 'orange',
        EMA200: 'yellow'
      };

      // Define the shift amount in seconds (adjust as needed)
      const shiftAmount = 60 * 335; // For example, shifting by 15 minutes

      Object.keys(emaColors).forEach(emaKey => {
        const emaPlotData = emaData.map(point => ({
          time: parseDateTimeToUnix(point.Date) - shiftAmount, // Apply the shift
          value: point[emaKey]
        }));

        emaSeries[emaKey] = chart.addLineSeries({
          color: emaColors[emaKey],
          lineWidth: 2
        });

        emaSeries[emaKey].setData(emaPlotData);
      });
    }

    hideSpinner();
  } catch (error) {
    console.error('Error fetching EMA data:', error);
    hideSpinner();
  }
}


let srLineSeries = [];

// Function to fetch and draw support and resistance lines
async function fetchAndDrawSupportResistance(symbol, interval) {
  showSpinner();
  try {
    const nsr = document.getElementById('num-sr-lines').value;
    const group_size = document.getElementById('group-size').value;
    const response = await fetch(`/support-resistance?symbol=${symbol}&interval=${interval}&nsr=${nsr}&group_size=${group_size}`);
    const srGroups = await response.json();
    
    // Clear existing SR line series
    srLineSeries.forEach(series => chart.removeSeries(series));
    srLineSeries = [];
    
    srGroups.forEach((group, index) => {
      const color = ['black', 'blue', 'green'][index];
      const { start_date, end_date, sr_lines } = group;
      const startTime = parseDateTimeToUnix(start_date);
      const endTime = parseDateTimeToUnix(end_date);
      
      sr_lines.forEach(level => {
        const horizontalLineData = [
          { time: startTime, value: level },
          { time: endTime, value: level }
        ];
        
        const lineSeries = chart.addLineSeries({
          color: color,
          lineWidth: 1,
          priceLineVisible: false,
        });
        
        lineSeries.setData(horizontalLineData);
        srLineSeries.push(lineSeries);
      });
    });
    hideSpinner();
  } catch (error) {
    console.error(error);
    hideSpinner();
  }
}

let trendlineSeries = [];

// Fetch and draw trendlines with angle calculation considering scaling
async function fetchAndDrawTrendlines(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/trend-lines?symbol=${symbol}&interval=${interval}`);
    const trendlineData = await response.json();
    // Clear existing trendline series
    trendlineSeries.forEach(series => chart.removeSeries(series));
    trendlineSeries = [];

    // Get the conversion functions from the chart
    // const priceToCoordinate = chart.priceScale().priceToCoordinate.bind(chart.priceScale());
    // const timeToCoordinate = chart.timeScale().timeToCoordinate.bind(chart.timeScale());
    
    
    trendlineData.forEach(line => {
      let [ x0, y0, x1, y1, colorCode ] = line;
      // Calculate scaled coordinates
      // const x0Coord = chart.timeScale().timeToCoordinate(x0);
      // const y0Coord = candleSeries.priceScale().priceToCoordinate(y0);
      // const x1Coord = chart.timeScale().timeToCoordinate(x1);
      // const y1Coord = candleSeries.priceScale().priceToCoordinate(y1);
      let x0Unix = parseDateTimeToUnix(x0);
      let x1Unix = parseDateTimeToUnix(x1);

      if (x0Unix === null || x1Unix === null) {
        console.error('Invalid date conversion for:', line);
        return;
      }
      const linecolor = colorCode === 1 ? 'green' : 'red';
      if (x0Unix > x1Unix) {
        let temp = x0Unix;
        x0Unix = x1Unix;
        x1Unix = temp;

        temp = y0;
        y0 = y1;
        y1 = temp;
      }

      // Calculate angle in degrees considering the scaling
      // const angle = Math.atan2(y1Coord - y0Coord, x1Coord - x0Coord) * (180 / Math.PI);
      // console.log(angle);
      // Convert x0, y0, x1, y1 to the format expected by Lightweight Charts
      const lineSeries = chart.addLineSeries({
        color: linecolor,  // or any color you prefer
        lineWidth: 1,
        priceLineVisible: false,
      });
      
      lineSeries.setData([
        { time: x0Unix, value: y0 },
        { time: x1Unix, value: y1 }
      ]);

      trendlineSeries.push(lineSeries);

      // Optional: Add text labels for the angle
      // chart.addAnnotation({
      //   time: (x0 + x1) / 2,
      //   price: (y0 + y1) / 2,
      //   // text: `${angle.toFixed(2)}째`,
      //   // color: linecolor,
      // });
      
    });

    hideSpinner();
  } catch (error) {
    console.error('error is' + error);
    hideSpinner();
  }
}

let ibars = [];

// Fetch and draw consecutive inside bars
async function fetchAndDrawIbars(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/inside-bars?symbol=${symbol}&interval=${interval}`);
    const ibarsData = await response.json();

    // Clear existing inside bar series
    ibars.forEach(series => chart.removeSeries(series));
    ibars = [];

    ibarsData.forEach(line => {
      let { x0, y0, x1, y1 } = line;

      let x0Unix = parseDateTimeToUnix(x0);
      let x1Unix = parseDateTimeToUnix(x1);

      if (x0Unix === null || x1Unix === null) {
        console.error('Invalid date conversion for:', line);
        return;
      }

      // Ensure (x0, y0) is to the left of (x1, y1)
      if (x0Unix > x1Unix) {
        [x0Unix, x1Unix] = [x1Unix, x0Unix];
        [y0, y1] = [y1, y0];
      }

      // Define the rectangle series using LineSeries
      const rectangleSeries = chart.addLineSeries({
        color: 'rgba(0, 150, 136, 0.6)', // Semi-transparent color
        lineWidth: 2,
        priceLineVisible: false,
      });

      // Draw rectangle using four lines
      const rectangleData = [
        { time: x0Unix, value: y0 }, // Bottom left
        { time: x1Unix, value: y0 }, // Bottom right
        { time: x1Unix, value: y1 }, // Top right
        { time: x0Unix, value: y1 }, // Top left
        { time: x0Unix, value: y0 }, // Close the rectangle
      ];

      rectangleSeries.setData(rectangleData);

      ibars.push(rectangleSeries);
    });

    hideSpinner();
  } catch (error) {
    console.error('Error:', error);
    hideSpinner();
  }
}

let vShapes = [];

// Fetch and draw V-shape patterns
async function fetchAndDrawVShapes(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/v-shape-patterns?symbol=${symbol}&interval=${interval}`);
    const vShapesData = await response.json();

    // Clear existing V-shape series
    vShapes.forEach(series => chart.removeSeries(series));
    vShapes = [];

    vShapesData.forEach(shape => {
      const { x0, y0, x1, y1, x2, y2 } = shape;

      const x0Unix = parseDateTimeToUnix(x0);
      const x1Unix = parseDateTimeToUnix(x1);
      const x2Unix = parseDateTimeToUnix(x2);

      if (x0Unix === null || x1Unix === null || x2Unix === null) {
        console.error('Invalid date conversion for:', shape);
        return;
      }

      // Define the line series for the V-shape pattern
      const vShapeSeries = chart.addLineSeries({
        color: 'blue',
        lineWidth: 2,
        priceLineVisible: false,
      });

      // Draw V-shape using three lines
      const vShapeData = [
        { time: x0Unix, value: y0 },
        { time: x1Unix, value: y1 },
        { time: x2Unix, value: y2 },
      ];

      vShapeSeries.setData(vShapeData);

      vShapes.push(vShapeSeries);
    });

    hideSpinner();
  } catch (error) {
    console.error('Error:', error);
    hideSpinner();
  }
}

let doubleTops = [];

// Fetch and draw double tops
async function fetchAndDrawDoubleTops(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/double-tops?symbol=${symbol}&interval=${interval}`);
    const doubleTopsData = await response.json();

    // Clear existing double tops series
    doubleTops.forEach(series => chart.removeSeries(series));
    doubleTops = [];

    doubleTopsData.forEach(line => {
      let { x0, y0, x1, y1 } = line;

      let x0Unix = parseDateTimeToUnix(x0);
      let x1Unix = parseDateTimeToUnix(x1);

      if (x0Unix === null || x1Unix === null) {
        console.error('Invalid date conversion for:', line);
        return;
      }

      // Define the line series for the double top pattern
      const doubleTopSeries = chart.addLineSeries({
        color: 'blue',
        lineWidth: 2,
        priceLineVisible: false,
      });

      // Draw double top lines
      const doubleTopData = [
        { time: x0Unix, value: y0 },
        { time: x1Unix, value: y1 }
      ];

      doubleTopSeries.setData(doubleTopData);

      doubleTops.push(doubleTopSeries);
    });

    hideSpinner();
  } catch (error) {
    console.error('Error:', error);
    hideSpinner();
  }
}
let headAndShoulders = [];

// Fetch and draw head-and-shoulders patterns
async function fetchAndDrawHeadAndShoulders(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/head-and-shoulders?symbol=${symbol}&interval=${interval}`);
    const headAndShouldersData = await response.json();

    // Clear existing head-and-shoulders series
    headAndShoulders.forEach(series => chart.removeSeries(series));
    headAndShoulders = [];

    headAndShouldersData.forEach(pattern => {
      let patternData = pattern.map(point => ({
        time: parseDateTimeToUnix(point.x),
        value: point.y
      }));

      // Define the line series for the head-and-shoulders pattern
      const headAndShouldersSeries = chart.addLineSeries({
        color: 'blue',
        lineWidth: 2,
      });

      headAndShouldersSeries.setData(patternData);

      headAndShoulders.push(headAndShouldersSeries);
    });

    hideSpinner();
  } catch (error) {
    console.error('Error:', error);
    hideSpinner();
  }
}

let cupAndHandle = [];

// Fetch and draw cup-and-handle patterns
async function fetchAndDrawCupAndHandle(symbol, interval) {
  showSpinner();
  try {
    const response = await fetch(`/cup-and-handle?symbol=${symbol}&interval=${interval}`);
    const cupAndHandleData = await response.json();

    // Clear existing cup-and-handle series
    cupAndHandle.forEach(series => chart.removeSeries(series));
    cupAndHandle = [];

    cupAndHandleData.forEach(pattern => {
      if (pattern.type === 'cup') {
        let cupSeries = chart.addLineSeries({
          color: 'purple',
          lineWidth: 2,
        });
        let cupData = pattern.x.map((x, index) => ({
          time: parseDateTimeToUnix(x),
          value: pattern.y[index]
        }));
        cupSeries.setData(cupData);
        cupAndHandle.push(cupSeries);
      } else if (pattern.type === 'handle') {
        let handleSeries = chart.addLineSeries({
          color: 'red',
          lineWidth: 2,
        });
        let handleData = [
          { time: parseDateTimeToUnix(pattern.x0), value: pattern.y0 },
          { time: parseDateTimeToUnix(pattern.x1), value: pattern.y1 }
        ];
        handleSeries.setData(handleData);
        cupAndHandle.push(handleSeries);
      }
    });

    hideSpinner();
  } catch (error) {
    console.error('Error:', error);
    hideSpinner();
  }
}

// Update the change event listener for the interval select
document.getElementById('interval-select').addEventListener('change', async (event) => {
  const interval = event.target.value;

  // Find the selected stock row
  const selectedRow = document.querySelector('.stock-row.selected');
  
  if (selectedRow) {
    const symbol = selectedRow.getAttribute('data-symbol');
    fetchData(symbol, interval);
    const lastCandle = await fetchData(symbol, interval);
    if (lastCandle) {
      currentOHLC[lastCandle.time] = lastCandle;
      console.log(currentOHLC[lastCandle.time]);
      console.log(lastCandle);
    }
    srLineSeries.forEach(series => chart.removeSeries(series));
    srLineSeries = [];
    trendlineSeries.forEach(series => chart.removeSeries(series));
    trendlineSeries = [];
    ibars.forEach(series => chart.removeSeries(series));
    ibars = [];
    vShapes.forEach(series => chart.removeSeries(series));
    vShapes = [];
    headAndShoulders.forEach(series => chart.removeSeries(series));
    headAndShoulders = [];
    doubleTops.forEach(series => chart.removeSeries(series));
    doubleTops = [];
    cupAndHandle.forEach(series => chart.removeSeries(series));
    cupAndHandle = [];
    emaSeries.forEach(series => chart.removeSeries(series));
    emaSeries = [];
    if (selectedOptions.includes('sup-res')) {
      await fetchAndDrawSupportResistance(symbol, interval);
    }
    if (selectedOptions.includes('trlines')) {
      await fetchAndDrawTrendlines(symbol, interval);
    }
    if (selectedOptions.includes('ibarss')) {
      await fetchAndDrawIbars(symbol, interval);
    }
    if (selectedOptions.includes('vshape')) {
      await fetchAndDrawVShapes(symbol, interval);
    }
    if (selectedOptions.includes('head-and-shoulders')) {
      await fetchAndDrawHeadAndShoulders(symbol, interval);
    }
    if (selectedOptions.includes('double-tops')) {
      await fetchAndDrawDoubleTops(symbol, interval);
    }
    if (selectedOptions.includes('cupandhandle')) {
      await fetchAndDrawCupAndHandle(symbol, interval);
    }
    if (selectedOptions.includes('ema')) {
        await fetchAndDrawEma(symbol, interval);
    }
  }
});

// Search Button

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const searchPopup = document.getElementById('search-popup');
  const closeButton = document.querySelector('.close-button');
  const searchResults = document.getElementById('search-results');
  let rows = document.querySelectorAll('.stock-row');

  // Show search popup on button click
  searchButton.addEventListener('click', () => {
    searchPopup.style.display = 'block';
    fetchStocks();
  });



  // Close search popup on button click
  closeButton.addEventListener('click', () => {
    searchPopup.style.display = 'none';
  });

  // Close the popup when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target == searchPopup) {
      searchPopup.style.display = 'none';
    }
  });

  // Fetch stock data from Flask endpoint
  function fetchStocks() {
    fetch('/get_50_stocks')  // Adjust the endpoint URL as necessary
      .then(response => response.json())
      .then(data => {
        displayStocks(data);
      })
      .catch(error => {
        console.error('Error fetching stocks:', error);
      });
  }

  // Display stocks in the search popup
  function displayStocks(stocks) {
    searchResults.innerHTML = '';
    const existingSymbols = new Set(Array.from(rows).map(row => row.getAttribute('data-symbol')));
    console.log(existingSymbols);
    stocks.forEach(stock => {
      const stockItem = document.createElement('div');
      stockItem.classList.add('stock-item');
      stockItem.setAttribute('data-symbol', stock.value);

      // Determine the button symbol based on whether the stock is already in the table
      const buttonSymbol = existingSymbols.has(stock.value) ? '-' : '+';
      const buttonClass = existingSymbols.has(stock.value) ? 'remove-stock-button' : 'add-stock-button';

      stockItem.innerHTML = `
        <span>${stock.value} </span>
        <button class="${buttonClass}">${buttonSymbol}</button>
      `;
      searchResults.appendChild(stockItem);

      const actionButton = stockItem.querySelector(`.${buttonClass}`);
      actionButton.addEventListener('click', () => {
        if (buttonSymbol === '+') {
          addStockToTable(stock);
        } else {
          removeStockFromTable(stock);
        }
      });
    });
  }

  function removeStockFromTable(stock) {
    rows.forEach(row => {
      if (row.getAttribute('data-symbol') === stock.value) {
        row.remove(); // Remove the stock row
      }
    });
    rows = document.querySelectorAll('.stock-row');
  }

  // Add stock to the stock table
  function addStockToTable(stock) {
    const tableBody = document.querySelector('#stock-table tbody');
    const newRow = document.createElement('tr');
    newRow.classList.add('stock-row');
    newRow.setAttribute('data-symbol', stock.value);
    newRow.setAttribute('onclick', 'selectStock(this)');
    newRow.innerHTML = `
      <td>${stock.value}</td>
      <td class="last-price"></td>
      <td class="change"></td>
      <td class="change-percentage"></td>
    `;
    tableBody.appendChild(newRow);
    searchPopup.style.display = 'none';
    rows = document.querySelectorAll('.stock-row');
    console.log(rows);
  }
  
  
});



let selectedOptions = [];

document.getElementById('refresh-button').addEventListener('click', () => {
  chart.timeScale().resetTimeScale();
});
// Pattern Select Dropdown 
document.addEventListener('DOMContentLoaded', () => {
  const dropdownHeader = document.getElementById('dropdown-header');
  const dropdownContent = document.getElementById('dropdown-content');
  const options = document.querySelectorAll('.option');

 
  // Toggle dropdown visibility on header click
  dropdownHeader.addEventListener('click', () => {
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  });

  // Handle option click to toggle selection
  options.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      option.classList.toggle('selected');

      if (option.classList.contains('selected')) {
        selectedOptions.push(value);
      } else {
        selectedOptions = selectedOptions.filter(item => item !== value);
      }

      const selectedRow = document.querySelector('.stock-row.selected');
      if (selectedRow) {
        const symbol = selectedRow.getAttribute('data-symbol');
        const interval = document.getElementById('interval-select').value;
        if (selectedOptions.includes('sup-res')) {
          fetchAndDrawSupportResistance(symbol, interval);
        }
        else{
          srLineSeries.forEach(series => chart.removeSeries(series));
          srLineSeries = [];
        }
        if (selectedOptions.includes('trlines')) {
          fetchAndDrawTrendlines(symbol, interval);
        }
        else{
          trendlineSeries.forEach(series => chart.removeSeries(series));
          trendlineSeries = [];
        }
        if (selectedOptions.includes('ibarss')) {
          fetchAndDrawIbars(symbol, interval);
        }
        else{
          ibars.forEach(series => chart.removeSeries(series));
          ibars = [];
        }
        if (selectedOptions.includes('head-and-shoulders')) {
          fetchAndDrawHeadAndShoulders(symbol, interval);
        }
        else{
          headAndShoulders.forEach(series => chart.removeSeries(series));
          headAndShoulders = [];
        }
        if (selectedOptions.includes('double-tops')) {
          fetchAndDrawDoubleTops(symbol, interval);
        }
        else{
          doubleTops.forEach(series => chart.removeSeries(series));
          doubleTops = [];
        } 
        if (selectedOptions.includes('vshape')) {
          fetchAndDrawVShapes(symbol, interval);
        }
        else{
          vShapes.forEach(series => chart.removeSeries(series));
          vShapes = [];
        }
        if (selectedOptions.includes('cupandhandle')) {
          fetchAndDrawCupAndHandle(symbol, interval);
        }
        else{
          cupAndHandle.forEach(series => chart.removeSeries(series));
          cupAndHandle = [];
        }
        if (selectedOptions.includes('ema')) {
          fetchAndDrawEma(symbol, interval);
        }
        else{
          emaSeries.forEach(series => chart.removeSeries(series));
          emaSeries = [];
        }
      }
      
    });
  });

  // Close dropdown when clicking outside
  window.addEventListener('click', (event) => {
    if (!dropdownHeader.contains(event.target) && !dropdownContent.contains(event.target)) {
      dropdownContent.style.display = 'none';
    }
  });
}); 

document.getElementById('refresh-button').addEventListener('click', () => {
  chart.priceScale('right').applyOptions({
    autoScale : true,
  });
  chart.timeScale().resetTimeScale();
});

// Fullscreen button functionality
document.addEventListener("DOMContentLoaded", function() {
  const fullscreenButton = document.getElementById("fullscreen-button");

  fullscreenButton.addEventListener("click", function() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      const element = document.documentElement; // Fullscreen the entire document

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { /* IE/Edge */
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  });
});

// Add hover info mouse move event listener
chart.subscribeCrosshairMove(function(param) {
  if (!param || !param.time || !param.seriesData.size) {
    hoverInfo.innerHTML = '';
    return;
  }

  const data = param.seriesData.get(candleSeries);
  if (!data) {
    hoverInfo.innerHTML = '';
    return;
  }

  let { open, close, high, low } = data;

  open = open.toFixed(2);
  close = close.toFixed(2);
  high = high.toFixed(2);
  low = low.toFixed(2);

  hoverInfo.innerHTML = `
    Open: ${open}
    Close: ${close}
    High: ${high}
    Low: ${low}
  `;
});

// Initialize fetch data with the default selected row and interval
window.onload = () => {
  const selectedRow = document.querySelector('.stock-row.selected');
  if (selectedRow) {
    const symbol = selectedRow.getAttribute('data-symbol');
    const interval = document.getElementById('interval-select').value;
    fetchData(symbol, interval);
  }
};

var skt = fyersDataSocket.getInstance(accessToken);

function roundTimeToInterval(unixTimestamp, intervalMinutes) {
  const date = new Date((unixTimestamp + 5.5 * 60 * 60) * 1000);
  let minutes = date.getMinutes();
  let hours = date.getHours();

  if (intervalMinutes === 30) {
      if (minutes < 15) {
          minutes = 45;
          hours = hours - 1; // previous hour
      } else if (minutes < 45) {
          minutes = 15;
      } else {
          minutes = 45;
      }
  } else if (intervalMinutes === 60) {
      if (minutes < 15) {
          minutes = 15;
          hours =  hours - 1; // previous hour
      } else {
          minutes = 15;
      }
  } else {
      minutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
  }

  date.setHours(hours);
  date.setMinutes(minutes, 0, 0);
  return Math.floor(date.getTime() / 1000) ;
}





// Function to update OHLC data
function updateOHLC(ltp, time) {
  const interval = document.getElementById('interval-select').value;
  const roundedTime = roundTimeToInterval(time, interval);

  if (!currentOHLC[roundedTime]) {
    currentOHLC[roundedTime] = {
      time: roundedTime,
      open: ltp,
      high: ltp,
      low: ltp,
      close: ltp,
    };
  } else {
    currentOHLC[roundedTime].high = Math.max(currentOHLC[roundedTime].high, ltp);
    currentOHLC[roundedTime].low = Math.min(currentOHLC[roundedTime].low, ltp);
    currentOHLC[roundedTime].close = ltp;
  }

  candleSeries.update(currentOHLC[roundedTime]);
}

// WebSocket message handler
function onmsg(message) {
  const parsedData = message;
  // console.log(message);
  const selectedRow = document.querySelector('.stock-row.selected');
  const symbol = selectedRow.getAttribute('data-symbol');
  const row = document.querySelector(`tr[data-symbol="${symbol}"]`);
  const lastPriceCell = row.querySelector('.last-price');
  const changeCell = row.querySelector('.change');
  const changePercentageCell = row.querySelector('.change-percentage');
  if (parsedData.symbol === symbol) {
    const time = parsedData.exch_feed_time;
    const ltp = parsedData.ltp;
    lastPriceCell.textContent = parsedData.ltp;
    changeCell.textContent = parsedData.ch;
    changePercentageCell.textContent = parsedData.chp;
    updateOHLC(ltp, time);
  }
}


skt.on("connect", function() {
    const selectedRow = document.querySelector('.stock-row.selected');
    const symbol = selectedRow.getAttribute('data-symbol');
    skt.subscribe([symbol], false, 1);
    skt.mode(skt.FullMode, 1);
    console.log(skt.isConnected());
    skt.autoreconnect();
});

skt.on("message", function(message) {
    onmsg(message);
});

skt.on("error", function(message) {
    console.log("error is", message);
});

skt.on("close", function() {
    console.log("socket closed");
});

skt.connect();
