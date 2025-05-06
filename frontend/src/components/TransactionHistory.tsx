import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link,
  Box,
} from '@mui/material';
import { ethers } from 'ethers';
import { formatDistanceToNow } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Array<{
    type: string;
    timestamp: number;
    hash: string;
    data: any;
  }>;
  provider: ethers.providers.Web3Provider;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  provider,
}) => {
  const getTransactionDetails = (transaction: TransactionHistoryProps['transactions'][0]) => {
    switch (transaction.type) {
      case 'Rebalance':
        return 'Portfolio rebalancing executed';
      case 'WeightsUpdated':
        return 'Asset weights updated';
      case 'CrossChainMoved':
        return `Cross-chain transfer: ${ethers.utils.formatEther(transaction.data.amount)} tokens`;
      case 'SwapExecuted':
        return `Swap executed: ${ethers.utils.formatEther(transaction.data.amountIn)} → ${ethers.utils.formatEther(transaction.data.amountOut)}`;
      default:
        return transaction.type;
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Transaction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell>{tx.type}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true })}
                </TableCell>
                <TableCell>{getTransactionDetails(tx)}</TableCell>
                <TableCell>
                  <Link
                    href={`${provider.network.chainId === 1 ? 'https://etherscan.io' : 'https://goerli.etherscan.io'}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box py={2}>
                    <Typography color="textSecondary">
                      No transactions found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TransactionHistory; 