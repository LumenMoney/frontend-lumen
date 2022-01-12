import { Box, Button, CircularProgress } from '@mui/material';
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

export function Claim() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [payout, setPayout] = useState(0);
  const [loading, setLoading]= useState(false);

  const connectedWallet = useConnectedWallet();

  const getPayout = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    const result = await terra.wasm.contractQuery(
      addresses[chainID].BOND_ADDRESS,
      { "pending_payout": {
          "address": connectedWallet.walletAddress
       } } // query msg
    );
    return result

  }, [connectedWallet]);

  useEffect( () =>{
    getPayout()
    .then((result: any) => {
      console.log(result)
      setPayout(result)
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
    

    connectedWallet
      .post({
        fee: new Fee(1000000, '2000000uusd'),
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress, 
            addresses[chainID].BOND_ADDRESS, 
            {"redeem": 
              {
                stake: false,
                
              }
          },
          )
        
        ],
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
  }, [connectedWallet]);

  return (
    <div>



      <h1>Claimable LUM:   {(payout / Math.pow(10,9)).toFixed(2)}</h1>

      

      {connectedWallet?.availablePost && !txResult && (
       <Box sx={{ m: 1, position: 'relative' }}>
       <Button
         variant="contained"
         disabled={loading}
         onClick={proceed}
       >
         Claim LUM
       </Button>
       {loading && (
         <CircularProgress
           size={24}
           
         />
       )}
     </Box> 
        // <Button variant="contained" onClick={proceed}>Claim LUM</Button>
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
      )} */}
{/* 
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
