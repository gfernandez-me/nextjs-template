"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GearRecommendation } from "#prisma";
import { createRecommendationTableColumns } from "./columns";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { toast } from "sonner";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = React.useState<
    GearRecommendation[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = React.useCallback((id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/recommendations/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRecommendations((prev) => prev.filter((r) => r.id !== deleteId));
        toast.success("Recommendation deleted successfully");
      } else {
        toast.error("Failed to delete recommendation");
      }
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      toast.error("Error deleting recommendation");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  }, [deleteId]);

  // Create columns with useMemo to prevent recreation on every render
  const columns = React.useMemo(
    () => createRecommendationTableColumns(handleDelete),
    [handleDelete]
  );

  React.useEffect(() => {
    async function fetchRecommendations() {
      try {
        // Since we're now a client component, we need to fetch data via API
        const response = await fetch("/api/recommendations");
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        } else {
          console.error("Failed to fetch recommendations");
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recommendations</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/recommendations/analyze">Analyze Build</Link>
          </Button>
          <Button asChild>
            <Link href="/recommendations/edit">Create New</Link>
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={recommendations} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              recommendation and all its associated gear items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
