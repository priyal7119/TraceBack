import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Database, 
  Cloud, 
  Lock, 
  HelpCircle, 
  CheckCircle, 
  Compass, 
  Mail,
  Building2,
  GraduationCap,
  MapPin
} from 'lucide-react';

export const AboutUs = () => {
  const awsStack = [
    {
      name: 'Amazon Rekognition',
      role: 'Computer Vision & Deep Feature Extraction',
      description: 'Automatically analyzes uploaded item images from smartphones and campus cameras, detecting object categories, labels, dominant color palettes, and generating geometric vectors for high-precision similarity matching.',
      icon: Sparkles
    },
    {
      name: 'AWS Lambda',
      role: 'Serverless Event-Driven Microservices',
      description: 'Executes match algorithms instantly whenever a student or staff member files a lost or found report at HAMC, calculating spatial proximity across campus blocks with zero idle server overhead.',
      icon: Cpu
    },
    {
      name: 'Amazon DynamoDB',
      role: 'Single-Table NoSQL Storage Engine',
      description: 'Stores item metadata, user profiles, claims, and audit logs with single-digit millisecond latency and horizontal auto-scaling for campus events.',
      icon: Database
    },
    {
      name: 'Amazon S3',
      role: 'Presigned Media & Evidence Vault',
      description: 'Guarantees secure, temporary presigned client-side image uploads with AES-256 server-side encryption and granular access policies.',
      icon: Cloud
    },
    {
      name: 'Amazon API Gateway',
      role: 'Secure API Orchestration & Auth',
      description: 'Manages rate limiting, SSL termination, and JWT token authentication between the React client and serverless Lambda functions.',
      icon: Lock
    }
  ];

  const faqs = [
    {
      q: 'Who can use TraceBack at HAMC?',
      a: 'TraceBack is designed for the Vivekanand Education Society community at the Hashu Advani Memorial Complex (HAMC) in Chembur, Mumbai. This includes students, teaching faculty, non-teaching staff, and other authorized campus users.'
    },
    {
      q: 'Where are physically found items stored at HAMC?',
      a: 'Items found on campus are typically turned over to the HAMC Main Gate Security Cabin (Collector\'s Colony entrance), the Central Library Circulation Counter (2nd Floor), or the Campus Administration Office.'
    },
    {
      q: 'How does AI matching protect against fraudulent claims?',
      a: 'Private identification markers (such as engraved roll numbers, unique stickers, or internal markings) are concealed from public listings. Claimants must provide proof matching these hidden criteria before custodians approve release.'
    },
    {
      q: 'What happens if two students claim the same found item?',
      a: 'The item enters the Dispute Management queue. Campus custodians review timestamps, purchase invoices, and photographic evidence (such as live device pairing) to resolve ownership fairly.'
    },
    {
      q: 'How quickly does Amazon Rekognition process images?',
      a: 'Label and feature extraction runs in under 1.5 seconds upon image submission. Match notifications are generated immediately if a corresponding item is found in the campus catalog.'
    }
  ];

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-16 overflow-x-hidden">
      
      {/* Header Banner - Full width */}
      <section className="w-full bg-sand-200/60 border-b border-sand-300 py-16 sm:py-20 text-center">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-50 border border-sand-300 text-xs font-semibold text-olive mb-4">
            <Building2 className="w-3.5 h-3.5 text-terracotta" />
            <span>TraceBack – Campus Lost & Found</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-olive mb-4">
            Reuniting the HAMC Campus Community
          </h1>
          <p className="text-base sm:text-lg text-charcoal-light max-w-3xl mx-auto leading-relaxed">
            Serving students, faculty and staff at Hashu Advani Memorial Complex, Chembur. Powered by modern computer vision to ensure misplaced belongings find their way back.
          </p>
        </div>
      </section>

      {/* Campus Context & Mission - Full width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
              Campus Purpose
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-olive">
              Designed for Hashu Advani Memorial Complex
            </h2>
            <p className="text-sm sm:text-base text-charcoal-light leading-relaxed">
              Every academic year, hundreds of personal essentials—calculators, campus ID cards, lab coats, notebooks, and electronics—are misplaced across lecture halls, laboratory blocks, the central library, and the campus canteen at HAMC.
            </p>
            <p className="text-sm sm:text-base text-charcoal-light leading-relaxed">
              TraceBack bridges the gap between honest finders and anxious owners. Rather than relying solely on chaotic notice boards or scattered paper registers, TraceBack leverages Amazon Rekognition to match visual geometry, color signatures, and location attributes within the complex.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="btn-terracotta px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
              >
                Browse Campus Registry
              </Link>
              <Link
                to="/user/report-lost"
                className="btn-olive px-6 py-3 text-sm font-semibold"
              >
                Report Missing Property
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-warm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-sand-200">
              <div className="w-10 h-10 rounded-xl bg-olive flex items-center justify-center text-cream-100 font-bold">
                <ShieldCheck className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <h3 className="font-bold text-olive">HAMC Custody Standards</h3>
                <p className="text-xs text-charcoal-muted">Collector's Colony, R.C. Marg, Chembur</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-charcoal-light">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-olive flex-shrink-0 mt-0.5" />
                <span>Zero public exposure of student roll numbers, ID barcodes, or sensitive contact details.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-olive flex-shrink-0 mt-0.5" />
                <span>Dual verification: AI visual confidence score + campus custodial physical verification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-olive flex-shrink-0 mt-0.5" />
                <span>Dedicated custody points at Main Gate Security, Central Library, and Admin Office.</span>
              </li>
            </ul>

            <div className="p-3 bg-cream-50 rounded-xl border border-sand-200 text-xs text-charcoal-muted flex items-start gap-2">
              <MapPin className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
              <span>Hashu Advani Memorial Complex (HAMC), Collector's Colony, R.C. Marg, Chembur, Mumbai – 400074.</span>
            </div>
          </div>

        </div>
      </section>

      {/* Cloud Architecture Section - Full width */}
      <section className="w-full bg-sand-100/70 border-y border-sand-300 py-16">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-olive">
              Cloud Native Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-olive">
              Approved AWS Architecture
            </h2>
            <p className="text-sm text-charcoal-light">
              Built strictly with approved enterprise-grade AWS services for rapid visual matching and high data integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {awsStack.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="card-warm p-6 space-y-3 bg-cream-50">
                  <div className="w-10 h-10 rounded-xl bg-sand-200 flex items-center justify-center text-olive">
                    <Icon className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <h3 className="font-bold text-olive text-base">{service.name}</h3>
                    <p className="text-xs font-semibold text-terracotta">{service.role}</p>
                  </div>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs - Full width container */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-olive">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-charcoal-light">
              Everything you need to know about reporting, claiming, and campus verification at HAMC.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card-warm p-5 bg-cream-50">
                <h3 className="font-semibold text-olive text-sm sm:text-base flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-terracotta flex-shrink-0 mt-1" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-light mt-2 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Help Touchpoint */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full bg-sand-200/80 rounded-2xl p-6 sm:p-8 border border-sand-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-olive">Need assistance with a misplaced campus item?</h3>
            <p className="text-xs sm:text-sm text-charcoal-light">Contact the campus custodial administration or visit the Main Gate Security Cabin at HAMC.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support.hamc@traceback.org"
              className="btn-olive px-5 py-2.5 text-xs font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              <Mail className="w-4 h-4 text-terracotta" />
              Contact HAMC Custodians
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
