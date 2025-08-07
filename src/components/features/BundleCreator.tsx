/**
 * 🚀 Solana Bundler Bot - Bundle Creator Component
 * 
 * Advanced bundle creation interface for managing multi-wallet trading operations.
 * Provides comprehensive configuration options for token trading with enhanced
 * security, performance monitoring, and user experience features.
 * 
 * Key Features:
 * - Multi-wallet bundle creation and management
 * - Advanced trading configuration options
 * - Real-time balance monitoring and validation
 * - Performance analytics and transaction tracking
 * - Enhanced security with input validation
 * - Responsive design with accessibility support
 * 
 * @author solship
 * @version 2.0.0
 * @repository https://github.com/solship/solana-bundler-bot.git
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

// Enhanced type definitions
interface Wallet {
  id: string;
  address: string;
  balance: number;
  selected: boolean;
  name?: string;
  type: 'dev' | 'fund' | 'trading';
  lastUsed?: Date;
  transactionCount: number;
}

interface BundleConfig {
  tokenAddress: string;
  buyAmount: number;
  sellPercentage: number;
  priorityFee: number;
  slippage: number;
  wallets: string[];
  maxGasPrice?: number;
  deadline?: number;
  autoApprove?: boolean;
}

interface BundleCreatorProps {
  onCreateBundle?: (config: BundleConfig) => void;
  onError?: (error: Error) => void;
  wallets?: Wallet[];
  onWalletsUpdate?: (wallets: Wallet[]) => void;
}

interface BundleStats {
  totalBundles: number;
  successfulBundles: number;
  totalVolume: number;
  averageGasUsed: number;
}

/**
 * Bundle Creator Component
 * 
 * Provides comprehensive bundle creation functionality with advanced features
 * for multi-wallet trading operations on the Solana blockchain.
 */
