'use strict'

//TODO: add ability to minimize certain wrappers

$(document).ready(function() {
    /*
     * sidebar
     */

    $(document).on('click', '.sidebar>ul>li>a', function() {
        let id = $(this).attr('id');

        if (id) {
            $('.wrapper').hide();
            $('.wrapper-' + id).show();

            if (id == 'stocks') {
                $('.wrapper-stocks').hide();
                $('.wrapper-search').show();
            }
        }
    });

    /*
     * login
     */

    $('.form-login input[name="login"]').click(function(e) {
        e.preventDefault();
        login();
    }); 

    $('.form-login input[name="create"]').click(function() {
        $('.form-login').hide();

        $('.form-create-account').trigger('reset');
        $('.form-error').hide();
        $('.form-create-account').show();
    });

    $('.form-login input[name="forgot"]').click(function() {
        $('.form-login').hide();

        $('.form-forgot-password').trigger('reset');
        $('.form-error').hide();
        $('.form-forgot-password').show();
    });

    $('.form-create-account input[name="create"]').click(function(e) {
        e.preventDefault();
        createAccount();
    });

    $('.form-create-account input[name="login"]').click(function() {
        $('.form-create-account').hide();

        $('.form-login').trigger('reset');
        $('.form-error').hide();
        $('.form-login').show();
    });

    $('.form-forgot-password input[name="reset"]').click(function(e) {
        e.preventDefault();
        forgotPassword();
    });

    $('.form-forgot-password input[name="login"]').click(function() {
        $('.form-forgot-password').hide();

        $('.form-login').trigger('reset');
        $('.form-error').hide();
        $('.form-login').show();
    });

    /*
     * stocks
     */

    jQuery.ui.autocomplete.prototype._resizeMenu = function() {
        this.menu.element.outerWidth(this.element.outerWidth() - 1);
    }

    let symbol;
    let chart = initChart();

    $('#stockInput').autocomplete({
        source: '/search',
        select: function(event, ui) {
            $('.wrapper-stocks').show();
            $('.wrapper-company').show();

            $('#stockInput').val('');

            symbol = ui.item.value;

            loadStock(symbol, chart);

            return false;
        },
        open: function(event, ui) {
            $('.wrapper-search>input[type="text"]').css('border-bottom', 'none');
            $('.wrapper-search>input[type="text"]').css('border-bottom-left-radius', '0');
            $('.wrapper-search>input[type="text"]').css('border-bottom-right-radius', '0');
        },
        close: function(event, ui) {
            $('.wrapper-search>input[type="text"]').css('border-bottom', '1px solid #dfdfdf');
            $('.wrapper-search>input[type="text"]').css('border-radius', '.125rem');
        },
        minLength: 1,
        position: {
            my: 'left+0 top-1'
        },
        messages: {
            noResults: '',
            results: function() {}
        }
    });

    $('.wrapper-periods>button').click(function() {
        if ($(this).hasClass('active-period')) {
            return;
        }

        $('.active-period').removeClass('active-period');
        $(this).addClass('active-period');

        if ($(this).text() == '1D') {
            loadChart(symbol, '1D', chart);

            chartTimer = setInterval(function() {
                loadChart(symbol, '1D', chart);
            }, 60000);
        } else {
            if (chartTimer) {
                clearInterval(chartTimer);
            }

            loadChart(symbol, $(this).text(), chart);
        }
    });
});

/*
 * login
 */ 

function login() {
    let email = $('.form-login input[name="email"]').val();
    let password = $('.form-login input[name="password"]').val(); 

    if (!validateEmail(email) || password.length == 0) {
        $('.form-error').text('Check your email and password and try again.');
        $('.form-error').show();
        return;
    }

    $.ajax({
        type: 'get',
        url: '/login',
        dataType: 'json',
        data: {
            email: email,
            password: password
        },
        success: function(data) {            
            if (data.status == 'fail') {
                $('.form-error').text('Check your email and password and try again.');
                $('.form-error').show();
                return;
            }
    
            $('.form-error').hide();

            console.log(data);

            // login
            window.location.replace('index.html');

            // TODO: if not verified add verification banner
        },
        fail: function(error) {
            console.log(error);
        }
    });
}

function createAccount() {
    let email = $('.form-create-account input[name="email"]').val();
    let password = $('.form-create-account input[name="password"]').val();
    let password2 = $('.form-create-account input[name="password2"]').val();

    if (!validateEmail(email) || password.length == 0 || password2.length == 0 || password != password2) {
        $('.form-error').text('Check your email and passwords and try again.');
        $('.form-error').show();
        return;
    }

    $('.form-error').hide();

    $.ajax({
        type: 'get',
        url: '/createAccount',
        dataType: 'json',
        data: {
            email: email,
            password: password
        },
        success: function(data) {

        },
        fail: function(error) {
            console.log(error);
        }
    });
}

