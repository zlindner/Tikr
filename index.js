$(document).ready(function () {
    let chart = new Chart($('#stockChart'), {
        type: 'line',
        data: {
            datasets: []
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
            }
        }
    });
});