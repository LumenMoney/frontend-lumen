import { Button, FilledInput, FormControl, InputAdornment, InputLabel } from '@mui/material';
import { Fee, MsgSend, MsgExecuteContract, Dec, Int } from '@terra-money/terra.js';
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
} from '@terra-money/wallet-provider';
import React, { useCallback, useEffect, useState } from 'react';
import { addresses, wallet, terra } from '../constants';


interface State {
    price: string;
}
export function BuyBond() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [bondPrice, setBondPrice] = useState(0);
  const [marketPrice, setMarketPrice] = useState(600);
  const connectedWallet = useConnectedWallet();


  const [values, setValues] = React.useState<State>({
    price: '',
    
  });

  /**
   * Handles change in amount input
   * @param e 
   */
  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setAmount(e.target.value)
  };

  //TO BE SEPERATED
  const getBondPriceUSD = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    const result = await terra.wasm.contractQuery(
      addresses[chainID].BOND_ADDRESS,
      { "bond_price_in_usd": { } } // query msg
    );
    return result

  }, [connectedWallet]);

  useEffect(() => {
    getBondPriceUSD()
    .then((result: any) => {
      setBondPrice(result.price / Math.pow(10, 6))
      console.log(result)
    })
    .catch((error: any) => {
      console.log(error)
    })
  });

  const proceed = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    if (chainID.startsWith('columbus')) {
      alert(`Please only execute this example on Testnet`);
      return;
    }

    setTxResult(null);
    setTxError(null);
    console.log(amount)

    connectedWallet
      .post({
        fee: new Fee(1000000, '2000000uusd'),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress, 
            addresses[chainID].BOND_ADDRESS, 
            {"deposit": 
              {
                
                max_price: 60000
              }
          },
            { uusd: new Int(new Dec(amount).mul(1000000)).toString() },
          )
        
        ],
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setTxResult(nextTxResult);

      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setTxError('User Denied');
        } else if (error instanceof CreateTxFailed) {
          setTxError('Create Tx Failed: ' + error.message);
        } else if (error instanceof TxFailed) {
          setTxError('Tx Failed: ' + error.message);
        } else if (error instanceof Timeout) {
          setTxError('Timeout');
        } else if (error instanceof TxUnspecifiedError) {
          setTxError('Unspecified Error: ' + error.message);
        } else {
          setTxError(
            'Unknown Error: ' +
              (error instanceof Error ? error.message : String(error)),
          );
        }
      });
  }, [amount, connectedWallet]);

  return (
    <div>
        <h2> Bond Price:    ${bondPrice}</h2>
        <h2> Market Price:    ${marketPrice}</h2>
        <h2> SAVINGS:    {(100 - (bondPrice * 100 / marketPrice)).toFixed(2)}%</h2>
        <FormControl fullWidth sx={{ m: 1 }} variant="filled">
          <InputLabel htmlFor="filled-adornment-amount">Amount</InputLabel>
          <FilledInput
            id="filled-adornment-amount"
            value={amount}
            onChange={handleChangeAmount}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>

        
        <h3>LUM You can buy {amount ? parseFloat(amount) / bondPrice : 0}</h3>

      {connectedWallet?.availablePost && !txResult && !txError && (
        <Button onClick={proceed} variant="contained">Buy LUM</Button> 
        // <button onClick={proceed}>Deposit 1000UST to buy LUM</button>
      )}



      {txResult && (
        <>
          <pre>{JSON.stringify(txResult, null, 2)}</pre>

          {connectedWallet && txResult && (
            <div>
              <a
                href={`https://finder.terra.money/${connectedWallet.network.chainID}/tx/${txResult.result.txhash}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Tx Result in Terra Finder
              </a>
            </div>
          )}
        </>
      )}

      {txError && <pre>{txError}</pre>}

      {(!!txResult || !!txError) && (
        <button
          onClick={() => {
            setTxResult(null);
            setTxError(null);
          }}
        >
          Clear result
        </button>
      )}

      {!connectedWallet && <p>Wallet not connected!</p>}

      {connectedWallet && !connectedWallet.availablePost && (
        <p>This connection does not support post()</p>
      )}
      <h3>To Do:</h3>
      <ul>
        <li> GET MAX PAYOUT from Backend and Show in Frontend</li>
        <li>GET CUrrent payout i.e. Vested amount </li>
        <li>Get remaining time</li>
      </ul>
    </div>
  );
}
