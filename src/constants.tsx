import { LCDClient, MnemonicKey } from '@terra-money/terra.js';

interface IAddresses {
    [key: string]: { [key: string]: string };
}

export const addresses: IAddresses = {
    "localterra" : {
        SLUM_ADDRESS: "terra1wshph3059fe5exz68w3shmr449f7n23n6y3u0g",
        STAKING_ADDRESS: "terra1lzzqmch40pgfe6kkc9dcj5zkfmzc4uyz6zkuzl",
        TREASURY_ADDRESS: "terra1xnwp4nhee46lcp7f3vpyjkz8ktf0p7tga5vl6z",
        BOND_ADDRESS: "terra1r7jxq78qlfr3vdqc8macs4kduwspzy369pxm73",
        STAKING_HELPER_ADDRESS: "",
        STAKING_WARMUP_ADDRESS: "",
        DISTRIBUTOR_ADDRESS: "",
        BONDINGCALC_ADDRESS: ""
    }
}
const mk = new MnemonicKey({
    mnemonic: 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'
  })
  
  // connect to localterra
export const terra = new LCDClient({
    URL: 'http://localhost:1317',
    chainID: 'localterra'
  });
  
export const wallet = terra.wallet(mk);

export const largeApproval = "400000000000000";