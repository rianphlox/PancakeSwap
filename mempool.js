require('dotenv').config();
const ethers = require('ethers');

const provider = new ethers.providers.WebSocketProvider(process.env.TESTNET_URL);
const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
const account = wallet.connect(provider);

const addresses = {
    WBNB : '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    routerAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    myAddress : process.env.TEST_WALLET,
    methodID : '0xf305d719'
}

// provider.removeAllListeners();

const bot = async () => {
    provider.on('pending', async (tx) => {
        transaction = await provider.getTransaction(tx);
        if (transaction != null && transaction['data'].includes(addresses.methodID) && transaction['data'].includes(addresses.WBNB)) {
            console.log(transaction);
        }
    })
    provider._websocket.on('error', async () => {
        console.log(`Unable to connect. Retrying in 2s .....` );
        setInterval(bot, 2000)
    })
    provider._websocket.on('close', async (close) => {
        console.log(`Connection lost with code Attempting restart in 2s ...`);
        provider._websocket.terminate();
        setTimeout(bot, 2000);

    })
}

bot()