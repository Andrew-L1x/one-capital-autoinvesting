'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import Image from 'next/image'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button variant="outline" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)}>
        Connect Wallet
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector })
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {connector.id === 'l1x' ? (
                  <Image
                    src="/l1x-wallet.svg"
                    alt="L1X Wallet"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : connector.id === 'injected' ? (
                  <Image
                    src="/metamask.svg"
                    alt="MetaMask"
                    width={24}
                    height={24}
                  />
                ) : null}
                {connector.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 