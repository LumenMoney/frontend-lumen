import { Box, Button, CircularProgress, FilledInput, FormControl, Grid, InputAdornment, InputLabel, Slider, Snackbar, SnackbarOrigin } from '@mui/material';
import { green } from '@mui/material/colors';
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
import { ConnectAndDisconnect} from './Connect';

export interface State extends SnackbarOrigin {
  open: boolean;
}

export function BuyBond() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [bondPrice, setBondPrice] = useState(0);
  const [marketPrice, setMarketPrice] = useState(600);
  const [loading, setLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const { vertical, horizontal, open } = state;

  const connectedWallet = useConnectedWallet();

  /**
   * Slider
   * @param e 
   */

   const marks = [
    {
      value: 0,
      label: '0 Days',
    },
    {
      value: 5,
      label: '5 Days',
    },
    {
      value: 30,
      label: '30 Days',
    },
    {
      value: 100,
      label: '100 Days',
    },
  ];
  
  function valuetext(value: number) {
    return `${value} Days`;
  }
  
  function valueLabelFormat(value: number) {
    return marks.findIndex((mark) => mark.value === value) + 1;
  }

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

    setLoading(true);

    let chainID = connectedWallet.network.chainID;

    setTxResult(null);
    setTxError(null);

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
        setLoading(false);
        setSnackMessage("Transaction was a success")
        setState({ open: true, vertical: 'top', horizontal: 'center' });
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
  }, [state, snackMessage, loading, amount, connectedWallet]);

  return (
    <div>
        <br/>
        <br />
        <Grid container spacing={2}>
          <Grid item={true} xs ={4}> <h2> Bond Price:    ${bondPrice}</h2></Grid>
          <Grid item={true} xs ={4}><h2> Market Price:    ${marketPrice}</h2></Grid>
          <Grid item={true} xs ={4}> <h2> SAVINGS:    {(100 - (bondPrice * 100 / marketPrice)).toFixed(2)}%</h2></Grid>
        </Grid>

        <br/>
        <br /> 
       
       <Grid container spacing={2} >
         <Grid item={true} xs={6}>
         <FormControl fullWidth sx={{ m: 1 }} variant="filled">
          <InputLabel htmlFor="filled-adornment-amount">Amount in UST</InputLabel>
          <FilledInput
            id="filled-adornment-amount"
            value={amount}
            onChange={handleChangeAmount}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>
         </Grid>
         <Grid item={true} xs={4} ml={5} mt={3}><h3>LUM You can buy: {amount ? parseFloat(amount) / bondPrice : 0}</h3></Grid>
       </Grid>
       
        
        <br />
        <br />
        
        

        {/* <Slider
        aria-label="Restricted values"
        defaultValue={0}
        valueLabelFormat={valueLabelFormat}
        getAriaValueText={valuetext}
        step={null}
        valueLabelDisplay="auto"
        marks={marks}
      /> */}


      {connectedWallet?.availablePost && (
              <Box sx={{ m: 1, position: 'relative' }}>
              <Button
                variant="contained"
                disabled={loading}
                onClick={proceed}
              >
                Buy Bond
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  
                />
              )}
            </Box>
        // <Button onClick={proceed} variant="contained" size="large">Buy Bond</Button> 
        // <button onClick={proceed}>Deposit 1000UST to buy LUM</button>
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

      {/* {txError && <pre>{txError}</pre>}

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

      {
              <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={open}
              message={snackMessage}
              onClose={() => setState({open: false, vertical: "top", horizontal: "center"})}
              key={vertical + horizontal}
              autoHideDuration={3000}
            />
      }

      {/* <h3>To Do:</h3>
      <ul>
        <li> GET MAX PAYOUT from Backend and Show in Frontend</li>
        <li>GET CUrrent payout i.e. Vested amount </li>
        <li>Get remaining time</li>
      </ul> */}
    </div>
  );
}
