import React from 'react';
import { ChevronRight, Edit, Trash2, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  iconMap: Record<string, React.ComponentType>;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isSelected,
  iconMap,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap];
  const hasNotes = category.links.some((link) => !!link.notes?.content);

  return (
    <Card
      className={`group p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl transition-all duration-300 hover:border-blue-400 hover:border-opacity-30 active:scale-[0.99] ${
        isSelected
          ? "bg-blue-900 bg-opacity-20 border-blue-400 border-opacity-50"
          : "bg-white bg-opacity-5 hover:bg-opacity-10"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-0 relative">
        <div className="absolute top-0 right-0 flex space-x-2">
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
        </div>

        <div className="flex items-center justify-between mb-6">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isSelected
                ? "bg-blue-500 bg-opacity-20"
                : "bg-white bg-opacity-10"
            } group-hover:bg-blue-500 group-hover:bg-opacity-20 transition-all duration-300`}
          >
            {IconComponent && <IconComponent className="w-6 h-6" />}
          </div>
          <ChevronRight
            className={`w-5 h-5 text-gray-400 transform transition-all duration-300 ${
              isSelected ? "translate-x-1 text-blue-400" : ""
            } group-hover:translate-x-1`}
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-semibold line-clamp-1">
            {category.title}
          </h3>
          {hasNotes && (
            <div className="flex items-center text-xs text-gray-400">
              <StickyNote className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Has notes</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
            {category.description}
          </p>
          <span className="text-xs text-gray-500 ml-4">
            {category.links.length} {category.links.length === 1 ? 'link' : 'links'}
          </span>
        </div>

        {/* Mobile Touch Hint */}
        <div className="sm:hidden absolute inset-x-0 bottom-0 py-2 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-gray-700 opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryItem;