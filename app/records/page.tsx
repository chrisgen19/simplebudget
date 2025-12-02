'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SwipeableExpense from '@/components/SwipeableExpense';

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

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

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

  const handleEdit = (expense: any) => {
    localStorage.setItem('editExpense', JSON.stringify(expense));
    router.push('/');
  };

  const handleDelete = async (id: number) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id.toString(),
        },
      });

      if (response.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      } else {
        alert('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const toggleMonth = (monthKey: string) => {
    const newCollapsed = new Set(collapsedMonths);
    if (newCollapsed.has(monthKey)) {
      newCollapsed.delete(monthKey);
    } else {
      newCollapsed.add(monthKey);
    }
    setCollapsedMonths(newCollapsed);
  };

  // Filter and group expenses
  const { groupedByMonth, totalAmount, filteredCount } = useMemo(() => {
    // Apply filters
    let filtered = expenses;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.note.toLowerCase().includes(query) ||
        e.amount.toString().includes(query) ||
        getCategoryInfo(e.category)?.label.toLowerCase().includes(query)
      );
    }

    // Group by month and year
    const grouped = filtered.reduce((groups, expense) => {
      const [year, month] = expense.date.split('-');
      const monthKey = `${year}-${month}`;

      if (!groups[monthKey]) {
        groups[monthKey] = {
          expenses: [],
          total: 0,
          year,
          month,
        };
      }

      groups[monthKey].expenses.push(expense);
      groups[monthKey].total += expense.amount;

      return groups;
    }, {} as Record<string, { expenses: typeof filtered; total: number; year: string; month: string }>);

    // Sort by month (most recent first)
    const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const sortedGrouped = sortedKeys.reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {} as typeof grouped);

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);

    return {
      groupedByMonth: sortedGrouped,
      totalAmount: total,
      filteredCount: filtered.length,
    };
  }, [expenses, selectedCategory, searchQuery]);

  const formatMonthYear = (year: string, month: string) => {
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = dateStr === today.toISOString().split('T')[0];
    const isYesterday = dateStr === yesterday.toISOString().split('T')[0];

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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
      <div className="mb-4">
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

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            {selectedCategory !== 'all' || searchQuery ? 'Filtered' : 'Total'} Spending
          </p>
          <p className="text-3xl font-bold text-slate-800">₱{totalAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">
            {filteredCount} transaction{filteredCount !== 1 ? 's' : ''}
            {(selectedCategory !== 'all' || searchQuery) && ` (of ${expenses.length} total)`}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200 border border-slate-200"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses grouped by month */}
      {filteredCount === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">
            {searchQuery || selectedCategory !== 'all'
              ? 'No expenses found matching your filters'
              : 'No expenses recorded yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedByMonth).map(([monthKey, monthData]) => {
            const isCollapsed = collapsedMonths.has(monthKey);

            // Group expenses by date within the month
            const groupedByDate = monthData.expenses.reduce((groups, expense) => {
              if (!groups[expense.date]) {
                groups[expense.date] = [];
              }
              groups[expense.date].push(expense);
              return groups;
            }, {} as Record<string, typeof monthData.expenses>);

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

            return (
              <div key={monthKey} className="bg-white rounded-2xl shadow-sm border border-slate-200">
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-t-2xl transition-colors"
                >
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-slate-800">
                      {formatMonthYear(monthData.year, monthData.month)}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {monthData.expenses.length} transaction{monthData.expenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-800">
                      ₱{monthData.total.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xl">
                      {isCollapsed ? '▼' : '▲'}
                    </span>
                  </div>
                </button>

                {/* Month Content */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 space-y-3">
                    {sortedDates.map((dateStr) => {
                      const dateExpenses = groupedByDate[dateStr];
                      const dateTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

                      return (
                        <div key={dateStr} className="border-t border-slate-100 pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-600">
                              {formatDate(dateStr)}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">
                              ₱{dateTotal.toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {dateExpenses.map((expense) => {
                              const cat = getCategoryInfo(expense.category);
                              return (
                                <SwipeableExpense
                                  key={expense.id}
                                  expense={expense}
                                  categoryIcon={cat?.icon}
                                  categoryLabel={cat?.label}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                />
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
          })}
        </div>
      )}
    </div>
  );
}
