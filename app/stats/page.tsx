'use client';

import React, { useEffect, useState, useMemo } from 'react';
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

export default function StatsPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Array<{
    id: number;
    amount: number;
    category: string;
    payment: string;
    note: string;
    date: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
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

  // Filter expenses based on time period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (timeFilter === 'all') return expenses;

    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));

      if (timeFilter === 'week') return daysDiff <= 7;
      if (timeFilter === 'month') return daysDiff <= 30;
      if (timeFilter === 'year') return daysDiff <= 365;
      return true;
    });
  }, [expenses, timeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    // Category breakdown
    const byCategory = filteredExpenses.reduce((acc, e) => {
      if (!acc[e.category]) {
        acc[e.category] = { total: 0, count: 0 };
      }
      acc[e.category].total += e.amount;
      acc[e.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Payment method breakdown
    const byPayment = filteredExpenses.reduce((acc, e) => {
      if (!acc[e.payment]) {
        acc[e.payment] = { total: 0, count: 0 };
      }
      acc[e.payment].total += e.amount;
      acc[e.payment].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Daily average
    const dates = [...new Set(filteredExpenses.map(e => e.date))];
    const dailyAverage = dates.length > 0 ? total / dates.length : 0;

    // Highest and lowest expenses
    const sortedByAmount = [...filteredExpenses].sort((a, b) => b.amount - a.amount);
    const highest = sortedByAmount[0];
    const lowest = sortedByAmount[sortedByAmount.length - 1];

    // Monthly trend (for year view)
    const monthlyTrend = filteredExpenses.reduce((acc, e) => {
      const [year, month] = e.date.split('-');
      const key = `${year}-${month}`;
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }
      acc[key].total += e.amount;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      total,
      count,
      average,
      byCategory,
      byPayment,
      dailyAverage,
      daysWithExpenses: dates.length,
      highest,
      lowest,
      monthlyTrend,
    };
  }, [filteredExpenses]);

  const getTimeFilterLabel = () => {
    if (timeFilter === 'week') return 'This Week';
    if (timeFilter === 'month') return 'This Month';
    if (timeFilter === 'year') return 'This Year';
    return 'All Time';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto pb-20">
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
          <h1 className="text-xl font-bold text-slate-800">Statistics</h1>
          <div className="w-16"></div>
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['week', 'month', 'year', 'all'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter as any)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                timeFilter === filter
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {filter === 'week' ? 'Week' : filter === 'month' ? 'Month' : filter === 'year' ? 'Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          {getTimeFilterLabel()}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-slate-800">₱{stats.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-slate-800">{stats.count}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Avg per Transaction</p>
            <p className="text-lg font-semibold text-slate-700">₱{Math.round(stats.average).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Avg per Day</p>
            <p className="text-lg font-semibold text-slate-700">₱{Math.round(stats.dailyAverage).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">By Category</h2>
        <div className="space-y-3">
          {Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([categoryId, data]) => {
              const cat = getCategoryInfo(categoryId);
              const percentage = stats.total > 0 ? (data.total / stats.total) * 100 : 0;
              return (
                <div key={categoryId}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{cat?.label}</span>
                      <span className="text-xs text-slate-400">({data.count})</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      ₱{data.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-slate-800 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-right">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">By Payment Method</h2>
        <div className="space-y-3">
          {Object.entries(stats.byPayment)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([method, data]) => {
              const percentage = stats.total > 0 ? (data.total / stats.total) * 100 : 0;
              const icon = method === 'cash' ? '💵' : method === 'gcash' ? '📱' : '💳';
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm font-medium text-slate-700 capitalize">{method}</span>
                      <span className="text-xs text-slate-400">({data.count})</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      ₱{data.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-right">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Highest and Lowest Expenses */}
      {stats.highest && stats.lowest && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Expense Range</h2>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-medium mb-1">Highest Expense</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryInfo(stats.highest.category)?.icon}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {getCategoryInfo(stats.highest.category)?.label}
                    </span>
                  </div>
                  {stats.highest.note && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{stats.highest.note}</p>
                  )}
                </div>
                <span className="text-lg font-bold text-red-700">
                  ₱{stats.highest.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium mb-1">Lowest Expense</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryInfo(stats.lowest.category)?.icon}</span>
                    <span className="text-sm font-medium text-slate-700">
                      {getCategoryInfo(stats.lowest.category)?.label}
                    </span>
                  </div>
                  {stats.lowest.note && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{stats.lowest.note}</p>
                  )}
                </div>
                <span className="text-lg font-bold text-green-700">
                  ₱{stats.lowest.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend (for year/all time) */}
      {(timeFilter === 'year' || timeFilter === 'all') && Object.keys(stats.monthlyTrend).length > 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Monthly Trend</h2>
          <div className="space-y-2">
            {Object.entries(stats.monthlyTrend)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 12)
              .map(([monthKey, data]) => {
                const [year, month] = monthKey.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                const maxMonthTotal = Math.max(...Object.values(stats.monthlyTrend).map(m => m.total));
                const barWidth = maxMonthTotal > 0 ? (data.total / maxMonthTotal) * 100 : 0;

                return (
                  <div key={monthKey}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{monthName}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        ₱{data.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Spending Habits */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Insights</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Active Days</p>
              <p className="text-xs text-slate-500">
                You spent money on {stats.daysWithExpenses} different days
              </p>
            </div>
          </div>

          {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Top Category</p>
                <p className="text-xs text-slate-500">
                  Most spending in{' '}
                  {getCategoryInfo(
                    Object.entries(stats.byCategory).sort(([, a], [, b]) => b.total - a.total)[0][0]
                  )?.label}
                </p>
              </div>
            </div>
          )}

          {stats.count > 0 && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Transaction Size</p>
                <p className="text-xs text-slate-500">
                  Your average transaction is ₱{Math.round(stats.average).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No data message */}
      {stats.count === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No expenses found for this period</p>
        </div>
      )}
    </div>
  );
}
