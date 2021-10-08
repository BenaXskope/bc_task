<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <div class="container">
      <h2 class="text-center font-bold text-xl text-yellow-500">
        Текущий курс
      </h2>
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <PriceCard
          v-for="t in tickers"
          :key="t.name"
          :title="`${t.name} - USD`"
          :price="t.price"
        />
      </dl>
      <hr class="w-full border-t border-yellow-500 my-4" />
      <h2 class="text-center font-bold text-xl text-yellow-500 mb-4">
        Конвертер
      </h2>
      <form class="grid grid-cols-1 sm:grid-cols-5">
        <div class="mb-2 sm:col-span-2">
          <div class="flex gap-2 mb-2">
            <label
              v-for="fromCurrency of currencyTypes"
              :key="fromCurrency"
              class="inline-flex items-center cursor-pointer"
            >
              <input
                v-model="fromSelected"
                type="radio"
                class="
                  form-radio
                  cursor-pointer
                  border-yellow-500
                  text-yellow-500
                  h-6
                  w-6
                "
                :class="[
                  fromCurrency === toSelected
                    ? 'bg-gray-400 border-none'
                    : 'bg-gray-900'
                ]"
                name="from-cur"
                :value="fromCurrency"
                :disabled="fromCurrency === toSelected"
              />
              <span
                class="ml-2 font-bold"
                :class="[
                  fromCurrency === toSelected
                    ? 'text-gray-400'
                    : 'text-yellow-500'
                ]"
                >{{ fromCurrency }}</span
              >
            </label>
          </div>
          <div>
            <label
              class="
                block
                uppercase
                tracking-wide
                text-yellow-500 text-xs
                font-bold
                out
                mb-2
              "
              for="grid-first-name"
            >
              Сумма
            </label>
            <input
              v-model.number="fromAmount"
              @input="changeAmount('from')"
              type="number"
              class="
                appearance-none-custom
                block
                w-full
                bg-gray-900
                text-yellow-500
                border border-yellow-500
                rounded
                py-3
                px-4
                mb-3
                leading-tight
                outline-none
                focus:outline-none
              "
            />
          </div>
        </div>
        <double-arrow-icon
          @click="switchCurrencies"
          class="
            cursor-pointer
            bg-gray-900
            p-1
            rounded
            border-yellow-500 border
            fill-current
            text-yellow-500
            h-10
            w-10
            mb-3
            sm:transform
            justify-self-center
            self-center
            sm:rotate-90 sm:translate-y-6
          "
        />
        <div class="sm:col-span-2">
          <div class="flex gap-2 mb-2">
            <label
              v-for="toCurrency of currencyTypes"
              :key="toCurrency"
              class="inline-flex items-center cursor-pointer"
            >
              <input
                v-model="toSelected"
                type="radio"
                class="
                  form-radio
                  bg-gray-400
                  cursor-pointer
                  text-yellow-500
                  h-6
                  w-6
                "
                :class="[
                  toCurrency === fromSelected
                    ? 'bg-gray-400 border-none'
                    : 'bg-gray-900'
                ]"
                name="to-cur"
                :value="toCurrency"
                :disabled="toCurrency === fromSelected"
              />
              <span
                class="ml-2 font-bold"
                :class="[
                  toCurrency === fromSelected
                    ? 'text-gray-400'
                    : 'text-yellow-500'
                ]"
                >{{ toCurrency }}</span
              >
            </label>
          </div>
          <div>
            <label
              class="
                block
                uppercase
                tracking-wide
                text-yellow-500 text-xs
                font-bold
                out
                mb-2
              "
              for="grid-first-name"
            >
              Сумма
            </label>
            <input
              v-model.number="toAmount"
              @input="changeAmount('to')"
              type="number"
              class="
                appearance-none
                block
                w-full
                bg-gray-900
                text-yellow-500
                border border-yellow-500
                rounded
                py-3
                px-4
                mb-3
                leading-tight
                outline-none
                focus:outline-none
              "
            />
          </div>
        </div>
      </form>
      <hr class="w-full border-t border-yellow-500 my-4" />
      <h2 class="text-center font-bold text-xl text-yellow-500 mb-4">
        Изменение курса
      </h2>
      <button
        @click="changeGraphData(true)"
        class="
          rounded
          text-yellow-500
          font-bold
          border border-yellow-500
          bg-gray-900
          p-1
          float-right
        "
      >
        Обновить
      </button>
      <LoadSpinner v-if="graphLoading" />
      <LineChart v-else v-bind="priceGraph" />
    </div>
  </div>
