<template>
  <div><canvas ref="canvas" style="min-height: 300px" /></div>
</template>
<script>
import { Doughnut } from "vue-chartjs";

export default {
  extends: Doughnut,
  props: {
    labels: {
      type: Array,
      required: true
    },
    datasets: {
      type: Array,
      required: true
    },
    colors: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.renderChart(
      {
        labels: this.labels,
        datasets: [
          {
            borderColor: "rgba(31, 41, 55)",
            backgroundColor: this.colors,
            data: this.datasets
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: false
      }
    );
  }
};
</script>
