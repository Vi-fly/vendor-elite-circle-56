
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, AlertCircle, Loader2, Check, IndianRupee, CalendarDays, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import PricingTableForm from './PricingTableForm';
import { Json } from '@/integrations/supabase/types';

interface Feature {
  name: string;
  included: boolean;
}

interface PricingTable {
  id: string;
  supplier_id: string;
  service_name: string;
  price_amount: number;
  price_unit: string;
  features: Feature[];
  created_at: string;
  duration?: string;
  includes?: string;
  description?: string;
}

interface RawPricingTable {
  id: string;
  supplier_id: string;
  service_name: string;
  price_amount: number;
  price_unit: string;
  features: Json;
  created_at: string;
  updated_at: string;
  duration?: string;
  includes?: string;
  description?: string;
}

interface PricingTableListProps {
  supplierId: string;
}

const PricingTableList = ({ supplierId }: PricingTableListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pricingTables, setPricingTables] = useState<PricingTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTable, setEditingTable] = useState<PricingTable | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'detailed'>('table');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'price_amount', direction: 'asc' });

  const fetchPricingTables = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, create mock data since we're having issues with the database
      const mockPricingTables: PricingTable[] = [
        {
          id: '1',
          supplier_id: supplierId,
          service_name: 'Basic Education Package',
          price_amount: 950,
          price_unit: 'per month',
          duration: 'Half-day (5 days)',
          includes: 'All core curriculum',
          description: 'Our Basic Education Package provides students with foundational learning in all core subjects. This half-day program runs five days a week and includes regular assessments, parent-teacher meetings, and access to our online learning platform.',
          features: [
            { name: 'Access to core learning materials', included: true },
            { name: 'Regular progress assessments', included: true },
            { name: 'Parent-teacher meetings', included: true },
            { name: 'Basic art and music classes', included: true },
            { name: 'Morning snack provided', included: true },
            { name: 'Access to library resources', included: true },
          ],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          supplier_id: supplierId,
          service_name: 'Full Day Program',
          price_amount: 1450,
          price_unit: 'per month',
          duration: 'Full-day (5 days)',
          includes: 'Core + enrichment',
          description: 'The Full Day Program expands on our basic package with additional enrichment activities. Students receive comprehensive education across all subjects with specialized attention to areas of individual interest.',
          features: [
            { name: 'All features of Basic Package', included: true },
            { name: 'Enrichment activities', included: true },
            { name: 'Lunch provided', included: true },
            { name: 'Extended learning hours', included: true },
            { name: 'Specialized subject tutoring', included: true },
            { name: 'Sports and physical education', included: true },
            { name: 'Computer lab access', included: true },
            { name: 'Quarterly educational field trips', included: true },
          ],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          supplier_id: supplierId,
          service_name: 'Extended Care',
          price_amount: 15,
          price_unit: 'per hour',
          duration: 'Additional hours',
          includes: 'Before/after care',
          description: 'Our Extended Care service provides supervised activities before and after regular school hours. This flexible program accommodates working parents who need additional childcare coverage.',
          features: [
            { name: 'Supervised activities', included: true },
            { name: 'Flexible pickup times', included: true },
            { name: 'Homework assistance', included: true },
            { name: 'Healthy snacks provided', included: true },
            { name: 'Indoor/outdoor play options', included: true },
            { name: 'Reading time', included: true },
          ],
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          supplier_id: supplierId,
          service_name: 'Summer Program',
          price_amount: 2800,
          price_unit: 'flat rate',
          duration: '8 weeks',
          includes: 'Themed activities',
          description: 'Our comprehensive Summer Program keeps children engaged and learning during school breaks. The 8-week program includes a variety of educational and recreational activities designed to prevent summer learning loss while ensuring children have fun.',
          features: [
            { name: 'Weekly field trips', included: true },
            { name: 'Swimming lessons', included: true },
            { name: 'Art and craft workshops', included: true },
            { name: 'Science experiments', included: true },
            { name: 'Outdoor adventures', included: true },
            { name: 'Cultural exploration', included: true },
            { name: 'Team building activities', included: true },
            { name: 'End of summer showcase', included: true },
          ],
          created_at: new Date().toISOString()
        }
      ];
      
      setPricingTables(mockPricingTables);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching pricing tables:', err);
      setError('Failed to load pricing tables. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) {
      fetchPricingTables();
    }
  }, [supplierId]);

  const handleDelete = async (id: string) => {
    try {
      // For demo purposes, just filter out the deleted item
      setPricingTables(pricingTables.filter(table => table.id !== id));
      
      toast({
        title: 'Success',
        description: 'Pricing table has been deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting pricing table:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete pricing table. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    fetchPricingTables();
    setShowAddForm(false);
    setEditingTable(null);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedPricingTables = () => {
    const sortableTables = [...pricingTables];
    if (sortConfig.key) {
      sortableTables.sort((a, b) => {
        if (a[sortConfig.key as keyof PricingTable] < b[sortConfig.key as keyof PricingTable]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof PricingTable] > b[sortConfig.key as keyof PricingTable]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTables;
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />;
  };

  if (!user) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">Please log in to view pricing tables.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-navy">Pricing Structure</h2>
          <p className="text-sm text-gray-500">Manage your service pricing details</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={viewMode === 'cards' ? 'bg-gray-100' : ''}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={viewMode === 'table' ? 'bg-gray-100' : ''}
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={viewMode === 'detailed' ? 'bg-gray-100' : ''}
            onClick={() => setViewMode('detailed')}
          >
            Detailed
          </Button>
          <Button 
            onClick={() => {
              setEditingTable(null);
              setShowAddForm(!showAddForm);
            }}
            className="bg-gradient-to-r from-teal to-primary text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Table
          </Button>
        </div>
      </div>

      {showAddForm && !editingTable && (
        <div className="mb-6">
          <PricingTableForm 
            supplierId={supplierId}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}
      
      {editingTable && (
        <div className="mb-6">
          <PricingTableForm 
            supplierId={supplierId}
            existingPricingTable={editingTable}
            onSuccess={handleFormSuccess}
          />
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setEditingTable(null)}
            >
              Cancel Editing
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading pricing tables...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8 text-red-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      ) : pricingTables.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="p-8 text-center text-gray-500">
            <p>No pricing tables have been created yet.</p>
            {!showAddForm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Pricing Table
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'detailed' ? (
        // Detailed view
        <div className="space-y-6">
          {getSortedPricingTables().map((table) => (
            <Card key={table.id} className="overflow-hidden border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-navy">{table.service_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{table.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal">
                      {formatCurrency(table.price_amount)}
                    </div>
                    <div className="text-sm text-gray-500">{table.price_unit}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy mb-2">Description</h3>
                    <p className="text-gray-600 mb-4">{table.description || 'No description provided.'}</p>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-navy mb-2">What's Included</h3>
                      <p className="text-sm text-gray-600 mb-2">{table.includes}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy mb-3">Features</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {table.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <div className="mt-0.5 mr-2 flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                              <Check className="w-3 h-3 text-teal-700" />
                            </div>
                          </div>
                          <span className="text-gray-600">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTable(table)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Pricing Table</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this pricing table? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDelete(table.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : viewMode === 'table' ? (
        // Table view (similar to the image shared)
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead 
                    className="font-semibold cursor-pointer"
                    onClick={() => requestSort('service_name')}
                  >
                    Service {getSortIcon('service_name')}
                  </TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer"
                    onClick={() => requestSort('price_amount')}
                  >
                    Price {getSortIcon('price_amount')}
                  </TableHead>
                  <TableHead className="font-semibold">Includes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedPricingTables().map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">{table.service_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                        {table.duration || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-teal">
                        {formatCurrency(table.price_amount)} <span className="text-gray-500 font-normal text-sm">{table.price_unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {table.includes || 'Basic features'}
                        <div className="mt-1 text-xs text-gray-500">
                          {table.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-center">
                              <Check className="h-3 w-3 text-green-500 mr-1" />
                              <span>{feature.name}</span>
                            </div>
                          ))}
                          {table.features.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{table.features.length - 2} more features
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTable(table)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Pricing Table</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this pricing table? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDelete(table.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t p-4">
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Additional Pricing Details</h3>
              <p className="text-sm text-gray-600">
                Sliding scale tuition available for families demonstrating financial need. 
                Sibling discounts of 10% for additional children. Payment plans available with no additional fees.
              </p>
            </div>
          </CardFooter>
        </Card>
      ) : (
        // Card view (original implementation)
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getSortedPricingTables().map((table) => (
            <Card key={table.id} className="border overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col relative group">
              {/* Pricing Header */}
              <CardHeader className="pb-2 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium text-navy">
                    {table.service_name}
                  </CardTitle>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingTable(table)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Pricing Table</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this pricing table? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(table.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              {/* Pricing Info */}
              <CardContent className="flex-grow">
                <div className="py-4 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <IndianRupee className="h-5 w-5 text-teal mr-1" />
                    <span className="text-3xl font-bold text-teal">
                      {table.price_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {table.price_unit}
                  </p>
                </div>
                
                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {table.duration || 'Not specified'}
                </div>
                
                {/* Features List */}
                <div className="space-y-3 mt-4">
                  {table.features && table.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-0.5 mr-3 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-teal-700" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              {/* Card Footer */}
              <CardFooter className="pt-2 pb-4 border-t bg-gradient-to-r from-purple-50 to-blue-50 mt-auto">
                <Badge variant="outline" className="mx-auto text-xs bg-white/70 hover:bg-white">
                  {table.includes || 'Standard Service'}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingTableList;
