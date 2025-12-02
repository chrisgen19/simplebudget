'use client';

import React, { useState, useEffect, useRef } from 'react';
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

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'gcash', label: 'GCash', icon: '📱' },
  { id: 'card', label: 'Card', icon: '💳' },
];

export default function ExpenseTracker() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [payment, setPayment] = useState('cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenses, setExpenses] = useState<Array<{
    id: number;
    amount: number;
    category: string;
    payment: string;
    note: string;
    date: string;
  }>>([]);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<{ id: number; firstName: string; lastName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editingExpense, setEditingExpense] = useState<{
    id: number;
    amount: number;
    category: string;
    payment: string;
    note: string;
    date: string;
  } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchExpenses(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const fetchExpenses = async (userId: number) => {
    try {
      const response = await fetch('/api/expenses', {
        headers: {
          'x-user-id': userId.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Convert date strings to YYYY-MM-DD format for consistency
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSubmit = async () => {
    if (!amount || !category || !user) return;

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString(),
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          payment,
          note,
          date,
        }),
      });

      if (response.ok) {
        const newExpense = await response.json();
        // Format the date for consistency
        const formattedExpense = {
          ...newExpense,
          date: new Date(newExpense.date).toISOString().split('T')[0],
        };
        setExpenses([formattedExpense, ...expenses]);
        setAmount('');
        setCategory('');
        setNote('');
        setPayment('cash');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Failed to save expense. Please try again.');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const getCategoryInfo = (id: string) => categories.find(c => c.id === id);

  const handleEdit = (expense: any) => {
    // Set editing mode with expense data
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setPayment(expense.payment);
    setNote(expense.note || '');
    setDate(expense.date);

    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setAmount('');
    setCategory('');
    setPayment('cash');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleUpdateExpense = async () => {
    if (!amount || !category || !user || !editingExpense) return;

    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString(),
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          payment,
          note,
          date,
        }),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        const formattedExpense = {
          ...updatedExpense,
          date: new Date(updatedExpense.date).toISOString().split('T')[0],
        };

        // Update in state
        setExpenses(expenses.map(e =>
          e.id === editingExpense.id ? formattedExpense : e
        ));

        // Reset form
        handleCancelEdit();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Failed to update expense. Please try again.');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  // Check for expense to edit from records page
  useEffect(() => {
    const editExpenseStr = localStorage.getItem('editExpense');
    if (editExpenseStr) {
      const expense = JSON.parse(editExpenseStr);
      handleEdit(expense);
      // Clear from localStorage
      localStorage.removeItem('editExpense');
    }
  }, [expenses]);

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
        // Remove from state
        setExpenses(expenses.filter(e => e.id !== id));
      } else {
        alert('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());

  const todayExpenses = expenses
    .filter(e => e.date === today)
    .sort((a, b) => b.id - a.id); // Sort by ID descending (most recent first)
  const previousExpenses = expenses.filter(e => e.date !== today);

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group previous expenses by date
  const groupedExpenses = previousExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, typeof expenses>);

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  // Format date for display
  const formatDate = (dateStr: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (dateStr === yesterdayStr) {
      return 'Yesterday';
    }

    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6" ref={formRef}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h1>
            <p className="text-slate-500 text-sm">
              {editingExpense ? 'Update your expense details' : 'Quick and simple tracking'}
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-slate-800 rounded-full hover:bg-slate-700 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10 border border-slate-200">
                <button onClick={() => router.push('/records')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">All records</button>
                <button onClick={() => router.push('/stats')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Statistics</button>
                <button onClick={() => router.push('/settings')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amount Input - Big and Prominent */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-4">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</label>
        <div className="flex items-center mt-2">
          <span className="text-3xl font-bold text-slate-400 mr-2">₱</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="text-4xl font-bold text-slate-800 w-full outline-none bg-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Category Selection - Visual Chips */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block">Category</label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                category === cat.id
                  ? `${cat.color} border-current scale-105`
                  : 'bg-slate-50 border-transparent hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method - Horizontal Pills */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 block">Paid with</label>
        <div className="flex gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPayment(method.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all ${
                payment === method.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{method.icon}</span>
              <span className="text-sm font-medium">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note & Date - Collapsible Details */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this for?"
              className="w-full p-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Save/Update Button */}
      {editingExpense ? (
        <div className="flex gap-3">
          <button
            onClick={handleCancelEdit}
            className="flex-1 py-4 rounded-2xl font-semibold text-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateExpense}
            disabled={!amount || !category}
            className={`flex-1 py-4 rounded-2xl font-semibold text-lg transition-all ${
              amount && category
                ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saved ? '✓ Updated!' : 'Update Expense'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!amount || !category}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            amount && category
              ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-98'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Expense'}
        </button>
      )}

      {/* Spending History */}
      {expenses.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Today's Expenses */}
          {todayExpenses.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-800">Today</span>
                <span className="text-lg font-bold text-slate-800">₱{todayTotal.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                {todayExpenses.map((expense) => {
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
          )}

          {/* Previous Days Expenses - Limited to 4 days (+ today = 5 days total) */}
          {sortedDates.slice(0, 4).map((dateStr) => {
            const dateExpenses = groupedExpenses[dateStr].sort((a, b) => b.id - a.id); // Sort by ID descending
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

          {/* View All Records Button */}
          {sortedDates.length > 4 && (
            <button
              onClick={() => router.push('/records')}
              className="w-full py-3 bg-white rounded-2xl font-medium text-sm text-slate-600 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
            >
              View All Records ({expenses.length} total)
            </button>
          )}
        </div>
      )}

      {/* Tip */}
      <p className="text-center text-xs text-slate-400 mt-4">
        Tip: Just amount + category is enough. Keep it simple! 💪
      </p>
    </div>
  );
}