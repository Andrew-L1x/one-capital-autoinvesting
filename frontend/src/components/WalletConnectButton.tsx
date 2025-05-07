'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
    // Debug: Log available connectors
    console.log('Available connectors:', connectors)
    // Debug: Check if L1X wallet is available
    console.log('L1X wallet available:', typeof window !== 'undefined' && window.l1x)
  }, [connectors])

  const handleConnect = async () => {
    try {
      console.log('Attempting to connect...')
      
      // Check if L1X wallet is available
      if (typeof window === 'undefined' || !window.l1x) {
        console.error('L1X wallet not detected')
        return
      }

      // Try to enable the wallet first
      try {
        await window.l1x.enable()
      } catch (err) {
        console.error('Failed to enable L1X wallet:', err)
        return
      }

      const l1xConnector = connectors.find(c => c.id === 'l1x')
      console.log('Found connector:', l1xConnector)
      
      if (!l1xConnector) {
        console.error('L1X wallet connector not found')
        return
      }

      await connect({ connector: l1xConnector })
      console.log('Connection successful')
    } catch (err) {
      console.error('Failed to connect:', err)
    }
  }

  if (!mounted) {
    return <Button variant="outline">Loading...</Button>
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="flex items-center gap-2"
      >
        <span className="hidden md:inline">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <span className="md:hidden">Connected</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={handleConnect}
      className="flex items-center gap-2"
    >
      Connect L1X Wallet
    </Button>
  )
} 