import { FormControl, InputLabel, FilledInput, InputAdornment, Button } from '@mui/material';
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

const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

export function Unstake() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [slumBalance, setSlumBalance] = useState(0);


  const connectedWallet = useConnectedWallet();

    /**
   * Handles change in amount input
   * @param e 
   */
     const handleUnstakeAmount = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setUnstakeAmount(e.target.value)
  };

  const getSlumBalance = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    const result = await terra.wasm.contractQuery(
      addresses[chainID].SLUM_ADDRESS,
      { "balance_of": { 
            "address": connectedWallet.walletAddress,  
      } } // query msg
    );
    return result

  }, [connectedWallet]);

  useEffect(() => {
    getSlumBalance()
    .then((result: any) => {
      console.log(result)
      setSlumBalance(result.balance)
    })
    .catch((error: any) => {
      console.log(error)
    })
  });

  const getAllowance = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    const result = await terra.wasm.contractQuery(
      addresses[chainID].TREASURY_ADDRESS,
      { "query_allowance": { 
            "owner": connectedWallet.walletAddress,
            "spender": addresses[chainID].STAKING_ADDRESS  
      } } // query msg
    );
    return result

  }, [connectedWallet]);


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

    getAllowance()
    .then((result: unknown) => {
      console.log(result)
    })
    .catch((error: unknown) => {
      console.log(error)
    })
    

    connectedWallet
      .post({
        fee: new Fee(1000000, '2000000uusd'),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress, 
            addresses[chainID].SLUM_ADDRESS, 
            {"increase_allowance": 
              {
               
                spender: addresses[chainID].STAKING_ADDRESS,
                value: "4000000000000"
                
              }
          },
          ),
          new MsgExecuteContract(
            connectedWallet.walletAddress, 
            addresses[chainID].STAKING_ADDRESS, 
            {"unstake": 
              {
                amount: unstakeAmount
                
              }
          },
          )
        
        ]
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
  }, [unstakeAmount, connectedWallet]);

  return (
    <div>
      <h1>Unstake</h1>

      <h3>Your Staked LUM balance is:   {(slumBalance/ Math.pow(10,9))}</h3>
        <FormControl fullWidth sx={{ m: 1 }} variant="filled">
          <InputLabel htmlFor="filled-adornment-amount-unstake">Amount to UnStake</InputLabel>
          <FilledInput
            id="filled-adornment-amount-unstake"
            value={unstakeAmount}
            onChange={handleUnstakeAmount}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl> 

      {connectedWallet?.availablePost && !txResult && !txError && (
        
        <Button variant="contained" onClick={proceed}>Unstake LUM</Button>
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
    </div>
  );
}