function forgotPassword() {
    let email = $('.form-forgot-password input[name="email"]').val();

    if (!validateEmail(email)) {
        $('.form-error').text('Check your email and try again.');
        $('.form-error').show();
        return;
    }

    $('.form-error').hide();
}

function validateEmail(email) {
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}

/*
 * stocks
 */ 

 // base IEX api url
const IEX = 'https://api.iextrading.com/1.0';

// updates stock price every min
let priceTimer;

// updates stock chart every min (for 1D only)
let chartTimer;

function loadStock(symbol, chart) {
    if (priceTimer) {
        clearInterval(priceTimer);
    }

    if (chartTimer) {
        clearInterval(chartTimer);
    }

    $.getJSON(IEX + '/stock/' + symbol + '/stats', function(stats) {
        $('#stockName').text(stats.companyName);
        $('#stockSymbol').text('(' + stats.symbol + ')');
    });

    $.getJSON(IEX + '/stock/' + symbol + '/previous', function(prev) {
        getPrice(symbol, prev, false, chart);

        // update price every minute
        priceTimer = setInterval(function() {
            getPrice(symbol, prev, true, chart)
        }, 60000);
    });

    loadChart(symbol, '1D', chart);

    chartTimer = setInterval(function() {
        loadChart(symbol, '1D', chart);
    }, 60000);

    loadCompany(symbol);
}

function getPrice(symbol, prev, update, chart) {
    $.get(IEX + '/stock/' + symbol + '/price', function(price) {
        // dont animate on first call
        if (update) {
            let current = parseFloat($('#stockPrice').text()).toFixed(2);

            if (current != price.toFixed(2)) {
                $('#stockPrice').fadeOut(200);
                $('#stockPrice').fadeIn(400);
            }
        } 
        
        $('#stockPrice').text(price.toFixed(2));

        let diff = (price - prev.close).toFixed(2);
        let diffPercent = (diff / prev.close * 100).toFixed(2);

        if (diff > 0) {
            diff = '+' + diff;
            diffPercent = '+' + diffPercent;

            $('#priceDiff').css('color', '#19be87');

            chart.data.datasets[0].borderColor = '#19be87';
            chart.data.datasets[0].pointHoverBackgroundColor = '#19be87';
            chart.data.datasets[0].pointHoverBorderColor = '#19be87';
        } else if (diff < 0) {
            $('#priceDiff').css('color', '#f72121');

            chart.data.datasets[0].borderColor = '#f72121';
            chart.data.datasets[0].pointHoverBackgroundColor = '#f72121';
            chart.data.datasets[0].pointHoverBorderColor = '#f72121';
        } else {
            $('#priceDiff').css('color', '#222222');
            
            chart.data.datasets[0].borderColor = '#222222';
            chart.data.datasets[0].pointHoverBackgroundColor = '#222222';
            chart.data.datasets[0].pointHoverBorderColor = '#222222';
        }

        chart.update();

        $('#priceDiff').text(diff + ' (' + diffPercent + '%)');
    });
}

function initChart() {
    let chart = new Chart($('#stockChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                fill: false,
                lineTension: 0,
                borderWidth: 1.5,
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(0, 0, 0, 0)',
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

function loadChart(symbol, period, chart) {
    $.getJSON(IEX + '/stock/' + symbol + '/chart/' + period, function(json) {
        let labels = [];
        let data = [];

        json.forEach(function(obj) {
            if (obj.open) {
                labels.push(obj.label);
                data.push(obj.open);
            }
        });

        chart.data.labels = labels;
        chart.data.datasets[0].data = data;

        chart.options.tooltips.callbacks = {
            label: function(items) {
                return symbol + ': ' + (items.yLabel).toFixed(2);
            }
        }

        chart.update();

        $('.wrapper-chart').show();
    });
}

function loadCompany(symbol) {
    $.getJSON(IEX + '/stock/' + symbol + '/company', function(json) {
        if (json.description) {
            $('#companyDesc').text(json.description);
        } else {
            $('#companyDesc').text('...');
        }

        if (json.exchange) {
            $('#companyExchange').text(json.exchange);
        } else {
            $('#companyExchange').text('...');
        }

        if (json.industry) {
            $('#companyIndustry').text(json.industry);
        } else {
            $('#companyIndustry').text('...');
        }

        if (json.sector) {
            $('#companySector').text(json.sector);
        } else {
            $('#companySector').text('...');
        }

        if (json.CEO) {
            $('#companyCEO').text(json.CEO);
        } else {
            $('#companyCEO').text('...');
        }

        if (json.website) {
            $('#companyWebsite').text(json.website).attr('href', json.website);
        } else {
            $('#companyWebsite').text('...');
        }
    });
}