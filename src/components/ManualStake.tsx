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

export function  ManualStake() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState('');

  const connectedWallet = useConnectedWallet();

  const messages: MsgExecuteContract[] = [];

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
    getAllowance()
    .then((result: any) => {
      console.log(result)
      setAllowance(result.allowance);
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

   messages.push(new MsgExecuteContract(
      connectedWallet.walletAddress, 
      addresses[chainID].STAKING_ADDRESS, 
      {"stake": 
        {
          owner: connectedWallet.walletAddress,
          recipient: addresses[chainID].STAKING_ADDRESS,
          amount: 40
          
        }
    },
    ))
    

    connectedWallet
      .post({
        fee: new Fee(1000000, '2000000uusd'),
        msgs: messages
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
  }, [allowance, connectedWallet]);

  return (
    <div>
      <h1>Manual Stake</h1>

      

      {connectedWallet?.availablePost && !txResult && !txError && (
        
        <button onClick={proceed}>Manual Stake</button>
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
