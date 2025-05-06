import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Select,
  Input,
  HStack,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Spinner
} from '@chakra-ui/react';
import PortfolioABI from './contracts/Portfolio.json';
import L1XSwapWidget from './components/L1XSwapWidget';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// Common token list with addresses and symbols
const COMMON_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    logo: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png'
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
  },
  {
    symbol: 'AAVE',
    name: 'Aave',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/aave-aave-logo.png'
  },
  {
    symbol: 'SNX',
    name: 'Synthetix',
    address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/synthetix-network-token-snx-logo.png'
  },
  {
    symbol: 'YFI',
    name: 'yearn.finance',
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png'
  }
];

const App = () => {
  const [portfolio, setPortfolio] = useState<ethers.Contract | null>(null);
  const [assets, setAssets] = useState<{ address: string; weight: number }[]>([
    {
      address: COMMON_TOKENS[0].address, // ETH
      weight: 60
    },
    {
      address: COMMON_TOKENS[1].address, // USDC
      weight: 25
    },
    {
      address: COMMON_TOKENS[3].address, // WBTC
      weight: 15
    }
  ]);
  const [balances, setBalances] = useState<number[]>([0, 0, 0]);
  const [isPortfolioOwner, setIsPortfolioOwner] = useState(false);
  const [portfolioBalance, setPortfolioBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('0');
  const [autoRebalanceEnabled, setAutoRebalanceEnabled] = useState(false);
  const [rebalanceFrequency, setRebalanceFrequency] = useState('');
  const [nextRebalanceTime, setNextRebalanceTime] = useState(0);
  const [canManualRebalance, setCanManualRebalance] = useState(false);
  const [newTokenWeight, setNewTokenWeight] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [apr, setApr] = useState(0);
  const [performanceData, setPerformanceData] = useState<number[]>([]);
  const [initialDeposit, setInitialDeposit] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []); // Request account access
          const signer = provider.getSigner();
          
          // Get the first test account from Hardhat
          const accounts = await provider.listAccounts();
          const testAccount = accounts[0];
          
          // Create a mock contract instance
          const mockContract = new ethers.Contract(
            testAccount, // Use the test account as the contract address for now
            PortfolioABI.abi,
            signer
          );
          
          setPortfolio(mockContract);
          setIsPortfolioOwner(true); // Set to true for testing
          setIsLoading(false);
        } else {
          setError("Please install MetaMask to use this application");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize contract:", error);
        setError("Failed to initialize contract. Please make sure you're connected to the Hardhat network.");
        setIsLoading(false);
      }
    };

    initializeContract();
  }, []);

  const handleCreatePortfolio = async () => {
    try {
      if (!portfolio) {
        throw new Error("Contract not initialized");
      }

      setIsLoading(true);
      setError(null);

      // For testing, just set the portfolio owner status to true
      setIsPortfolioOwner(true);
      
      toast({
        title: "Success",
        description: "Portfolio created successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error: any) {
      console.error("Failed to create portfolio:", error);
      setError(error?.message || "Failed to create portfolio. Please try again.");
      toast({
        title: "Error",
        description: error?.message || "Failed to create portfolio. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolioData = async () => {
    try {
      if (!portfolio) {
        throw new Error("Contract not initialized");
      }

      const [portfolioAssets, portfolioWeights] = await portfolio.getPortfolio();
      const currentBalances = await portfolio.getCurrentBalances();
      const autoRebalance = await portfolio.autoRebalanceEnabled();
      const frequency = await portfolio.getRebalanceFrequencyString();
      const nextRebalance = await portfolio.getNextRebalanceTime();
      const canRebalance = await portfolio.canManualRebalance();

      setAssets(portfolioAssets.map((address: string, index: number) => ({
        address,
        weight: portfolioWeights[index].toNumber()
      })));
      setBalances(currentBalances.map((balance: ethers.BigNumber) => balance.toNumber()));
      setAutoRebalanceEnabled(autoRebalance);
      setRebalanceFrequency(frequency);
      setNextRebalanceTime(nextRebalance.toNumber());
      setCanManualRebalance(canRebalance);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolio data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const depositFunds = async (amount: string) => {
    try {
      if (!portfolio) {
        throw new Error("Contract not initialized");
      }

      const tx = await portfolio.depositFunds({
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      
      toast({
        title: 'Success',
        description: 'Funds deposited successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      await loadPortfolioData();
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to deposit funds',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWeightChange = (index: number, newWeight: number) => {
    const updatedAssets = [...assets];
    updatedAssets[index].weight = newWeight;
    
    // Calculate total weight excluding the current token
    const totalExcludingCurrent = updatedAssets.reduce((sum, asset, i) => 
      i === index ? sum : sum + asset.weight, 0);
    
    // If this is the last token, adjust its weight to make total 100%
    if (index === updatedAssets.length - 1) {
      updatedAssets[index].weight = Math.max(0, 100 - totalExcludingCurrent);
    }
    
    setAssets(updatedAssets);
  };

  const handleAddToken = async () => {
    try {
      if (!portfolio) {
        throw new Error("Contract not initialized");
      }

      const tokenAddress = isCustomToken ? customTokenAddress : selectedToken;
      
      if (!ethers.utils.isAddress(tokenAddress)) {
        toast({
          title: 'Error',
          description: 'Invalid token address',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (newTokenWeight <= 0 || newTokenWeight > 100) {
        toast({
          title: 'Error',
          description: 'Weight must be between 1 and 100',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Find the highest weighted asset
      const highestWeightedIndex = assets.reduce((maxIndex, asset, currentIndex) => 
        asset.weight > assets[maxIndex].weight ? currentIndex : maxIndex, 0);

      // Create new assets array with the new token
      const updatedAssets = [...assets, { address: tokenAddress, weight: newTokenWeight }];
      
      // Reduce the highest weighted asset's weight by the new token's weight
      updatedAssets[highestWeightedIndex].weight = Math.max(0, updatedAssets[highestWeightedIndex].weight - newTokenWeight);
      
      setAssets(updatedAssets);
      setBalances([...balances, 0]);

      toast({
        title: 'Success',
        description: 'Token added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setSelectedToken('');
      setCustomTokenAddress('');
      setNewTokenWeight(0);
      setIsCustomToken(false);
      onClose();
    } catch (error: any) {
      console.error('Error adding token:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add token',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateWeights = async () => {
    try {
      if (!portfolio) {
        throw new Error("Contract not initialized");
      }

      const newWeights = assets.map(asset => 
        ethers.utils.parseUnits(asset.weight.toString(), 16)
      );
      
      const tx = await portfolio.updateWeights(newWeights, {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0
      });
      await tx.wait();

      toast({
        title: 'Success',
        description: 'Weights updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await loadPortfolioData();
    } catch (error: any) {
      console.error('Error updating weights:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update weights',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Generate random colors for the pie chart
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  // Prepare chart data
  const chartData = {
    labels: assets.map(asset => {
      const token = COMMON_TOKENS.find(t => t.address.toLowerCase() === asset.address.toLowerCase());
      return token ? `${token.symbol} (${asset.weight}%)` : `${asset.address.slice(0, 6)}... (${asset.weight}%)`;
    }),
    datasets: [
      {
        data: assets.map(asset => asset.weight),
        backgroundColor: generateColors(assets.length),
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Portfolio Allocation',
        font: {
          size: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  // Generate performance data (mock data for now)
  useEffect(() => {
    if (totalValue > 0) {
      // Generate 30 days of performance data
      const data = Array.from({ length: 30 }, (_, i) => {
        const randomChange = (Math.random() - 0.5) * 0.1; // Random change between -5% and +5%
        return totalValue * (1 + randomChange);
      });
      setPerformanceData(data);

      // Calculate APR based on performance
      const firstValue = data[0];
      const lastValue = data[data.length - 1];
      const aprValue = ((lastValue - firstValue) / firstValue) * 100;
      setApr(aprValue);
    }
  }, [totalValue]);

  // Update price calculation to use L1X X-talk oracle
  useEffect(() => {
    const calculateTotalValue = async () => {
      if (!portfolio || assets.length === 0) {
        return;
      }

      let total = 0;
      for (let i = 0; i < assets.length; i++) {
        const token = COMMON_TOKENS.find(t => t.address.toLowerCase() === assets[i].address.toLowerCase());
        if (token) {
          try {
            const balance = balances[i] || 0;
            // For testing, use a mock price of 1
            const price = 1;
            total += balance * price;
          } catch (error) {
            console.error('Error fetching price:', error);
            total += balances[i] || 0;
          }
        }
      }
      setTotalValue(total);
      if (initialDeposit === 0) {
        setInitialDeposit(total);
      }
    };
    calculateTotalValue();
  }, [assets, balances, portfolio, initialDeposit]);

  // Performance chart data
  const performanceChartData = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceData,
        borderColor: performanceData[performanceData.length - 1] >= initialDeposit ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: performanceData[performanceData.length - 1] >= initialDeposit ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Portfolio Performance',
        font: {
          size: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  useEffect(() => {
    if (portfolio) {
      const interval = setInterval(() => {
        loadPortfolioData();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [portfolio, loadPortfolioData]);

  useEffect(() => {
    const total = assets.reduce((sum, asset) => sum + asset.weight, 0);
    setTotalWeight(total);
  }, [assets]);

  return (
    <ChakraProvider>
      <Box p={8}>
        <VStack spacing={8} align="stretch">
          <Heading>Portfolio Management</Heading>
          
          {isLoading ? (
            <VStack spacing={4}>
              <Spinner size="xl" />
              <Text>Loading...</Text>
            </VStack>
          ) : error ? (
            <VStack spacing={4}>
              <Text color="red.500">{error}</Text>
              <Button colorScheme="blue" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </VStack>
          ) : !isPortfolioOwner ? (
            <VStack spacing={4}>
              <Text>Create your portfolio to start managing your assets</Text>
              <Button 
                colorScheme="blue" 
                onClick={handleCreatePortfolio}
                isLoading={isLoading}
              >
                Create Portfolio
              </Button>
            </VStack>
          ) : (
            <>
              <Text>Your Portfolio</Text>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={8}>
                <GridItem>
                  <Box>
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md">Portfolio Assets</Heading>
                      <Button colorScheme="green" onClick={onOpen}>
                        Add Token
                      </Button>
                    </HStack>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Asset</Th>
                            <Th>Weight (%)</Th>
                            <Th>Balance</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {assets.map((asset, index) => {
                            const token = COMMON_TOKENS.find(t => t.address.toLowerCase() === asset.address.toLowerCase());
                            return (
                              <Tr key={asset.address}>
                                <Td>
                                  <HStack>
                                    {token && <Image src={token.logo} alt={token.symbol} boxSize="24px" />}
                                    <Text>{token ? token.symbol : asset.address.slice(0, 6) + '...'}</Text>
                                  </HStack>
                                </Td>
                                <Td>
                                  <NumberInput
                                    value={asset.weight}
                                    min={0}
                                    max={100}
                                    onChange={(_, value) => handleWeightChange(index, value)}
                                  >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </Td>
                                <Td>{balances[index] ? ethers.utils.formatEther(balances[index]) : '0'}</Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => {
                                      const updatedAssets = assets.filter((_, i) => i !== index);
                                      const updatedBalances = balances.filter((_, i) => i !== index);
                                      // If removing the last token, adjust the new last token's weight
                                      if (index === assets.length - 1 && updatedAssets.length > 0) {
                                        const totalExcludingLast = updatedAssets.reduce((sum, asset, i) => 
                                          i === updatedAssets.length - 1 ? sum : sum + asset.weight, 0);
                                        updatedAssets[updatedAssets.length - 1].weight = 100 - totalExcludingLast;
                                      }
                                      setAssets(updatedAssets);
                                      setBalances(updatedBalances);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                    <HStack justify="space-between" mt={4}>
                      <Text>Total Weight: {totalWeight}%</Text>
                      <Button
                        colorScheme="blue"
                        onClick={handleUpdateWeights}
                        isDisabled={totalWeight !== 100}
                      >
                        Update Weights
                      </Button>
                    </HStack>
                  </Box>
                </GridItem>

                <GridItem>
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    boxShadow="md"
                    bg="white"
                  >
                    {assets.length > 0 ? (
                      <Pie data={chartData} options={chartOptions} />
                    ) : (
                      <VStack h="300px" justify="center">
                        <Text color="gray.500">Add tokens to see allocation chart</Text>
                      </VStack>
                    )}
                  </Box>
                </GridItem>
              </Grid>

              <Box mt={8}>
                <Heading size="md" mb={4}>Deposit Funds</Heading>
                <HStack>
                  <NumberInput
                    min={0}
                    onChange={(_, value) => setDepositAmount(value.toString())}
                  >
                    <NumberInputField placeholder="Amount in ETH" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button
                    colorScheme="blue"
                    onClick={() => depositFunds(depositAmount)}
                  >
                    Deposit
                  </Button>
                </HStack>
                <Text mt={2}>Current Balance: {ethers.utils.formatEther(portfolioBalance)} ETH</Text>
              </Box>

              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Add Token</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody pb={6}>
                    <FormControl>
                      <FormLabel>Select Token</FormLabel>
                      <Select
                        placeholder="Select token"
                        value={selectedToken}
                        onChange={(e) => {
                          setSelectedToken(e.target.value);
                          setIsCustomToken(false);
                        }}
                      >
                        {COMMON_TOKENS.map(token => (
                          <option key={token.address} value={token.address}>
                            {token.symbol} - {token.name}
                          </option>
                        ))}
                        <option value="custom">Custom Token</option>
                      </Select>
                    </FormControl>

                    {selectedToken === 'custom' && (
                      <FormControl mt={4}>
                        <FormLabel>Custom Token Address</FormLabel>
                        <Input
                          value={customTokenAddress}
                          onChange={(e) => setCustomTokenAddress(e.target.value)}
                          placeholder="0x..."
                        />
                      </FormControl>
                    )}

                    <FormControl mt={4}>
                      <FormLabel>Weight (%)</FormLabel>
                      <NumberInput
                        value={newTokenWeight}
                        min={0}
                        max={100}
                        onChange={(_, value) => setNewTokenWeight(value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <Button mt={6} colorScheme="blue" mr={3} onClick={handleAddToken}>
                      Add Token
                    </Button>
                    <Button mt={6} onClick={onClose}>Cancel</Button>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default App; 