
Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};

var chartsController = function(params) {

    var interval = "1 HOUR";
    var queryType = "chart";

    function getQueryParams() {
        return {
            interval: interval,
            queryType: queryType
        };
    }

    function requestChartData() {
        queryHelper.requestWeatherData(getQueryParams(), renderChartData);
    }

    function prepareData(data, dateColumn, column) {
        var columnData = [];
        var now = new Date();
        var currentTimeZoneOffsetInHours = now.getTimezoneOffset() / 60;

        for (var i = 0; i < data.length; i++) {
            var dt = data[i][dateColumn];
            var localdt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
            localdt = localdt.addHours(-currentTimeZoneOffsetInHours);
            var utcdt = Date.UTC(localdt.getUTCFullYear(), localdt.getUTCMonth(), localdt.getUTCDate(), localdt.getUTCHours(), localdt.getUTCMinutes(), localdt.getUTCSeconds());
            var value = data[i][column];
            columnData.push([utcdt, value]);
        }

        return columnData;
    }

    function renderChartData(weatherData) {
        var data = weatherData.data;
        var t1 = prepareData(data, "MeasuredDateTime", "Temperature1");
        var t2 = prepareData(data, "MeasuredDateTime", "Temperature2");
        $('#chart').highcharts({
            chart: {
                animation: false
            },
            title: {
                text: 'Температура'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Температура (°C)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ' °C'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'T1',
                data: t1
            }, {
                name: 'T2',
                data: t2
            }]
        });
    }

    function getIntervalDescription(interval) {
        var intervalAnchors = $(".intervalItem");
        for (var i = 0; i < intervalAnchors.length; i++) {
            var a = intervalAnchors[i];
            if (a.getAttribute("interval") == interval)
                return a.innerHTML;
        }

        return "";
    }

    function renderChartController() {
        var chartController = ge("chartController");
        var intervalSpan = document.createElement("span");
        chartController.appendChild(intervalSpan);

        intervalSpan.id = "intervalSpan";
        intervalSpan.className = "example";
        intervalSpan.innerHTML = "Показывать график за: {0}".format(getIntervalDescription(interval));
        intervalSpan.setAttribute("data-jq-dropdown", "#jq-dropdown-2");

        var intervalAnchors = $(".intervalItem");
        intervalAnchors.bind("click", function() {
            var intervalToSet = this.getAttribute("interval");
            if (intervalToSet != interval) {
                interval = intervalToSet;
                intervalSpan.innerHTML = "Показывать график за: {0}".format(getIntervalDescription(interval));
                requestChartData();
            }
        });
    }

    function init() {
        renderChartController();
        requestChartData();
    }

    init();
};
