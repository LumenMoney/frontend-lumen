import { LCDClient, MnemonicKey } from '@terra-money/terra.js';

interface IAddresses {
    [key: string]: { [key: string]: string };
}

export const addresses: IAddresses = {
    "localterra" : {
      CONTRACT_ADDRESS: "terra1uwcjkghqlz030r989clzqs8zlaujwyph2h0fs0"
    },
    "bombay-12": {
      CONTRACT_ADDRESS: "terra16mx6dyfej6k8sjltppgm76239vhf3ujxdgjwm8"
    }
}
const mk = new MnemonicKey({
    mnemonic: 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'
  })
  
  // connect to localterra
export  const terra = new LCDClient({
    URL: 'https://bombay-lcd.terra.dev',
    chainID: 'bombay-12',
    // URL: 'http://localhost:1317',
    // chainID : 'localterra'
});
  
export const wallet = terra.wallet(mk);

export const largeApproval = "400000000000000";