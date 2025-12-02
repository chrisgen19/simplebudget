'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'food', label: 'Food', icon: '🍔', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: 'bills', label: 'Bills', icon: '📄', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'shopping', label: 'Shopping', icon: '🛒', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'health', label: 'Health', icon: '💊', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: 'entertainment', label: 'Fun', icon: '🎮', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'debt', label: 'Debt', icon: '💳', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  { id: 'other', label: 'Other', icon: '📦', color: 'bg-gray-100 border-gray-300 text-gray-700' },
];

export default function RecordsPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Array<{
    id: number;
    amount: number;
    category: string;
    payment: string;
    note: string;
    date: string;
  }>>([]);
  const [user, setUser] = useState<{ id: number; firstName: string; lastName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchExpenses(userData.id);
  }, [router]);

  const fetchExpenses = async (userId: number) => {
    try {
      const response = await fetch('/api/expenses', {
        headers: {
          'x-user-id': userId.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedExpenses = data.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date).toISOString().split('T')[0],
        }));
        setExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (id: string) => categories.find(c => c.id === id);

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());
  const todayExpenses = expenses.filter(e => e.date === today);
  const previousExpenses = expenses.filter(e => e.date !== today);

  // Group expenses by date
  const groupedExpenses = previousExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, typeof expenses>);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  // Format date for display
  const formatDate = (dateStr: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (dateStr === yesterdayStr) {
      return 'Yesterday';
    }

    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <span className="text-xl">←</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800">All Records</h1>
          <div className="w-16"></div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Spending</p>
          <p className="text-3xl font-bold text-slate-800">₱{totalAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{expenses.length} transactions</p>
        </div>
      </div>

      {/* All Expenses */}
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4 pb-6">
          {/* Today's Expenses */}
          {todayExpenses.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-800">Today</span>
                <span className="text-lg font-bold text-slate-800">
                  ₱{todayExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {todayExpenses.map((expense) => {
                  const cat = getCategoryInfo(expense.category);
                  return (
                    <div key={expense.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <span className="text-xl">{cat?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700">{cat?.label}</p>
                        {expense.note && <p className="text-xs text-slate-400 truncate">{expense.note}</p>}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">₱{expense.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Previous Days */}
          {sortedDates.map((dateStr) => {
            const dateExpenses = groupedExpenses[dateStr];
            const dateTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={dateStr} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-500">{formatDate(dateStr)}</span>
                  <span className="text-base font-semibold text-slate-700">₱{dateTotal.toLocaleString()}</span>
                </div>

                <div className="space-y-2">
                  {dateExpenses.map((expense) => {
                    const cat = getCategoryInfo(expense.category);
                    return (
                      <div key={expense.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                        <span className="text-xl">{cat?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700">{cat?.label}</p>
                          {expense.note && <p className="text-xs text-slate-400 truncate">{expense.note}</p>}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">₱{expense.amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
