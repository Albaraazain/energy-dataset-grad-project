// components/NotesDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StickyNote, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: { content: string; lastUpdated: string }) => void;
  initialNotes?: {
    content?: string | null;
    lastUpdated?: string | null;
  } | null;
  title: string;
}

const NotesDialog: React.FC<NotesDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNotes,
  title,
}) => {
  const [notes, setNotes] = useState("");
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (initialNotes?.content) {
      setNotes(initialNotes.content);
      setCharCount(initialNotes.content.length);
    } else {
      setNotes("");
      setCharCount(0);
    }
  }, [initialNotes, isOpen]);

  const handleSave = () => {
    onSave({
      content: notes,
      lastUpdated: new Date().toISOString(),
    });
    onClose();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNotes(newText);
    setCharCount(newText.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <StickyNote className="w-5 h-5" />
            Notes for {title}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              {initialNotes?.lastUpdated ? (
                <span>
                  Last updated{" "}
                  {formatDistanceToNow(new Date(initialNotes.lastUpdated))} ago
                </span>
              ) : (
                <span>No previous notes</span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={notes}
              onChange={handleTextChange}
              placeholder="Add detailed notes about this resource..."
              className="w-full h-96 rounded-md border border-gray-700 bg-gray-800 text-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                lineHeight: "1.5",
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {charCount} characters
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <ul className="list-disc list-inside space-y-1">
              <li>Use clear and concise language</li>
              <li>Include relevant dates and version numbers if applicable</li>
              <li>Add any important links or references</li>
              <li>Highlight key findings or important details</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <StickyNote className="w-4 h-4 mr-2" />
            <span>Markdown formatting is supported</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Notes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;