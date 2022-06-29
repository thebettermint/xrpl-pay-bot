import { xrpToDrops } from 'xrpl';
import config from '../config/config.json';
import { wait } from './lib/utils/wait';
import { payment } from './lib/xrpl/payment';

const main = async (config) => {
  const length = config.destinations.list.length;
  const cycle = config.destinations.cycle;

  const source = {
    network: config.server,
    sourceAddress: config.source.classicAddress,
    sourceTag: config.source.tag,
    sourceXaddress: config.source.xAdress,
    sourceSecret:
      config.source.secret ||
      process.env[config.source.classicAddress] ||
      process.env[config.source.xAdress],
  };

  const amount = {
    amount:
      config.amount.currency === 'XRP'
        ? xrpToDrops(config.amount.value)
        : config.amount,
  };

  await wait(config.time.delay);

  let count = 0;
  let random = Math.floor(Math.random() * length);
  if (cycle === 'reverse') count = length - 1;
  let param: any;
  while (true) {
    if (cycle === 'random') {
      param = {
        destinationAddress: config.destinations.list[random].classicAddress,
        destinationTag: config.destinations.list[random].tag,
      };
    } else {
      param = {
        destinationAddress: config.destinations.list[count].classicAddress,
        destinationTag: config.destinations.list[count].tag,
      };
    }

    let handled = Object.assign(param, source, amount);
    let p = await payment(handled);
    console.log(p);

    if (cycle !== 'reverse') {
      count++;
      if (count === length) count = 0;
    }

    if (cycle === 'reverse') {
      count--;
      if (count < 0) count = length - 1;
    }

    random = Math.floor(Math.random() * length);
    console.log(`time to next payment: ${config.time.interval / 1000} sec`);

    if (cycle === 'random') {
      console.log(
        `next payment to: ${config.destinations.list[random].classicAddress}`
      );
    } else {
      console.log(
        `next payment to: ${config.destinations.list[count].classicAddress}`
      );
    }

    await wait(config.time.interval);
  }
};

main(config[0])
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  });
