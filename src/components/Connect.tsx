import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useWallet, WalletStatus } from '@terra-money/wallet-provider';
import React, { useState } from 'react';

export interface Props {
    show: boolean;
  }

export function ConnectAndDisconnect() {
  const {
    status,
    network,
    wallets,
    availableConnectTypes,
    availableInstallTypes,
    availableConnections,
    supportFeatures,
    connect,
    install,
    disconnect,
  } = useWallet();

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const openDialog = () => {
    setOpen(true);
  };

  function handleClick(type: any, identifier: any){
    setOpen(false);
    connect(type, identifier); 
  }

  return (
    <div>
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Choose your wallet"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
           
          {availableConnections.map(
              ({ type, name, icon, identifier = '' }) => (
                <Button sx={{mt: 2}} fullWidth variant="contained"
                  key={'connection-' + type + identifier}
                  onClick={() => handleClick(type, identifier)}
                  // onClick={() => (setOpen(false);connect(type, identifier))}
                >
                  <img
                    src={icon}
                    alt={name}
                    style={{ width: '1em', height: '1em' }}
                  />
                  {name} [{identifier}]
                </Button>
                
              ),
            )}
          </DialogContentText>
        </DialogContent>

      </Dialog>

        {status === WalletStatus.WALLET_NOT_CONNECTED && (
          <>
           <Button variant='contained' onClick={openDialog}>Connect</Button>
            <br />
            
          </>
        )}
        {status === WalletStatus.WALLET_CONNECTED && (
          <Button variant="contained" onClick={() => disconnect()}>Disconnect</Button>
        )}
    </div>

  );
}
