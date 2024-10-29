"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Database,
  Sun,
  Activity,
  BarChart2,
  Building2,
  Gauge,
  Cloud,
  Leaf,
  Plus,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useFirebaseOperations } from "@/hooks/useFirebaseOperations";
import { Category, Link as DatasetLink } from "@/types";
import CategoryItem from "./CategoryItem";
import LinkItem from "./LinkItem";
import CategoryDialog from "./CategoryDialog";
import LinkDialog from "./LinkDialog";
import NotesDialog from "./NotesDialog";
import MobileNavigation from "./MobileNavigation";

// Icon mapping for categories
const iconMap = {
  Database,
  Sun,
  Activity,
  BarChart2,
  Building2,
  Gauge,
  Cloud,
  Leaf,
};

// Badge color mapping
const getBadgeColor = (type: string) => {
  const colors = {
    ieee: "bg-blue-600",
    arxiv: "bg-green-600",
    mdpi: "bg-purple-600",
    tool: "bg-yellow-600",
    database: "bg-red-600",
    dataset: "bg-indigo-600",
    specification: "bg-pink-600",
    article: "bg-orange-600",
  };
  return colors[type as keyof typeof colors] || "bg-gray-600";
};

interface EditingNotesState {
  categoryId: string;
  linkId: string;
  notes: {
    content: string;
    lastUpdated: string;
  };
  linkTitle: string;
}

