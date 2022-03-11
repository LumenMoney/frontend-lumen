import { LCDClient, MnemonicKey } from '@terra-money/terra.js';

interface IAddresses {
    [key: string]: { [key: string]: string };
}

export const addresses: IAddresses = {
    "localterra" : {
      SLUM_ADDRESS: "terra1w7vw66d5kq7jynx43ltd7mkcxzeqyzlayf5l0h",
      STAKING_ADDRESS: "terra1tdf02xst4jjnd8dcuh70pvvzk2ufgqlrnr7jz8",
      TREASURY_ADDRESS: "terra1ns8ujs5lt6mvl3dvxra4kk5acrzx3n7uvcjkyh",
      BOND_ADDRESS: "terra150993pnauf335xtp8pnu2jtlt87h2lsac0vq0e",
      DISTRIBUTOR_ADDRESS: "terra10w3m3hagg857s3uylw5yw55ztd6snl5r8jylzr",
        STAKING_HELPER_ADDRESS: "",
        STAKING_WARMUP_ADDRESS: "",
        BONDINGCALC_ADDRESS: ""
    },
    "bombay-12": {
      SLUM_ADDRESS: "terra1ykxrzh7rudm6ta69uajzkxu99nds5mpfcwpkfe",
      STAKING_ADDRESS: "terra1sls824jecgs3m52g8n6sug2w450v2kdzthurcz",
      TREASURY_ADDRESS: "terra1ee6g4mucrg4rvrf7rcmfh7atu6smcpe9yfjgr5",
      BOND_ADDRESS: "terra1jq3wpxqle6vy4f3ld0yfe0ztkewv49jpnf3mhe",
      DISTRIBUTOR_ADDRESS: "terra1qxu7cachfvm4g0lvy8wf48cj605pcdca7v4mxu",  
    }
}
const mk = new MnemonicKey({
    mnemonic: 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'
  })
  
  // connect to localterra
export  const terra = new LCDClient({
    // URL: 'https://bombay-lcd.terra.dev',
    // chainID: 'bombay-12',
    URL: 'http://localhost:1317',
    chainID : 'localterra'
});
  
export const wallet = terra.wallet(mk);

export const largeApproval = "400000000000000";