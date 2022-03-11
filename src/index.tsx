import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Claim } from 'components/Claim';
import { ClaimAndStake } from 'components/ClaimAndStake';
import { Test } from 'components/Test';
import { Unstake } from 'components/Unstake';
import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import { Grid, Box, createTheme, ThemeProvider, CssBaseline, Button, Paper } from '@mui/material';
import BasicTabs from 'components/BasicTabs';
import ButtonAppBar from 'components/ButtonAppBar';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink
} from "react-router-dom";
import { BuyBond } from 'components/BuyBond';
import { Stake } from 'components/Stake';

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: '#ff8f00',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#310000',
      paper: '#731010',
    },
  },
  typography: {
    fontFamily: 'Do Hyeon',
  },
  shape: {
    borderRadius: 16,
  },
});

function App() {
  return (
    <main
      style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
    >
      {/* <ThemeProvider theme={theme}>
        <CssBaseline/> */}
        <ButtonAppBar/>
          <Box sx={{ flexGrow: 1 }}>
            
            <Grid container spacing={2}>
              
              <Grid item={true} xs={3}>
              </Grid>
              
                <Grid item={true} xs={6}>
                  <Paper sx={{bgcolor: "whitesmoke"}}>
                  <BasicTabs/>
                  </Paper>
                  
                </Grid>  
                <Grid item={true} xs={3}></Grid>
              
            </Grid>      
          </Box>

      {/* </ThemeProvider> */}

      

      {/* <Test/> */}
            {/* <TxSample /> */}
            {/* < Claim/>
            < ClaimAndStake />
            < ManualStake />
            <Unstake/>  */}
      {/* <ConnectSample /> */}

      {/* <SignSample /> */}
      {/* <SignBytesSample /> */}
      {/* <CW20TokensSample /> */}
      {/* <NetworkSample /> */}
      
    </main>
  );
}

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <App />
    </WalletProvider>,
    document.getElementById('root'),
  );
});
