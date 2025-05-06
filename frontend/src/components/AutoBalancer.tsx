import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { ethers } from 'ethers';

interface AutoBalancerProps {
  provider: ethers.providers.Web3Provider;
  autoBalancerAddress: string;
  portfolioAddress: string;
}

const AutoBalancer: React.FC<AutoBalancerProps> = ({
  provider,
  autoBalancerAddress,
  portfolioAddress,
}) => {
  const theme = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [interval, setInterval] = useState(24); // hours
  const [gasThreshold, setGasThreshold] = useState(100); // gwei
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [provider, autoBalancerAddress]);

  const loadSettings = async () => {
    try {
      const contract = new ethers.Contract(
        autoBalancerAddress,
        [
          'function rebalanceInterval() view returns (uint256)',
          'function gasThreshold() view returns (uint256)',
          'function authorizedPortfolios(address) view returns (bool)',
        ],
        provider
      );

      const [interval, threshold, isAuthorized] = await Promise.all([
        contract.rebalanceInterval(),
        contract.gasThreshold(),
        contract.authorizedPortfolios(portfolioAddress),
      ]);

      setInterval(Number(interval) / 3600); // Convert seconds to hours
      setGasThreshold(Number(ethers.utils.formatUnits(threshold, 'gwei')));
      setIsEnabled(isAuthorized);
    } catch (error) {
      console.error('Error loading auto-balancer settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        autoBalancerAddress,
        [
          'function setRebalanceInterval(uint256)',
          'function setGasThreshold(uint256)',
          'function authorizePortfolio(address,bool)',
        ],
        signer
      );

      const tx1 = await contract.setRebalanceInterval(interval * 3600); // Convert hours to seconds
      await tx1.wait();

      const tx2 = await contract.setGasThreshold(
        ethers.utils.parseUnits(gasThreshold.toString(), 'gwei')
      );
      await tx2.wait();

      if (isEnabled) {
        const tx3 = await contract.authorizePortfolio(portfolioAddress, true);
        await tx3.wait();
      }

      setLoading(false);
    } catch (error) {
      console.error('Error saving auto-balancer settings:', error);
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Auto-Balancer Settings
      </Typography>

      <Stack spacing={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>Enable Auto-Balancing</Typography>
          <Switch
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            color="primary"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Rebalance Interval (hours)</Typography>
          <Slider
            value={interval}
            onChange={(_event: Event, value: number | number[]) =>
              setInterval(Array.isArray(value) ? value[0] : value)
            }
            min={1}
            max={168} // 1 week
            step={1}
            marks={[
              { value: 24, label: '24h' },
              { value: 72, label: '3d' },
              { value: 168, label: '1w' },
            ]}
            disabled={!isEnabled}
          />
        </Box>

        <Box>
          <Typography gutterBottom>Gas Price Threshold (gwei)</Typography>
          <Slider
            value={gasThreshold}
            onChange={(_event: Event, value: number | number[]) =>
              setGasThreshold(Array.isArray(value) ? value[0] : value)
            }
            min={1}
            max={500}
            step={1}
            marks={[
              { value: 50, label: '50' },
              { value: 100, label: '100' },
              { value: 200, label: '200' },
            ]}
            disabled={!isEnabled}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
          disabled={loading}
          fullWidth
        >
          Save Settings
        </Button>
      </Stack>
    </Card>
  );
};

export default AutoBalancer; 