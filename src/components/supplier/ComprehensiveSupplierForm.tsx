import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, CreditCard, FileText, GraduationCap, MapPin, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ComprehensiveSupplierFormProps {
  initialValues?: any;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
}

interface BaseServiceDetails {
  services_offered: string[];
  product_categories: string[];
  pricing_model: string;
  implementation_time: string;
  trial_period: string;
  minimum_order: string;
  delivery_time: string;
  support_channels: string[];
  training_provided: boolean;
  customization_available: boolean;
  demo_available: boolean;
}

interface EdTechServiceDetails extends BaseServiceDetails {
  platform: 'web' | 'mobile' | 'hybrid';
  tech_stack: string;
  problem_solving: string;
  key_features: string;
  integrations: string;
  user_count: number;
  sso_support: boolean;
  support: string;
  data_compliance: boolean;
}

interface CurriculumServiceDetails extends BaseServiceDetails {
  standards: string;
  grades: string;
  subjects: string;
  objectives: boolean;
  special_needs: boolean;
  philosophy: string;
  methods: string;
  assessment: string;
  lesson_plans: boolean;
  progress: boolean;
  results: string;
}

interface FurnitureServiceDetails extends BaseServiceDetails {
  categories: 'classroom' | 'office' | 'lab' | 'sports' | 'multiple';
  modular: boolean;
  materials: string;
  installation: 'installation' | 'supply' | 'both';
  warranty: string;
  certified: boolean;
}

interface BooksServiceDetails extends BaseServiceDetails {
  book_types: 'textbooks' | 'references' | 'workbooks' | 'fiction' | 'multiple';
  subjects: string;
  grade_range: string;
  languages: string;
  digital_versions: boolean;
  bulk_discounts: boolean;
  customization: boolean;
  delivery_process: string;
  publishing_standards: string;
}

interface UniformsServiceDetails extends BaseServiceDetails {
  uniform_types: string;
  customization: boolean;
  materials: string;
  size_range: string;
  min_order_quantity: string;
  school_branding: boolean;
  washing_durability: string;
}

interface TransportServiceDetails extends BaseServiceDetails {
  fleet_size: number;
  vehicle_types: string;
  tracking: boolean;
  safety_measures: string;
  driver_vetting: string;
  route_optimization: boolean;
  parent_app: boolean;
  contract_types: string;
}

interface TrainingServiceDetails extends BaseServiceDetails {
  training_type: string;
  delivery_method: 'inperson' | 'online' | 'hybrid';
  target_audience: string;
  trainer_qualifications: string;
  certifications: boolean;
  custom_curriculum: boolean;
  training_duration: string;
  assessment_methods: string;
}

interface ERPServiceDetails extends BaseServiceDetails {
  modules: string;
  deployment: 'cloud' | 'onpremise' | 'hybrid';
  mobile_friendly: boolean;
  integration: string;
  data_export: boolean;
  multi_school: boolean;
  support_hours: string;
  user_training: boolean;
}

type ServiceDetails = 
  | EdTechServiceDetails 
  | CurriculumServiceDetails 
  | FurnitureServiceDetails 
  | BooksServiceDetails 
  | UniformsServiceDetails 
  | TransportServiceDetails 
  | TrainingServiceDetails 
  | ERPServiceDetails;

interface ServiceDetailsField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

