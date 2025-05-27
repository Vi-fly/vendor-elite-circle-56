import { motion } from 'framer-motion';
import React from 'react';

const Features: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h6 className="text-teal font-medium mb-2 uppercase tracking-wider">Why Choose TSCSN</h6>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            The Backbone of <span className="text-gold">India's Education System</span>
          </h2>
          <p className="text-gray-600 text-lg">
            We connect quality educational service providers with schools and institutions through our exclusive vetting process.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {/* Feature 1 */}
          <motion.div 
            variants={itemVariants}
            className="group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-200 hover:border-teal/30 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mb-6 group-hover:bg-teal/20 transition-all duration-300 group-hover:scale-110">
              <svg className="w-10 h-10 text-teal transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors duration-300">Verified Suppliers Only</h3>
            <p className="text-gray-600 mb-4">
              Every vendor is quality-checked and reference-verified by school and college principals.
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-teal to-teal-light rounded-full group-hover:w-24 transition-all duration-300"></div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={itemVariants}
            className="group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-200 hover:border-teal/30 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mb-6 group-hover:bg-teal/20 transition-all duration-300 group-hover:scale-110">
              <svg className="w-10 h-10 text-teal transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors duration-300">Education-Focused</h3>
            <p className="text-gray-600 mb-4">
              We understand academic timelines, budget constraints, and institutional needs.
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-teal to-teal-light rounded-full group-hover:w-24 transition-all duration-300"></div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            variants={itemVariants}
            className="group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-200 hover:border-teal/30 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mb-6 group-hover:bg-teal/20 transition-all duration-300 group-hover:scale-110">
              <svg className="w-10 h-10 text-teal transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors duration-300">Pan-India Network</h3>
            <p className="text-gray-600 mb-4">
              Serving urban, rural, and remote institutions with equal commitment.
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-teal to-teal-light rounded-full group-hover:w-24 transition-all duration-300"></div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            variants={itemVariants}
            className="group flex flex-col items-center text-center p-8 rounded-2xl border border-gray-200 hover:border-teal/30 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-20 h-20 rounded-2xl bg-teal/10 flex items-center justify-center mb-6 group-hover:bg-teal/20 transition-all duration-300 group-hover:scale-110">
              <svg className="w-10 h-10 text-teal transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy mb-3 group-hover:text-teal transition-colors duration-300">Seamless Vendor Discovery</h3>
            <p className="text-gray-600 mb-4">
              Find the right partners based on location, category, and verified reviews.
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-teal to-teal-light rounded-full group-hover:w-24 transition-all duration-300"></div>
          </motion.div>
        </motion.div>

        {/* What We Offer Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h6 className="text-teal font-medium mb-2 uppercase tracking-wider">Our Value Proposition</h6>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What We <span className="text-gold">Offer</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* For Institutions */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center group-hover:bg-teal/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-teal transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-navy">For Institutions</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "One-click access to the most trusted vendors across 50+ categories",
                  "Verified reviews by fellow principals & educators",
                  "Transparent pricing, documentation, and contact information"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 group"
                  >
                    <svg className="w-6 h-6 text-teal mt-1 transform group-hover:scale-110 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-navy transition-colors duration-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* For Vendors */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center group-hover:bg-teal/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-teal transform group-hover:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-navy">For Vendors</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Join an elite network recommended by education leaders",
                  "Get direct B2B leads from verified institutions",
                  "Participate in exclusive review podcasts & showcase your credibility"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 group"
                  >
                    <svg className="w-6 h-6 text-teal mt-1 transform group-hover:scale-110 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-navy transition-colors duration-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Recognition Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 bg-gradient-to-r from-navy to-navy-dark rounded-2xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Built with the Support of India's Finest Principals
            </h2>
            <p className="text-lg text-gray-200">
              TSCSN is a recognized initiative under the Skill Bharat Association, powered by the Elite Principals Club—ensuring that only the most reliable and responsible suppliers are showcased.
            </p>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-gradient-to-r from-navy to-navy-dark rounded-2xl p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGrid)" />
            </svg>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: "100+", label: "Verified Suppliers" },
              { value: "50+", label: "School Partners" },
              { value: "8", label: "Service Categories" },
              { value: "95%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="text-center group"
              >
                <motion.p 
                  className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-gold font-medium group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
