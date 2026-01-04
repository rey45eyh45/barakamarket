import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, ArrowLeft, CreditCard, Wallet, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  customerName: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  processedDate?: string;
  bankDetails?: string;
}

interface VendorRevenueProps {
  vendorId: string;
  onBack: () => void;
}

export function VendorRevenue({ vendorId, onBack }: VendorRevenueProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'withdrawals'>('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [commissionRate, setCommissionRate] = useState(10); // Default 10%

  useEffect(() => {
    loadRevenueData();
  }, [vendorId]);

  const loadRevenueData = () => {
    try {
      // Load vendor profile to get commission rate
      const vendorData = localStorage.getItem(`vendor_${vendorId}`);
      if (vendorData) {
        const vendor = JSON.parse(vendorData);
        setCommissionRate(vendor.commission || 10);
      }

      // Load transactions from orders
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const allOrders = JSON.parse(ordersData);
        
        // Filter orders for this vendor's products
        const vendorProductsData = localStorage.getItem(`vendor_products_${vendorId}`);
        const vendorProducts = vendorProductsData ? JSON.parse(vendorProductsData) : [];
        const vendorProductIds = vendorProducts.map((p: any) => p.id);

        const vendorTransactions: Transaction[] = [];
        let total = 0;
        let commission = 0;
        let pending = 0;

        allOrders.forEach((order: any) => {
          // Check if order contains vendor's products
          const vendorItems = order.items.filter((item: any) => 
            vendorProductIds.includes(item.product?.id)
          );

          if (vendorItems.length > 0) {
            const orderAmount = vendorItems.reduce((sum: number, item: any) => 
              sum + (item.product.price * item.quantity), 0
            );
            const orderCommission = orderAmount * (commissionRate / 100);
            const netAmount = orderAmount - orderCommission;

            const transaction: Transaction = {
              id: `trans_${order.id}`,
              orderId: order.id,
              amount: orderAmount,
              commission: orderCommission,
              netAmount: netAmount,
              date: order.date,
              status: order.status === 'delivered' ? 'completed' : 'pending',
              customerName: order.customerInfo.name
            };

            vendorTransactions.push(transaction);

            if (transaction.status === 'completed') {
              total += transaction.netAmount;
              commission += transaction.commission;
            } else {
              pending += transaction.netAmount;
            }
          }
        });

        setTransactions(vendorTransactions);
        setTotalRevenue(total);
        setTotalCommission(commission);
        setPendingAmount(pending);
      }

      // Load withdrawals
      const withdrawalsData = localStorage.getItem(`vendor_withdrawals_${vendorId}`);
      if (withdrawalsData) {
        const allWithdrawals = JSON.parse(withdrawalsData);
        setWithdrawals(allWithdrawals);

        // Calculate available balance
        const totalWithdrawn = allWithdrawals
          .filter((w: WithdrawalRequest) => w.status === 'approved')
          .reduce((sum: number, w: WithdrawalRequest) => sum + w.amount, 0);
        
        setBalance(totalRevenue - totalWithdrawn);
      } else {
        setBalance(totalRevenue);
      }
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('To\'g\'ri summa kiriting!');
      return;
    }

    if (amount > balance) {
      toast.error('Balansda yetarli mablag\' yo\'q!');
      return;
    }

    if (!bankDetails.trim()) {
      toast.error('Bank kartasi ma\'lumotlarini kiriting!');
      return;
    }

    try {
      const newWithdrawal: WithdrawalRequest = {
        id: `withdraw_${Date.now()}`,
        amount: amount,
        requestedDate: new Date().toISOString(),
        status: 'pending',
        bankDetails: bankDetails
      };

      const updatedWithdrawals = [...withdrawals, newWithdrawal];
      setWithdrawals(updatedWithdrawals);
      localStorage.setItem(`vendor_withdrawals_${vendorId}`, JSON.stringify(updatedWithdrawals));

      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankDetails('');
      
      toast.success('Pul yechish so\'rovi yuborildi! Admin ko\'rib chiqadi.');
    } catch (error) {
      console.error('Failed to create withdrawal:', error);
      toast.error('Xatolik yuz berdi!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Orqaga</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/20 p-3 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white text-2xl">Moliyaviy Hisobot</h1>
            <p className="text-green-100">Daromad va komissiya</p>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Mavjud Balans</span>
            <Wallet className="w-5 h-5 text-green-200" />
          </div>
          <div className="text-3xl font-bold mb-4">{formatPrice(balance)}</div>
          
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance <= 0}
            className="w-full bg-white text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pul yechish
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="flex gap-2 px-4 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedTab === 'overview'
                ? 'border-green-600 text-green-600 dark:border-green-500 dark:text-green-500'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Ko'rsatkichlar
          </button>
          <button
            onClick={() => setSelectedTab('transactions')}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedTab === 'transactions'
                ? 'border-green-600 text-green-600 dark:border-green-500 dark:text-green-500'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Tranzaksiyalar ({transactions.length})
          </button>
          <button
            onClick={() => setSelectedTab('withdrawals')}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedTab === 'withdrawals'
                ? 'border-green-600 text-green-600 dark:border-green-500 dark:text-green-500'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Yechib olish ({withdrawals.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatPrice(totalRevenue)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Jami Daromad
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatPrice(totalCommission)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Komissiya ({commissionRate}%)
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatPrice(pendingAmount)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Kutilmoqda
                </div>
              </motion.div>
            </div>

            {/* Commission Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Komissiya haqida</p>
                  <p>Har bir sotuvdan {commissionRate}% komissiya olinadi. Buyurtma "Yetkazildi" holatiga o'tgandan keyin pul hisobingizga o'tadi.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {selectedTab === 'transactions' && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Hali tranzaksiyalar yo'q</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Buyurtma #{transaction.orderId}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.customerName}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status === 'completed' ? 'Yakunlandi' : 'Kutilmoqda'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Summa</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(transaction.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Komissiya</div>
                      <div className="font-semibold text-red-600 dark:text-red-400">
                        -{formatPrice(transaction.commission)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Daromad</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {formatPrice(transaction.netAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(transaction.date)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Withdrawals Tab */}
        {selectedTab === 'withdrawals' && (
          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">Hali pul yechmadingiz</p>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={balance <= 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pul yechish
                </button>
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                        <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(withdrawal.amount)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(withdrawal.requestedDate)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      {withdrawal.status === 'approved' && 'Tasdiqlandi'}
                      {withdrawal.status === 'pending' && 'Ko\'rib chiqilmoqda'}
                      {withdrawal.status === 'rejected' && 'Rad etildi'}
                    </div>
                  </div>

                  {withdrawal.bankDetails && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Karta: {withdrawal.bankDetails}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Pul yechish
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summa
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Mavjud: {formatPrice(balance)}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank kartasi raqami
              </label>
              <input
                type="text"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="8600 **** **** ****"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Yuborish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
