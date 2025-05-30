"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { LogOut, ChevronUp } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

export const ProfilePopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-auto w-full px-3 py-2 gap-3 hover:bg-gray-100 focus:bg-gray-100 transition-colors justify-start"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate w-full text-left">
              {user.name}
            </span>
            <span className="text-xs text-gray-500 truncate w-full text-left">
              {user.email}
            </span>
          </div>
          <ChevronUp 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-white border border-gray-200 shadow-xl rounded-xl" 
        align="center"
        side="top"
        sideOffset={8}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 text-base">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            onClick={() => {
              setIsOpen(false);
              // Add navigation to profile settings here if needed
            }}
          >
            <User className="h-4 w-4 mr-3" />
            <span className="font-medium">Profile Settings</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            onClick={() => {
              setIsOpen(false);
              // Add navigation to account settings here if needed
            }}
          >
            <Settings className="h-4 w-4 mr-3" />
            <span className="font-medium">Account Settings</span>
          </Button>
        </div> */}

        <Separator className="my-1" />
        
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};