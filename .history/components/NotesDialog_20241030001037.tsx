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
import { StickyNote, Clock, Info } from "lucide-react";
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
  const [isFocused, setIsFocused] = useState(false);

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
      <DialogContent className="bg-gray-900 text-white sm:max-w-2xl w-full h-[95vh] sm:h-auto flex flex-col">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
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

        <div className="flex-1 min-h-0 space-y-4 py-4">
          <div className="relative flex-1 h-full">
            <textarea
              value={notes}
              onChange={handleTextChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Add detailed notes about this resource..."
              className="w-full h-full min-h-[200px] rounded-md border border-gray-700 bg-gray-800 text-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                lineHeight: "1.5",
              }}
            />
            <div
              className={`absolute bottom-2 right-2 text-xs ${
                isFocused ? "text-blue-400" : "text-gray-400"
              } transition-colors`}
            >
              {charCount} characters
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Info className="w-4 h-4" />
              <span>Writing Tips</span>
            </div>
            <div className="text-xs text-gray-400">
              <ul className="list-disc list-inside space-y-1">
                <li>Use clear and concise language</li>
                <li>Include relevant dates and version numbers if applicable</li>
                <li>Add any important links or references</li>
                <li>Highlight key findings or important details</li>
                <li>Tag important sections with #hashtags for easy searching</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between border-t border-gray-800 pt-4 mt-4">
          <div className="hidden sm:flex items-center text-sm text-gray-400">
            <StickyNote className="w-4 h-4 mr-2" />
            <span>Markdown formatting supported</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
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