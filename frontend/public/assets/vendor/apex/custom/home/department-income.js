// No chartColors declaration here — use the global one
var options = {
    series: [{
        name: 'Sales',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    }],
    chart: {
        type: 'bar',
        height: 350
    },
    colors: [
        chartColors.column.primary,
        chartColors.column.success,
        chartColors.column.info
    ],
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    },
    yaxis: {
        title: {
            text: '$ (thousands)'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return "$ " + val + " thousands";
            }
        }
    }
};

var chart = new ApexCharts(document.querySelector("#department-income-chart"), options);
chart.render();
