// LinkDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/types";
import { StickyNote } from "lucide-react";

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Link) => void;
  link?: Link;
  mode: "add" | "edit";
  categoryId?: string;
}

const LinkDialog: React.FC<LinkDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  link,
  mode,
  categoryId,
}) => {
  const [formData, setFormData] = useState<Link>(
    link || {
      id: "", // Add this line
      title: "",
      url: "",
      type: "dataset",
      notes: {
        content: "",
        lastUpdated: new Date().toISOString(),
      },
    }
  );

  useEffect(() => {
    if (link && mode === "edit") {
      setFormData(link);
    } else if (!link && mode === "add") {
      setFormData({
        id: "", // Add this line
        title: "",
        url: "",
        type: "dataset",
        notes: {
          content: "",
          lastUpdated: new Date().toISOString(),
        },
      });
    }
  }, [link, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Include the categoryId in the link data if it exists
    const linkData = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Generate ID if not exists
      notes: {
        ...formData.notes,
        lastUpdated: new Date().toISOString(),
      },
    };
    onSave(linkData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Link" : "Edit Link"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new resource link to this category" 
              : "Edit the existing resource link"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-200">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Link Title"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">URL</label>
            <Input
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="Link URL"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as Link["type"],
                })
              }
              className="w-full h-10 rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm"
            >
              <option value="dataset">Dataset</option>
              <option value="tool">Tool</option>
              <option value="database">Database</option>
              <option value="article">Article</option>
              <option value="specification">Specification</option>
              <option value="ieee">IEEE</option>
              <option value="arxiv">ArXiv</option>
              <option value="mdpi">MDPI</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              <label className="text-sm font-medium text-gray-200">Notes</label>
            </div>
            <textarea
              value={formData.notes?.content || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notes: {
                    content: e.target.value,
                    lastUpdated: new Date().toISOString(),
                  },
                })
              }
              placeholder="Add notes about this resource..."
              className="w-full min-h-[120px] rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {mode === "add" ? "Add Link" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDialog;