
import Layout from '@/components/layout/Layout';
import SupplierForm from '@/components/supplier/SupplierForm';

const JoinSupplier = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">
              Join Our <span className="text-teal">Elite Vendor Network</span>
            </h1>
            <p className="text-gray-600 mb-6">
              Complete the form below to submit your application as an education service provider. 
              Our team will review your submission and get back to you soon.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <svg className="w-6 h-6 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-800">Submission Process</h3>
                  <p className="text-sm text-blue-700">
                    After submission, your application will be reviewed by our team. Approval typically takes 2-3 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-teal-50 border-l-4 border-teal-500 rounded">
                <svg className="w-6 h-6 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-semibold text-teal-800">Multiple Service Types</h3>
                  <p className="text-sm text-teal-700">
                    We welcome all education-related service providers, from EdTech solutions to books, furniture, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <SupplierForm />
        </div>
      </div>
    </Layout>
  );
};

export default JoinSupplier;
