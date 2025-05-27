import { useAuth } from '@/components/auth/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the supplier type options
const supplierTypes = [
  { value: 'edtech', label: 'EdTech / Digital Learning' },
  { value: 'curriculum', label: 'Curriculum & Content' },
  { value: 'furniture', label: 'Furniture & Infrastructure' },
  { value: 'transport', label: 'Transport & Logistics' },
  { value: 'training', label: 'Training / Consulting' },
  { value: 'erp', label: 'School ERP / Admin Software' },
  { value: 'books', label: 'Books' },
  { value: 'uniforms', label: 'Uniforms' },
];

// Define the current year for validation
const currentYear = new Date().getFullYear();

// Basic info fields shown for all supplier types
const universalFields = [
  { id: 'orgName', label: 'Organization Name', type: 'text', required: true },
  { id: 'contactName', label: 'Contact Person Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: true },
  { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
  { id: 'website', label: 'Website URL', type: 'url', required: false },
  { id: 'linkedin', label: 'LinkedIn Profile', type: 'url', required: false },
  { id: 'yearStarted', label: 'Year Business Started', type: 'number', required: true, max: currentYear },
  { id: 'companyType', label: 'Company Type', type: 'select', required: true, options: [
    { value: 'private_limited', label: 'Private Limited' },
    { value: 'public_limited', label: 'Public Limited' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'proprietorship', label: 'Proprietorship' },
    { value: 'llp', label: 'LLP' },
    { value: 'startup', label: 'Startup' },
    { value: 'sme', label: 'SME (Small/Medium Enterprise)' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'trust', label: 'Trust/Society/NGO' },
    { value: 'other', label: 'Other' },
  ]},
  { id: 'gstNumber', label: 'GST Number (if applicable)', type: 'text', required: false },
  { id: 'hqCity', label: 'Headquarters City', type: 'text', required: true },
  { id: 'operationalCities', label: 'Operational Cities (comma separated)', type: 'text', required: true },
  { id: 'statesCovered', label: 'States Covered (comma separated)', type: 'text', required: true },
];

// Additional fields specific to each supplier type
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

// Common fields for pricing and payment section
const pricingFields = [
  { id: 'discounts', label: 'Do you offer volume-based discounts?', type: 'checkbox', required: false },
  { id: 'annualContracts', label: 'Any annual contract pricing options?', type: 'checkbox', required: false },
  { id: 'refundPolicy', label: 'Refund or cancellation policy', type: 'textarea', required: true },
];

// Description fields for all suppliers
const descriptionFields = [
  { id: 'pitch', label: 'One-line Pitch', type: 'text', required: true },
  { id: 'shortDesc', label: 'Short Business Description (200 characters)', type: 'textarea', required: true, maxLength: 200 },
  { id: 'fullDesc', label: 'Full Business Description', type: 'textarea', required: true },
];

// Form sections
const formSections = [
  { id: 'supplierType', title: 'Provider Type Selection', description: 'Select the type of service you provide' },
  { id: 'basic', title: 'Basic Information', description: 'Tell us about your organization' },
  { id: 'business', title: 'Business Details', description: 'Share your business specifics' },
  { id: 'location', title: 'Location Information', description: 'Where do you operate?' },
  { id: 'targeting', title: 'Target Audience', description: 'Who do you serve?' },
  { id: 'description', title: 'Business Description', description: 'Describe your offerings' },
  { id: 'typeSpecific', title: 'Service Specific Details', description: 'Tell us more about your specific services' },
  { id: 'pricing', title: 'Pricing & Payment', description: 'Payment and pricing information' },
  { id: 'brochure', title: 'Product Brochure', description: 'Share your product materials' },
];

const SupplierForm: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [supplierType, setSupplierType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit the supplier form",
        variant: "destructive",
      });
      navigate('/login'); // Redirect to login page
    }
  }, [user, toast, navigate]);

  // Function to handle field change
  const handleChange = (id: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when field is edited
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Function to handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBrochureFile(file);
  };

  // Navigation functions
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Function to validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Get fields for current step
    let fieldsToValidate: any[] = [];
    
    switch(formSections[currentStep].id) {
      case 'supplierType':
        if (!supplierType) {
          newErrors['supplierType'] = 'Please select a service type';
        }
        break;
      case 'basic':
        fieldsToValidate = universalFields.slice(0, 6);
        break;
      case 'business':
        fieldsToValidate = universalFields.slice(6, 10);
        // Validate year started is not in the future
        if (formData.yearStarted && parseInt(formData.yearStarted) > currentYear) {
          newErrors['yearStarted'] = `Year must be ${currentYear} or earlier`;
        }
        break;
      case 'location':
        fieldsToValidate = universalFields.slice(10, 13);
        break;
      case 'targeting': {
        // Special validation for checkbox groups
        let hasInstitution = false;
        let hasBoard = false;
        let hasAudience = false;
        
        // Check if at least one institution type is selected
        ['Preschool', 'K-12', 'Higher Ed', 'Coaching', 'Other'].forEach(type => {
          if (formData[`inst-${type}`]) {
            hasInstitution = true;
          }
        });
        
        // Check if at least one board type is selected
        ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'].forEach(board => {
          if (formData[`board-${board}`]) {
            hasBoard = true;
          }
        });
        
        // Check if at least one audience segment is selected
        ['Students', 'Teachers', 'Schools', 'Parents'].forEach(audience => {
          if (formData[`audience-${audience}`]) {
            hasAudience = true;
          }
        });
        
        if (!hasInstitution) {
          newErrors['institutionType'] = 'Please select at least one institution type';
        }
        
        if (!hasBoard) {
          newErrors['preferredBoard'] = 'Please select at least one board type';
        }
        
        if (!hasAudience) {
          newErrors['audienceSegment'] = 'Please select at least one audience segment';
        }
        
        return Object.keys(newErrors).length === 0;
      }
      case 'description':
        fieldsToValidate = descriptionFields;
        break;
      case 'typeSpecific':
        fieldsToValidate = supplierType && typeSpecificFields[supplierType] ? 
          typeSpecificFields[supplierType] : [];
        break;
      case 'pricing': {
        fieldsToValidate = pricingFields;
        // Validate at least one payment method is selected
        const hasPaymentMethod = ['Bank Transfer', 'UPI', 'Cheque', 'Credit Terms', 'Other'].some(method => 
          formData[`payment-${method}`]
        );
        if (!hasPaymentMethod) {
          newErrors['paymentMethods'] = 'Please select at least one payment method';
        }
        break;
      }
      case 'brochure':
        // Brochure is optional, no validation needed
        return true;
    }
    
    // Validate required fields
    fieldsToValidate.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Validate year field if it's in the current set of fields
      if (field.id === 'yearStarted' && formData[field.id]) {
        const year = parseInt(formData[field.id]);
        const currentYear = new Date().getFullYear();
        if (year > currentYear) {
          newErrors[field.id] = `Year must be ${currentYear} or earlier`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to upload brochure file to Supabase Storage
  const uploadBrochure = async () => {
    if (!brochureFile) return null;
    
    try {
      // Create a unique file name
      const fileExt = brochureFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `brochures/${fileName}`;
      
      // Upload the file - no need to check for authentication as per storage policy
      const { error: uploadError, data } = await supabase.storage
        .from('supplier-docs')
        .upload(filePath, brochureFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error("Failed to upload brochure. Please try again.");
      }
      
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('supplier-docs')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error in upload process:', error);
      throw error;
    }
  };

  // Submit form function - updated to handle authentication better
  const handleSubmit = async () => {
    if (!validateStep()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit the form",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      // Upload brochure if provided
      let brochureUrl = null;
      if (brochureFile) {
        try {
          brochureUrl = await uploadBrochure();
        } catch (uploadError) {
          console.error('Brochure upload error:', uploadError);
          toast({
            title: "Brochure Upload Failed",
            description: "Failed to upload brochure. Please try again or submit without a brochure.",
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare service-specific details as JSON object
      const serviceDetails = {};
      if (supplierType && typeSpecificFields[supplierType]) {
        typeSpecificFields[supplierType].forEach((field: any) => {
          if (formData[field.id] !== undefined) {
            serviceDetails[field.id] = formData[field.id];
          }
        });
      }

      // Create payment_modes string from individual payment method fields
      const selectedPaymentMethods = ['Bank Transfer', 'UPI', 'Cheque', 'Credit Terms', 'Other']
        .filter(method => formData[`payment-${method}`])
        .join(', ');

      // Prepare data for insertion
      const applicationData = {
        user_id: user.id,
        supplier_type: supplierType,
        org_name: formData.orgName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || null,
        linkedin: formData.linkedin || null,
        year_started: parseInt(formData.yearStarted),
        company_type: formData.companyType,
        gst_number: formData.gstNumber || null,
        hq_city: formData.hqCity,
        operational_cities: formData.operationalCities,
        states_covered: formData.statesCovered,

        // Institutions served
        inst_preschool: formData['inst-Preschool'] || false,
        inst_k12: formData['inst-K-12'] || false,
        inst_higher_ed: formData['inst-Higher Ed'] || false,
        inst_coaching: formData['inst-Coaching'] || false,
        inst_other: formData['inst-Other'] || false,

        // Boards served
        board_cbse: formData['board-CBSE'] || false,
        board_icse: formData['board-ICSE'] || false,
        board_state: formData['board-State Board'] || false,
        board_ib: formData['board-IB'] || false,
        board_cambridge: formData['board-Cambridge'] || false,
        board_other: formData['board-Other'] || false,

        // Audiences
        audience_students: formData['audience-Students'] || false,
        audience_teachers: formData['audience-Teachers'] || false,
        audience_schools: formData['audience-Schools'] || false,
        audience_parents: formData['audience-Parents'] || false,

        // Business descriptions
        pitch: formData.pitch,
        short_desc: formData.shortDesc,
        full_desc: formData.fullDesc,

        // Service specific details
        service_details: serviceDetails,

        // Payment methods - Using payment_modes field expected by the database
        payment_modes: selectedPaymentMethods || 'None specified',

        // Other pricing info
        discounts: formData.discounts || false,
        annual_contracts: formData.annualContracts || false,
        refund_policy: formData.refundPolicy,

        // Other fields
        additional_info: formData.additionalInfo || null,
        brochure_url: brochureUrl,

        // Status (default set in database)
        status: 'pending',
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('supplier_applications')
        .insert(applicationData)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Submission Successful!",
        description: "Your supplier information has been submitted and is pending review.",
      });

      navigate('/submission-success');

    } catch (error) {
      console.error('Form submission error:', error);
      
      let errorMessage = "There was an error submitting your information. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message.includes("RLS")
          ? "Permission denied. Please ensure you're logged in and have proper authorization."
          : error.message;
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Render form fields based on type
  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : 'input-animated'}
              required={field.required}
              max={field.max}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : 'input-animated'}
              maxLength={field.maxLength}
              required={field.required}
            />
            {field.maxLength && (
              <p className="text-xs text-gray-500 mt-1">
                {((formData[field.id] || '').length)} / {field.maxLength}
              </p>
            )}
            {errors[field.id] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={formData[field.id] || ''}
              onValueChange={(value) => handleChange(field.id, value)}
            >
              <SelectTrigger className={errors[field.id] ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
            )}
          </div>
        );
        
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2 pt-4">
            <Checkbox
              id={field.id}
              checked={!!formData[field.id]}
              onCheckedChange={(checked) => handleChange(field.id, !!checked)}
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render fields based on current step
  const renderStepFields = () => {
    const section = formSections[currentStep];
    
    switch (section.id) {
      case 'supplierType':
        return (
          <div className="space-y-4">
            <Label htmlFor="supplierType">
              Select Your Service Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={supplierType}
              onValueChange={setSupplierType}
            >
              <SelectTrigger className={errors['supplierType'] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your service type" />
              </SelectTrigger>
              <SelectContent>
                {supplierTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors['supplierType'] && (
              <p className="text-red-500 text-xs mt-1">{errors['supplierType']}</p>
            )}
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-700">
                This selection will determine which additional questions you'll need to answer later in the form.
                You can always come back and change this if needed.
              </p>
            </div>
          </div>
        );
        
      case 'basic':
        return universalFields.slice(0, 6).map(renderField);
        
      case 'business':
        return universalFields.slice(6, 10).map(renderField);
        
      case 'location':
        return universalFields.slice(10, 13).map(renderField);
        
      case 'targeting':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="institutionType">
                Type of Institutions Served <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['Preschool', 'K-12', 'Higher Ed', 'Coaching', 'Other'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`inst-${type}`}
                      checked={formData[`inst-${type}`] || false}
                      onCheckedChange={(checked) => handleChange(`inst-${type}`, !!checked)}
                    />
                    <Label htmlFor={`inst-${type}`} className="text-sm font-normal">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
              {errors['institutionType'] && (
                <p className="text-red-500 text-xs mt-1">{errors['institutionType']}</p>
              )}
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="preferredBoard">
                Preferred Board <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'].map((board) => (
                  <div key={board} className="flex items-center space-x-2">
                    <Checkbox
                      id={`board-${board}`}
                      checked={formData[`board-${board}`] || false}
                      onCheckedChange={(checked) => handleChange(`board-${board}`, !!checked)}
                    />
                    <Label htmlFor={`board-${board}`} className="text-sm font-normal">
                      {board}
                    </Label>
                  </div>
                ))}
              </div>
              {errors['preferredBoard'] && (
                <p className="text-red-500 text-xs mt-1">{errors['preferredBoard']}</p>
              )}
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="audienceSegment">
                Audience Segment <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-4">
                {['Students', 'Teachers', 'Schools', 'Parents'].map((audience) => (
                  <div key={audience} className="flex items-center space-x-2">
                    <Checkbox
                      id={`audience-${audience}`}
                      checked={formData[`audience-${audience}`] || false}
                      onCheckedChange={(checked) => handleChange(`audience-${audience}`, !!checked)}
                    />
                    <Label htmlFor={`audience-${audience}`} className="text-sm font-normal">
                      {audience}
                    </Label>
                  </div>
                ))}
              </div>
              {errors['audienceSegment'] && (
                <p className="text-red-500 text-xs mt-1">{errors['audienceSegment']}</p>
              )}
            </div>
          </>
        );
        
      case 'description':
        return descriptionFields.map(renderField);
        
      case 'typeSpecific':
        if (!supplierType || !typeSpecificFields[supplierType] || typeSpecificFields[supplierType].length === 0) {
          return (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                <h3 className="font-semibold text-amber-800">No additional questions</h3>
                <p className="text-sm text-amber-700 mt-1">
                  There are no additional questions for your selected service type. 
                  You can proceed to the next step.
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(0)}
                className="mt-4"
              >
                Change Service Type
              </Button>
            </div>
          );
        }
        
        // If type is selected and has fields, show type-specific fields
        return typeSpecificFields[supplierType]?.map(renderField) || [];
        
      case 'pricing':
        return (
          <>
            <div className="space-y-2 mb-6">
              <Label htmlFor="paymentMethods">
                Payment Methods Accepted <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {['Bank Transfer', 'UPI', 'Cheque', 'Credit Terms', 'Other'].map((method) => (
                  <div key={method} className="flex items-center space-x-2 bg-white p-3 rounded-md border hover:shadow-sm transition-shadow">
                    <Checkbox
                      id={`payment-${method}`}
                      checked={formData[`payment-${method}`] || false}
                      onCheckedChange={(checked) => handleChange(`payment-${method}`, !!checked)}
                    />
                    <Label htmlFor={`payment-${method}`} className="text-sm font-normal">
                      {method}
                    </Label>
                  </div>
                ))}
              </div>
              {errors['paymentMethods'] && (
                <p className="text-red-500 text-xs mt-1">{errors['paymentMethods']}</p>
              )}
            </div>
            {pricingFields.map(renderField)}
          </>
        );
        
      case 'brochure':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="brochure">
                Upload Product Brochure (PDF, Image)
              </Label>
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
            </div>
            
            <div>
              <Label htmlFor="additionalInfo">Any additional information?</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Share any additional information that might be helpful"
                value={formData.additionalInfo || ''}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                className="input-animated mt-1"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / formSections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-gradient-to-r from-teal to-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Getting Started</span>
          <span>Step {currentStep + 1} of {formSections.length}</span>
          <span>Final Review</span>
        </div>
      </div>

      {/* Form card */}
      <Card className="border-0 shadow-xl animate-scale-in">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy">
              {formSections[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {formSections[currentStep].description}
            </p>
          </div>

          <div className="space-y-4">
            {renderStepFields()}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-teal text-teal hover:bg-teal-50"
            >
              Previous
            </Button>

            {currentStep === formSections.length - 1 ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-teal to-primary hover:from-teal-dark hover:to-primary text-white btn-animated"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-teal to-primary hover:from-teal-dark hover:to-primary text-white btn-animated"
              >
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierForm;
