const Web3 = require('web3');
import { appConfig, providerOptions } from '../../config/default';

const {config} = appConfig();

export const provider = new Web3.providers.WebsocketProvider(config.full_wss, providerOptions);

export const web3 = new Web3(provider);
