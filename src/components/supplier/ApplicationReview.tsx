import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, Book, Edit, FileText, School, Settings, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveSupplierForm from './ComprehensiveSupplierForm';

interface ApplicationReviewProps {
  application: any;
  onEditRequest?: () => void;
  fieldIssues?: string[];
}

interface ServiceDetails {
  services_offered?: string[];
  product_categories?: string[];
  pricing_model?: string;
  implementation_time?: string;
  trial_period?: string;
  minimum_order?: string;
  delivery_time?: string;
  support_channels?: string[];
  training_provided?: boolean;
  customization_available?: boolean;
  demo_available?: boolean;
  [key: string]: any;
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({ application, onEditRequest, fieldIssues = [] }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Function to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Under Review</Badge>;
      case 'waiting':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Updates Requested</Badge>;
      default:
        return <Badge variant="outline">Unknown Status</Badge>;
    }
  };

  // Handle safely rendering possibly complex objects
  const renderValue = (value: any, fieldName?: string) => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    
    if (typeof value === 'object') {
      // Convert objects to string representation to avoid React errors when rendering
      return JSON.stringify(value);
    }
    
    return value.toString();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFormSuccess = () => {
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Your application has been updated successfully",
    });
    // Refresh the page to show updated data
    window.location.reload();
  };

  if (!application) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="h-12 w-12 text-amber-500 mx-auto mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find your supplier application.
          </p>
          <Button onClick={() => navigate('/join')}>
            Submit an Application
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const isFieldFlagged = (fieldName: string): boolean => {
    return fieldIssues.includes(fieldName);
  };

  const renderFieldValue = (fieldName: string, value: any) => {
    const hasIssue = isFieldFlagged(fieldName);
    
    return (
      <dd className={`mt-1 ${hasIssue ? 'flex items-center gap-2' : ''}`}>
        <span className={`${hasIssue ? 'text-amber-700 font-medium' : 'text-navy'}`}>
          {renderValue(value, fieldName)}
        </span>
        {hasIssue && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Update Required
          </Badge>
        )}
      </dd>
    );
  };

  const getSupplierTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'edtech': 'EdTech',
      'curriculum': 'Curriculum',
      'furniture': 'Furniture',
      'transport': 'Transport',
      'training': 'Training',
      'erp': 'ERP Software',
      'books': 'Books',
      'uniforms': 'Uniforms'
    };
    
    return types[type] || type;
  };

  const renderFieldList = (field: string, values: string | string[], options?: string[]) => {
    const hasIssue = isFieldFlagged(field);
    const valueArray = Array.isArray(values) ? values : values?.split(',') || [];
    
    return (
      <div className={`mt-2 ${hasIssue ? 'mb-2' : ''}`}>
        <div className="flex flex-wrap gap-2">
          {valueArray.map((value, index) => (
            <Badge key={index} variant="outline" className="bg-gray-50">
              {value.trim()}
            </Badge>
          ))}
        </div>
        {hasIssue && (
          <div className="mt-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Update Required
            </Badge>
          </div>
        )}
      </div>
    );
  };

  // Add this function to parse service details
  const getServiceDetails = (): ServiceDetails => {
    if (!application.service_details) return {};
    
    try {
      if (typeof application.service_details === 'string') {
        return JSON.parse(application.service_details);
      }
      return application.service_details as ServiceDetails;
    } catch (error) {
      console.error('Error parsing service details:', error);
      return {};
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-navy text-white">
              <AvatarFallback>{getInitials(application.org_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-navy mb-1">Edit Application</h1>
              <p className="text-gray-600">{application.org_name}</p>
            </div>
          </div>
          <Button 
            onClick={handleEditToggle}
            variant="outline"
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
        </div>

        <ComprehensiveSupplierForm 
          initialValues={application}
          onSuccess={handleFormSuccess}
          mode="edit"
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-navy text-white">
            <AvatarFallback>{getInitials(application.org_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-navy mb-1">{application.org_name}</h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600">Status:</p>
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>
        <Button 
          onClick={handleEditToggle}
          className="bg-teal text-white hover:bg-teal-600"
        >
          <Edit className="h-4 w-4 mr-2" /> Edit Application
        </Button>
      </div>

      {fieldIssues.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              Application Update Required
            </CardTitle>
            <CardDescription>
              Please address the admin feedback to improve your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">The admin has identified issues with some fields in your application. Please check the highlighted fields below and update them.</p>
              <div>
                <p className="text-xs font-medium mb-1">Fields to update:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldIssues.map((field: string) => (
                    <Badge key={field} variant="outline" className="text-xs bg-amber-100 border-amber-300">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="about" className="data-[state=active]:text-navy">About Us</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:text-navy">Business Details</TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:text-navy">Services</TabsTrigger>
          <TabsTrigger value="coverage" className="data-[state=active]:text-navy">Service Coverage</TabsTrigger>
          <TabsTrigger value="education" className="data-[state=active]:text-navy">Education Details</TabsTrigger>
        </TabsList>
        
        {/* About Us Tab */}
        <TabsContent value="about" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Organization Name</dt>
                  {renderFieldValue('org_name', application.org_name)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                  {renderFieldValue('contact_name', application.contact_name)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  {renderFieldValue('email', application.email)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  {renderFieldValue('phone', application.phone)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Supplier Type</dt>
                  {renderFieldValue('supplier_type', getSupplierTypeName(application.supplier_type))}
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Short Description</dt>
                  {renderFieldValue('short_desc', application.short_desc)}
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Full Description</dt>
                  <div className="bg-gray-50 p-3 rounded-md mt-1">
                    {renderFieldValue('full_desc', application.full_desc)}
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Business Details Tab */}
        <TabsContent value="details" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Business Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Year Started</dt>
                  {renderFieldValue('year_started', application.year_started)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company Type</dt>
                  {renderFieldValue('company_type', application.company_type)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">GST Number</dt>
                  {renderFieldValue('gst_number', application.gst_number || 'Not provided')}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="mt-1">
                    {application.website ? (
                      <div className={isFieldFlagged('website') ? "flex items-center gap-2" : ""}>
                        <a 
                          href={application.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`${isFieldFlagged('website') ? "text-amber-700" : "text-teal"} hover:underline`}
                        >
                          {application.website}
                        </a>
                        {isFieldFlagged('website') && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Update Required
                          </Badge>
                        )}
                      </div>
                    ) : (
                      'Not provided'
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const serviceDetails = getServiceDetails();
                
                return (
                  <>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {serviceDetails.services_offered && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Services Offered</dt>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {serviceDetails.services_offered.map((service, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-50">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {serviceDetails.product_categories && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Product Categories</dt>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {serviceDetails.product_categories.map((category, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-50">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {serviceDetails.pricing_model && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Pricing Model</dt>
                          {renderFieldValue('service_details.pricing_model', serviceDetails.pricing_model)}
                        </div>
                      )}
                      
                      {serviceDetails.implementation_time && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Implementation Time</dt>
                          {renderFieldValue('service_details.implementation_time', serviceDetails.implementation_time)}
                        </div>
                      )}
                      
                      {serviceDetails.trial_period && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Trial Period</dt>
                          {renderFieldValue('service_details.trial_period', serviceDetails.trial_period)}
                        </div>
                      )}
                      
                      {serviceDetails.minimum_order && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Minimum Order</dt>
                          {renderFieldValue('service_details.minimum_order', serviceDetails.minimum_order)}
                        </div>
                      )}
                      
                      {serviceDetails.delivery_time && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Delivery Time</dt>
                          {renderFieldValue('service_details.delivery_time', serviceDetails.delivery_time)}
                        </div>
                      )}
                      
                      {serviceDetails.support_channels && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Support Channels</dt>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2">
                              {serviceDetails.support_channels.map((channel, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-50">
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </dl>
                    
                    {/* Service Features */}
                    {(serviceDetails.training_provided || 
                      serviceDetails.customization_available || 
                      serviceDetails.demo_available) && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 border-b pb-2">Service Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {serviceDetails.training_provided && (
                            <Badge variant="outline" className="bg-green-50">
                              Training Provided
                            </Badge>
                          )}
                          {serviceDetails.customization_available && (
                            <Badge variant="outline" className="bg-blue-50">
                              Customization Available
                            </Badge>
                          )}
                          {serviceDetails.demo_available && (
                            <Badge variant="outline" className="bg-purple-50">
                              Demo Available
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Service Details */}
                    {Object.entries(serviceDetails)
                      .filter(([key]) => ![
                        'services_offered',
                        'product_categories',
                        'pricing_model',
                        'implementation_time',
                        'trial_period',
                        'minimum_order',
                        'delivery_time',
                        'support_channels',
                        'training_provided',
                        'customization_available',
                        'demo_available'
                      ].includes(key))
                      .map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          {renderFieldValue(`service_details.${key}`, value)}
                        </div>
                      ))
                    }
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Service Coverage Tab */}
        <TabsContent value="coverage" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Service Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">States Covered</dt>
                  {renderFieldValue('states_covered', application.states_covered)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Operational Cities</dt>
                  {renderFieldValue('operational_cities', application.operational_cities)}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Headquarter City</dt>
                  {renderFieldValue('hq_city', application.hq_city)}
                </div>
                
                {/* Payment and Policy Information */}
                <div className="sm:col-span-2 mt-4">
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Payment & Policies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Modes</dt>
                      {renderFieldValue('payment_modes', application.payment_modes || 'Not provided')}
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Refund Policy</dt>
                      {renderFieldValue('refund_policy', application.refund_policy || 'Not provided')}
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Annual Contracts</dt>
                      {renderFieldValue('annual_contracts', 
                        application.annual_contracts !== undefined ? 
                        (application.annual_contracts ? 'Yes' : 'No') : 'Not specified')}
                    </div>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Details Tab */}
        <TabsContent value="education" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <School className="h-5 w-5 mr-2" />
                Educational Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Audience Section */}
              <div>
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-gray-600" />
                  <h3 className="text-lg font-medium">Target Audience</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.audience_students && <Badge variant="outline">Students</Badge>}
                  {application.audience_teachers && <Badge variant="outline">Teachers</Badge>}
                  {application.audience_parents && <Badge variant="outline">Parents</Badge>}
                  {application.audience_schools && <Badge variant="outline">Schools</Badge>}
                </div>
              </div>

              {/* Institution Types Section */}
              <div>
                <div className="flex items-center mb-2">
                  <School className="h-4 w-4 mr-2 text-gray-600" />
                  <h3 className="text-lg font-medium">Institution Types</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.inst_k12 && <Badge variant="outline">K-12 Schools</Badge>}
                  {application.inst_higher_ed && <Badge variant="outline">Higher Education</Badge>}
                  {application.inst_preschool && <Badge variant="outline">Preschool</Badge>}
                  {application.inst_coaching && <Badge variant="outline">Coaching Centers</Badge>}
                  {application.inst_other && <Badge variant="outline">Other</Badge>}
                </div>
              </div>

              {/* Educational Boards Section */}
              <div>
                <div className="flex items-center mb-2">
                  <Book className="h-4 w-4 mr-2 text-gray-600" />
                  <h3 className="text-lg font-medium">Educational Boards Supported</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.board_cbse && <Badge variant="outline">CBSE</Badge>}
                  {application.board_icse && <Badge variant="outline">ICSE</Badge>}
                  {application.board_state && <Badge variant="outline">State Boards</Badge>}
                  {application.board_cambridge && <Badge variant="outline">Cambridge</Badge>}
                  {application.board_ib && <Badge variant="outline">IB</Badge>}
                  {application.board_other && <Badge variant="outline">Other</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationReview;
