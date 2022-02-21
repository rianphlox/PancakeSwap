require('dotenv').config();
const ethers = require("ethers");
const url = process.env.BSC_MAINNET_WS;


const init =  function () {
    const addresses = {
        WBNB : '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        myAddress : process.env.TEST_WALLET,
        methodID : '0xf305d719',
        methodID2: '0xe8e33700'
    }
    const provider = new ethers.providers.WebSocketProvider(url);
    
    provider.on("pending", async (tx) => {
        transaction = await provider.getTransaction(tx);
        if (transaction['data'].toString() !== '' && transaction['data'].toString().includes(addresses.methodID)  || transaction['data'].toString() !== '' && transaction['data'].toString().includes(addresses.methodID2)  ) {
            console.log(transaction);
            // transaction['data'].substring(34, 74)
            let tokenAddress;
            tokenAddress = transaction['data'].toString().includes(addresses.methodID) ? `0x${transaction['data'].substring(34, 74)}` : ``
            
        }
    
    
    // });
  });

  provider._websocket.on("error", async (err) => {
    console.log(`Unable to connect to ${err.subdomain} retrying in 1.5s...`);
    setTimeout(init, 1500);
  });
  provider._websocket.on("close", async (code) => {
    console.log(`Connection lost with code ${code}! Attempting reconnect in 1.5s...`);
    provider._websocket.terminate();
    setTimeout(init, 1500);
  });
};

init();