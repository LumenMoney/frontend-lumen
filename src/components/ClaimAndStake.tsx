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
import { addresses, wallet, terra, largeApproval } from '../constants';

const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

export function ClaimAndStake() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState('');
  const messages: MsgExecuteContract[] = []; 
  const [loading, setLoading] = useState(false);

  const connectedWallet = useConnectedWallet();

  const getEpoch = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    let chainID = connectedWallet.network.chainID;
    const result = await terra.wasm.contractQuery(
      addresses[chainID].STAKING_ADDRESS,
      { "get_epoch": { } } // query msg
    );
    return result

  }, [connectedWallet]);

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
      console.log(result)
      setAllowance(result.allowance);
    })
    .catch((error: any) => {
      console.log(error)
    })
  },[connectedWallet]);


  const proceed = useCallback(() => {
    if (!connectedWallet) {
      return;
    }


    let chainID = connectedWallet.network.chainID;


    setLoading(true);
    setTxResult(null);
    setTxError(null);

    // let amount = parseFloat(document.getElementsByTagName('h1')[0].innerText.split(":")[1]) *  Math.pow(10,9);
    // console.log(amount)
    messages.splice(0, messages.length)

    if (parseInt(allowance) == 0) {
        
      messages.push(
        new MsgExecuteContract(
          connectedWallet.walletAddress, 
          addresses[chainID].TREASURY_ADDRESS, 
          {"increase_allowance": 
            {
              spender: addresses[chainID].STAKING_ADDRESS,
              amount: largeApproval
              
            }
        },
        )
      )
    }
    
    messages.push(
      new MsgExecuteContract(
        connectedWallet.walletAddress, 
        addresses[chainID].BOND_ADDRESS, 
        {"redeem": 
          {
            stake: true
            
          }
      },
      )
    )

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
  }, [allowance, connectedWallet]);

  return (
    <div>
     

      

      {connectedWallet?.availablePost &&  (
               <Box sx={{ m: 1, position: 'relative' }}>
               <Button
                 variant="contained"
                 disabled={loading}
                 onClick={proceed}
               >
                 Claim LUM and Stake
               </Button>
               {loading && (
                 <CircularProgress
                   size={24}
                   
                 />
               )}
             </Box> 
        
        // <Button variant="contained" onClick={proceed}>Claim LUM and Stake</Button>
      )}
{/* 
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
      )} */}

      {!connectedWallet && <p>Wallet not connected!</p>}

      {connectedWallet && !connectedWallet.availablePost && (
        <p>This connection does not support post()</p>
      )}
<br/>

    </div>
    
  );
}
