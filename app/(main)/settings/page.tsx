'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Building2, Info } from 'lucide-react';
import UOMManagement from '@/features/metadata/components/uom-management';
import CurrencyManagement from '@/features/metadata/components/currency-management';
import CompanyManagement from '@/features/companies/components/company-management';

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="metadata" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metadata" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Metadata</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Companies</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Metadata Management
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Manage Units of Measurement (UOMs) and Currencies for your ERP system
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="uom" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="uom">Units of Measurement</TabsTrigger>
                    <TabsTrigger value="currencies">Currencies</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="uom">
                    <UOMManagement />
                  </TabsContent>
                  
                  <TabsContent value="currencies">
                    <CurrencyManagement />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          <CompanyManagement />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Application Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Version:</span> 1.0.0</p>
                    <p><span className="font-medium">Environment:</span> Development</p>
                    <p><span className="font-medium">Database:</span> MongoDB</p>
                    <p><span className="font-medium">API Service:</span> Mock Service</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Features</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✅ Customer Management</p>
                    <p>✅ Enquiry Management</p>
                    <p>✅ Quotation Management</p>
                    <p>✅ Purchase Order Management</p>
                    <p>✅ Company Management</p>
                    <p>✅ Supplier DC Management</p>
                    <p>✅ Metadata Management</p>
                    <p>✅ User Management</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This section will contain data import/export, backup, and other system utilities.
                </p>
                <div className="text-sm text-gray-500">
                  <p>• Data Export (Coming Soon)</p>
                  <p>• Data Import (Coming Soon)</p>
                  <p>• System Backup (Coming Soon)</p>
                  <p>• Audit Logs (Coming Soon)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
