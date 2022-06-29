import { generate } from 'xrpl-accountlib';
import fs from 'fs';

const main = () => {
  let wallet1 = generate.secretNumbers();
  console.log(wallet1);
  let wallet2 = generate.mnemonic({ strength: 128 });
  console.log(wallet2);
  let wallet3 = generate.mnemonic({ strength: 256 });
  console.log(wallet3);
  let wallet4 = generate.familySeed();
  console.log(wallet4);
  fs.writeFileSync(
    '../../config/testWallets.json',
    JSON.stringify([wallet1, wallet2, wallet3, wallet4])
  );
};

main();
