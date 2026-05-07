import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  Smartphone,
  FileText,
  Pill,
  Activity,
  Calendar,
  Lock,
  Cloud,
  BarChart3,
  Heart,
  Brain,
  Stethoscope,
  Thermometer,
  Eye,
  Cpu,
  Zap,
  ChevronRight,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'HIPAA Compliant Security',
      description: 'Enterprise-grade encryption and compliance for patient data protection.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Real-time Updates',
      description: 'Instant synchronization across all devices for critical patient information.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Team Collaboration',
      description: 'Seamless communication between doctors, nurses, and administrative staff.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Insights',
      description: 'Predictive analytics and intelligent suggestions for better patient outcomes.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Digital Records',
      description: 'Complete digitization of patient records with smart search capabilities.',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: 'Pharmacy Integration',
      description: 'Automated prescription tracking and medication management.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      quote: 'Our hospital efficiency increased by 40% after implementing CareSync.',
      avatar: 'SJ'
    },
    {
      name: 'Nurse Michael Chen',
      role: 'Head Nurse',
      quote: 'Mobile accessibility means I can update patient charts right at the bedside.',
      avatar: 'MC'
    },
    {
      name: 'Admin Robert Davis',
      role: 'Hospital Administrator',
      quote: 'Billing integration has reduced paperwork by 70% and improved accuracy.',
      avatar: 'RD'
    }
  ];

  const stats = [
    { label: 'Hospitals Trust Us', value: '250+' },
    { label: 'Patients Managed', value: '1.2M+' },
    { label: 'Avg. Time Saved', value: '3.5 hrs/day' },
    { label: 'Accuracy Rate', value: '99.8%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-primary-50/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Navigation Logo */}
            <div className="flex items-center space-x-2.5 md:space-x-3">
              <img 
                src="/caresync_logo.PNG" 
                alt="CareSync" 
                className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl"
              />
              <div className="flex items-baseline">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                  CareSync
                </span>
                <span className="text-xs font-medium text-primary-600 ml-1.5">EMR</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
              <Link 
                to="#features" 
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm hidden md:block"
              >
                Features
              </Link>
              <Link 
                to="#testimonials" 
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm hidden lg:block"
              >
                Testimonials
              </Link>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <Link 
                  to="/auth/login" 
                  className="text-gray-700 hover:text-primary-600 font-medium text-sm px-2 md:px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
                <Link 
                  to="/auth/register" 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow hover:shadow-md whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-emerald-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-emerald-100 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">Modern Healthcare Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                <span className="block">Transform</span>
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Patient Care
                </span>
                <span className="block">with Intelligent EMR</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl">
                CareSync combines advanced electronic medical records with AI-powered insights to revolutionize healthcare delivery, improve patient outcomes, and streamline clinical workflows.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth/register" className="group relative bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 overflow-hidden">
                  <span className="relative z-10">Start Free 30-Day Trial</span>
                  <ArrowRight className="h-5 w-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
                <Link to="#features" className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center justify-center space-x-3">
                  <span>See Features</span>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 pt-8">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-600">Cloud-Based</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="text-gray-600">AI-Powered</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-emerald-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-6 transform rotate-1">
                <div className="flex space-x-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">12,847</div>
                      <div className="text-sm text-blue-600 font-medium">Patients</div>
                      <div className="h-2 bg-blue-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-700">98.2%</div>
                      <div className="text-sm text-emerald-600 font-medium">Accuracy</div>
                      <div className="h-2 bg-emerald-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Live Patient Dashboard</div>
                        <div className="text-sm text-gray-500">Real-time monitoring and alerts</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">Appointments Today</div>
                      <div className="text-sm font-bold text-primary-600">24</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">Lab Results Pending</div>
                      <div className="text-sm font-bold text-amber-600">6</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">Prescriptions Ready</div>
                      <div className="text-sm font-bold text-emerald-600">18</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 transform -rotate-6">
                <div className="w-56 h-64 border-2 border-gray-200 rounded-3xl overflow-hidden">
                  <div className="h-12 bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    <div className="h-20 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl"></div>
                    <div className="flex space-x-3 justify-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600"></div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -left-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-8 w-8" />
                  <div>
                    <div className="font-bold">AI Assistant</div>
                    <div className="text-xs opacity-90">24/7 Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything Your <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Healthcare Team</span> Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for modern healthcare delivery with AI-powered insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:via-primary-500/5 group-hover:to-emerald-500/10 rounded-2xl blur transition-all duration-300"></div>
                <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-200 transition-all duration-300 group-hover:shadow-xl">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center text-primary-600 font-medium">
                      <span>Learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-emerald-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative">
                <div className="w-64 h-[32rem] bg-gradient-to-b from-primary-500 to-primary-700 rounded-[3rem] p-3 mx-auto">
                  <div className="bg-white h-full rounded-[2.5rem] p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                      <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-sm font-bold text-primary-700">CareSync Mobile</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-4 border border-primary-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">Patient Vitals</div>
                          <Activity className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="text-xs text-gray-500">Updated 5 min ago</div>
                        <div className="h-2 bg-primary-100 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full w-4/5"></div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">Medication Due</div>
                          <Pill className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="text-xs text-gray-500">2 alerts pending</div>
                        <div className="flex space-x-2 mt-2">
                          <div className="h-2 flex-1 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-2/3"></div>
                          </div>
                          <div className="h-2 flex-1 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-1/2"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">Appointments</div>
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-xs text-gray-500">3 scheduled today</div>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">DR</span>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">NS</span>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">PT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Stethoscope className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-cyan-100 px-4 py-2 rounded-full mb-4">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Mobile First</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Healthcare at Your <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">Fingertips</span>
                </h2>
              </div>
              
              <p className="text-xl text-gray-600">
                Access critical patient information anytime, anywhere. Our mobile-optimized interface ensures seamless operation on all devices.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Cross-Platform Sync</div>
                    <div className="text-gray-600">Real-time synchronization across all devices with offline capability</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Secure & Compliant</div>
                    <div className="text-gray-600">End-to-end encryption with HIPAA compliance on all devices</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Instant Updates</div>
                    <div className="text-gray-600">Push notifications for critical alerts and AI-powered insights</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to="/auth/register" className="inline-flex items-center text-primary-600 font-bold hover:text-primary-700 group">
                  <span>Start Mobile Experience</span>
                  <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-primary-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Healthcare Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of healthcare providers using CareSync to deliver exceptional patient care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:via-primary-500/5 group-hover:to-primary-500/10 rounded-2xl blur transition-all duration-300"></div>
                <div className="relative bg-white rounded-xl border border-gray-200 p-8 hover:border-primary-200 transition-all duration-300 group-hover:shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.avatar}</span>
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-primary-600 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic border-l-4 border-primary-500 pl-4 py-2">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex mt-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Heart key={star} className="h-5 w-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-emerald-500/10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-12 text-center shadow-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-6 py-2 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Limited Time Offer</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Practice?
            </h2>
            
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join the future of healthcare. Start your free 30-day trial with full access to all features. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/auth/register" className="group relative bg-white text-primary-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-0.5">
                <span>Start Free 30-Day Trial</span>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white to-white/50 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link to="/auth/login" className="px-10 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-200">
                Schedule a Demo
              </Link>
            </div>
            
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6 text-white/80">
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-5 w-5 text-emerald-300" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="h-5 w-5 text-emerald-300" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center justify-center space-x-2 md:col-span-1">
                <Check className="h-5 w-5 text-emerald-300" />
                <span>Full support included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <img 
                src="/caresync_logo.PNG" 
                alt="CareSync" 
                className="h-10 w-10 rounded-xl"
              />
                </div>
                <div>
                  <div className="text-xl font-bold">CareSync</div>
                  <div className="text-sm text-primary-300">EMR System</div>
                </div>
              </div>
              <p className="text-gray-400">
                Modern Electronic Medical Records system designed for healthcare excellence. Secure, intuitive, and reliable.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Mobile App</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">HIPAA Compliance</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} CareSync EMR. All rights reserved.</p>
            <p className="mt-2 text-sm">Built with ❤️ for better healthcare worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;