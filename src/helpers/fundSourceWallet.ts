import fund from '@thebettermint/xrpl-auto-funder';

const main = async () => {
  let response = await fund({
    publicAddress: 'rhvzzja3ZfYbqnVCgPNmPmQ91Eg5ixKkWX',
    network: 'testnet',
  });
  console.log(response);
};

main();
