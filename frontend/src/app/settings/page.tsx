'use client'

import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Layout } from '@/components/layout'

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Auto-Rebalancing Settings */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Auto-Rebalancing Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Auto-Rebalancing</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically rebalance your portfolio based on your target allocations
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rebalancing Frequency</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rebalancing Threshold</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="5"
                />
                <span className="text-sm text-muted-foreground">% deviation from target allocation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important events
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Price Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified when token prices reach your target levels
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium">Connected Wallet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                0x1234...5678
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Change Wallet
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Network</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Ethereum Mainnet</option>
                <option>Polygon</option>
                <option>Arbitrum</option>
                <option>Optimism</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Layout>
  )
} 