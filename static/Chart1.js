document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch CSV data and return as JSON
    async function fetchCSVData(url) {
        const response = await fetch(url);
        const data = await response.text();
        const parsedData = Papa.parse(data, {
            header: true,
            dynamicTyping: true,
        });
        return parsedData.data;
    }

    // Function to check for a double top pattern
    function detectDoubleTop(data) {
        const peaks = [];
        const troughs = [];

        for (let i = 1; i < data.length - 1; i++) {
            if (data[i].high > data[i - 1].high && data[i].high > data[i + 1].high) {
                peaks.push(i);
            } else if (data[i].low < data[i - 1].low && data[i].low < data[i + 1].low) {
                troughs.push(i);
            }
        }

        for (let i = 0; i < peaks.length - 1; i++) {
            for (let j = 0; j < troughs.length; j++) {
                if (peaks[i] < troughs[j] && peaks[i + 1] > troughs[j] && Math.abs(data[peaks[i]].high - data[peaks[i + 1]].high) < 0.5) {
                    return {
                        firstPeak: peaks[i],
                        trough: troughs[j],
                        secondPeak: peaks[i + 1],
                        price: data[peaks[i]].high
                    };
                }
            }
        }

        return null;
    }

    // Function to create the chart
    async function createChart() {
        const data = await fetchCSVData('/data');
        const labels = data.map(item => item.date);
        const closePrices = data.map(item => item.close);
        const openPrices = data.map(item => item.open);
        
        // Detect double top pattern
        const doubleTop = detectDoubleTop(data);
        if (doubleTop) {
            console.log("Double Top Detected:", doubleTop);
        } else {
            console.log("No Double Top Detected");
        }

        const ctx = document.getElementById('niftybankChart').getContext('2d');
        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Close Price',
                    data: closePrices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1
                }, {
                    label: 'Open Price',
                    data: openPrices,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'NSE NIFTYBANK-INDEX Prices'
                    },
                    annotation: {
                        annotations: doubleTop ? [{
                            type: 'line',
                            mode: 'horizontal',
                            scaleID: 'y-axis-0',
                            value: doubleTop.price,
                            borderColor: 'red',
                            borderWidth: 2,
                            label: {
                                content: 'Double Top',
                                enabled: true,
                                position: 'center'
                            }
                        }] : []
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Price'
                        }
                    }
                }
            }
        };

        new Chart(ctx, chartConfig);
    }

    createChart();
});
