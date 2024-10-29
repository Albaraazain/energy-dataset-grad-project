import React, { useState } from 'react';
import { Menu, X, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationMenu from './NotificationMenu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MobileNavigation = ({ 
  onAddCategory 
}: { 
  onAddCategory: () => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-gray-900 text-white border-r border-gray-800">
              <SheetHeader>
                <SheetTitle className="text-white">Energy Dataset Portal</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-4">
                <Button 
                  onClick={() => {
                    onAddCategory();
                    setIsOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
                {/* Add more navigation items here */}
              </div>
            </SheetContent>
          </Sheet>

          {/* Center Logo/Title */}
          <h1 className="text-lg font-semibold text-white">Energy Dataset</h1>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <NotificationMenu />
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16" />
    </div>
  );
};

export default MobileNavigation;