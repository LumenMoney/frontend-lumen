import { terra, addresses } from "../constants";
import { useCallback, useEffect, useState } from "react";
import { useConnectedWallet } from "@terra-money/wallet-provider";
import { Grid, Card, CardContent, Typography } from "@mui/material";

export function Dashboard(){
    const [distribute, setDistribute] = useState(0);
    const [supply, setSupply] = useState(0);
    const [lumSupply, setLumSupply] = useState(0); 
    const connectedWallet = useConnectedWallet();

    function calcApy(distribute: number, supply: number ) {
      let rebase = distribute / supply;
      return rebase;
    }

    const getLumSupply = useCallback(async () => {
      if (!connectedWallet) {
        return;
      }
  
      let chainID = connectedWallet.network.chainID;
      const result = await terra.wasm.contractQuery(
        addresses[chainID].TREASURY_ADDRESS,
        { "token_info": { } } // query msg
      );
      return result
  
    }, [connectedWallet]);

    useEffect( () =>{
      getLumSupply()
      .then((result: any) => {
        console.log(result)
        setLumSupply(result.total_supply)
      })
      .catch((error: any) => {
        console.log(error)
      })
    });

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

      useEffect( () =>{
        getEpoch()
        .then((result: any) => {
          console.log(result)
          setDistribute(result.distribute)
        })
        .catch((error: any) => {
          console.log(error)
        })
      });

      const getSupply = useCallback(async () => {
        if (!connectedWallet) {
          return;
        }
    
        let chainID = connectedWallet.network.chainID;
        const result = await terra.wasm.contractQuery(
          addresses[chainID].SLUM_ADDRESS,
          { "circulating_supply": { } } // query msg
        );
        return result
    
      }, [connectedWallet]);

      useEffect( () =>{
        getSupply()
        .then((result: any) => {
          console.log(result)
          setSupply(result.supply)
        })
        .catch((error: any) => {
          console.log(error)
        })
      });

      return(
        <div>
        <Grid container spacing={2}>
         <Grid item={true} xs={6}>
           <Card>
             <CardContent>
             <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              APY
             </Typography>
               <Typography variant="h5" component="div">{ distribute && supply ? calcApy : 0}</Typography>
             </CardContent>
            </Card>
          </Grid>
          <Grid item={true} xs={6}>
           <Card>
             <CardContent>
             <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                LUM Supply
            </Typography>
               <Typography variant="h5" component="div">{ lumSupply? (lumSupply/Math.pow(10,9)).toFixed(0): 0 }</Typography>
             </CardContent>
            </Card>
          </Grid>
       </Grid>    
              
        </div>
      )
}

