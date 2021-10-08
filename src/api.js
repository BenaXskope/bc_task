import { API_KEY } from "./config";

// WS

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";

socket.addEventListener("message", (e) => {
  let { TYPE: type, FROMSYMBOL: ticker, PRICE: newPrice } = JSON.parse(e.data);

  if (type === INVALID_SUB) {
    newPrice = "invalid";
  } else if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(ticker)
    ? [...tickersHandlers.get(ticker)]
    : [];

  handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker, currency = "USD") {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${currency}`]
  });
}

function unsubscribeToTickerOnWs(ticker, currency = "USD") {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~${currency}`]
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const isSubscribed = tickersHandlers.has(ticker);
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  if (!isSubscribed) {
    subscribeToTickerOnWs(ticker);
  }
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeToTickerOnWs(ticker);
};

// HTTP

const priceGraphCache = new Map(); // caching map

const coinNameToID = {
  BTC: "bitcoin",
  ETH: "ethereum"
};

const reverseGraphData = (graphData) => {
  return graphData.map((priceData) => [priceData[0], 1 / priceData[1]]);
};

export const getCoinPriceGraph = async (
  coinName,
  currencyName,
  forceRefresh = false
) => {
  let reverseFlag = false;
  const cacheKey = `${coinName}-${currencyName}`;
  const reversedCacheKey = `${currencyName}-${coinName}`;

  if (coinName === "USD") {
    coinName = [currencyName, (currencyName = coinName)][0];
    reverseFlag = true;
  }

  if (!forceRefresh && priceGraphCache.has(cacheKey)) {
    return priceGraphCache.get(cacheKey);
  }

  if (!forceRefresh && priceGraphCache.has(reversedCacheKey)) {
    return reverseGraphData(priceGraphCache.get(reversedCacheKey));
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${
      coinNameToID[coinName]
    }/market_chart?vs_currency=${currencyName.toLowerCase()}&days=14&interval=daily`;

    let coinPriceGraph = await fetch(url)
      .then((r) => r.json())
      .then((d) => d.prices);

    if (reverseFlag) {
      coinPriceGraph = reverseGraphData(coinPriceGraph);
    }

    priceGraphCache.set(cacheKey, coinPriceGraph);
    return coinPriceGraph;
  } catch (err) {
    console.log("Error:", err);
    return "err";
  }
};

// LocalStorage - emulating server-save
export const getCurrencies = () => {
  return JSON.parse(localStorage.getItem("currencies"));
};

export const setCurrencies = (curData) => {
  localStorage.setItem("currencies", JSON.stringify(curData));
};
