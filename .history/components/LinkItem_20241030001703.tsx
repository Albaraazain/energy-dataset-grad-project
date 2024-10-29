import React from 'react';
import {
  Edit,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Link as DatasetLink } from '@/types';

interface LinkItemProps {
  link: DatasetLink;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onEditNotes: () => void;
  onDelete: () => void;
  getBadgeColor: (type: string) => string;
}

const LinkItem: React.FC<LinkItemProps> = ({
  link,
  isExpanded,
  onToggleExpand,
  onEdit,
  onEditNotes,
  onDelete,
  getBadgeColor,
}) => {
  const hasNotes = !!link.notes?.content;

  return (
    <div className="group bg-white bg-opacity-5 rounded-xl transition-all duration-300 border border-white border-opacity-5 hover:border-blue-400 hover:border-opacity-30">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-base sm:text-lg text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2 sm:line-clamp-1">
              {link.title}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className={`${getBadgeColor(link.type)} text-white`}>
                {link.type}
              </Badge>
              {hasNotes && !isExpanded && (
                <button
                  onClick={onToggleExpand}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <StickyNote className="w-3 h-3" />
                  <span className="hidden sm:inline">View notes</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isExpanded && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNotes();
                }}
              >
                <StickyNote className="w-4 h-4" />
              </Button>
            )}
            {hasNotes && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {link.url !== "#" && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {isExpanded && link.notes && (
          <div className="mt-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <StickyNote className="w-4 h-4" />
                <span>Notes</span>
              </div>
              <div className="flex items-center gap-4">
                {link.notes.lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Updated {formatDistanceToNow(new Date(link.notes.lastUpdated))} ago
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNotes();
                  }}
                  className="text-gray-400 hover:text-blue-400"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 bg-opacity-50 rounded-lg p-3">
              {link.notes.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkItem;