import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText, Eye } from 'lucide-react';
import { useBomVersionHistory } from '../api/use-bom-version-history';
import { useBomVersions } from '../api/use-bom-versions';
import { BomVersionHistoryEntry } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface BomVersionHistoryProps {
  bomId: string;
}

const BomVersionHistory: React.FC<BomVersionHistoryProps> = ({ bomId }) => {
  const router = useRouter();
  
  const { 
    data: historyData, 
    isLoading: isLoadingHistory, 
    error: historyError 
  } = useBomVersionHistory({ id: bomId });

  const { 
    data: versionsData, 
    isLoading: isLoadingVersions, 
    error: versionsError 
  } = useBomVersions({ id: bomId });

  const handleViewVersion = (versionBomId: string) => {
    router.push(`/boms/${versionBomId}`);
  };

  if (isLoadingHistory || isLoadingVersions) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (historyError || versionsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            Error loading version history: {historyError?.message || versionsError?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!historyData || !versionsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No version history available</p>
        </CardContent>
      </Card>
    );
  }

  const { versionHistory, currentVersion, isLatestVersion } = historyData;
  const { versions } = versionsData;

  // Create a map of version numbers to BOM IDs for easy lookup
  const versionToBomIdMap = new Map();
  versions.forEach(version => {
    versionToBomIdMap.set(version.version, version.id);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            Track changes and versions of this BOM over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versionHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No version history available</p>
            ) : (
              versionHistory
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry: BomVersionHistoryEntry, index: number) => (
                  <div
                    key={`${entry.versionNumber}-${entry.bomId}`}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          Version {entry.versionNumber}
                        </Badge>
                        {entry.versionNumber === currentVersion && isLatestVersion && (
                          <Badge variant="outline">Current</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {entry.changeDescription || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const bomId = versionToBomIdMap.get(entry.versionNumber) || entry.bomId;
                          handleViewVersion(bomId);
                        }}
                        className="h-8"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Versions</CardTitle>
          <CardDescription>
            View all versions of this BOM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {versions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No versions available</p>
            ) : (
              versions
                .sort((a, b) => {
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                })
                .map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={version.isLatestVersion ? "default" : "secondary"}>
                        v{version.version}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{version.bomName}</p>
                        <p className="text-xs text-gray-500">
                          Created {version.createdAt ? new Date(version.createdAt).toLocaleDateString() : 'Unknown date'} by {version.createdBy || 'Unknown user'}
                        </p>
                      </div>
                      {version.isLatestVersion && (
                        <Badge variant="outline" className="ml-2">Latest</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => version.id && handleViewVersion(version.id)}
                      disabled={!version.id}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BomVersionHistory;
