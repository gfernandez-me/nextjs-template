"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types
interface GearSet {
  id: number;
  setName: string;
  piecesRequired: number;
  effectDescription: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GearSetsTableProps {
  initialData: GearSet[];
}

export function GearSetsTable({ initialData }: GearSetsTableProps) {
  const [gearSets, setGearSets] = useState<GearSet[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered gear sets
  const filteredGearSets = gearSets.filter(
    (gearSet) =>
      gearSet.setName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gearSet.effectDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gear set?")) return;

    try {
      // TODO: Implement API call to delete gear set
      setGearSets(gearSets.filter((gs) => gs.id !== id));
      // toast.success("Gear set deleted successfully!");
    } catch (error) {
      // toast.error("Failed to delete gear set");
      console.error(error);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: number) => {
    try {
      // TODO: Implement API call to toggle active status
      setGearSets(
        gearSets.map((gs) =>
          gs.id === id ? { ...gs, isActive: !gs.isActive } : gs
        )
      );
      // toast.success("Gear set status updated successfully!");
    } catch (error) {
      // toast.error("Failed to update gear set status");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search gear sets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Button disabled>Create Gear Set (Coming Soon)</Button>
      </div>

      {/* Gear Sets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gear Sets ({filteredGearSets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Set Name</TableHead>
                <TableHead>Pieces</TableHead>
                <TableHead>Effect</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGearSets.map((gearSet) => (
                <TableRow key={gearSet.id}>
                  <TableCell>
                    <span className="text-2xl">{gearSet.icon}</span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {gearSet.setName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        gearSet.piecesRequired === 4 ? "default" : "secondary"
                      }
                    >
                      {gearSet.piecesRequired} pieces
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {gearSet.effectDescription}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={gearSet.isActive ? "default" : "destructive"}
                    >
                      {gearSet.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(gearSet.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Edit (Coming Soon)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(gearSet.id)}
                      >
                        {gearSet.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(gearSet.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
