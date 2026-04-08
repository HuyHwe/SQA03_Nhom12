import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle2, Clock, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { http } from '../utils/http';
import toast from 'react-hot-toast';
import './PaymentModal.css';
import PaymentModalSkeleton from './PaymentModalSkeleton';

export default function PaymentModal({ orderId, onClose, onSuccess }) {
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState({ account: false, content: false });
  const [countdown, setCountdown] = useState(300); // 5 phút

  useEffect(() => {
    fetchBankInfo();
    
    // Poll để check payment status mỗi 5 giây
    const pollInterval = setInterval(checkPaymentStatus, 5000);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [orderId]);

  const fetchBankInfo = async () => {
    try {
      console.log('Fetching bank info for order:', orderId);
      const res = await http(`/api/Payment/bank-info/${orderId}`);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch bank info');
      }
      
      const data = await res.json();
      console.log('Bank info data:', data);
      setBankInfo(data);
    } catch (error) {
      console.error('Error fetching bank info:', error);
      toast.error('Không thể tải thông tin thanh toán: ' + error.message);
      onClose(); // Đóng modal nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checking) return;
    setChecking(true);
    try {
      // Giả lập webhook gọi tới Backend báo là đã nhận được tiền (Bypass Check)
      await http('/api/Payment/webhook/sepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 0,
          code: bankInfo.transferContent,
          content: bankInfo.transferContent,
          transferAmount: bankInfo.amount,
          transferType: 'in',
          referenceCode: 'MOCK_PAYMENT_' + Date.now()
        })
      });

      const res = await http(`/api/Orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to check payment');
      const data = await res.json();
      if (data.status === 'paid') {
        toast.success('Thanh toán thành công!');
        onSuccess();
      } else {
        toast.error('Giao dịch đang được xử lý, vui lòng chờ...');
      }
    } catch (error) {
      console.error('Error checking payment:', error);
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      toast.success('Đã sao chép!');
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    } catch (error) {
      toast.error('Không thể sao chép');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !bankInfo) {
    return <PaymentModalSkeleton />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Thanh toán đơn hàng</h2>
                <p className="text-blue-100 text-sm">Quét mã QR hoặc chuyển khoản thủ công</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Countdown Timer */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg p-3">
            <Clock className="w-5 h-5" />
            <span className="text-sm">Thời gian còn lại:</span>
            <span className="font-mono font-bold text-lg">{formatTime(countdown)}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
            <div className="inline-block bg-white p-4 rounded-xl shadow-lg animate-scaleIn">
              <img
                src={bankInfo.qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64 mx-auto object-contain"
                decoding="async"
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-700">
              <CheckCircle2 className="w-5 h-5" />
              <p className="font-medium">Quét mã QR để thanh toán tự động</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Mở app ngân hàng → Quét QR → Xác nhận thanh toán
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc chuyển khoản thủ công</span>
            </div>
          </div>

          {/* Bank Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Name */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Ngân hàng</p>
              <p className="font-semibold text-gray-900">{bankInfo.bankName} Bank</p>
            </div>

            {/* Account Holder */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Chủ tài khoản</p>
              <p className="font-semibold text-gray-900">{bankInfo.accountHolder}</p>
            </div>

            {/* Account Number */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Số tài khoản</p>
              <div className="flex items-center justify-between">
                <p className="font-mono font-bold text-lg text-blue-900">{bankInfo.bankAccount}</p>
                <button
                  onClick={() => copyToClipboard(bankInfo.bankAccount, 'account')}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  {copied.account ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-700 mb-1">Số tiền</p>
              <p className="font-bold text-2xl text-red-600">
                {bankInfo.amount.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>

          {/* Transfer Content - Highlighted */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-300 animate-pulse-slow">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-2">Nội dung chuyển khoản (Quan trọng!)</p>
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-200">
                  <code className="font-mono font-bold text-xl text-orange-600">
                    {bankInfo.transferContent}
                  </code>
                  <button
                    onClick={() => copyToClipboard(bankInfo.transferContent, 'content')}
                    className="p-2 hover:bg-orange-50 rounded-lg transition-colors group"
                  >
                    {copied.content ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ Vui lòng ghi chính xác nội dung để hệ thống tự động xác nhận
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Hướng dẫn thanh toán
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">1.</span>
                <span>Mở app ngân hàng và chọn chức năng chuyển khoản</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">2.</span>
                <span>Quét mã QR hoặc nhập thông tin tài khoản bên trên</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">3.</span>
                <span>Nhập số tiền và <strong>nội dung chuyển khoản chính xác</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-600">4.</span>
                <span>Xác nhận giao dịch và chờ hệ thống xử lý (tự động trong vài giây)</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={checkPaymentStatus}
              disabled={checking}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {checking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Tôi đã chuyển khoản
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>

          {/* Status Indicator */}
          {checking && (
            <div className="flex items-center justify-center gap-2 text-blue-600 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Đang kiểm tra trạng thái thanh toán...</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