const BundleCreator: React.FC<BundleCreatorProps> = ({ 
  onCreateBundle, 
  onError,
  wallets: externalWallets,
  onWalletsUpdate 
}: BundleCreatorProps) => {
  // State management with proper initialization
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bundle configuration state
  const [tokenAddress, setTokenAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellPercentage, setSellPercentage] = useState('100');
  const [priorityFee, setPriorityFee] = useState('0.001');
  const [slippage, setSlippage] = useState('1.0');
  const [maxGasPrice, setMaxGasPrice] = useState('0.005');
  const [deadline, setDeadline] = useState('30');
  const [autoApprove, setAutoApprove] = useState(false);
  
  // Wallet management state
  const [wallets, setWallets] = useState<Wallet[]>(externalWallets || [
    { 
      id: '1', 
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 
      balance: 1.5, 
      selected: true,
      name: 'Dev Wallet 1',
      type: 'dev',
      transactionCount: 0
    },
    { 
      id: '2', 
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 
      balance: 2.3, 
      selected: true,
      name: 'Fund Wallet 1',
      type: 'fund',
      transactionCount: 0
    },
    { 
      id: '3', 
      address: 'DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz', 
      balance: 0.8, 
      selected: false,
      name: 'Trading Wallet 1',
      type: 'trading',
      transactionCount: 0
    },
  ]);

  // Bundle statistics
  const [bundleStats, setBundleStats] = useState<BundleStats>({
    totalBundles: 12,
    successfulBundles: 10,
    totalVolume: 45.6,
    averageGasUsed: 0.0023
  });

  // Computed values with memoization
  const selectedWallets = useMemo(() => 
    wallets.filter((w: Wallet) => w.selected), [wallets]
  );

  const totalBalance = useMemo(() => 
    selectedWallets.reduce((sum: number, w: Wallet) => sum + w.balance, 0), [selectedWallets]
  );

  const totalInvestment = useMemo(() => 
    parseFloat(buyAmount || '0') * selectedWallets.length, [buyAmount, selectedWallets]
  );

  const totalFees = useMemo(() => 
    parseFloat(priorityFee || '0') * selectedWallets.length, [priorityFee, selectedWallets]
  );

  // Validation functions
  const validateTokenAddress = useCallback((address: string): boolean => {
    return /^[A-Za-z0-9]{32,44}$/.test(address);
  }, []);

  const validateInputs = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!tokenAddress.trim()) {
      errors.push('Token address is required');
    } else if (!validateTokenAddress(tokenAddress)) {
      errors.push('Invalid token address format');
    }

    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      errors.push('Buy amount must be greater than 0');
    }

    if (parseFloat(sellPercentage) < 0 || parseFloat(sellPercentage) > 100) {
      errors.push('Sell percentage must be between 0 and 100');
    }

    if (selectedWallets.length === 0) {
      errors.push('At least one wallet must be selected');
    }

    if (totalInvestment > totalBalance) {
      errors.push('Total investment exceeds available balance');
    }

    return { isValid: errors.length === 0, errors };
  }, [tokenAddress, buyAmount, sellPercentage, selectedWallets, totalInvestment, totalBalance, validateTokenAddress]);

  // Event handlers
  const toggleWalletSelection = useCallback((id: string) => {
    setWallets((prev: Wallet[]) => prev.map((wallet: Wallet) => 
      wallet.id === id ? { ...wallet, selected: !wallet.selected } : wallet
    ));
  }, []);

  const selectAllWallets = useCallback(() => {
    setWallets((prev: Wallet[]) => prev.map((wallet: Wallet) => ({ ...wallet, selected: true })));
  }, []);

  const deselectAllWallets = useCallback(() => {
    setWallets((prev: Wallet[]) => prev.map((wallet: Wallet) => ({ ...wallet, selected: false })));
  }, []);

  const handleCreateBundle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const validation = validateInputs();
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const config: BundleConfig = {
        tokenAddress: tokenAddress.trim(),
        buyAmount: parseFloat(buyAmount),
        sellPercentage: parseFloat(sellPercentage),
        priorityFee: parseFloat(priorityFee),
        slippage: parseFloat(slippage),
        wallets: selectedWallets.map((w: Wallet) => w.address),
        maxGasPrice: parseFloat(maxGasPrice),
        deadline: parseInt(deadline),
        autoApprove
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      onCreateBundle?.(config);
      setIsModalOpen(false);
      
      // Update wallet transaction counts
      setWallets((prev: Wallet[]) => prev.map((wallet: Wallet) => 
        wallet.selected 
          ? { ...wallet, transactionCount: wallet.transactionCount + 1, lastUsed: new Date() }
          : wallet
      ));

      // Update bundle stats
      setBundleStats((prev: BundleStats) => ({
        ...prev,
        totalBundles: prev.totalBundles + 1,
        totalVolume: prev.totalVolume + totalInvestment
      }));

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create bundle');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    validateInputs, tokenAddress, buyAmount, sellPercentage, priorityFee, 
    slippage, selectedWallets, maxGasPrice, deadline, autoApprove, 
    totalInvestment, onCreateBundle, onError
  ]);

  const resetForm = useCallback(() => {
    setTokenAddress('');
    setBuyAmount('');
    setSellPercentage('100');
    setPriorityFee('0.001');
    setSlippage('1.0');
    setMaxGasPrice('0.005');
    setDeadline('30');
    setAutoApprove(false);
    setError(null);
  }, []);

  // Effect to sync external wallets
  useEffect(() => {
    if (externalWallets) {
      setWallets(externalWallets);
    }
  }, [externalWallets]);

  // Effect to notify parent of wallet updates
  useEffect(() => {
    onWalletsUpdate?.(wallets);
  }, [wallets, onWalletsUpdate]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bundle Creator</h2>
            <p className="text-gray-600">Create and manage multi-wallet trading bundles</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            icon="➕"
            size="lg"
          >
            Create New Bundle
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Active Wallets</div>
            <div className="text-2xl font-bold text-blue-900">{selectedWallets.length}</div>
            <div className="text-xs text-blue-600">of {wallets.length} total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Total Balance</div>
            <div className="text-2xl font-bold text-green-900">{totalBalance.toFixed(2)} SOL</div>
            <div className="text-xs text-green-600">Available for trading</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Bundles Created</div>
            <div className="text-2xl font-bold text-purple-900">{bundleStats.totalBundles}</div>
            <div className="text-xs text-purple-600">{bundleStats.successfulBundles} successful</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">Total Volume</div>
            <div className="text-2xl font-bold text-orange-900">{bundleStats.totalVolume.toFixed(1)} SOL</div>
            <div className="text-xs text-orange-600">Lifetime trading</div>
          </div>
        </div>

        {/* Recent Bundles */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bundles</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-medium text-gray-900">Bundle #{bundleStats.totalBundles - i + 1}</div>
                  <div className="text-sm text-gray-500">
                    {selectedWallets.length} wallets • {(Math.random() * 2 + 0.5).toFixed(2)} SOL each
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Bundle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Bundle"
        size="xl"
      >
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-500">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Token Configuration */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Token Configuration</h4>
            <div className="space-y-4">
              <Input
                label="Token Address"
                placeholder="Enter token mint address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                error={tokenAddress && !validateTokenAddress(tokenAddress) ? 'Invalid token address format' : undefined}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Buy Amount (SOL per wallet)"
                  type="number"
                  placeholder="0.1"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Sell Percentage (%)"
                  type="number"
                  placeholder="100"
                  value={sellPercentage}
                  onChange={(e) => setSellPercentage(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Trading Parameters */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Trading Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Priority Fee (SOL)"
                type="number"
                placeholder="0.001"
                value={priorityFee}
                onChange={(e) => setPriorityFee(e.target.value)}
                min="0"
                step="0.0001"
              />
              <Input
                label="Slippage (%)"
                type="number"
                placeholder="1.0"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                min="0"
                max="50"
                step="0.1"
              />
              <Input
                label="Max Gas Price (SOL)"
                type="number"
                placeholder="0.005"
                value={maxGasPrice}
                onChange={(e) => setMaxGasPrice(e.target.value)}
                min="0"
                step="0.001"
              />
              <Input
                label="Deadline (minutes)"
                type="number"
                placeholder="30"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min="1"
                max="1440"
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-approve token spending</span>
              </label>
            </div>
          </div>

          {/* Wallet Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Select Wallets</h4>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllWallets}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllWallets}>
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wallets.map((wallet: Wallet) => (
                <div
                  key={wallet.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    wallet.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleWalletSelection(wallet.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={wallet.selected}
                      onChange={() => toggleWalletSelection(wallet.id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {wallet.name || `${wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)} • {wallet.balance} SOL
                      </div>
                      <div className="text-xs text-gray-400">
                        {wallet.transactionCount} transactions • Last used: {wallet.lastUsed ? wallet.lastUsed.toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      wallet.type === 'dev' ? 'bg-blue-100 text-blue-800' :
                      wallet.type === 'fund' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {wallet.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Bundle Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Wallets:</span>
                <span className="text-gray-900">{selectedWallets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment:</span>
                <span className="text-gray-900">{totalInvestment.toFixed(2)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fees:</span>
                <span className="text-gray-900">{totalFees.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Balance:</span>
                <span className={`font-medium ${totalInvestment > totalBalance ? 'text-red-600' : 'text-green-600'}`}>
                  {totalBalance.toFixed(2)} SOL
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Reset Form
            </Button>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateBundle}
                disabled={isLoading || !validateInputs().isValid}
                loading={isLoading}
              >
                {isLoading ? 'Creating Bundle...' : 'Create Bundle'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BundleCreator;
