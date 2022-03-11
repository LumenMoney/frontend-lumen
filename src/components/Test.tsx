import { Button, FilledInput, FormControl, InputAdornment, InputLabel } from '@mui/material';
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
import { addresses, wallet, terra } from '../constants';

const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

export function Test() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [lumBalance, setLumBalance] = useState(0);

  const messages: MsgExecuteContract[] = [];
  const connectedWallet = useConnectedWallet();

  /**
   * Handles change in amount input
   * @param e 
   */
     const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setStakeAmount(e.target.value)
      console.log(stakeAmount)
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
      console.log(result)
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
    if (chainID.startsWith('columbus')) {
      alert(`Please only execute this example on Testnet`);
      return;
    }

    setTxResult(null);
    setTxError(null);

    messages.push();

    let currTime = new Date().getTime() / 1000;
    let start = Math.round(currTime) + 100;
    let end =  Math.round(currTime) + 100000;

    connectedWallet
      .post({
        // fee: new Fee(1000000, '2000000uusd'),
        fee: undefined,
        msgs: [

          // new MsgExecuteContract(
          //   connectedWallet.walletAddress, 
          //   "terra1xchf90q9cr0tzfqlzlhsneyqdgdea7v6plvw58", //LBP Factory
             
          //   {
          //     "create_pair": {
          //       "asset_infos": [
          //         {
          //           "info": {
          //             "token": {
          //               "contract_addr": "terra1p9ecgk8eqdmecgmcgpgknzvktfa7gz3nekajhf" //LBP Asset Token
          //             }
          //           },
          //           "start_weight": "90",
          //           "end_weight": "10"
          //         },
          //         {
          //           "info": {
          //             "native_token": {
          //               "denom": "uusd"
          //             }
          //           },
          //           "start_weight": "10",
          //           "end_weight": "90"
          //         }
          //       ],
          //       "start_time": start,
          //       "end_time": end,
          //     }
          //   },
          // ),
          new MsgExecuteContract(
            connectedWallet.walletAddress, 
            'terra1p9ecgk8eqdmecgmcgpgknzvktfa7gz3nekajhf', //LBP Asset Token
            {"increase_allowance": 
              {
                spender: 'terra1tsn5xva6crfll3sty8fgkauj8n55f7vtcna35j', //LBP Pair
                amount: "400000000000"
                
              }
          },
          ),
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            'terra1tsn5xva6crfll3sty8fgkauj8n55f7vtcna35j', //LBP Pair
            {
              "provide_liquidity": {
                "assets": [
                  {
                    "info": {
                      "token": {
                        "contract_addr": "terra1p9ecgk8eqdmecgmcgpgknzvktfa7gz3nekajhf"//LBP Asset Token 
                      }
                    },
                    "amount": "4000000000"
                  },
                  {
                    "info": {
                      "native_token": {
                        "denom": "uusd"
                      }
                    },
                    "amount": "4000000000"
                  }
                ]
              }
            },
            { uusd: 4000000000 }
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
  }, [stakeAmount, connectedWallet]);

  return (
    <div>
        <h3>Your LUM balance is:   {(lumBalance/ Math.pow(10,9)).toFixed(2)}</h3>
        <FormControl fullWidth sx={{ m: 1 }} variant="filled">
          <InputLabel htmlFor="filled-adornment-amount-redeem">Amount</InputLabel>
          <FilledInput
            id="filled-adornment-amount-redeem"
            value={stakeAmount}
            onChange={handleChangeAmount}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>
      
      {connectedWallet?.availablePost && !txResult && !txError && (
        
        <Button variant="contained" onClick={proceed}>Stake LUM</Button>
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
