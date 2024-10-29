// CategoryDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
  category?: Category;
  mode: "add" | "edit";
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<Category>>(
    category || {
      title: "",
      description: "",
      icon: "Database",
      links: [],
    }
  );

  useEffect(() => {
    if (category && mode === "edit") {
      setFormData(category);
    } else if (!category && mode === "add") {
      setFormData({
        title: "",
        description: "",
        icon: "Database",
        links: [],
      });
    }
  }, [category, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Category" : "Edit Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-200">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Category Title"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Category Description"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">Icon</label>
            <select
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full h-10 rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm"
            >
              <option value="Database">Database</option>
              <option value="Sun">Sun</option>
              <option value="Activity">Activity</option>
              <option value="BarChart2">BarChart</option>
              <option value="Building2">Building</option>
              <option value="Gauge">Gauge</option>
              <option value="Cloud">Cloud</option>
              <option value="Leaf">Leaf</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {mode === "add" ? "Add Category" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
