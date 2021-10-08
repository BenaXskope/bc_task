<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <div class="container">
      <h2 class="text-center font-bold text-xl text-yellow-500">Портфель</h2>
      <dl class="mt-5 grid grid-cols-1 gap-5">
        <PriceCard :title="'Стоимость портфеля'" :price="`${overallCost} $`" />
      </dl>
      <hr class="w-full border-t border-yellow-500 my-4" />
      <h2 class="text-center font-bold text-xl text-yellow-500">
        Состав портфеля
      </h2>
      <dl class="mt-5 grid grid-cols-1 gap-5">
        <PriceCard
          v-for="cur of currencies"
          :key="cur"
          :title="cur.name"
          :price="cur.amount"
        >
          <template #actions>
            <hr class="w-full border-t border-yellow-500 my-4" />
            <div class="flex flex-col-reverse items-center gap-4 sm:flex-row">
              <button
                @click="changeCurrencyAmount(cur.name, 'SUB', inputs[cur.name])"
                class="
                  bg-gray-900
                  rounded-full
                  mt-3
                  text-center text-yellow-500
                  font-bold
                  border-yellow-500 border-2
                  pb-1
                  text-3xl
                  w-11
                  h-11
                "
              >
                -
              </button>
              <div class="flex-grow">
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
                  Изменить
                </label>
                <input
                  v-model.number="inputs[cur.name]"
                  type="number"
                  placeholder="0"
                  class="
                    appearance-none-custom
                    block
                    w-full
                    bg-gray-700
                    text-yellow-500
                    placeholder-yellow-500
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
              <button
                @click="changeCurrencyAmount(cur.name, 'ADD', inputs[cur.name])"
                class="
                  bg-gray-900
                  rounded-full
                  mt-3
                  text-center text-yellow-500
                  font-bold
                  border-yellow-500 border-2
                  pb-1
                  text-3xl
                  w-11
                  h-11
                "
              >
                +
              </button>
            </div>
          </template>
        </PriceCard>
      </dl>
      <PieChart
        :key="updateChartFlag"
        :datasets="currenciesCost"
        :labels="currenciesNames"
        :colors="[
          'rgba(245, 158, 11)',
          'rgba(21, 244, 238)',
          'rgb(255, 7, 58)'
        ]"
      />
    </div>
  </div>
</template>
<script>
import PriceCard from "@/components/PriceCard";
import PieChart from "@/components/PieChart";
import { getCurrencies, setCurrencies } from "@/api";
import { formatPrice } from "@/utils";

export default {
  name: "PortfolioPage",

  components: {
    PriceCard,
    PieChart
  },

  props: {
    tickers: {
      required: true,
      type: Array
    }
  },

  data() {
    return {
      currencies: [
        {
          name: "BTC",
          amount: 0
        },
        {
          name: "ETH",
          amount: 0
        },
        {
          name: "USD",
          amount: 0
        }
      ],
      inputs: {
        BTC: null,
        ETH: null,
        USD: null
      },

      updateChartFlag: false
    };
  },

  created() {
    const loadedCurrencies = getCurrencies();
    if (loadedCurrencies) {
      this.currencies = loadedCurrencies;
    }
  },

  computed: {
    overallCost() {
      return this.formatPrice(
        this.currencies.reduce((acc, cur) => {
          if (cur.name === "USD") {
            return acc + cur.amount;
          }

          return (
            acc +
            cur.amount * this.tickers.find((t) => t.name === cur.name).price
          );
        }, 0)
      );
    },

    currenciesNames() {
      return this.currencies.map((cur) => cur.name);
    },

    currenciesCost() {
      return this.currencies.map((cur) => {
        if (cur.name === "USD") {
          return cur.amount;
        }

        return cur.amount * this.tickers.find((t) => t.name === cur.name).price;
      });
    }
  },

  methods: {
    formatPrice,

    changeCurrencyAmount(curName, action, amount) {
      this.updateChartFlag = !this.updateChartFlag;
      const cur = this.currencies.find((cur) => cur.name === curName);
      this.inputs[curName] = null;

      if (action == "ADD") {
        cur.amount += amount;
        return;
      }

      cur.amount = cur.amount - amount < 0 ? 0 : cur.amount - amount;
    }
  },

  watch: {
    currencies: {
      deep: true,
      handler() {
        setCurrencies(this.currencies);
      }
    }
  }
};
</script>
