// No chartColors declaration here — use the global one
var options = {
    series: [{
        name: 'Income',
        data: [31, 40, 28, 51, 42, 109, 100]
    }],
    chart: {
        height: 350,
        type: 'area'
    },
    colors: [chartColors.area.primary, chartColors.area.success],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    }
};

var chart = new ApexCharts(document.querySelector("#income-chart"), options);
chart.render();
