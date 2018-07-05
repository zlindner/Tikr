'use strict'

/* TODO:
 * 
 * 1D stock charts need fixing
 * 
 */

// base IEX api url
const IEX = 'https://api.iextrading.com/1.0';

// rgba colour representing positive
const POSITIVE = 'rgba(25, 190, 135, 255)';

// rgba colour representing negative
const NEGATIVE = 'rgba(247, 33, 33, 255)';

// rgba colour representing zero
const ZERO = 'rgba(34, 34, 34, 255)'

// js enum for determining months from index
const MONTHS = Object.freeze({
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
});

$(document).ready(function() {
    let symbols = getSymbols();
    let chart = initChart();

    //TODO: move getting symbols to server, might not have to limit results then
    $('#search').autocomplete({
        source: function (request, response) {
            var results = $.ui.autocomplete.filter(symbols, request.term);

            response(results.slice(0, 20));
        }, 
        minLength: 0,
        messages: {
            noResults: '',
            results: function() {}
        },
        select: function(event, ui) {
            let symbol = ui.item.value;

            getPrice(symbol);
            getChange(symbol);
            getStats(symbol);

            updateChart(chart, symbol, '1D');

            $(document).on('click', '.time-period-button:not(.selected)', function() {
                updateChart(chart, symbol, $(this).text());

                $('.time-period-button.selected').removeClass('selected');
                $(this).addClass('selected');
            });
        }
    });
});

//TODO: asynchronous
function getSymbols() {
    const URL = IEX + '/ref-data/symbols';
    let symbols = [];

    $.ajax({
        type: 'get',
        url: URL,
        dataType: 'json',
        async: false,
        success: function(json) {
            json.forEach(function(obj) {
                let symbol = obj.symbol;
                let name = obj.name;

                if (name.length > 0) {
                    symbols.push({
                        label: symbol + ' - ' + name,
                        value: symbol
                    });
                } else {
                    symbols.push({
                        label: symbol,
                        value: symbol
                    });
                }
            });
        }
    });

    return symbols;
}

function getPrice(symbol) {
    const URL = IEX + '/stock/' + symbol + '/price';

    $.get(URL, function(price) {
        $('#stockPrice').text(price.toFixed(2)); 
    });
}

function getStats(symbol) {
    const URL = IEX + '/stock/' + symbol + '/stats';

    $.getJSON(URL, function(json) {
        $('#stockName').text(json.companyName);
        $('#stockSymbol').text('(' + symbol + ')');
    });
}

function getChange(symbol) {
    const URL = IEX + '/stock/' + symbol + '/previous';

    $.getJSON(URL, function(json) {
        let prevClose = json.close;

        const URL2 = IEX + '/stock/' + symbol + '/price';
        
        $.get(URL2, function(price) {
            let diff = price - prevClose;
            let diffPercent = diff / prevClose * 100;

            if (diff > 0) {
                diff = '+' + diff.toFixed(2);
                diffPercent = '+' + diffPercent.toFixed(2);

                $('#stockDiff').addClass('positive');
            } else if (diff < 0) {
                diff = '-' + diff.toFixed(2);
                diffPercent = '-' + diffPercent.toFixed(2);

                $('#stockDiff').addClass('negative');
            }

            $('#stockDiff').text(diff + ' (' + diffPercent + '%)');
        });
    });
}

function initChart() {
    //TODO: change this depending on change sign
    let colour = POSITIVE;

    let chart = new Chart($('#stockChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                fill: false,
                lineTension: 0,
                borderColor: colour,
                borderWidth: 1.5,
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                pointHoverBackgroundColor: colour,
                pointHoverBorderColor: colour
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    display: false,
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        display: false
                    },
                    gridLines: {
                        color: 'transparent'
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                displayColors: false
            },
            animation: false,
            maintainAspectRatio: false
        }
    });

    return chart;
}

//TODO: asynchronous
function getChartData(symbol, period) {
    const URL = IEX + '/stock/' + symbol + '/chart/' + period;

    let chartData = {
        labels: [],
        data: []
    };

    $.ajax({
        type: 'get',
        url: URL,
        dataType: 'json',
        async: false,
        success: function(json) {
            let labels = [];
            let data = [];

            //TODO: possibly add year for periods >= 1y
            json.forEach(function(obj) {
                let date = new Date(obj.date);
                let label = MONTHS[date.getMonth()] + ' ' + date.getDate();

                labels.push(label);
                data.push(obj.open);
            });

            chartData.labels = labels;
            chartData.data = data;
        },
        fail: function(error) {
            console.log(error);
        }
    });

    return chartData;
}

function updateChart(chart, symbol, period) {
    let chartData = getChartData(symbol, period);

    chart.data.labels = chartData.labels;
    chart.data.datasets[0].data = chartData.data;

    chart.options.tooltips.callbacks = {
        label: function(items, data) {
            return symbol + ': ' + items.yLabel;
        }
    }
    
    chart.update();
}