import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Building2, CheckCircle2, Globe2, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBrowseClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to browse suppliers",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy to-navy-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted School & College Suppliers Network
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              The Backbones of India's Education System
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-teal hover:bg-teal-600 text-white"
              >
                <Link to={user ? "/suppliers" : "/login"}>
                  Browse Suppliers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link to="/join">Join as Supplier</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-navy mb-6">Who We Are</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              TSCSN is India's premier B2B platform uniting verified, trusted, and excellence-driven suppliers who serve schools, colleges, and educational institutions across the nation. From infrastructure and uniforms to labs, books, technology, and beyond—our network powers the foundation of quality education.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-navy mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To build a transparent, efficient, and reliable ecosystem where educational institutions can access pre-approved, top-tier vendors—ensuring quality, compliance, and long-term partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Why TSCSN Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-navy mb-8">Why TSCSN is the Backbone</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 text-teal" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Verified Suppliers Only</h3>
                      <p className="text-gray-600">Every vendor is quality-checked and reference-verified by school and college principals.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Building2 className="h-8 w-8 text-teal" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Education-Focused</h3>
                      <p className="text-gray-600">We understand academic timelines, budget constraints, and institutional needs.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Globe2 className="h-8 w-8 text-teal" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pan-India Network</h3>
                      <p className="text-gray-600">Serving urban, rural, and remote institutions with equal commitment.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Star className="h-8 w-8 text-teal" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Seamless Vendor Discovery</h3>
                      <p className="text-gray-600">Find the right partners based on location, category, and verified reviews.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-navy mb-8">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">For Institutions</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal mt-1" />
                      <span>One-click access to the most trusted vendors across 50+ categories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal mt-1" />
                      <span>Verified reviews by fellow principals & educators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal mt-1" />
                      <span>Transparent pricing, documentation, and contact information</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">For Vendors</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal mt-1" />
                      <span>Join an elite network recommended by education leaders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal mt-1" />
                      <span>Get direct B2B leads from verified institutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal mt-1" />
                      <span>Participate in exclusive review podcasts & showcase your credibility</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-navy mb-6">
              Built with the Support of India's Finest Principals
            </h2>
            <p className="text-lg text-gray-700">
              TSCSN is a recognized initiative under the Skill Bharat Association, powered by the Elite Principals Club—ensuring that only the most reliable and responsible suppliers are showcased.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">🌐 Join TSCSN Today</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">📌 For Institutions</h3>
                  <p className="text-gray-200 mb-4">
                    Stop wasting time on unreliable vendors. Join TSCSN and simplify your procurement process.
                  </p>
                  <Button
                    asChild
                    className="bg-teal hover:bg-teal-600 text-white w-full"
                  >
                    <Link to={user ? "/suppliers" : "/login"}>
                      Browse Suppliers
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">📌 For Suppliers</h3>
                  <p className="text-gray-200 mb-4">
                    Stand out as a verified, trusted partner. Build your brand across India's top schools and colleges.
                  </p>
                  <Button
                    asChild
                    className="bg-teal hover:bg-teal-600 text-white w-full"
                  >
                    <Link to="/join">Join as Supplier</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 