import { Box, Button, CircularProgress, FilledInput, FormControl, InputAdornment, InputLabel } from '@mui/material';
import { chainPropTypes } from '@mui/utils';
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
import { addresses, wallet, terra, largeApproval } from '../constants';

const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

export function Stake() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [lumBalance, setLumBalance] = useState(0);
  const [allowance, setAllowance] = useState('');
  const [loading, setLoading] = useState(false);

  const messages: MsgExecuteContract[] = [];
  const connectedWallet = useConnectedWallet();

  /**
   * Handles change in amount input
   * @param e 
   */
     const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setStakeAmount(e.target.value)
  };

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

  useEffect(() => {
    let chainID = connectedWallet ? connectedWallet.network.chainID : "terra";
    getAllowance()
    .then((result: any) => {
      console.log(result);
      setAllowance(result.allowance);
    })
    .catch((error: any) => {
      console.log(error)
    })
  },[connectedWallet]);

  const getLumBalance = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    const result = await terra.wasm.contractQuery(
      addresses[chainID].TREASURY_ADDRESS,
      { "balance": { 
            "address": connectedWallet.walletAddress,  
      } } // query msg
    );
    return result

  }, [connectedWallet]);

  useEffect(() => {
    getLumBalance()
    .then((result: any) => {
      console.log(result)
      setLumBalance(result.balance)
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

    setLoading(true);
    setTxResult(null);
    setTxError(null);

    messages.splice(0, messages.length);

    if (parseInt(allowance) == 0) {
      console.log(addresses[chainID].LUM_ADDRESS) 
       messages.push(
         new MsgExecuteContract(
           connectedWallet.walletAddress, 
           addresses[chainID].TREASURY_ADDRESS, 
           {"increase_allowance": 
             {
              
               spender: addresses[chainID].STAKING_ADDRESS,
               value: largeApproval
               
             }
         },
         )
       )
     }

    messages.push(
      new MsgExecuteContract(
        connectedWallet.walletAddress, 
        addresses[chainID].STAKING_ADDRESS, 
        {"stake": 
          {
            owner: connectedWallet.walletAddress,
            recipient: connectedWallet.walletAddress, 
            amount: parseInt(stakeAmount) * Math.pow(10, 9)
            
          }
      },
      )
    );


    

    connectedWallet
      .post({
        fee: new Fee(1000000, '2000000uusd'),
        msgs: messages
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setLoading(false);
        // setTxResult(nextTxResult);

      })
      .catch((error: unknown) => {
        setLoading(false);
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
  }, [allowance, stakeAmount, connectedWallet]);

  return (
    <div>
      <h1>Stake</h1>
        <h3>Your LUM balance is:   {(lumBalance/ Math.pow(10,9)).toFixed(2)}</h3>
        <FormControl fullWidth sx={{ m: 1 }} variant="filled">
          <InputLabel htmlFor="filled-adornment-amount-redeem">Amount to Stake</InputLabel>
          <FilledInput
            id="filled-adornment-amount-redeem"
            value={stakeAmount}
            onChange={handleChangeAmount}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>
      
      {connectedWallet?.availablePost &&  (
                      <Box sx={{ m: 1, position: 'relative' }}>
                      <Button
                        variant="contained"
                        disabled={loading}
                        onClick={proceed}
                      >
                        Stake
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          
                        />
                      )}
                    </Box>
        
        // <Button variant="contained" onClick={proceed}>Stake LUM</Button>
      )}

      {/* {txResult && (
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
      )} */}

      {!connectedWallet && <p>Wallet not connected!</p>}

      {connectedWallet && !connectedWallet.availablePost && (
        <p>This connection does not support post()</p>
      )}
    </div>
  );
}
