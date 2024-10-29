"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Database,
  Sun,
  Activity,
  BarChart2,
  Building2,
  Gauge,
  Cloud,
  Leaf,
  Edit,
  Trash2,
  Plus,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  StickyNote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import CategoryDialog from "./CategoryDialog";
import LinkDialog from "./LinkDialog";
import categoriesData from "@/data/categories.json";
import { Category, Link as DatasetLink } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  migrateDataToFirestore,
  validateMigrationData,
} from "@/lib/firebase/migration";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useFirebaseOperations } from "@/hooks/useFirebaseOperations";

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

// New component for expanded notes
const ExpandedNotes: React.FC<{ notes: DatasetLink["notes"] }> = ({
  notes,
}) => {
  if (!notes?.content) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <StickyNote className="w-4 h-4" />
          <span>Notes</span>
        </div>
        {notes.lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(notes.lastUpdated))} ago
          </span>
        )}
      </div>
      <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 bg-opacity-50 rounded-lg p-3">
        {notes.content}
      </div>
    </div>
  );
};

const DatasetPortal = () => {
  // 1. All useState hooks
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // 2. Custom hooks
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

  // 3. Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [editingLink, setEditingLink] = useState<DatasetLink | undefined>();
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  // 4. Effects - all useEffect hooks need to be together
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 5. Derived state
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

  // 6. Loading state - move this after all hooks
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // 7. Event handlers - after all hooks and before render
  const handleAddCategory = () => {
    setDialogMode("add");
    setEditingCategory(undefined);
    setIsCategoryDialogOpen(true);
  };

  const handleMigration = async () => {
    const categoriesData = await import("@/data/categories.json");

    // First validate the data
    if (!validateMigrationData(categoriesData.categories)) {
      alert(
        "Invalid data structure detected. Please check the console for details."
      );
      return;
    }

    // Confirm migration
    if (
      !window.confirm(
        "This will migrate all categories and links to Firebase. Continue?"
      )
    ) {
      return;
    }

    try {
      // Attempt migration
      const success = await migrateDataToFirestore(categoriesData.categories);

      if (success) {
        alert("Migration completed successfully!");
      } else {
        const cleanup = window.confirm(
          "Migration failed. Would you like to clean up any partial migration data?"
        );

        if (cleanup) {
          await cleanupFailedMigration(categoriesData.categories);
          alert("Cleanup completed.");
        }
      }
    } catch (error) {
      console.error("Migration error:", error);
      alert("Migration failed. Check console for details.");
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const success = await deleteCategory(categoryId);
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
      const success = await updateCategory(
        editingCategory.id.toString(),
        categoryData
      );
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

  const handleEditLink = (link: Link) => {
    setDialogMode("edit");
    setEditingLink(link);
    setIsLinkDialogOpen(true);
  };

  const handleDeleteLink = async (categoryId: string, linkId: string) => {
    if (!selectedCategory) return;

    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        const success = await deleteLink(selectedCategory, linkId);
        if (!success) {
          alert("Failed to delete link. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting link:", error);
        alert("An error occurred while deleting the link.");
      }
    }
  };

  const handleSaveLink = async (linkData: Link) => {
    if (!selectedCategory) return;

    try {
      if (dialogMode === "add") {
        // Generate a proper ID for the new link
        const newLinkData = {
          ...linkData,
          id: linkData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        };

        const success = await addLink(selectedCategory, newLinkData);
        if (!success) {
          alert("Failed to add link. Please try again.");
        }
      } else if (dialogMode === "edit" && editingLink) {
        // Use the existing link ID or generate one if it doesn't exist
        const updatedLinkData = {
          ...linkData,
          id:
            editingLink.id ||
            linkData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        };

        const success = await updateLink(
          selectedCategory,
          updatedLinkData.id,
          updatedLinkData
        );
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
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

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-black opacity-50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Energy Dataset Portal
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Explore comprehensive energy data resources for research and
            analysis
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search datasets..."
                className="w-full bg-white bg-opacity-10 rounded-2xl pl-12 pr-4 py-4 border border-white border-opacity-10 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300 text-lg placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-24 -mt-48">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => {
            const IconComponent =
              iconMap[category.icon as keyof typeof iconMap];
            const hasNotes = category.links.some(
              (link) => !!link.notes?.content
            );

            return (
              <Card
                key={category.id}
                className={`group p-8 rounded-2xl transition-all duration-300 hover:border-blue-400 hover:border-opacity-30 ${
                  selectedCategory === category.id.toString()
                    ? "bg-blue-900 bg-opacity-20 border-blue-400 border-opacity-50"
                    : "bg-white bg-opacity-5 hover:bg-opacity-10"
                }`}
                onClick={() => setSelectedCategory(category.id.toString())}
              >
                <CardContent className="p-0 relative">
                  <div className="absolute top-0 right-0 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-blue-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
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
                        handleDeleteCategory(category.id.toString());
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedCategory === category.id
                          ? "bg-blue-500 bg-opacity-20"
                          : "bg-white bg-opacity-10"
                      } group-hover:bg-blue-500 group-hover:bg-opacity-20 transition-all duration-300`}
                    >
                      {IconComponent && <IconComponent className="w-6 h-6" />}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transform transition-all duration-300 ${
                        selectedCategory === category.id
                          ? "translate-x-1 text-blue-400"
                          : ""
                      } group-hover:translate-x-1`}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                    {hasNotes && (
                      <div className="flex items-center text-xs text-gray-400">
                        <StickyNote className="w-3 h-3 mr-1" />
                        <span>Has notes</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* <Button
        onClick={handleMigration}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Migrate to Firebase
      </Button> */}

      {/* Dataset List */}
      {selectedCategory && (
        <div className="max-w-4xl mx-auto px-4 pb-24">
          <Card className="bg-white bg-opacity-5 rounded-2xl p-8 border border-white border-opacity-10">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  {
                    categories.find((c) => c.id.toString() === selectedCategory)
                      ?.title
                  }{" "}
                  Resources
                </h2>
                <Button
                  onClick={handleAddLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Link
                </Button>
              </div>
              <div className="space-y-4">
                {categories
                  .find((c) => c.id.toString() === selectedCategory)
                  ?.links.map((link: DatasetLink, index: number) => {
                    const isExpanded = expandedLinks.has(link.title);
                    const hasNotes = !!link.notes?.content;

                    return (
                      <div
                        key={index}
                        className="group bg-white bg-opacity-5 rounded-xl transition-all duration-300 border border-white border-opacity-5 hover:border-blue-400 hover:border-opacity-30"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg text-gray-200 group-hover:text-blue-400 transition-colors">
                                {link.title}
                              </span>
                              <Badge
                                className={`${getBadgeColor(
                                  link.type
                                )} text-white`}
                              >
                                {link.type}
                              </Badge>
                              {hasNotes && !isExpanded && (
                                <button
                                  onClick={() =>
                                    toggleLinkExpansion(link.title)
                                  }
                                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                  <StickyNote className="w-3 h-3" />
                                  <span>View notes</span>
                                </button>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {!isExpanded && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-blue-400"
                                  onClick={() =>
                                    handleEditNotes(selectedCategory!, link)
                                  }
                                >
                                  <StickyNote className="w-4 h-4" />
                                </Button>
                              )}
                              {hasNotes && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-blue-400"
                                  onClick={() =>
                                    toggleLinkExpansion(link.title)
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-blue-400"
                                onClick={() => handleEditLink(link)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-400"
                                onClick={() =>
                                  handleDeleteLink(selectedCategory!, link.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {link.url !== "#" && (
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-400"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                          {isExpanded && (
                            <ExpandedNotes
                              notes={link.notes}
                              onEdit={() =>
                                handleEditNotes(selectedCategory!, link)
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add NotesDialog */}
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

      {/* Keep existing dialogs */}
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
    </div>
  );
};

export default DatasetPortal;
