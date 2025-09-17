(function() {
// Define reusable chart colors
const chartColors_appointments_overview = ["#566fe2", "#ff3b41", "#24aa5c", "#ffb037", "#2b81df"];

const options = {
  chart: {
    height: 300,
    type: "bar",
    toolbar: { show: false }
  },
  series: [
    {
      name: "Orders",
      data: [100, 200, 300, 400, 150]
    }
  ],
  plotOptions: {
    bar: {
      columnWidth: "40%",
      horizontal: false,
      borderRadius: 6,
      distributed: true
    }
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 6,
    colors: ["transparent"]
  },
  grid: {
    borderColor: "#d8dee6",
    strokeDashArray: 5,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
  },
  xaxis: {
    categories: ["Male", "Female", "Boys", "Girls", "Kids"]
  },
  yaxis: {
    labels: { show: false }
  },
  colors: chartColors,
  tooltip: {
    y: { formatter: val => val }
  }
};

new ApexCharts(document.querySelector("#overview"), options).render();

})();
