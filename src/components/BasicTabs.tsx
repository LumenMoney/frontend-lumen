import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { BuyBond } from './BuyBond';
import { Test } from './Test';
import { Claim } from './Claim';
import { ClaimAndStake } from './ClaimAndStake';
import { Stake } from './Stake';
import { Unstake } from './Unstake';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'span'} >{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs centered value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Bond" {...a11yProps(0)} />
          <Tab label="Redeem" {...a11yProps(1)} />
          <Tab label="Stake" {...a11yProps(2)} />
          <Tab label="Dashboard" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <BuyBond/>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Claim/>
        <br/>
        <br/>
        <ClaimAndStake/>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Stake/>
        <br/>
        <br />
        <br />
        <Unstake/>
      </TabPanel>
      <TabPanel value={value} index={3}>
        Dashboard
      </TabPanel>
    </Box>
  );
}
