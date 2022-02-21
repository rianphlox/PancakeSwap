require('dotenv').config();
const Web3 = require("web3");
const url = process.env.URL;


const addresses = {
    WBNB : '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    myAddress : process.env.TEST_WALLET,
    methodID : '0xf305d719'
}

var options = {
  timeout: 30000,
  clientConfig: {
    maxReceivedFrameSize: 100000000,
    maxReceivedMessageSize: 100000000,
  },
  reconnect: {
    auto: true,
    delay: 5000,
    maxAttempts: 15,
    onTimeout: false,
  },
};

var web3 = new Web3(new Web3.providers.WebsocketProvider(url, options));
const subscription = web3.eth.subscribe("pendingTransactions", (err, res) => {
  if (err) console.error(err);
});

var init = function () {
  subscription.on("data", (txHash) => {
    setTimeout(async () => {
      try {
        let tx = await web3.eth.getTransaction(txHash);
        // console.log(tx['input'])
        if (tx !== null && tx['input'].includes(addresses.methodID) && tx['input'].includes(addresses.WBNB)) {
            console.log(tx)
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
};

init();