import {
  isValidXAddress,
  xAddressToClassicAddress,
} from 'ripple-address-codec';
import { isValidNetwork } from '.';

export const parseInput = (input: {
  publicAddress?: string;
  destinationTag?: number;
  xAddress?: string;
  amount?: string;
  network?: string;
}) => {
  if (input.network) {
    let isValid = isValidNetwork(input.network);
    if (!isValid) return Error('ParseError: Not a valid network');
  }

  if (input.xAddress) {
    let isValid = isValidXAddress(input.xAddress);
    if (!isValid) return Error('ParseError: Not a valid xAdress');
    let account = xAddressToClassicAddress(input.xAddress);

    input.publicAddress = account.classicAddress;
    if (account.tag !== false) input.destinationTag = account.tag;
  }

  if (!input.publicAddress)
    return Error('ParseError: Regular address not found or not provided');

  return input;
};

export const parseXAddress = (xAddress: string) => {
  let isValid = isValidXAddress(xAddress);
  if (!isValid) return Error('ParseError: Not a valid xAdress');
  let account = xAddressToClassicAddress(xAddress);

  return [account.classicAddress, account.tag] as const;
};
