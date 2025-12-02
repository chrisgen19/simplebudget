'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SwipeableExpenseProps {
  expense: {
    id: number;
    amount: number;
    category: string;
    payment: string;
    note: string;
    date: string;
  };
  categoryIcon?: string;
  categoryLabel?: string;
  onEdit: (expense: any) => void;
  onDelete: (id: number) => void;
}

export default function SwipeableExpense({
  expense,
  categoryIcon,
  categoryLabel,
  onEdit,
  onDelete,
}: SwipeableExpenseProps) {
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50; // Minimum distance to consider it a swipe
  const editThreshold = 80;
  const deleteThreshold = 150;

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.targetTouches[0].clientX);
    setEndX(e.targetTouches[0].clientX);
    setIsSwiping(true);
    setHasMoved(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setEndX(e.targetTouches[0].clientX);
    const distance = startX - e.targetTouches[0].clientX;

    // Mark as moved if distance is significant
    if (Math.abs(distance) > 10) {
      setHasMoved(true);
    }

    // Only allow left swipe (positive distance)
    if (distance > 0) {
      setSwipeOffset(Math.min(distance, deleteThreshold + 50));
    }
  };

  const handleTouchEnd = () => {
    finishSwipe();
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setEndX(e.clientX);
    setIsDragging(true);
    setIsSwiping(true);
    setHasMoved(false);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setEndX(e.clientX);
    const distance = startX - e.clientX;

    // Mark as moved if distance is significant
    if (Math.abs(distance) > 10) {
      setHasMoved(true);
    }

    // Only allow left swipe (positive distance)
    if (distance > 0) {
      setSwipeOffset(Math.min(distance, deleteThreshold + 50));
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    finishSwipe();
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    finishSwipe();
  };

  const finishSwipe = () => {
    const distance = startX - endX;

    // Only process swipe actions if user actually moved
    // This prevents accidental taps from triggering actions
    if (!hasMoved || distance < minSwipeDistance) {
      // No significant movement - just reset
      setSwipeOffset(0);
      setIsSwiping(false);
      setHasMoved(false);
      return;
    }

    if (distance > deleteThreshold) {
      // Full swipe - delete
      setSwipeOffset(deleteThreshold + 50);
      setTimeout(() => {
        onDelete(expense.id);
      }, 200);
    } else if (distance > editThreshold) {
      // Partial swipe - edit
      setSwipeOffset(editThreshold);
      setTimeout(() => {
        onEdit(expense);
        setSwipeOffset(0);
      }, 100);
    } else {
      // Not enough swipe - reset
      setSwipeOffset(0);
    }

    setIsSwiping(false);
    setHasMoved(false);
  };

  const handleReset = () => {
    setSwipeOffset(0);
  };

  // Get payment method icon and color
  const getPaymentInfo = (payment: string) => {
    switch (payment.toLowerCase()) {
      case 'cash':
        return { icon: '💵', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'gcash':
        return { icon: '📱', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'card':
        return { icon: '💳', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      default:
        return { icon: '💰', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const paymentInfo = getPaymentInfo(expense.payment);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-end">
        {swipeOffset > editThreshold && swipeOffset < deleteThreshold && (
          <div className="bg-blue-500 h-full flex items-center px-6">
            <span className="text-white font-medium text-sm">✏️ Edit</span>
          </div>
        )}
        {swipeOffset >= deleteThreshold && (
          <div className="bg-red-500 h-full flex items-center px-6">
            <span className="text-white font-medium text-sm">🗑️ Delete</span>
          </div>
        )}
      </div>

      {/* Swipeable content */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={swipeOffset > 0 ? handleReset : undefined}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
          userSelect: 'none',
        }}
        className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-grab active:cursor-grabbing"
      >
        <span className="text-xl">{categoryIcon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700">{categoryLabel}</p>
          {expense.note && <p className="text-xs text-slate-400 truncate">{expense.note}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${paymentInfo.color}`}>
            {paymentInfo.icon}
          </span>
          <span className="text-sm font-semibold text-slate-800">
            ₱{expense.amount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
