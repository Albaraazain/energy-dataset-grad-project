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
import { Label } from "@/components/ui/label";
import { Link } from "@/types";
import { StickyNote } from "lucide-react";
import NotesDialog from "./NotesDialog";

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
      id: "",
      title: "",
      url: "",
      type: "dataset",
      notes: {
        content: "",
        lastUpdated: new Date().toISOString(),
      },
    }
  );

  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  useEffect(() => {
    if (link && mode === "edit") {
      setFormData(link);
    } else if (!link && mode === "add") {
      setFormData({
        id: "",
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
    const linkData = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
    onSave(linkData);
    onClose();
  };

  const handleNotesUpdate = (updatedNotes: { content: string; lastUpdated: string }) => {
    setFormData(prev => ({
      ...prev,
      notes: updatedNotes
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 text-white sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">
              {mode === "add" ? "Add New Link" : "Edit Link"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {mode === "add" 
                ? "Add a new resource link to this category" 
                : "Edit the existing resource link"
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
                placeholder="Enter link title"
                className="bg-gray-800 border-gray-700 text-white h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-200">URL</Label>
              <Input
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="Enter link URL"
                className="bg-gray-800 border-gray-700 text-white h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-200">Type</Label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Link["type"],
                  })
                }
                className="w-full h-11 rounded-md border border-gray-700 bg-gray-800 text-white px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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

            {/* Notes Section Preview */}
            <div className="space-y-2 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-gray-400" />
                  <Label className="text-sm font-medium text-gray-200">Notes</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNotesDialogOpen(true)}
                  className="bg-transparent border-gray-700 text-white hover:bg-gray-700 h-9"
                >
                  {formData.notes?.content ? "Edit Notes" : "Add Notes"}
                </Button>
              </div>
              {formData.notes?.content && (
                <div className="text-sm text-gray-400 bg-gray-900 rounded-md p-3 mt-2">
                  {formData.notes.content.length > 150
                    ? `${formData.notes.content.substring(0, 150)}...`
                    : formData.notes.content}
                </div>
              )}
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
                {mode === "add" ? "Add Link" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <NotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => setIsNotesDialogOpen(false)}
        onSave={handleNotesUpdate}
        initialNotes={formData.notes}
        title={formData.title || "New Link"}
      />
    </>
  );
};

export default LinkDialog;