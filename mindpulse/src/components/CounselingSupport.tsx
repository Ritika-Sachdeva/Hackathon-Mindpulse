import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, Video, CheckCircle, Star, Shield } from 'lucide-react';

const CounselingSupport: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'30min' | '60min' | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'success'>('select');

  const handleBook = (plan: '30min' | '60min') => {
    setSelectedPlan(plan);
    setBookingStep('confirm');
  };

  const confirmBooking = () => {
    // Simulate API call
    setTimeout(() => {
      setBookingStep('success');
    }, 1000);
  };

  if (bookingStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your {selectedPlan === '30min' ? '30-minute' : '1-hour'} session has been scheduled. 
          You will receive a confirmation email with the video call link shortly.
        </p>
        <button 
          onClick={() => setBookingStep('select')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          Book Another Session
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Professional Counseling Support</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Sometimes talking to AI isn't enough. Connect with our certified mental health professionals for personalized guidance and support.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 30 Min Plan */}
        <div className={`relative bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer hover:shadow-xl ${selectedPlan === '30min' ? 'border-indigo-600 shadow-indigo-100' : 'border-gray-100 hover:border-indigo-200'}`}>
          <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Quick Check-in</h3>
              <p className="text-gray-500 text-sm">30 Minutes Session</p>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Immediate stress relief</span>
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Guided grounding techniques</span>
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <Video className="w-5 h-5 text-gray-400" />
              <span>Video or Audio Call</span>
            </li>
          </ul>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
            <div>
              <span className="text-3xl font-bold text-gray-900">₹500</span>
              <span className="text-gray-400 text-sm">/session</span>
            </div>
            <button 
              onClick={() => handleBook('30min')}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* 1 Hour Plan */}
        <div className={`bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer hover:shadow-xl ${selectedPlan === '60min' ? 'border-purple-600 shadow-purple-100' : 'border-gray-100 hover:border-purple-200'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Deep Therapy</h3>
              <p className="text-gray-500 text-sm">60 Minutes Session</p>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>In-depth emotional analysis</span>
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Long-term coping strategies</span>
            </li>
             <li className="flex items-center gap-3 text-gray-600">
              <Video className="w-5 h-5 text-gray-400" />
              <span>Video or Audio Call</span>
            </li>
          </ul>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
            <div>
              <span className="text-3xl font-bold text-gray-900">₹900</span>
              <span className="text-gray-400 text-sm">/session</span>
            </div>
            <button 
              onClick={() => handleBook('60min')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
           <Shield className="w-8 h-8 text-indigo-500" />
           <div>
              <h4 className="font-bold text-gray-800">100% Confidential</h4>
              <p className="text-xs text-gray-500">Private & encrypted calls</p>
           </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
           <Star className="w-8 h-8 text-yellow-500" />
           <div>
              <h4 className="font-bold text-gray-800">Certified Experts</h4>
              <p className="text-xs text-gray-500">Licensed therapists only</p>
           </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
           <CreditCard className="w-8 h-8 text-green-500" />
           <div>
              <h4 className="font-bold text-gray-800">Secure Payment</h4>
              <p className="text-xs text-gray-500">Refund protection included</p>
           </div>
        </div>
      </div>

      {/* Confirmation Modal Overlay (Simple inline for demo) */}
      {bookingStep === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Session Type</span>
                <span className="font-bold text-gray-900">{selectedPlan === '30min' ? '30 Minutes' : '1 Hour'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price</span>
                <span className="font-bold text-indigo-600">{selectedPlan === '30min' ? '₹500' : '₹900'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setBookingStep('select')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBooking}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex justify-center items-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Pay & Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselingSupport;