document.addEventListener("DOMContentLoaded", function () {
  function createSparkline(selector, data, color) {
    const el = document.querySelector(selector);
    if (!el) {
      console.warn(`Sparkline container not found: ${selector}`);
      return;
    }

    const options = {
      series: [{ data }],
      chart: {
        type: "line",
        height: 50,
        width: 120,
        sparkline: { enabled: true },
      },
      stroke: { width: 5 },
      colors: [color],
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: {
          title: { formatter: () => "" },
        },
        theme: "dark",
        marker: { show: false },
      },
    };

    const chart = new ApexCharts(el, options);
    chart.render();
  }

  // Render your charts
  createSparkline("#sparkline1", [10, 10, 15, 15, 20, 20, 25], "#566fe2");
  createSparkline("#sparkline2", [10, 10, 15, 15, 20, 20, 25], "#566fe2");
  createSparkline("#sparkline3", [10, 10, 15, 15, 20, 20, 25], "#566fe2");
});
