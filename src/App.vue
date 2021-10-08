<template>
  <div class="flex flex-col h-screen items-center bg-gray-900 overflow-y-auto">
    <div class="p-6 max-w-screen-xl w-full">
      <nav class="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-4 align-self-center">
        <router-link
          class="
            overflow-hidden
            shadow
            text-center
            font-bold
            text-2xl
            border-purple-800
            bg-gray-700
            text-gray-200
            cursor-pointer
            py-4
            rounded-2xl
          "
          active-class="
        bg-gray-800
        text-yellow-500
        "
          :to="{ name: 'main' }"
          >Конвертер</router-link
        >

        <router-link
          class="
            overflow-hidden
            shadow
            text-center
            font-bold
            text-2xl
            border-purple-800
            bg-gray-700
            text-gray-200
            cursor-pointer
            py-4
            rounded-2xl
          "
          active-class="
        bg-gray-800
        text-yellow-500
        "
          :to="{ name: 'portfolio' }"
          >Портфель</router-link
        >
      </nav>
      <div
        class="
          overflow-hidden
          flex flex-col
          items-center
          bg-gray-800
          border-yellow-500
          p-6
          rounded-2xl
        "
      >
        <LoadSpinner v-if="isLoading" fullscreen />
        <router-view v-else :tickers="tickers" />
      </div>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from "./api";
import LoadSpinner from "@/components/LoadSpinner";
const coinList = ["BTC", "ETH"];

export default {
  name: "App",

  components: {
    LoadSpinner
  },

  data() {
    return {
      tickers: [],
      invalidTickers: new Set(),
      unloadTickers: []
    };
  },

  created() {
    coinList.forEach((coinName) => {
      this.unloadTickers.push(coinName);
      this.tickers.push({
        name: coinName,
        price: "-"
      });
      subscribeToTicker(coinName, (newPrice) =>
        this.updateTicker(coinName, newPrice)
      );
    });
  },

  beforeUnmount() {
    this.tickers.forEach((t) => unsubscribeFromTicker(t.name));
  },

  computed: {
    isLoading() {
      return this.unloadTickers.length > 0;
    }
  },

  methods: {
    tickerSubscribe(tickerName) {
      subscribeToTicker(tickerName, (newPrice) =>
        this.updateTicker(tickerName, newPrice)
      );
    },

    updateTicker(tickerName, price) {
      let tickerForUpdate = this.tickers.find((t) => t.name === tickerName);
      if (price === "invalid") {
        this.invalidTickers.add(tickerName);
      }
      tickerForUpdate.price = price;

      const unloadIdx = this.unloadTickers.indexOf(tickerName);
      if (unloadIdx > -1) {
        this.unloadTickers.splice(unloadIdx, 1);
      }
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    }
  }
};
</script>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}
</style>
