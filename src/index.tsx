import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Claim } from 'components/Claim';
import { ClaimAndStake } from 'components/ClaimAndStake';
import { ConnectSample } from 'components/ConnectSample';
import { CW20TokensSample } from 'components/CW20TokensSample';
import { ManualStake } from 'components/ManualStake';
import { NetworkSample } from 'components/NetworkSample';
import { QuerySample } from 'components/QuerySample';
import { SignBytesSample } from 'components/SignBytesSample';
import { SignSample } from 'components/SignSample';
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
      style={{ margin: 20, display: 'flex', flexDirection: 'column', gap: 40 }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Router>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <ButtonAppBar/>
              <Grid item={true} xs={3}>
                <br/>
              <Button sx={{mt: 3}} variant="outlined" size="large" component={RouterLink} to="/bonds">
                Bonds
              </Button>
              <br/>
                {/* <div><Link to="/bonds">Bonds</Link></div> */}
              <Button sx={{mt: 3}} variant="outlined" size="large" component={RouterLink} to="/redeem">
                Redeem
              </Button>
              <br/>
              <Button sx={{mt: 3}} variant="outlined" size="large" component={RouterLink} to="/stake">
                Stake
              </Button>
              <br/>
              <Button sx={{mt: 3}} variant="outlined" size="large" component={RouterLink} to="/dashboard">
                Dashboard
              </Button>
              </Grid>
              
                <Grid item={true} xs={9}>
                {/* <Box
  display="flex"
  justifyContent="center"

  minHeight="100vh"
><Paper> */}
                    <Switch>
                      <Route path="/bonds">
                        <BuyBond></BuyBond>
                      </Route>
                      <Route path="/redeem">
                        <Claim/>
                        <br />
                        <ClaimAndStake/>
                      </Route>
                      <Route path="/stake">
                        <Stake/>
                        <br />
                        <Unstake/>
                      </Route>
                      </Switch>
                      {/* </Paper>
                      </Box> */}
                </Grid>  
              
            </Grid>      
          </Box>

        </Router>
      </ThemeProvider>

      

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
