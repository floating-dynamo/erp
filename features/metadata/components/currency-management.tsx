'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Edit, Save, X, DollarSign } from 'lucide-react';
import { useCurrencies, useUpsertCurrency } from '@/features/metadata/api/use-metadata';
import { Currency } from '@/features/metadata/schemas';

interface CurrencyFormData {
  id?: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
  isActive: boolean;
}

const CurrencyManagement = () => {
  const { currencies, isLoading, error } = useCurrencies();
  const upsertCurrencyMutation = useUpsertCurrency();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCurrency, setEditingCurrency] = React.useState<Currency | null>(null);
  const [formData, setFormData] = React.useState<CurrencyFormData>({
    code: '',
    name: '',
    symbol: '',
    exchangeRate: undefined,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      exchangeRate: undefined,
      isActive: true,
    });
    setEditingCurrency(null);
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({
      id: currency.id,
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate,
      isActive: currency.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await upsertCurrencyMutation.mutateAsync(formData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 p-8">
            Error loading currencies. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Currencies</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., USD, INR"
                    required
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g., $, ₹"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., US Dollar, Indian Rupee"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">Exchange Rate (Optional)</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.0001"
                  value={formData.exchangeRate || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    exchangeRate: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="Exchange rate to base currency"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={upsertCurrencyMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {upsertCurrencyMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currencies.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No currencies configured. Add your first currency.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currencies.map((currency) => (
                <div
                  key={currency.id || currency.code}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">
                          {currency.symbol}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{currency.name}</h4>
                        <p className="text-sm text-gray-600 font-mono">{currency.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={currency.isActive ? 'default' : 'secondary'}>
                        {currency.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(currency)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {currency.exchangeRate && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      <span>Rate: {currency.exchangeRate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyManagement;