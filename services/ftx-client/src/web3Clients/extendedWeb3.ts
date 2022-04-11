import bigGasLimitTransactionFormatter from "./utils/transactionFormatter";
import bigGasBlockFormatter from "./utils/blockFormatter";
import { appConfig, providerOptions } from "../config/default";
import { EventStatus } from "../config/types/eventStatus";

const Web3 = require('web3');

const {config} = appConfig();

const provider = new Web3.providers.WebsocketProvider(config.full_wss, providerOptions);

const web3 = new Web3(provider);

const {END} = EventStatus;

provider.on(END, () => {
  provider.on('connect', () => {
    console.log('WSS Reconnected');
  });

  web3.setProvider(provider);
})

export const extendedWeb3 = [
  {
    name: 'getBigGasLimitTransaction',
    call: 'eth_getTransactionByHash',
    params: 1,
    inputFormatter: [null],
    outputFormatter: bigGasLimitTransactionFormatter,
  },
  {
    name: 'getBigGasBlockWithTransactions',
    call: 'eth_getBlockByNumber',
    params: 2,
    inputFormatter: [web3.utils.numberToHex, null],
    outputFormatter: bigGasBlockFormatter,
  },
]

web3.extend({
  methods: extendedWeb3
});

export const web3Client = web3;
