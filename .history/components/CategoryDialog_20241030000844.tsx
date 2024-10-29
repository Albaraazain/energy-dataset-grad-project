import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";
import { Label } from "@/components/ui/label";

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
      <DialogContent className="bg-gray-900 text-white sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {mode === "add" ? "Add New Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === "add" 
              ? "Create a new category to organize your datasets" 
              : "Update the category details"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-200">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter category title"
              className="bg-gray-800 border-gray-700 text-white h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-200">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter category description"
              className="bg-gray-800 border-gray-700 text-white h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-200">Icon</Label>
            <select
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full h-11 rounded-md border border-gray-700 bg-gray-800 text-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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

          <DialogFooter className="sm:justify-between gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800 flex-1 sm:flex-none h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700 flex-1 sm:flex-none h-11"
            >
              {mode === "add" ? "Add Category" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;