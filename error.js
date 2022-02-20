/* /u/mdrgr_crypto avatarmdrgr_crypto
66d
Join
Pancakeswap automatic bot: buy on liquidity. Unknown errors in node.js
My Project
I am adapting a BSC trading bot that (1) detects a liquidity event, (2) checks if at least 1 BNB in liquidity is available for the trading pair, (3) buys the token, (4) checks how many tokens were bought taking into consideration tokens that do not have 18 decimals (5) waits a set amount of time and then sells the token back to WBNB.

I am using node.js in VSCode. I know another programming language decently enough that I could find relevant code snippets and create the below code. However, my JavaScript knowledge is very limited. The below code crashes at line 52, but states "No debugger available, can not send 'variables'". The breakpoints are simply ignored. I initially had most code segments in separate files and would often get unknown errors for "ethers.Contract". This is very frustrating because I have scraped the blow code from 15h+ google searches and no pointers to why things are not working. While they seem to work for others, they don't seem to work for me. I would very much appreciate it if someone with more experience could point out any newbie mistakes I am making!
**/
require('dotenv').config();
const ethers = require('ethers');
const Web3   = require('web3');
const web3   = new Web3(process.env.URL);


//1. Snipe details
const includesBNB = "bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"; // WBNW CONTRACT
const amountIn    = ethers.utils.parseUnits('0.015', 'ether')   // HOW MUCH I BUY

//2. Wallet / connection details
const WSS              = "wss://xxx" // NODE CONNECTION
const Seed             = 'xxx'  // WALLET SEEDPHRASE
const recipientaddress = '0xXXX' // WALLET ADDRESS


//3. Optional settings
const bnbAddress       = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // contract for WBNB
const routeraddress    = '0x10ed43c718714eb63d5aa57b78b54704e256024e' // PANCAKESWAP ROUTER
const minBuy           = ethers.utils.parseUnits('0', 'ether')


const MethodID  = "0xf305d719" // Liquidity event
const MethodID2 = "0xe8e33700" 
const provider  = new ethers.providers.WebSocketProvider(WSS);
const wallet    = ethers.Wallet.fromMnemonic(Seed);
const account   = wallet.connect(provider);
provider.removeAllListeners()

const router = new ethers.Contract(
  routeraddress,
  ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'],
  account
);

console.log(`Connecting to the blockchain`),
console.log(`Starting to scan the network for a matching transaction based on the config entered`),
console.log(`As soon as a matching transaction has been found, it will be displayed here`),

provider.on("pending", async (tx) => {
  provider.getTransaction(tx).then(function (transaction){
    if (transaction != null && transaction['data'].includes(MethodID2) && transaction['data'].includes(includesBNB)  || transaction != null && transaction['data'].includes(MethodID) && transaction['data'].includes(includesBNB))
  console.log(transaction);
  console.log(transaction['data']);
  console.log(`Matching liquidity add transaction found!`);


  // EXTRACT THE TOKEN ADDRESS FROM transaction['data].
  // This seems to depend on the Method used.
  let buyAddress // THIS PRODUCES AN ERROR
  if (transaction['data'].includes(MethodID)) {
    buyAddress = transaction['data'].substring(38, 78);
    } else {
      buyAddress   = transaction['data'].substring(98,138);
    };

  // CHECK LIQUIDITY
  // (1) FIND THE PAIR ADDRESS
  var liqABI = [{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"}];

  var CAKE_FACTORY_V2 = web3.eth.contract(liqABI, routeraddress);
  var pairAddress     = await (await (new web3.eth.Contract(liqABI, CAKE_FACTORY_V2))).methods.getPair(buyAddress, bnbAddress).call(); // GET THE PAIR ADDRESS

  // (2) FIND THE RESERVES
  const pairABI = [
  'function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
  ]

  let pairContract = new ethers.Contract(pairAddress, pairABI, provider);
  let reserves = await pairContract.getReserves();

  if (reserves(1) < 1) {
    continue // NOT ENOUGH BNB LIQUIDITY
  }

  var curNonce = web3.eth.getTransactionCount(
    recipientaddress,
    "pending"
  );

// BUYING TOKEN
router.swapExactTokensForTokens(
    amountIn,
    minBuy, // set to 0
    [bnbAddress, buyAddress], // THIS IS NOT ALWAYS THE RIGHT ADDRESS, BUT YOU GET THE IDEA
    recipientaddress,
    Date.now() + 1000 * 60 * 10,
    { gasLimit: transaction.gasLimit, gasPrice: transaction.gasPrice, nonce: curNonce}
  ),

setTimeout(function () {console.log(`Attempting to place a buy order...`)}, 500)

  // CHECK AMOUNT BOUGHT
  // Is there an easier way? Like an output from the buying TX? e.g. tx = router.swapExactTokensForTokens and then receipt = tx.wait()? I saw that in another snipped, but never got the code to work, so no idea if amount bought is included here
  let minABI = [  // The minimum ABI to get ERC20 Token balance
  // balanceOf
  {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
  },
  // decimals
  {
    "constant":true,
    "inputs":[],
    "name":"decimals",
    "outputs":[{"name":"","type":"uint8"}],
    "type":"function"
  }
];

const contract = new provider.eth.Contract(minABI, buyAddress); // ERROR

// HOW MANY TOKENS HAVE BEEN BOUGHT?
async function getBalance() {
    const result = await contract.methods.balanceOf(recipientaddress).call();
}

// NOT ALL TOKENS HAVE 18 DECIMALS
async function getDecimals() {
    const resultDec = await contract.methods.decimals(recipientaddress).call()
}

var balance = getBalance().div(10**getDecimals()) 


// SELL BACK TO BNB AFTER TWO MINUTES
setTimeout(function () {
router.swapExactTokensForTokens(
        balance,
        minBuy,
        [buyAddress, bnbAddress],
        recipientaddress,
        Date.now() + 1000 * 60 * 5, // valid for 5 minutes
        { gasLimit: transaction.gasLimit, gasPrice: transaction.gasPrice, nonce: curNonce + 1} // THIS IS BEING CALLED WHILE THE BUY TRANSACTION IS STILL PENDING, THEREFORE THE NONCE MUST BE + 1

    );
}, 1000*60*2); // set to 2mins


return;  
})})