</template>
<script>
import LineChart from "@/components/LineChart";
import PriceCard from "@/components/PriceCard";
import DoubleArrowIcon from "@/components/Icons/DoubleArrowIcon";
import LoadSpinner from "@/components/LoadSpinner";
import { getCoinPriceGraph } from "@/api";
import { formatPrice } from "@/utils";

export default {
  name: "App",

  components: {
    DoubleArrowIcon,
    LineChart,
    LoadSpinner,
    PriceCard
  },

  props: {
    tickers: {
      required: true,
      type: Array
    }
  },

  data() {
    return {
      currencyTypes: ["BTC", "ETH", "USD"],
      fromSelected: "BTC",
      toSelected: "USD",
      fromAmount: 1,
      toAmount: this.recalculatePrice(1, "BTC", "USD"),
      priceGraph: null,
      graphLoading: true,

      changedAmountAutomatically: false,
      changedCurrencyAutomatically: false
    };
  },

  computed: {
    selectedCurrencies() {
      return [this.fromSelected, this.toSelected];
    }
  },

  async mounted() {
    await this.changeGraphData();
  },

  methods: {
    formatPrice,

    async changeGraphData(forceRefresh = false) {
      this.graphLoading = true;
      const graphData = await getCoinPriceGraph(
        this.fromSelected,
        this.toSelected,
        forceRefresh
      );

      const dates = graphData.map((el) => {
        const elDate = new Date(el[0]);
        return `${("0" + elDate.getDate()).slice(-2)}.${(
          "0" + elDate.getMonth()
        ).slice(-2)}`;
      });
      const prices = graphData.map((el) => this.formatPrice(el[1]));

      this.priceGraph = {
        labels: dates,
        dataset: prices
      };
      this.graphLoading = false;
    },

    switchCurrencies() {
      this.fromSelected = [
        this.toSelected,
        (this.toSelected = this.fromSelected)
      ][0];
    },

    changeAmount(initiatorSide) {
      if (initiatorSide === "from") {
        this.toAmount = this.recalculatePrice(
          this.fromAmount,
          this.fromSelected,
          this.toSelected
        );
        return;
      }

      this.fromAmount = this.recalculatePrice(
        this.toAmount,
        this.toSelected,
        this.fromSelected
      );
    },

    recalculatePrice(amount, fromCur, toCur) {
      let fromToUSD;
      let toToUSD;

      if (fromCur === "USD") {
        toToUSD = this.tickers.find((ticker) => ticker.name === toCur).price;
        return amount / toToUSD;
      }

      if (toCur === "USD") {
        fromToUSD = this.tickers.find(
          (ticker) => ticker.name === fromCur
        ).price;
        return amount * fromToUSD;
      }

      toToUSD = this.tickers.find((ticker) => ticker.name === toCur).price;

      fromToUSD = this.tickers.find((ticker) => ticker.name === fromCur).price;

      if (toCur === "USD") {
        return amount * fromToUSD;
      }

      return (amount * fromToUSD) / toToUSD;
    }
  },

  watch: {
    selectedCurrencies: {
      deep: true,
      handler() {
        this.changeAmount("from");
        this.changeGraphData();
      }
    }
  }
};
</script>

<style></style>
