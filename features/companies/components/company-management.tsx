'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, Mail, MapPin, Phone } from 'lucide-react';
import { useMyCompanies, useSetActiveCompany } from '@/features/companies/api/use-companies-settings';
import { MyCompany } from '@/lib/types';

const CompanyManagement = () => {
  const { data: companiesData, isLoading, error } = useMyCompanies();
  const setActiveCompanyMutation = useSetActiveCompany();

  const handleSetActive = async (companyId: string) => {
    try {
      await setActiveCompanyMutation.mutateAsync(companyId);
    } catch (error) {
      console.error('Error setting active company:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
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
          <CardTitle>Company Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 p-8">
            Error loading companies. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const companies = companiesData?.companies || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage your companies and set the active company for operations
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No companies found. Please contact your administrator to add companies.
            </div>
          ) : (
            <div className="grid gap-6">
              {companies.map((company: MyCompany) => (
                <div
                  key={company.id}
                  className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                    company.isActive 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold">{company.name}</h3>
                          {company.isActive && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono">
                          GST: {company.gstNumber}
                        </p>
                        {company.pan && (
                          <p className="text-sm text-gray-600 font-mono">
                            PAN: {company.pan}
                          </p>
                        )}
                      </div>
                    </div>
                    {!company.isActive && (
                      <Button
                        onClick={() => handleSetActive(company.id!)}
                        disabled={setActiveCompanyMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {setActiveCompanyMutation.isPending ? 'Setting...' : 'Set Active'}
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {company.city}, {company.state} - {company.pinCode}
                        </span>
                      </div>
                      {company.address && (
                        <div className="flex items-start space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{company.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{company.email}</span>
                      </div>
                      {company.contact && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{company.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyManagement;