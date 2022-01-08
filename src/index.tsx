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
import { Grid, Box } from '@mui/material';
import BasicTabs from 'components/BasicTabs';
import ButtonAppBar from 'components/ButtonAppBar';


function App() {
  return (
    <main
      style={{ margin: 20, display: 'flex', flexDirection: 'column', gap: 40 }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <ButtonAppBar/>
          <BasicTabs/>
        </Grid>      
      </Box>
      

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
