import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Heart, Users, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import DonationMap from '@/components/DonationMap';
import { Donation } from '@/types';
import { getAvailableDonations } from '@/services/donationService';

const Home: React.FC = () => {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = React.useState<Donation[]>([]);

  React.useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await getAvailableDonations();
        setDonations(data);
      } catch (error) {
        console.error("Error fetching donations for map:", error);
      }
    };
    fetchDonations();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 aurora-bg opacity-40" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/50 backdrop-blur border border-primary/20 text-primary text-sm font-semibold mb-10 animate-fade-up shadow-sm">
              <Sparkles className="h-4 w-4 fill-primary" />
              <span className="tracking-wide uppercase text-xs">Reducing Food Waste Together</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-foreground mb-8 animate-fade-up leading-[1.1] tracking-tight" style={{ animationDelay: '0.1s' }}>
              Share Food,{' '}
              <span className="gradient-text relative inline-block">
                Share Hope
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Connect surplus food from <span className="font-semibold text-foreground">restaurants</span>, <span className="font-semibold text-foreground">events</span>, and <span className="font-semibold text-foreground">homes</span> with NGOs
              serving those in need. Eliminate hunger, reduce waste.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {/* Hero Buttons: Show loading, or dashboard, or sign-in */}
              {loading ? (
                <Button variant="ghost" size="xl" disabled className="w-full sm:w-auto h-14 px-8 border-2 bg-white/50 animate-pulse">
                  Loading...
                </Button>
              ) : currentUser ? (
                userData ? (
                  <Link to={userData.role === 'donor' ? '/donor/dashboard' : userData.role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard'}>
                    <Button variant="hero" size="xl" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="destructive" size="xl" onClick={() => window.location.reload()} className="w-full sm:w-auto h-14 px-8 shadow-xl">
                    Retry Loading Profile
                  </Button>
                )
              ) : (
                <>
                  <Link to="/signup">
                    <Button variant="hero" size="xl" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                      Get Started
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto text-lg h-14 px-8 border-2 hover:bg-muted/50 transition-all hover:-translate-y-1 bg-white/50 backdrop-blur">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div >
        </div >
      </section >

      {/* Live Impact Ticker */}
      < div className="bg-primary py-3 overflow-hidden whitespace-nowrap" >
        <div className="flex animate-scroll text-sm text-primary-foreground font-medium">
          {[1, 2, 3, 4].map((group) => (
            <div key={group} className="flex items-center gap-8 mx-4">
              <span className="flex items-center gap-2"><Sparkles className="h-3 w-3" /> 1,200+ meals saved this week</span>
              <span className="flex items-center gap-2">• New partner: Community Kitchen added</span>
              <span className="flex items-center gap-2"><Heart className="h-3 w-3" /> Top Donor: Green Eats Restaurant</span>
              <span className="flex items-center gap-2">• 50kg surplus food distributed today</span>
            </div>
          ))}
        </div>
      </div >

      {/* Map Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Live Donations Near You
          </h2>
          <p className="text-muted-foreground">
            Explore active food donations in your area and help bridge the gap.
          </p>
        </div>
        <div className="max-w-5xl mx-auto animate-fade-up">
          <DonationMap donations={donations} />
        </div>
      </section>

      {/* Stats Section */}
      < section className="py-16 bg-muted/30 relative" >
        <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '12,543', label: 'Meals Shared', icon: Heart, color: 'text-rose-500' },
              { value: '892', label: 'Active Donors', icon: Users, color: 'text-indigo-500' },
              { value: '143', label: 'NGO Partners', icon: Leaf, color: 'text-emerald-500' },
              { value: '28', label: 'Cities Covered', icon: MapPin, color: 'text-amber-500' }
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-sm mb-4 transform transition-transform group-hover:scale-110 duration-300 ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <p className="text-4xl font-display font-bold text-foreground mb-1 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How FoodShare Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A seamless ecosystem connecting donors, volunteers, and NGOs to fight hunger.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'List Surplus',
                description: 'Donors post food details and location in seconds.',
                icon: Sparkles,
                color: 'bg-primary/10 text-primary'
              },
              {
                step: '02',
                title: 'NGOs Accept',
                description: 'Local NGOs get notified and claim the donation.',
                icon: Heart,
                color: 'bg-rose-500/10 text-rose-600'
              },
              {
                step: '03',
                title: 'Volunteer Pickup',
                description: 'Volunteers or NGOs transport the food safely.',
                icon: MapPin,
                color: 'bg-amber-500/10 text-amber-600'
              },
              {
                step: '04',
                title: 'Impact Created',
                description: 'Food feeds the hungry, not the landfill.',
                icon: Leaf,
                color: 'bg-emerald-500/10 text-emerald-600'
              }
            ].map((item, index) => (
              <div key={index} className="glass-card rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform duration-300 animate-fade-up group" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      < section className="py-20 bg-background relative overflow-hidden" >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl opacity-50" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Community Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from the people making a real difference in our community using FoodShare.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "FoodShare made it incredibly easy for our restaurant to donate surplus food. Instead of throwing it away, we know it's going to someone who needs it.",
                author: "Sarah Johnson",
                role: "Restaurant Owner",
                initials: "SJ"
              },
              {
                quote: "The notification system is a game-changer. We can quickly accept donations and plan our distribution routes efficiently to reach more families.",
                author: "David Chen",
                role: "NGO Coordinator",
                initials: "DC"
              },
              {
                quote: "I hosted a large event and had so much leftover food. Within hours, a local shelter had picked it up. The process was seamless and rewarding.",
                author: "Emily Rodriguez",
                role: "Event Planner",
                initials: "ER"
              }
            ].map((item, index) => (
              <div key={index} className="glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 animate-fade-up" style={{ animationDelay: `${0.2 * index}s` }}>
                <div className="flex gap-1 mb-6 text-warning">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Sparkles key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 italic">"{item.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.author}</h4>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-20 bg-primary/5" >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Whether you're a restaurant with extra food or an NGO looking to serve your community,
              join FoodShare today and be part of the solution.
            </p>
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Join FoodShare Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section >

      {/* Team Section */}
      <section className="py-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-foreground mb-12">
            Meet the Team <span className="text-primary text-xl block mt-2 font-sans font-medium">Batch 3</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {[
              { name: "K. Jothilingam", id: "24506377", role: "Team Lead" },
              { name: "S. Jayanth", id: "24506374", role: "Developer" },
              { name: "V. Inbaraj", id: "24506373", role: "Developer" },
              { name: "V. Dharan", id: "24506357", role: "Developer" }
            ].map((member, index) => (
              <div
                key={index}
                className={`glass-card p-6 rounded-xl w-64 transition-all duration-300 animate-fade-up relative overflow-hidden group ${member.role === 'Team Lead'
                  ? 'border-primary/50 bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/10 scale-105 hover:scale-110 z-10'
                  : 'hover:scale-105'
                  }`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {member.role === 'Team Lead' && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="h-2 w-2" /> Lead
                    </div>
                  </div>
                )}

                <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${member.role === 'Team Lead' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-primary/10 text-primary'
                  }`}>
                  <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
                </div>

                <h3 className="font-bold text-foreground text-lg">{member.name}</h3>
                <p className="text-muted-foreground font-mono text-sm mt-1 mb-2">{member.id}</p>

                {member.role === 'Team Lead' && (
                  <div className="inline-block mt-2">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      Team Lead
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      < footer className="py-12 bg-foreground" >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-display font-bold text-background">FoodShare</span>
            </div>
            <p className="text-background/60 text-sm">
              © 2026 FoodShare. Reducing food waste, one meal at a time.
              <br />
              <span className="text-xs opacity-50">Powered by JS Corporations</span>
            </p>
          </div>
        </div>
      </footer >
    </div >
  );
};

export default Home;
