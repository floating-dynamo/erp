'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Edit, Save, X } from 'lucide-react';
import { useUOMs, useUpsertUOM } from '@/features/metadata/api/use-metadata';
import { UOM } from '@/features/metadata/schemas';

interface UOMFormData {
  id?: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

const UOMManagement = () => {
  const { uoms, isLoading, error } = useUOMs();
  const upsertUOMMutation = useUpsertUOM();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUOM, setEditingUOM] = React.useState<UOM | null>(null);
  const [formData, setFormData] = React.useState<UOMFormData>({
    code: '',
    name: '',
    description: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      isActive: true,
    });
    setEditingUOM(null);
  };

  const handleEdit = (uom: UOM) => {
    setEditingUOM(uom);
    setFormData({
      id: uom.id,
      code: uom.code,
      name: uom.name,
      description: uom.description || '',
      isActive: uom.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await upsertUOMMutation.mutateAsync(formData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving UOM:', error);
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
          <CardTitle>Units of Measurement</CardTitle>
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
          <CardTitle>Units of Measurement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 p-8">
            Error loading UOMs. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Units of Measurement</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add UOM
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUOM ? 'Edit UOM' : 'Add New UOM'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., KG, PCS"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kilogram, Pieces"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
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
                  disabled={upsertUOMMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {upsertUOMMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uoms.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No UOMs configured. Add your first Unit of Measurement.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uoms.map((uom) => (
                <div
                  key={uom.id || uom.code}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{uom.name}</h4>
                      <p className="text-sm text-gray-600 font-mono">{uom.code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={uom.isActive ? 'default' : 'secondary'}>
                        {uom.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(uom)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {uom.description && (
                    <p className="text-sm text-gray-600">{uom.description}</p>
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

export default UOMManagement;