const DatasetPortal = () => {
  // Firebase hooks
  const { categories, loading: categoriesLoading } = useFirebase();
  const {
    addCategory,
    updateCategory,
    deleteCategory,
    addLink,
    updateLink,
    deleteLink,
    loading: operationsLoading,
  } = useFirebaseOperations();

  // State management
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingLink, setEditingLink] = useState<DatasetLink | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<EditingNotesState | null>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.links.some(
        (link) =>
          link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.notes?.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );


  // event handlers and utility functions

  // Event Handlers
  const handleAddCategory = () => {
    setDialogMode("add");
    setEditingCategory(undefined);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setDialogMode("edit");
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id.toString() === categoryId);
    if (!category) return;

    if (window.confirm(`Are you sure you want to delete the category "${category.title}"?`)) {
      const success = await deleteCategory(categoryId, category.title);
      if (success) {
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
        }
      } else {
        alert("Failed to delete category. Please try again.");
      }
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    if (dialogMode === "add") {
      const success = await addCategory(categoryData as Category);
      if (!success) {
        alert("Failed to add category. Please try again.");
      }
    } else if (dialogMode === "edit" && editingCategory) {
      const success = await updateCategory(editingCategory.id.toString(), categoryData);
      if (!success) {
        alert("Failed to update category. Please try again.");
      }
    }
  };

  const handleAddLink = () => {
    setDialogMode("add");
    setEditingLink(undefined);
    setIsLinkDialogOpen(true);
  };

  const handleEditLink = (link: DatasetLink) => {
    setDialogMode("edit");
    setEditingLink(link);
    setIsLinkDialogOpen(true);
  };

  const handleDeleteLink = async (categoryId: string, linkId: string) => {
    if (!selectedCategory) return;

    const category = categories.find((c) => c.id.toString() === categoryId);
    const link = category?.links.find((l) => l.id === linkId);
    if (!category || !link) return;

    if (window.confirm(`Are you sure you want to delete the link "${link.title}"?`)) {
      try {
        const success = await deleteLink(categoryId, linkId, link.title);
        if (!success) {
          alert("Failed to delete link. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting link:", error);
        alert("An error occurred while deleting the link.");
      }
    }
  };

  const handleSaveLink = async (linkData: DatasetLink) => {
    if (!selectedCategory) return;

    try {
      if (dialogMode === "add") {
        const newLinkData = {
          ...linkData,
          id: linkData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        };

        const success = await addLink(selectedCategory, newLinkData);
        if (!success) {
          alert("Failed to add link. Please try again.");
        }
      } else if (dialogMode === "edit" && editingLink) {
        const updatedLinkData = {
          ...linkData,
          id: editingLink.id || linkData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        };

        const success = await updateLink(selectedCategory, updatedLinkData.id, updatedLinkData);
        if (!success) {
          alert("Failed to update link. Please try again.");
        }
      }

      setIsLinkDialogOpen(false);
    } catch (error) {
      console.error("Error saving link:", error);
      alert("An error occurred while saving the link.");
    }
  };

  const handleEditNotes = (categoryId: string, link: DatasetLink) => {
    setEditingNotes({
      categoryId,
      linkId: link.id,
      notes: link.notes || {
        content: "",
        lastUpdated: new Date().toISOString(),
      },
      linkTitle: link.title,
    });
    setIsNotesDialogOpen(true);
  };

  const handleSaveNotes = async (updatedNotes: {
    content: string;
    lastUpdated: string;
  }) => {
    if (!editingNotes) return;

    try {
      const linkToUpdate = categories
        .find((c) => c.id.toString() === editingNotes.categoryId)
        ?.links.find((l) => l.id === editingNotes.linkId);

      if (!linkToUpdate) return;

      const updatedLink = {
        ...linkToUpdate,
        notes: updatedNotes,
      };

      const success = await updateLink(
        editingNotes.categoryId,
        editingNotes.linkId,
        updatedLink
      );

      if (!success) {
        alert("Failed to update notes. Please try again.");
      }

      setIsNotesDialogOpen(false);
      setEditingNotes(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("An error occurred while saving the notes.");
    }
  };

  const toggleLinkExpansion = (linkTitle: string) => {
    setExpandedLinks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(linkTitle)) {
        newSet.delete(linkTitle);
      } else {
        newSet.add(linkTitle);
      }
      return newSet;
    });
  };


  // Render
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          <p className="text-gray-400">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Desktop Navigation */}
      <nav
        className={`hidden lg:block fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-black bg-opacity-80 backdrop-blur" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold">Energy Dataset Portal</div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAddCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNavigation onAddCategory={handleAddCategory} />

      {/* Hero Section */}
      <div className="relative min-h-[80vh] lg:min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black opacity-50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 lg:mb-8 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Energy Dataset Portal
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-8 lg:mb-12 px-4">
            AI Solar Energy Optimization LLM Integration DATASETS -
            Graduation Project 2024-2025
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white bg-opacity-10 rounded-xl md:rounded-2xl pl-12 pr-4 py-3 md:py-4 
                         border border-white border-opacity-10 focus:border-blue-400 focus:ring-2 
                         focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 
                         text-base md:text-lg placeholder-gray-400 focus:bg-opacity-20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24 -mt-24 lg:-mt-48">
        {/* Section Header - Mobile Only */}
        <div className="lg:hidden mb-6 space-y-2">
          <h2 className="text-2xl font-bold text-white">Categories</h2>
          <p className="text-sm text-gray-400">
            Browse through our collection of energy datasets and resources
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id.toString()}
              iconMap={iconMap}
              onSelect={() => setSelectedCategory(category.id.toString())}
              onEdit={() => handleEditCategory(category)}
              onDelete={() => handleDeleteCategory(category.id.toString())}
            />
          ))}

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="col-span-full">
              <div className="text-center py-12 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 bg-opacity-10 mb-4">
                  {searchTerm ? (
                    <Search className="w-6 h-6 text-blue-400" />
                  ) : (
                    <PlusCircle className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No matching categories found
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Try adjusting your search term or browse all categories
                    </p>
                    <Button
                      onClick={() => setSearchTerm("")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      No categories yet
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Start by creating your first category
                    </p>
                    <Button
                      onClick={handleAddCategory}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add First Category
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State - Mobile Only */}
        {operationsLoading && (
          <div className="lg:hidden flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
          </div>
        )}
      </div>

      {/* Dataset List */}
      {selectedCategory && (
        <div className="max-w-4xl mx-auto px-4 pb-12 lg:pb-24">
          <Card className="bg-white bg-opacity-5 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-white border-opacity-10">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                    {categories.find((c) => c.id.toString() === selectedCategory)?.title}{" "}
                    Resources
                  </h2>
                  <p className="text-sm text-gray-400">
                    {categories.find((c) => c.id.toString() === selectedCategory)?.links.length}{" "}
                    {categories.find((c) => c.id.toString() === selectedCategory)?.links.length === 1
                      ? "resource"
                      : "resources"} available
                  </p>
                </div>
                <Button
                  onClick={handleAddLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto h-11"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Link
                </Button>
              </div>

              {/* Links List */}
              <div className="space-y-3 md:space-y-4">
                {categories
                  .find((c) => c.id.toString() === selectedCategory)
                  ?.links.map((link: DatasetLink) => (
                    <LinkItem
                      key={link.id}
                      link={link}
                      isExpanded={expandedLinks.has(link.title)}
                      onToggleExpand={() => toggleLinkExpansion(link.title)}
                      onEdit={() => handleEditLink(link)}
                      onEditNotes={() => handleEditNotes(selectedCategory!, link)}
                      onDelete={() => handleDeleteLink(selectedCategory!, link.id)}
                      getBadgeColor={getBadgeColor}
                    />
                  ))}
              </div>

              {/* Empty State */}
              {(!categories.find((c) => c.id.toString() === selectedCategory)?.links.length) && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 bg-opacity-10 mb-4">
                    <PlusCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No resources yet</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Start by adding your first resource to this category
                  </p>
                  <Button
                    onClick={handleAddLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add First Resource
                  </Button>
                </div>
              )}

              {/* Mobile Action Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-t border-gray-800 p-4 lg:hidden">
                <Button
                  onClick={handleAddLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> Add New Resource
                </Button>
              </div>
              
              {/* Spacer for Mobile Bottom Bar */}
              <div className="h-20 lg:hidden" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogs */}
      <NotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => {
          setIsNotesDialogOpen(false);
          setEditingNotes(null);
        }}
        onSave={handleSaveNotes}
        initialNotes={editingNotes?.notes}
        title={editingNotes?.linkTitle || ""}
      />

      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        mode={dialogMode}
      />

      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSave={handleSaveLink}
        link={editingLink}
        mode={dialogMode}
        categoryId={selectedCategory || undefined}
      />

      {/* Back to Top Button - Shows after scrolling */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 bg-blue-600 hover:bg-blue-700 
                   text-white rounded-full p-3 shadow-lg transition-all duration-300 
                   transform hover:scale-110 z-50"
        >
          <ChevronUp className="w-6 h-6" />
          <span className="sr-only">Back to top</span>
        </button>
      )}

      {/* Loading Overlay - Shows during operations */}
      {operationsLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
            <p className="text-gray-300">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetPortal;