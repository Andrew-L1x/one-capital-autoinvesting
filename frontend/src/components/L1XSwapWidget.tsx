import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  HStack,
  Select,
  useToast,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
} from '@chakra-ui/react';
import { ethers } from 'ethers';

interface L1XSwapWidgetProps {
  portfolio: any;
  assets: { address: string; weight: number }[];
}

const L1XSwapWidget: React.FC<L1XSwapWidgetProps> = ({ portfolio, assets }) => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string>('');
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const toast = useToast();

  // Estimate gas cost whenever relevant parameters change
  useEffect(() => {
    const estimateGas = async () => {
      if (!fromToken || !toToken || !amount || !portfolio) return;

      try {
        setIsEstimatingGas(true);
        const fromIndex = assets.findIndex(asset => asset.address === fromToken);
        const toIndex = assets.findIndex(asset => asset.address === toToken);
        
        if (fromIndex === -1 || toIndex === -1) return;

        const inputAmount = ethers.utils.parseEther(amount);
        const price = await portfolio.getPriceFromXtalk(fromToken, toToken);
        const expectedOutput = inputAmount.mul(price).div(ethers.constants.WeiPerEther);
        const slippageBps = Math.floor(parseFloat(slippage) * 100);
        const minOutput = expectedOutput.mul(10000 - slippageBps).div(10000);

        const gasEstimate = await portfolio.estimateGas.executeXtalkSwap(
          fromIndex,
          toIndex,
          inputAmount,
          minOutput
        );

        // Get current gas price
        const provider = portfolio.provider;
        const gasPrice = await provider.getGasPrice();
        const gasCost = gasEstimate.mul(gasPrice);
        
        setEstimatedGas(ethers.utils.formatEther(gasCost));
      } catch (error) {
        console.error('Error estimating gas:', error);
        setEstimatedGas('Error estimating gas');
      } finally {
        setIsEstimatingGas(false);
      }
    };

    estimateGas();
  }, [fromToken, toToken, amount, slippage, portfolio, assets]);

  const handleSwap = async () => {
    try {
      setIsLoading(true);
      
      const fromIndex = assets.findIndex(asset => asset.address === fromToken);
      const toIndex = assets.findIndex(asset => asset.address === toToken);
      
      if (fromIndex === -1 || toIndex === -1) {
        throw new Error('Invalid token selection');
      }

      const price = await portfolio.getPriceFromXtalk(fromToken, toToken);
      const inputAmount = ethers.utils.parseEther(amount);
      const expectedOutput = inputAmount.mul(price).div(ethers.constants.WeiPerEther);
      const slippageBps = Math.floor(parseFloat(slippage) * 100);
      const minOutput = expectedOutput.mul(10000 - slippageBps).div(10000);

      const tx = await portfolio.executeXtalkSwap(
        fromIndex,
        toIndex,
        inputAmount,
        minOutput
      );
      
      await tx.wait();

      toast({
        title: 'Swap Successful',
        description: 'Tokens swapped successfully through L1X X-talk',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setFromToken('');
      setToToken('');
      setAmount('');
    } catch (error) {
      console.error('Error executing swap:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute swap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
      bg="white"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">L1X Swap Widget</Heading>
        
        <FormControl>
          <FormLabel>From Token</FormLabel>
          <Select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            placeholder="Select token"
          >
            {assets.map((asset) => (
              <option key={asset.address} value={asset.address}>
                {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>To Token</FormLabel>
          <Select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            placeholder="Select token"
          >
            {assets.map((asset) => (
              <option key={asset.address} value={asset.address}>
                {asset.address.slice(0, 6)}...{asset.address.slice(-4)}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Amount</FormLabel>
          <NumberInput
            value={amount}
            onChange={(_, value) => setAmount(value.toString())}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Slippage Tolerance (%)</FormLabel>
          <NumberInput
            value={slippage}
            onChange={(_, value) => setSlippage(value.toString())}
            min={0.1}
            max={100}
            step={0.1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <Box>
          <Text fontWeight="bold">Estimated Gas Cost:</Text>
          <HStack>
            {isEstimatingGas ? (
              <Spinner size="sm" />
            ) : (
              <Text>{estimatedGas ? `${estimatedGas} ETH` : 'Enter swap details to estimate gas'}</Text>
            )}
          </HStack>
        </Box>

        <Button
          colorScheme="blue"
          onClick={handleSwap}
          isLoading={isLoading}
          isDisabled={!fromToken || !toToken || !amount || fromToken === toToken}
        >
          Swap
        </Button>
      </VStack>
    </Box>
  );
};

export default L1XSwapWidget; 