const typeSpecificFields: Record<string, any[]> = {
  edtech: [
    { id: 'platform', label: 'Is your platform web-based, mobile-based, or hybrid?', type: 'select', required: true, options: [
      { value: 'web', label: 'Web-based' },
      { value: 'mobile', label: 'Mobile-based' },
      { value: 'hybrid', label: 'Hybrid' },
    ]},
    { id: 'techStack', label: 'What technology stack do you use?', type: 'text', required: true },
    { id: 'problemSolving', label: 'What problem does your tech solve in education?', type: 'textarea', required: true },
    { id: 'keyFeatures', label: 'What key features does your platform offer?', type: 'textarea', required: true },
    { id: 'integrations', label: 'What integrations do you support?', type: 'text', required: false },
    { id: 'userCount', label: 'How many concurrent users can your platform handle?', type: 'number', required: false },
    { id: 'ssoSupport', label: 'Is login via SSO or Google/Facebook supported?', type: 'checkbox', required: false },
    { id: 'support', label: 'What kind of onboarding and customer support do you provide?', type: 'textarea', required: true },
    { id: 'dataCompliance', label: 'Is your platform GDPR/FERPA compliant?', type: 'checkbox', required: false },
  ],
  curriculum: [
    { id: 'standards', label: 'Which standards is your curriculum aligned with?', type: 'text', required: true },
    { id: 'grades', label: 'What grade levels do you cover?', type: 'text', required: true },
    { id: 'subjects', label: 'What subjects are included?', type: 'text', required: true },
    { id: 'objectives', label: 'Are learning objectives clearly defined?', type: 'checkbox', required: false },
    { id: 'specialNeeds', label: 'Do you support differentiation for special needs students?', type: 'checkbox', required: false },
    { id: 'philosophy', label: 'Describe your teaching philosophy', type: 'textarea', required: true },
    { id: 'methods', label: 'What instructional methods are used?', type: 'text', required: true },
    { id: 'assessment', label: 'What tools/methods do you use for assessment?', type: 'text', required: true },
    { id: 'lessonPlans', label: 'Are lesson plans or teacher guides provided?', type: 'checkbox', required: false },
    { id: 'progress', label: 'Do you track student progress or success metrics?', type: 'checkbox', required: false },
    { id: 'results', label: 'Can you share any results or achievements of your learners?', type: 'textarea', required: false },
  ],
  furniture: [
    { id: 'categories', label: 'What categories do you serve?', type: 'select', required: true, options: [
      { value: 'classroom', label: 'Classroom' },
      { value: 'office', label: 'Office' },
      { value: 'lab', label: 'Laboratory' },
      { value: 'sports', label: 'Sports' },
      { value: 'multiple', label: 'Multiple Categories' },
    ]},
    { id: 'modular', label: 'Are your products modular/customizable?', type: 'checkbox', required: false },
    { id: 'materials', label: 'What materials do you use?', type: 'text', required: true },
    { id: 'deliveryTime', label: 'What is your typical delivery time?', type: 'text', required: true },
    { id: 'installation', label: 'Do you handle installation or just supply?', type: 'select', required: true, options: [
      { value: 'installation', label: 'We handle installation' },
      { value: 'supply', label: 'Supply only' },
      { value: 'both', label: 'Both options available' },
    ]},
    { id: 'warranty', label: 'What is your return/warranty policy?', type: 'textarea', required: true },
    { id: 'certified', label: 'Are your products certified for safety (ISO, BIS)?', type: 'checkbox', required: false },
  ],
  books: [
    { id: 'bookTypes', label: 'What types of books do you provide?', type: 'select', required: true, options: [
      { value: 'textbooks', label: 'Textbooks' },
      { value: 'references', label: 'Reference Books' },
      { value: 'workbooks', label: 'Workbooks' },
      { value: 'fiction', label: 'Fiction' },
      { value: 'multiple', label: 'Multiple Types' },
    ]},
    { id: 'subjects', label: 'Which subjects do your books cover?', type: 'text', required: true },
    { id: 'gradeRange', label: 'What grade range do you cater to?', type: 'text', required: true },
    { id: 'languages', label: 'What languages are your books available in?', type: 'text', required: true },
    { id: 'digitalVersions', label: 'Do you offer e-books or digital versions?', type: 'checkbox', required: false },
    { id: 'bulkDiscounts', label: 'Do you offer bulk discounts for schools?', type: 'checkbox', required: true },
    { id: 'customization', label: 'Can you provide customized books for schools?', type: 'checkbox', required: false },
    { id: 'deliveryProcess', label: 'Describe your delivery process and timeline', type: 'textarea', required: true },
    { id: 'publishingStandards', label: 'What publishing standards do you follow?', type: 'text', required: true },
  ],
  uniforms: [
    { id: 'uniformTypes', label: 'What types of uniforms do you provide?', type: 'text', required: true },
    { id: 'customization', label: 'Do you offer customization options?', type: 'checkbox', required: true },
    { id: 'materials', label: 'What materials do you use?', type: 'text', required: true },
    { id: 'sizeRange', label: 'What size range do you offer?', type: 'text', required: true },
    { id: 'deliveryTime', label: 'What is your typical delivery time?', type: 'text', required: true },
    { id: 'minOrderQuantity', label: 'Is there a minimum order quantity?', type: 'text', required: true },
    { id: 'schoolBranding', label: 'Can you incorporate school logos and branding?', type: 'checkbox', required: true },
    { id: 'washingDurability', label: 'What is the washing durability of your uniforms?', type: 'text', required: true },
  ],
  transport: [
    { id: 'fleetSize', label: 'What is your fleet size?', type: 'number', required: true },
    { id: 'vehicleTypes', label: 'What types of vehicles do you operate?', type: 'text', required: true },
    { id: 'tracking', label: 'Do you offer GPS tracking and monitoring?', type: 'checkbox', required: true },
    { id: 'safetyMeasures', label: 'What safety measures do you implement?', type: 'textarea', required: true },
    { id: 'driverVetting', label: 'What driver vetting process do you follow?', type: 'textarea', required: true },
    { id: 'routeOptimization', label: 'Do you offer route optimization?', type: 'checkbox', required: false },
    { id: 'parentApp', label: 'Do you provide a parent app for tracking?', type: 'checkbox', required: false },
    { id: 'contractTypes', label: 'What contract types do you offer?', type: 'text', required: true },
  ],
  training: [
    { id: 'trainingType', label: 'What type of training do you provide?', type: 'text', required: true },
    { id: 'deliveryMethod', label: 'What is your delivery method?', type: 'select', required: true, options: [
      { value: 'inperson', label: 'In-person' },
      { value: 'online', label: 'Online' },
      { value: 'hybrid', label: 'Hybrid' },
    ]},
    { id: 'targetAudience', label: 'Who is your target audience for training?', type: 'text', required: true },
    { id: 'trainerQualifications', label: 'What are your trainers\' qualifications?', type: 'textarea', required: true },
    { id: 'certifications', label: 'Do you provide certifications after training?', type: 'checkbox', required: true },
    { id: 'customCurriculum', label: 'Can you provide a customized curriculum?', type: 'checkbox', required: true },
    { id: 'trainingDuration', label: 'What is the typical duration of your training?', type: 'text', required: true },
    { id: 'assessmentMethods', label: 'What assessment methods do you use?', type: 'text', required: true },
  ],
  erp: [
    { id: 'modules', label: 'What modules does your ERP system include?', type: 'text', required: true },
    { id: 'deployment', label: 'What is your deployment model?', type: 'select', required: true, options: [
      { value: 'cloud', label: 'Cloud-based' },
      { value: 'onpremise', label: 'On-premise' },
      { value: 'hybrid', label: 'Hybrid' },
    ]},
    { id: 'mobileFriendly', label: 'Is your system mobile-friendly?', type: 'checkbox', required: true },
    { id: 'integration', label: 'What integrations do you support?', type: 'text', required: true },
    { id: 'dataExport', label: 'Does your system allow data export?', type: 'checkbox', required: true },
    { id: 'multiSchool', label: 'Can your system handle multiple schools/campuses?', type: 'checkbox', required: true },
    { id: 'supportHours', label: 'What are your support hours?', type: 'text', required: true },
    { id: 'implementationTime', label: 'What is the typical implementation time?', type: 'text', required: true },
    { id: 'userTraining', label: 'Do you provide user training?', type: 'checkbox', required: true },
  ],
};

