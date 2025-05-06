import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { ethers } from 'ethers';
import Portfolio from './Portfolio';
import AutoBalancer from './AutoBalancer';
import TransactionHistory from './TransactionHistory';

interface DashboardProps {
  provider: ethers.providers.Web3Provider;
  portfolioAddress: string;
  autoBalancerAddress: string;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  provider,
  portfolioAddress,
  autoBalancerAddress,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [provider, portfolioAddress]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load transaction history
      const contract = new ethers.Contract(
        portfolioAddress,
        [
          'event WeightsUpdated(address[] tokens, uint256[] weights)',
          'event Rebalanced(uint256 timestamp, uint256[] newBalances)',
          'event CrossChainMoved(address token, uint256 amount, uint256 targetChainId, address to)',
          'event SwapExecuted(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)',
        ],
        provider
      );

      const filter = contract.filters.Rebalanced();
      const events = await contract.queryFilter(filter, -10000, 'latest');
      
      const formattedEvents = await Promise.all(
        events.map(async (event) => {
          const block = await event.getBlock();
          return {
            type: 'Rebalance',
            timestamp: block.timestamp,
            hash: event.transactionHash,
            data: event.args,
          };
        })
      );

      setTransactions(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
      showNotification('error', 'Failed to load dashboard data');
    }
  };

  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({ type, message });
  };

  const handleRebalance = async () => {
    try {
      showNotification('info', 'Rebalancing portfolio...');
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        portfolioAddress,
        ['function rebalance()'],
        signer
      );

      const tx = await contract.rebalance();
      await tx.wait();
      
      showNotification('success', 'Portfolio rebalanced successfully');
      loadInitialData(); // Refresh data
    } catch (error) {
      console.error('Error rebalancing portfolio:', error);
      showNotification('error', 'Failed to rebalance portfolio');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Portfolio Dashboard
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Portfolio
            provider={provider}
            portfolioAddress={portfolioAddress}
            onRebalance={handleRebalance}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <AutoBalancer
            provider={provider}
            autoBalancerAddress={autoBalancerAddress}
            portfolioAddress={portfolioAddress}
          />
        </Grid>

        <Grid item xs={12}>
          <TransactionHistory
            transactions={transactions}
            provider={provider}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.type}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 