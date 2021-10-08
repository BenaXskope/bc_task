<template>
  <div><canvas ref="canvas" style="min-height: 400px" /></div>
</template>
<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    labels: {
      required: true,
      type: Array
    },
    dataset: {
      required: true,
      type: Array
    }
  },

  data() {
    return {
      gradient: null,
      gradient2: null
    };
  },

  mounted() {
    this.gradient = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);

    this.renderChart(
      {
        labels: this.labels,
        datasets: [
          {
            chartLegend: null,
            borderColor: "rgba(245, 158, 11)",
            pointBackgroundColor: "rgba(17, 24, 39)",
            borderWidth: 1,
            barThickness: 6,
            pointBorderColor: "rgba(245, 158, 11)",
            backgroundColor: this.gradient,
            data: this.dataset
          }
        ]
      },
      {
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false
      }
    );
  }
};
</script>
