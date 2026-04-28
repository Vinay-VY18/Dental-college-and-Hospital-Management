import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserRound, Mail, Calendar, BookOpen, Award, LogOut, RefreshCw, CreditCard, BarChart3, Clock, MessageSquare, FileText, Grid3x3, Download, CheckCircle, AlertCircle, QrCode, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const StudentDashboard = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({ teacher: '', subject: '', feedback: '', rating: 5 });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [qrInputValue, setQrInputValue] = useState('');
  const [feePaymentData, setFeePaymentData] = useState({
    totalFee: 73000,
    paidFee: 30000,
    balanceFee: 43000
  });

  const token = sessionStorage.getItem('studentToken');

  const authConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchStudentData = async () => {
    if (!token) {
      navigate('/student-auth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get('http://localhost:5000/api/students/profile', authConfig);
      setStudent(res.data.student || null);
      sessionStorage.setItem('studentProfile', JSON.stringify(res.data.student));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard data.';
      setError(msg);

      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem('studentToken');
        sessionStorage.removeItem('studentProfile');
        navigate('/student-auth');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('studentToken');
    sessionStorage.removeItem('studentProfile');
    navigate('/student-auth');
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    alert(language === 'KN' ? 'ಪ್ರತಿಕ್ರಿಯೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ' : 'Feedback submitted successfully!');
    setFeedbackForm({ teacher: '', subject: '', feedback: '', rating: 5 });
    setShowFeedbackModal(false);
  };

  const handlePaymentClick = () => {
    if (feePaymentData.balanceFee > 0) {
      setShowPaymentModal(true);
    }
  };

  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      console.log('Starting payment process...');
      console.log('Student ID:', student?._id);
      console.log('Balance Fee:', feePaymentData.balanceFee);

      // Validate student and amount
      if (!student || !student._id) {
        throw new Error('Student information not loaded. Please refresh and try again.');
      }

      if (feePaymentData.balanceFee <= 0) {
        throw new Error('Invalid amount for payment');
      }

      // Step 1: Get Razorpay key from backend
      console.log('Fetching Razorpay key...');
      const keyRes = await axios.get('http://localhost:5000/api/payments/razorpay-key');
      const { key } = keyRes.data;
      console.log('Razorpay key received');

      // Step 2: Create order from backend
      console.log('Creating payment order...');
      const orderPayload = {
        amount: feePaymentData.balanceFee,
        description: 'Student Fee Payment',
        studentId: student._id,
        receipt: `receipt_${student.usn}_${Date.now()}`
      };
      console.log('Order payload:', orderPayload);

      const orderRes = await axios.post(
        'http://localhost:5000/api/payments/create-order',
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Order response:', orderRes.data);
      const { orderId, amount, currency } = orderRes.data;

      // Step 3: Open Razorpay checkout
      console.log('Opening Razorpay checkout...');
      const options = {
        key,
        order_id: orderId,
        amount,
        currency,
        name: 'RRDCH - Fee Payment',
        description: 'Student Fee Payment',
        prefill: {
          name: student?.name || 'Student',
          email: student?.email || '',
          contact: student?.phone || ''
        },
        handler: async function (response) {
          try {
            console.log('Payment response received:', response);
            
            // Step 4: Verify payment with backend
            const verifyRes = await axios.post(
              'http://localhost:5000/api/payments/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentId: student._id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              console.log('Payment verified successfully');
              // Payment successful
              const receipt = {
                id: response.razorpay_payment_id,
                amount: feePaymentData.balanceFee,
                date: new Date().toLocaleDateString('en-IN'),
                time: new Date().toLocaleTimeString('en-IN'),
                method: 'Razorpay',
                student: student?.name,
                usn: student?.usn,
                previousBalance: feePaymentData.paidFee,
                newBalance: feePaymentData.totalFee
              };

              setLastReceipt(receipt);
              
              // Update fee payment data
              setFeePaymentData({
                totalFee: feePaymentData.totalFee,
                paidFee: feePaymentData.totalFee,
                balanceFee: 0
              });

              setShowPaymentModal(false);
              setShowReceiptModal(true);
              setPaymentProcessing(false);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setPaymentProcessing(false);
            alert(language === 'KN' ? 'ಪಾವತಿ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Payment verification failed: ' + err.message);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
            alert(language === 'KN' ? 'ಪಾವತಿ ರದ್ದುಪಡಿಸಲಾಗಿದೆ' : 'Payment cancelled');
          }
        }
      };

      // Load Razorpay script if not already loaded
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentProcessing(false);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to initiate payment';
      alert(language === 'KN' ? `ಪಾವತಿ ಆರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ: ${errorMsg}` : `Payment failed: ${errorMsg}`);
    }
  };

  const handleDownloadReceipt = () => {
    if (!lastReceipt) return;

    const receiptContent = `
      RRDCH - FEE PAYMENT RECEIPT
      ================================
      
      Receipt ID: ${lastReceipt.id}
      Date: ${lastReceipt.date}
      Time: ${lastReceipt.time}
      
      Student Name: ${lastReceipt.student}
      USN: ${lastReceipt.usn}
      
      Payment Details:
      ----------------
      Amount Paid: ?${lastReceipt.amount}
      Total Fees: ${lastReceipt.newBalance}
      Payment Method: ${lastReceipt.method}
      
      Previous Balance: ?${lastReceipt.previousBalance}
      Current Balance: ?${feePaymentData.balanceFee}
      
      Status: SUCCESSFUL
      ================================
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `Receipt_${lastReceipt.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto"></div>
          <p className="text-gray-800 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dobDisplay = student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  // Dummy Data
  const classTimeTable = [
    { day: 'Monday', time: '10:00 AM - 11:00 AM', subject: 'Prosthodontics', room: 'Lab-2' },
    { day: 'Tuesday', time: '2:00 PM - 3:00 PM', subject: 'Periodontics', room: 'Classroom-A' },
    { day: 'Wednesday', time: '10:00 AM - 11:30 AM', subject: 'Oral Surgery', room: 'Lab-1' },
    { day: 'Thursday', time: '3:00 PM - 4:00 PM', subject: 'Conservative Dentistry', room: 'Lab-3' },
    { day: 'Friday', time: '11:00 AM - 12:00 PM', subject: 'Pharmacology', room: 'Classroom-B' }
  ];

  const examTimeTable = [
    { subject: 'Oral Surgery', date: '2026-05-10', time: '10:00 AM', room: 'Hall-1' },
    { subject: 'Prosthodontics', date: '2026-05-15', time: '2:00 PM', room: 'Hall-2' },
    { subject: 'Periodontics', date: '2026-05-20', time: '10:00 AM', room: 'Hall-1' },
    { subject: 'Conservative Dentistry', date: '2026-05-25', time: '3:00 PM', room: 'Hall-3' }
  ];

  const results = [
    { subject: 'Oral Surgery', internals: 35, theory: 78, total: 113, grade: 'A' },
    { subject: 'Prosthodontics', internals: 38, theory: 82, total: 120, grade: 'A+' },
    { subject: 'Periodontics', internals: 32, theory: 75, total: 107, grade: 'A' },
    { subject: 'Conservative Dentistry', internals: 36, theory: 79, total: 115, grade: 'A' }
  ];

  const attendance = [
    { subject: 'Oral Surgery', attended: 28, total: 30, percentage: 93 },
    { subject: 'Prosthodontics', attended: 29, total: 30, percentage: 97 },
    { subject: 'Periodontics', attended: 26, total: 30, percentage: 87 },
    { subject: 'Conservative Dentistry', attended: 30, total: 30, percentage: 100 }
  ];

  const feeStructure = [
    { description: 'Tuition Fee', amount: '₹50,000' },
    { description: 'Lab Fee', amount: '₹15,000' },
    { description: 'Library & IT', amount: '₹5,000' },
    { description: 'Activities & Events', amount: '₹3,000' },
    { description: 'Total Fee', amount: '₹73,000', isBold: true }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-teal/5 to-brand-blue/5 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-teal">
              {language === 'KN' ? '?????????? ?????????????' : 'Student Dashboard'}
            </h1>
            <p className="text-gray-800 mt-2">
              {language === 'KN' ? '????? ???????? ????? ????????? ??????' : 'Your profile and academic information'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStudentData}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-brand-teal text-brand-teal bg-white hover:bg-brand-light transition-colors font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'KN' ? '????????' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'KN' ? '????????' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content */}
        {student ? (
          <div className="space-y-6">
            {/* Welcome & Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="profile-section">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-xl shadow-sm border border-brand-teal/10 overflow-hidden">
                  <div className="bg-linear-to-r from-brand-teal to-brand-teal/80 px-6 py-8 text-white">
                    <h2 className="text-2xl font-bold">
                      {language === 'KN' ? '???????,' : 'Welcome,'} <span className="block text-3xl mt-2">{student.name}</span>
                    </h2>
                    <p className="text-brand-teal/90 mt-2">
                      {language === 'KN' ? '????? ????????? ?????????? ??????' : 'Welcome to your academic portal'}
                    </p>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">
                      {language === 'KN' ? '???????? ??????' : 'Profile Information'}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* USN */}
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                      <div className="p-3 bg-brand-teal/10 rounded-lg">
                        <UserRound className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{language === 'KN' ? 'USN' : 'University Serial Number'}</p>
                        <p className="text-lg font-semibold text-gray-900">{student.usn}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                      <div className="p-3 bg-brand-blue/10 rounded-lg">
                        <Mail className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{language === 'KN' ? '?????' : 'Email'}</p>
                        <p className="text-lg font-semibold text-gray-900 break-all">{student.email || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{language === 'KN' ? '??? ??????' : 'Date of Birth'}</p>
                        <p className="text-lg font-semibold text-gray-900">{dobDisplay}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{language === 'KN' ? '????' : 'Phone'}</p>
                        <p className="text-lg font-semibold text-gray-900">{student.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Student ID Card */}
                <div className="bg-linear-to-br from-brand-teal to-brand-teal/80 rounded-xl shadow-md p-6 text-white">
                  <p className="text-sm opacity-90">{language === 'KN' ? '?????????? ???' : 'Student ID'}</p>
                  <p className="text-3xl font-bold mt-2 break-all">{student.studentId}</p>
                </div>

                {/* Academic Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {language === 'KN' ? '???????? ???????' : 'Academic Details'}
                  </h3>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-sm text-orange-600 font-medium">{language === 'KN' ? '?????' : 'Department'}</p>
                    <p className="text-lg font-bold text-orange-900 mt-1">{student.department || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium">{language === 'KN' ? '?????????' : 'Semester'}</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">{student.semester ? `${student.semester}` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-4">
                <button
                  onClick={() => setActiveTab('fee')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    activeTab === 'fee'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {language === 'KN' ? '??' : 'Fee'}
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    activeTab === 'attendance'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  {language === 'KN' ? '?????' : 'Attendance'}
                </button>
                <button
                  onClick={() => setActiveTab('classtime')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    activeTab === 'classtime'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                  {language === 'KN' ? '????' : 'Class'}
                </button>
                <button
                  onClick={() => setActiveTab('examtime')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    activeTab === 'examtime'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  {language === 'KN' ? '???????' : 'Exam'}
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                    activeTab === 'results'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  {language === 'KN' ? '???????' : 'Results'}
                </button>
                <button
                  onClick={() => navigate('/student')}
                  className="px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <BookOpen className="w-5 h-5" />
                  {language === 'KN' ? 'ಸೇವೆಗಳು' : 'Services'}
                </button>
                <button
                  onClick={() => navigate('/hostel')}
                  className="px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <MessageSquare className="w-5 h-5" />
                  {language === 'KN' ? 'ಹಾಸ್ಟೆಲ್' : 'Hostel'}
                </button>
              </div>
            </div>

            {/* Fee Structure Section */}
            {activeTab === 'fee' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-brand-teal" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'KN' ? '?? ????' : 'Fee Structure'}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Fee Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">{language === 'KN' ? '????? ??' : 'Total Fee'}</p>
                    <p className="text-2xl font-bold text-blue-900 mt-2">₹{feePaymentData.totalFee.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">{language === 'KN' ? 'Paid Fee' : 'Paid Fee'}</p>
                    <p className="text-2xl font-bold text-green-900 mt-2">₹{feePaymentData.paidFee.toLocaleString('en-IN')}</p>
                  </div>
                  <div className={`p-4 ${feePaymentData.balanceFee > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'} rounded-lg`}>
                    <p className={`text-sm font-medium ${feePaymentData.balanceFee > 0 ? 'text-red-600' : 'text-green-600'}`}>{language === 'KN' ? 'Balance Fee' : 'Balance Fee'}</p>
                    <p className={`text-2xl font-bold mt-2 ${feePaymentData.balanceFee > 0 ? 'text-red-900' : 'text-green-900'}`}>₹{feePaymentData.balanceFee.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">{language === 'KN' ? '?? ??????' : 'Fee Breakdown'}</h4>
                  <div className="space-y-3">
                    {feeStructure.map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${item.isBold ? 'bg-brand-teal/10 border border-brand-teal/20' : 'bg-gray-50'}`}>
                        <span className={item.isBold ? 'font-bold text-brand-teal' : 'text-gray-700'}>{item.description}</span>
                        <span className={item.isBold ? 'font-bold text-brand-teal text-lg' : 'font-semibold text-gray-900'}>{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Status and Actions */}
                <div className="border-t border-gray-200 pt-6">
                  {feePaymentData.balanceFee === 0 ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">{language === 'KN' ? '??????? ???????' : 'Payment Complete'}</p>
                        <p className="text-sm text-green-700">{language === 'KN' ? '???? ????? ?? ?????? ?????????????' : 'You have paid all fees'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">{language === 'KN' ? '??????? ????' : 'Payment Pending'}</p>
                          <p className="text-sm text-amber-700">{language === 'KN' ? `?${feePaymentData.balanceFee.toLocaleString('en-IN')} ???????????` : `?${feePaymentData.balanceFee.toLocaleString('en-IN')} is pending`}</p>
                        </div>
                      </div>
                      <button
                        onClick={handlePaymentClick}
                        className="w-full px-6 py-3 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        {language === 'KN' ? '?? ?? ????' : 'Pay Now'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Receipt History */}
                {lastReceipt && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-4">{language === 'KN' ? '????? ????' : 'Last Receipt'}</h4>
                    <div className="p-4 bg-linear-to-br from-brand-teal/10 to-brand-blue/10 border border-brand-teal/20 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-800">{language === 'KN' ? '???? ???' : 'Receipt ID'}:</p>
                        <p className="font-mono font-semibold text-gray-900">{lastReceipt.id}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-800">{language === 'KN' ? '??????? ??????' : 'Payment Date'}:</p>
                        <p className="font-semibold text-gray-900">{lastReceipt.date} {lastReceipt.time}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-800">{language === 'KN' ? 'Amount Paid' : 'Amount Paid'}:</p>
                        <p className="font-semibold text-green-700">₹{lastReceipt.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={handleDownloadReceipt}
                        className="w-full mt-4 px-4 py-2 bg-white border border-brand-teal text-brand-teal rounded-lg font-medium hover:bg-brand-light transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {language === 'KN' ? '???? ????????? ????' : 'Download Receipt'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                  <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-brand-teal to-brand-teal/80 text-white flex items-center justify-between">
                    <h3 className="text-xl font-bold">{language === 'KN' ? '??????? ???????' : 'Confirm Payment'}</h3>
                    <button
                      onClick={() => setShowQRScanner(!showQRScanner)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      title={language === 'KN' ? 'QR ?????????' : 'QR Scanner'}
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* QR Scanner Section */}
                    {showQRScanner && (
                      <div className="p-4 bg-linear-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-900">{language === 'KN' ? 'QR ???? ???????? ????' : 'Scan QR Code'}</h4>
                        </div>
                        <p className="text-xs text-purple-700">{language === 'KN' ? 'UPI ID ???? ??????? ???? ???????? ????????' : 'Scan UPI/Payment QR with your camera'}</p>
                        <input
                          type="text"
                          placeholder={language === 'KN' ? 'QR ???? ???? UPI ID' : 'Paste QR data or UPI ID'}
                          value={qrInputValue}
                          onChange={(e) => setQrInputValue(e.target.value)}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <div className="p-3 bg-purple-100 rounded border border-purple-300 text-xs text-purple-800">
                          {language === 'KN' ? '? QR ???? ???? ?????? ?????? ????????? ???????? ?????????????' : '? QR Scanner ready for UPI/Payment codes'}</div>
                        <button
                          onClick={() => setShowQRScanner(false)}
                          className="w-full px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          {language === 'KN' ? '???????? ??????' : 'Close Scanner'}
                        </button>
                      </div>
                    )}

                    {/* Payment Amount Section */}
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-800">{language === 'KN' ? '?? ???????? ?????' : 'Amount to Pay'}:</span>
                        <span className="font-bold text-lg text-gray-900">₹{feePaymentData.balanceFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-800">{language === 'KN' ? '??????? ?????' : 'Payment Method'}:</span>
                        <span className="font-semibold text-gray-900">Razorpay</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-800">{language === 'KN' ? '???????' : 'Methods'}:</span>
                        <span className="font-semibold text-gray-900">Cards, UPI, Wallets</span>
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">{language === 'KN' ? '???????? ??????? ????? - ????? ???????? ??????' : 'Secured by Razorpay - Your details are protected'}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setShowPaymentModal(false);
                          setShowQRScanner(false);
                          setQrInputValue('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        disabled={paymentProcessing}
                      >
                        {language === 'KN' ? '?????' : 'Cancel'}
                      </button>
                      <button
                        onClick={handleRazorpayPayment}
                        className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg font-medium hover:bg-brand-teal/90 transition-colors disabled:opacity-80 flex items-center justify-center gap-2"
                        disabled={paymentProcessing}
                      >
                        <CreditCard className="w-4 h-4" />
                        {paymentProcessing ? (language === 'KN' ? '?????????...' : 'Processing...') : (language === 'KN' ? '?? ????' : 'Pay')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && lastReceipt && (
              <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
                  <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-green-600 to-green-500 text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      {language === 'KN' ? '??????? ??????' : 'Payment Successful'}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="text-center pb-3 border-b border-gray-200">
                        <p className="text-sm text-gray-800">{language === 'KN' ? '??????? ??????' : 'Payment Amount'}</p>
                        <p className="text-3xl font-bold text-green-600">₹{lastReceipt.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">{language === 'KN' ? '???? ???' : 'Receipt ID'}:</span>
                          <span className="font-mono font-semibold">{lastReceipt.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">{language === 'KN' ? '??????' : 'Date'}:</span>
                          <span className="font-semibold">{lastReceipt.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800">{language === 'KN' ? '???' : 'Time'}:</span>
                          <span className="font-semibold">{lastReceipt.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 px-4 py-2 border border-brand-teal text-brand-teal rounded-lg font-medium hover:bg-brand-light transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {language === 'KN' ? '?????????' : 'Download'}
                      </button>
                      <button
                        onClick={() => setShowReceiptModal(false)}
                        className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg font-medium hover:bg-brand-teal/90 transition-colors"
                      >
                        {language === 'KN' ? '??????' : 'Close'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Attendance Section */}
            {activeTab === 'attendance' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-brand-teal" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'KN' ? '??????? ?????' : 'Academic Attendance'}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendance.map((att, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-2">{att.subject}</p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-800">{att.attended}/{att.total} classes</p>
                        <span className={`text-lg font-bold ${att.percentage >= 85 ? 'text-green-600' : att.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>{att.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${att.percentage >= 85 ? 'bg-green-500' : att.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${att.percentage}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Class Timetable Section */}
            {activeTab === 'classtime' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center gap-3">
                <Grid3x3 className="w-6 h-6 text-brand-teal" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'KN' ? '???? ??? ??????' : 'Class Timetable'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '???' : 'Day'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '???' : 'Time'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '????' : 'Subject'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '????' : 'Room'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classTimeTable.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.day}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{item.time}</td>
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">{item.subject}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{item.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Exam Timetable Section */}
            {activeTab === 'examtime' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center gap-3">
                <Clock className="w-6 h-6 text-brand-teal" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'KN' ? '??????? ??? ??????' : 'Exam Timetable'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '????' : 'Subject'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '??????' : 'Date'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '???' : 'Time'}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '????' : 'Hall'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {examTimeTable.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.subject}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{item.time}</td>
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">{item.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Results Section */}
            {activeTab === 'results' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center gap-3">
                <Award className="w-6 h-6 text-brand-teal" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'KN' ? '??????????' : 'Results'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{language === 'KN' ? '????' : 'Subject'}</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">{language === 'KN' ? '??????' : 'Internals'}</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">{language === 'KN' ? '????????' : 'Theory'}</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">{language === 'KN' ? '?????' : 'Total'}</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">{language === 'KN' ? '??????' : 'Grade'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900 font-medium">{result.subject}</td>
                        <td className="px-6 py-3 text-sm text-center text-gray-900">{result.internals}</td>
                        <td className="px-6 py-3 text-sm text-center text-gray-900">{result.theory}</td>
                        <td className="px-6 py-3 text-sm text-center font-bold text-brand-teal">{result.total}</td>
                        <td className="px-6 py-3 text-sm text-center"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">{result.grade}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Teacher Feedback Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-brand-teal" />
                <h3 className="text-lg font-bold text-gray-800">
                  {language === 'KN' ? '??????? ??????????? ??????' : 'Teacher Feedback Form'}
                </h3>
              </div>
              <div className="p-6">
                {!showFeedbackModal ? (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full px-6 py-3 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {language === 'KN' ? '??????????? ????' : 'Submit Feedback'}
                  </button>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'KN' ? '???????? ?????' : 'Teacher Name'}
                      </label>
                      <input
                        type="text"
                        value={feedbackForm.teacher}
                        onChange={(e) => setFeedbackForm({...feedbackForm, teacher: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        placeholder={language === 'KN' ? '???????? ????? ???????' : 'Enter teacher name'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'KN' ? '????' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        value={feedbackForm.subject}
                        onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        placeholder={language === 'KN' ? '???? ?????' : 'Enter subject'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'KN' ? '???????' : 'Rating'} (1-5)
                      </label>
                      <select
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm({...feedbackForm, rating: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      >
                        <option value={5}>5 - {language === 'KN' ? '?????????' : 'Excellent'}</option>
                        <option value={4}>4 - {language === 'KN' ? '??? ????????' : 'Very Good'}</option>
                        <option value={3}>3 - {language === 'KN' ? '????????' : 'Good'}</option>
                        <option value={2}>2 - {language === 'KN' ? '????????' : 'Satisfactory'}</option>
                        <option value={1}>1 - {language === 'KN' ? '??????? ?????' : 'Needs Improvement'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'KN' ? '???????????' : 'Feedback'}
                      </label>
                      <textarea
                        value={feedbackForm.feedback}
                        onChange={(e) => setFeedbackForm({...feedbackForm, feedback: e.target.value})}
                        required
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        placeholder={language === 'KN' ? '????? ??????????? ????' : 'Enter your feedback'}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        {language === 'KN' ? '???????' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFeedbackModal(false)}
                        className="flex-1 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                      >
                        {language === 'KN' ? '????? ????' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg">
              {language === 'KN' ? '?????? ???? ??????????' : 'Unable to load student information'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;


