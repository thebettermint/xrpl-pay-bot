import { validNetworks } from '../constants';

import * as parse from './parse';
import { wait } from './wait';

export const isValidNetwork = async (network: string) => {
  return validNetworks.includes(network);
};

export default {
  parse,
  isValidNetwork,
  wait,
};
