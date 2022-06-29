import { Wallet, Payment, FeeRequest } from 'xrpl';
import * as client from './client';
import { Amount } from 'xrpl/dist/npm/models/common';
import { checkBalance } from './checkBalance';
import { servers } from '../../lib/constants';

import { parseXAddress } from '../utils/parse';

export const payment = async ({
  network,
  sourceAddress,
  sourceTag,
  sourceXaddress,
  sourceSecret,
  destinationAddress,
  destinationTag,
  destinationXaddress,
  amount,
}: {
  network: string;
  sourceAddress?: string;
  sourceTag?: number;
  sourceXaddress?: string;
  sourceSecret: string;
  destinationAddress: string;
  destinationTag?: number;
  destinationXaddress?: string;
  amount: Amount;
}) => {
  let api = await client.init(servers[network] || network);

  try {
    await api.connect();
    let signer = Wallet.fromSecret(sourceSecret);

    if (sourceAddress && sourceAddress !== signer.classicAddress) throw Error;

    if (sourceXaddress) {
      let address = parseXAddress(sourceXaddress);
      if (!(address instanceof Error)) {
        sourceAddress = address[0];
        if (sourceAddress !== signer.classicAddress) throw Error;
        if (address[1]) sourceTag = address[1];
      }
    }

    if (destinationXaddress) {
      let address = parseXAddress(destinationXaddress);
      if (!(address instanceof Error)) {
        destinationAddress = address[0];
        if (address[1]) destinationTag = address[1];
      }
    }

    const feeRequest: FeeRequest = {
      command: 'fee',
    };
    let feeResponse = await api.request(feeRequest);
    let fee: string = feeResponse.result.drops.median_fee;
    let cushion = api.feeCushion;
    console.log('Estimated Fee :', fee + cushion);

    let tx: Payment = {
      TransactionType: 'Payment',
      Account: signer.classicAddress,
      Amount: amount,
      Destination: destinationAddress,
      Fee: String(Math.max(12000, parseInt(fee) * cushion)),
    };

    if (destinationTag) tx.DestinationTag = destinationTag;
    if (sourceTag) tx.SourceTag = sourceTag;

    let options = {
      autfill: true,
      failhard: true,
      wallet: signer,
    };

    let response = await api.submitAndWait(tx, options);

    let meta: any;
    if (response && response.result?.meta) meta = response.result?.meta;
    if (meta.TransactionResult !== 'tesSUCCESS') {
      throw Error('Transaction was not successful');
    }

    let self_balances = await checkBalance(api, signer.classicAddress);
    let destination_balances = await checkBalance(api, tx.Destination);

    let resultObj = Object.assign(
      { network: network },
      {
        accountBalance: self_balances.result,
        destinationBalance: destination_balances.result,
      },
      response.result
    );

    return resultObj;
  } catch (error: any) {
    return Error(`${network.toUpperCase() + ': ' + error.message}`);
  } finally {
    api.disconnect();
  }
};
