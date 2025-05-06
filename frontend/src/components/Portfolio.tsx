import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Slider,
  Typography,
  useTheme,
  SliderProps,
} from '@mui/material';
import { ethers } from 'ethers';
import { PieChart, PieChartProps } from 'react-minimal-pie-chart';

interface Asset {
  token: string;
  symbol: string;
  weight: number;
  balance: string;
  value: string;
  color: string;
}

interface PieChartData {
  title: string;
  value: number;
  color: string;
}

interface PortfolioProps {
  provider: ethers.providers.Web3Provider;
  portfolioAddress: string;
  onRebalance: () => void;
}

interface PieChartDataEntry extends PieChartData {
  key?: number;
}

const Portfolio: React.FC<PortfolioProps> = ({
  provider,
  portfolioAddress,
  onRebalance,
}) => {
  const theme = useTheme();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newWeights, setNewWeights] = useState<number[]>([]);

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEEAD',
    '#D4A5A5',
    '#9FA8DA',
    '#FFE082',
  ];

  useEffect(() => {
    loadPortfolioData();
  }, [provider, portfolioAddress]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(
        portfolioAddress,
        ['function getPortfolio() view returns (address[], uint256[], uint256[], uint256[])'],
        provider
      );

      const [tokens, weights, balances, values] = await contract.getPortfolio();
      
      // Load token metadata
      const newAssets: Asset[] = await Promise.all(
        tokens.map(async (token: string, index: number) => {
          const tokenContract = new ethers.Contract(
            token,
            ['function symbol() view returns (string)'],
            provider
          );
          const symbol = await tokenContract.symbol();
          
          return {
            token,
            symbol,
            weight: Number(weights[index]) / 100, // Convert from basis points
            balance: ethers.utils.formatEther(balances[index]),
            value: ethers.utils.formatEther(values[index]),
            color: colors[index % colors.length],
          };
        })
      );

      setAssets(newAssets);
      setNewWeights(newAssets.map(a => a.weight));
      setLoading(false);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setLoading(false);
    }
  };

  const handleWeightChange = (index: number, value: number) => {
    const updatedWeights = [...newWeights];
    updatedWeights[index] = value;
    setNewWeights(updatedWeights);
  };

  const handleSaveWeights = async () => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        portfolioAddress,
        ['function updateWeights(uint256[])'],
        signer
      );

      // Convert percentages back to basis points
      const basisPointWeights = newWeights.map(w => w * 100);
      
      const tx = await contract.updateWeights(basisPointWeights);
      await tx.wait();
      
      setEditMode(false);
      loadPortfolioData();
    } catch (error) {
      console.error('Error updating weights:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  const pieChartData: PieChartData[] = assets.map(asset => ({
    title: asset.symbol,
    value: asset.weight,
    color: asset.color,
  }));

  return (
    <Card sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Portfolio Allocation
          </Typography>
          <Box height={300}>
            <PieChart
              data={pieChartData}
              label={({ dataEntry }: { dataEntry: PieChartDataEntry }) => 
                `${dataEntry.title} ${Math.round(dataEntry.value)}%`
              }
              labelStyle={{ fontSize: '5px' }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Asset Weights</Typography>
            <Button
              variant="contained"
              color={editMode ? "primary" : "secondary"}
              onClick={() => editMode ? handleSaveWeights() : setEditMode(true)}
            >
              {editMode ? "Save Changes" : "Edit Weights"}
            </Button>
          </Box>
          
          {assets.map((asset, index) => (
            <Box key={asset.token} mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>{asset.symbol}</Typography>
                <Typography>{editMode ? `${newWeights[index]}%` : `${asset.weight}%`}</Typography>
              </Box>
              {editMode ? (
                <Slider
                  value={newWeights[index]}
                  onChange={(_event: Event, value: number | number[]) => 
                    handleWeightChange(index, Array.isArray(value) ? value[0] : value)
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              ) : (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Balance: {asset.balance}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Value: ${asset.value}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
          
          {!editMode && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={onRebalance}
              sx={{ mt: 2 }}
            >
              Rebalance Portfolio
            </Button>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};

export default Portfolio; 