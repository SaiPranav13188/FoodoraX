'use client';

import React, { useState, useEffect } from 'react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const STEPS = [
  { id: 1, title: 'Order Placed', desc: 'We have received your order.', icon: '📝' },
  { id: 2, title: 'Preparing Food', desc: 'The kitchen is cooking your meal.', icon: '👨‍🍳' },
  { id: 3, title: 'Out for Delivery', desc: 'Driver is on the way with your food.', icon: '🛵' },
  { id: 4, title: 'Delivered', desc: 'Enjoy your meal!', icon: '🎉' },
];

export function OrderTrackerModal({ isOpen, onClose, orderId }: OrderTrackerModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(10);

  // Simulate order progress automatically
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setProgress(10);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) {
          const nextStep = prev + 1;
          setProgress(nextStep * 25);
          return nextStep;
        }
        clearInterval(timer);
        return prev;
      });
    }, 4000); // Progress every 4 seconds for demo purposes

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#1E1E24',
        border: '1px solid #2E2E38',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        color: '#FFFFFF'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Live Order Tracking</h3>
            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '4px 0 0 0' }}>Order #{orderId}</p>
          </div>
          <button 
            onClick={onClose}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', backgroundColor: '#0D0D11', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#FF5A36',
            transition: 'width 0.5s ease-in-out',
            boxShadow: '0 0 10px rgba(255, 90, 54, 0.5)'
          }} />
        </div>

        {/* Status Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent ? '#FF5A36' : isDone ? '#10B981' : '#0D0D11',
                  border: `2px solid ${isCurrent || isDone ? 'transparent' : '#2E2E38'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: isCurrent ? '0 0 12px rgba(255, 90, 54, 0.4)' : 'none'
                }}>
                  {isDone ? '✓' : step.icon}
                </div>
                <div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '15px', 
                    fontWeight: 'bold',
                    color: isCurrent ? '#FF5A36' : isDone ? '#10B981' : '#6B7280' 
                  }}>
                    {step.title}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: currentStep === 4 ? '#10B981' : '#FF5A36',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {currentStep === 4 ? 'Done' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
}