const ComprehensiveSupplierForm: React.FC<ComprehensiveSupplierFormProps> = ({ 
  initialValues, 
  onSuccess,
  mode = 'create' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    org_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    
    // Business Details
    company_type: '',
    supplier_type: '',
    year_started: new Date().getFullYear(),
    hq_city: '',
    gst_number: '',
    
    // Descriptions
    short_desc: '',
    full_desc: '',
    pitch: '',
    
    // Coverage
    states_covered: '',
    operational_cities: '',
    
    // Service Details
    service_details: {} as ServiceDetails,
    
    // Target Audience
    audience_students: false,
    audience_teachers: false,
    audience_parents: false,
    audience_schools: false,
    
    // Institution Types
    inst_k12: false,
    inst_higher_ed: false,
    inst_preschool: false,
    inst_coaching: false,
    inst_other: false,
    
    // Education Boards
    board_cbse: false,
    board_icse: false,
    board_state: false,
    board_cambridge: false,
    board_ib: false,
    board_other: false,
    
    // Business Policies
    payment_modes: '',
    refund_policy: '',
    annual_contracts: false,
    discounts: false,
    
    // Additional
    additional_info: '',
    brochure_url: '',
    
    // System fields
    status: 'pending',
    user_id: user?.id || '',
    submission_date: new Date().toISOString(),
  });

  useEffect(() => {
    if (initialValues) {
      // Parse service_details if it's a string
      const serviceDetails = typeof initialValues.service_details === 'string' 
        ? JSON.parse(initialValues.service_details)
        : initialValues.service_details;

      setFormData(prev => ({
        ...prev,
        ...initialValues,
        service_details: serviceDetails || getDefaultServiceDetails(initialValues.supplier_type)
      }));
    }
  }, [initialValues]);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'supplier_type' && value !== formData.supplier_type) {
      // When supplier type changes, reset service details to default for new type
      setFormData(prev => ({
        ...prev,
        [field]: value,
        service_details: getDefaultServiceDetails(value)
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    }

    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getDefaultServiceDetails = (type: string): ServiceDetails => {
    const baseDetails = {
      services_offered: [],
      product_categories: [],
      pricing_model: '',
      implementation_time: '',
      trial_period: '',
      minimum_order: '',
      delivery_time: '',
      support_channels: [],
      training_provided: false,
      customization_available: false,
      demo_available: false,
    };

    switch (type) {
      case 'edtech':
        return {
          ...baseDetails,
          platform: 'web',
          tech_stack: '',
          problem_solving: '',
          key_features: '',
          integrations: '',
          user_count: 0,
          sso_support: false,
          support: '',
          data_compliance: false,
        } as EdTechServiceDetails;
      
      case 'curriculum':
        return {
          ...baseDetails,
          standards: '',
          grades: '',
          subjects: '',
          objectives: false,
          special_needs: false,
          philosophy: '',
          methods: '',
          assessment: '',
          lesson_plans: false,
          progress: false,
          results: '',
        } as CurriculumServiceDetails;
      
      // ... Add other type-specific defaults ...
      
      default:
        return baseDetails as ServiceDetails;
    }
  };

  const getServiceDetails = (): ServiceDetails => {
    if (!formData.service_details) {
      return getDefaultServiceDetails(formData.supplier_type);
    }

    try {
      // Parse service details from string if needed
      const details = typeof formData.service_details === 'string' 
        ? JSON.parse(formData.service_details)
        : formData.service_details;

      // Get the type-specific fields from SupplierForm
      const typeFields = typeSpecificFields[formData.supplier_type] || [];
      
      // Create a properly mapped service details object
      const mappedDetails: any = {
        services_offered: details.services_offered || [],
        product_categories: details.product_categories || [],
        pricing_model: details.pricing_model || '',
        implementation_time: details.implementation_time || '',
        trial_period: details.trial_period || '',
        minimum_order: details.minimum_order || '',
        delivery_time: details.delivery_time || '',
        support_channels: details.support_channels || [],
        training_provided: details.training_provided || false,
        customization_available: details.customization_available || false,
        demo_available: details.demo_available || false,
      };

      // Map the type-specific fields from the database to our form structure
      typeFields.forEach((field: any) => {
        // Convert field names from camelCase to snake_case for database compatibility
        const dbFieldName = field.id.replace(/([A-Z])/g, '_$1').toLowerCase();
        // Try both camelCase and snake_case versions of the field name
        mappedDetails[field.id] = details[dbFieldName] || details[field.id] || '';
      });

      // Add type-specific default values if they're missing
      switch (formData.supplier_type) {
        case 'edtech':
          return {
            ...mappedDetails,
            platform: mappedDetails.platform || 'web',
            tech_stack: mappedDetails.tech_stack || '',
            problem_solving: mappedDetails.problem_solving || '',
            key_features: mappedDetails.key_features || '',
            integrations: mappedDetails.integrations || '',
            user_count: mappedDetails.user_count || 0,
            sso_support: mappedDetails.sso_support || false,
            support: mappedDetails.support || '',
            data_compliance: mappedDetails.data_compliance || false,
          } as EdTechServiceDetails;
        
        case 'curriculum':
          return {
            ...mappedDetails,
            standards: mappedDetails.standards || '',
            grades: mappedDetails.grades || '',
            subjects: mappedDetails.subjects || '',
            objectives: mappedDetails.objectives || false,
            special_needs: mappedDetails.special_needs || false,
            philosophy: mappedDetails.philosophy || '',
            methods: mappedDetails.methods || '',
            assessment: mappedDetails.assessment || '',
            lesson_plans: mappedDetails.lesson_plans || false,
            progress: mappedDetails.progress || false,
            results: mappedDetails.results || '',
          } as CurriculumServiceDetails;
        
        // Add other type-specific mappings here...
        
        default:
          return mappedDetails as ServiceDetails;
      }
    } catch (error) {
      console.error('Error parsing service details:', error);
      return getDefaultServiceDetails(formData.supplier_type);
    }
  };

  const handleServiceDetailChange = (field: string, value: any) => {
    const currentDetails = getServiceDetails();
    const updatedDetails = {
      ...currentDetails,
      [field]: value
    };

    // Convert the field name to snake_case for database storage
    const dbFieldName = field.replace(/([A-Z])/g, '_$1').toLowerCase();
    const dbDetails = {
      ...currentDetails,
      [dbFieldName]: value
    };

    handleInputChange('service_details', dbDetails);
  };

  const handleArrayFieldChange = (field: keyof ServiceDetails, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    handleServiceDetailChange(field, array);
  };

  // Add brochure upload function
  const uploadBrochure = async () => {
    if (!brochureFile) return null;
    
    try {
      // Create a unique file name
      const fileExt = brochureFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `brochures/${fileName}`;
      
      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('supplier-docs')
        .upload(filePath, brochureFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }
      
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('supplier-docs')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error in upload process:', error);
      return null;
    }
  };

  // Add file change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBrochureFile(file);
  };

  // Update handleSubmit to include brochure upload
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload brochure if provided
      let brochureUrl = formData.brochure_url;
      if (brochureFile) {
        brochureUrl = await uploadBrochure();
      }

      // Prepare data for submission
      const submissionData = {
        ...formData,
        user_id: user?.id || '',
        submission_date: mode === 'create' ? new Date().toISOString() : formData.submission_date,
        brochure_url: brochureUrl,
        // Ensure service_details is properly stringified if it's an object
        service_details: typeof formData.service_details === 'object' 
          ? JSON.stringify(formData.service_details)
          : formData.service_details
      };

      if (mode === 'edit' && initialValues?.id) {
        // Update existing application
        const { error } = await supabase
          .from('supplier_applications')
          .update(submissionData)
          .eq('id', initialValues.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your application has been updated successfully",
        });
      } else {
        // Create new application
        const { error } = await supabase
          .from('supplier_applications')
          .insert([submissionData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your application has been submitted successfully",
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while submitting your application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const supplierTypes = [
    { value: 'edtech', label: 'EdTech' },
    { value: 'curriculum', label: 'Curriculum' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'transport', label: 'Transport' },
    { value: 'training', label: 'Training' },
    { value: 'erp', label: 'ERP Software' },
    { value: 'books', label: 'Books' },
    { value: 'uniforms', label: 'Uniforms' }
  ];

  const companyTypes = [
    { value: 'pvt_ltd', label: 'Private Limited' },
    { value: 'public_ltd', label: 'Public Limited' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'proprietorship', label: 'Proprietorship' },
    { value: 'llp', label: 'LLP' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide your organization's basic contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="org_name">Organization Name *</Label>
                  <Input
                    id="org_name"
                    value={formData.org_name}
                    onChange={(e) => handleInputChange('org_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_name">Contact Person Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="short_desc">Short Description *</Label>
                <Textarea
                  id="short_desc"
                  value={formData.short_desc}
                  onChange={(e) => handleInputChange('short_desc', e.target.value)}
                  placeholder="Brief description of your organization (max 200 characters)"
                  maxLength={200}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="full_desc">Full Description *</Label>
                <Textarea
                  id="full_desc"
                  value={formData.full_desc}
                  onChange={(e) => handleInputChange('full_desc', e.target.value)}
                  placeholder="Detailed description of your organization and services"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Details Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Business Details
              </CardTitle>
              <CardDescription>
                Information about your business structure and credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_type">Supplier Type *</Label>
                  <Select 
                    value={formData.supplier_type} 
                    onValueChange={(value) => handleInputChange('supplier_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier type" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="company_type">Company Type *</Label>
                  <Select value={formData.company_type} onValueChange={(value) => handleInputChange('company_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="year_started">Year Started *</Label>
                  <Input
                    id="year_started"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.year_started}
                    onChange={(e) => handleInputChange('year_started', parseInt(e.target.value) || new Date().getFullYear())}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={formData.gst_number}
                    onChange={(e) => handleInputChange('gst_number', e.target.value)}
                    placeholder="15-digit GST number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hq_city">Headquarters City *</Label>
                  <Input
                    id="hq_city"
                    value={formData.hq_city}
                    onChange={(e) => handleInputChange('hq_city', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pitch">Elevator Pitch</Label>
                <Textarea
                  id="pitch"
                  value={formData.pitch}
                  onChange={(e) => handleInputChange('pitch', e.target.value)}
                  placeholder="Your compelling elevator pitch (max 300 characters)"
                  maxLength={300}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Service Details
              </CardTitle>
              <CardDescription>
                Detailed information about your services and offerings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const serviceDetails = getServiceDetails();
                const typeFields = typeSpecificFields[formData.supplier_type] || [];
                
                return (
                  <>
                    {/* Type-Specific Fields */}
                    {typeFields.length > 0 && (
                      <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">
                          {formData.supplier_type.charAt(0).toUpperCase() + formData.supplier_type.slice(1)} Specific Details
                        </h3>
                        <div className="space-y-6">
                          {typeFields.map((field) => (
                            <div key={field.id} className="space-y-2">
                              {field.type === 'select' ? (
              <div>
                                  <Label htmlFor={field.id}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  <Select
                                    value={serviceDetails[field.id] || ''}
                                    onValueChange={(value) => handleServiceDetailChange(field.id, value)}
                                  >
                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                                      {field.options?.map((option: any) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                    </SelectContent>
                  </Select>
                </div>
                              ) : field.type === 'textarea' ? (
                <div>
                                  <Label htmlFor={field.id}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  <Textarea
                                    id={field.id}
                                    value={serviceDetails[field.id] || ''}
                                    onChange={(e) => handleServiceDetailChange(field.id, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    required={field.required}
                  />
                </div>
                              ) : field.type === 'checkbox' ? (
                                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                                  <Checkbox
                                    id={field.id}
                                    checked={!!serviceDetails[field.id]}
                                    onCheckedChange={(checked) => handleServiceDetailChange(field.id, checked)}
                                  />
                                  <Label htmlFor={field.id} className="text-sm font-normal">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                </div>
                              ) : (
                <div>
                                  <Label htmlFor={field.id}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                  <Input
                                    id={field.id}
                                    type={field.type}
                                    value={serviceDetails[field.id] || ''}
                                    onChange={(e) => handleServiceDetailChange(field.id, 
                                      field.type === 'number' ? Number(e.target.value) : e.target.value
                                    )}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    required={field.required}
                  />
                </div>
                              )}
                </div>
                          ))}
              </div>
              </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Service Coverage
              </CardTitle>
              <CardDescription>
                Define your geographical service coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="states_covered">States Covered *</Label>
                <Textarea
                  id="states_covered"
                  value={formData.states_covered}
                  onChange={(e) => handleInputChange('states_covered', e.target.value)}
                  placeholder="List states where you provide services (comma-separated)"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="operational_cities">Operational Cities *</Label>
                <Textarea
                  id="operational_cities"
                  value={formData.operational_cities}
                  onChange={(e) => handleInputChange('operational_cities', e.target.value)}
                  placeholder="List cities where you have operations (comma-separated)"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Educational Profile
              </CardTitle>
              <CardDescription>
                Specify your target audience and educational focus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Audience */}
              <div>
                <Label className="text-base font-medium">Target Audience *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[
                    { key: 'audience_students', label: 'Students' },
                    { key: 'audience_teachers', label: 'Teachers' },
                    { key: 'audience_parents', label: 'Parents' },
                    { key: 'audience_schools', label: 'Schools' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) => handleInputChange(item.key, checked)}
                      />
                      <Label htmlFor={item.key}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution Types */}
              <div>
                <Label className="text-base font-medium">Institution Types *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {[
                    { key: 'inst_k12', label: 'K-12 Schools' },
                    { key: 'inst_higher_ed', label: 'Higher Education' },
                    { key: 'inst_preschool', label: 'Preschool' },
                    { key: 'inst_coaching', label: 'Coaching Centers' },
                    { key: 'inst_other', label: 'Other' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) => handleInputChange(item.key, checked)}
                      />
                      <Label htmlFor={item.key}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Boards */}
              <div>
                <Label className="text-base font-medium">Education Boards Supported</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {[
                    { key: 'board_cbse', label: 'CBSE' },
                    { key: 'board_icse', label: 'ICSE' },
                    { key: 'board_state', label: 'State Boards' },
                    { key: 'board_cambridge', label: 'Cambridge' },
                    { key: 'board_ib', label: 'IB' },
                    { key: 'board_other', label: 'Other' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.key}
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) => handleInputChange(item.key, checked)}
                      />
                      <Label htmlFor={item.key}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Business Policies
              </CardTitle>
              <CardDescription>
                Define your payment and business policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payment_modes">Payment Modes Accepted</Label>
                <Textarea
                  id="payment_modes"
                  value={formData.payment_modes}
                  onChange={(e) => handleInputChange('payment_modes', e.target.value)}
                  placeholder="e.g., Bank Transfer, Credit Card, UPI, Cheque"
                />
              </div>
              
              <div>
                <Label htmlFor="refund_policy">Refund Policy</Label>
                <Textarea
                  id="refund_policy"
                  value={formData.refund_policy}
                  onChange={(e) => handleInputChange('refund_policy', e.target.value)}
                  placeholder="Describe your refund policy"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="annual_contracts"
                    checked={formData.annual_contracts}
                    onCheckedChange={(checked) => handleInputChange('annual_contracts', checked)}
                  />
                  <Label htmlFor="annual_contracts">Offer Annual Contracts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="discounts"
                    checked={formData.discounts}
                    onCheckedChange={(checked) => handleInputChange('discounts', checked)}
                  />
                  <Label htmlFor="discounts">Provide Volume Discounts</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional Tab */}
        <TabsContent value="additional">
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Any additional details you'd like to share
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="brochure">Upload Product Brochure (PDF, Image)</Label>
                <div className="mt-2 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {brochureFile ? (
                        <>
                          <svg className="w-8 h-8 mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-700">
                            <span className="font-semibold">{brochureFile.name}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {(brochureFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, PNG, JPG (MAX. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input 
                      id="brochure" 
                      type="file" 
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>
                {uploadProgress > 0 && isSubmitting && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-teal h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                  </div>
                )}
                {formData.brochure_url && !brochureFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Current brochure: <a href={formData.brochure_url} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">View</a></p>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="additional_info">Additional Information</Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  placeholder="Any other information you'd like to share"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-teal hover:bg-teal-600 text-white px-8"
        >
          {isSubmitting ? 'Submitting...' : mode === 'edit' ? 'Update Application' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
};

export default ComprehensiveSupplierForm;
