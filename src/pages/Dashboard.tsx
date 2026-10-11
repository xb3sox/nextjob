import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Briefcase, FileText, TrendingUp, CheckCircle, Clock, ArrowRight, Settings, LogOut } from 'lucide-react';
import { analytics } from '../lib/analytics';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    analytics.track('dashboard_viewed');
  }, []);

  // Mock user data - TODO: Replace with actual auth context
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
  };

  // Mock stats - TODO: Replace with actual data
  const stats = [
    {
      label: 'Applications',
      value: '12',
      change: '+3 this week',
      icon: FileText,
      color: 'emerald',
    },
    {
      label: 'Interviews',
      value: '4',
      change: '+1 this week',
      icon: Briefcase,
      color: 'cyan',
    },
    {
      label: 'Success Rate',
      value: '33%',
      change: '+5% vs last month',
      icon: TrendingUp,
      color: 'amber',
    },
  ];

  // Mock recent activity - TODO: Replace with actual data
  const recentActivity = [
    {
      id: 1,
      type: 'application',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      status: 'submitted',
      date: '2 hours ago',
    },
    {
      id: 2,
      type: 'interview',
      title: 'Product Manager',
      company: 'Startup Inc',
      status: 'scheduled',
      date: 'Tomorrow, 2:00 PM',
    },
    {
      id: 3,
      type: 'application',
      title: 'Full Stack Developer',
      company: 'Digital Agency',
      status: 'interview',
      date: '3 days ago',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'interview':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'scheduled':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return FileText;
      case 'interview':
        return CheckCircle;
      case 'scheduled':
        return Clock;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Zap size={18} className="text-slate-900" />
              </div>
              <span className="text-lg font-bold">NextJob</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/settings"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={() => {
                  // TODO: Implement logout
                  navigate('/');
                }}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-emerald-400">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-white/60">Here's what's happening with your job search</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <span className="text-xs text-white/40">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/jobs"
              onClick={() => analytics.trackCTAClick('Find Jobs', 'dashboard')}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
            >
              <Briefcase className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold mb-1">Find Jobs</h3>
              <p className="text-sm text-white/60 mb-3">Discover opportunities that match your profile</p>
              <div className="flex items-center gap-2 text-sm text-emerald-400 group-hover:gap-3 transition-all">
                Browse jobs
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              to="/profile"
              onClick={() => analytics.trackCTAClick('Update Profile', 'dashboard')}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <FileText className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold mb-1">Update Profile</h3>
              <p className="text-sm text-white/60 mb-3">Keep your profile up to date with latest experience</p>
              <div className="flex items-center gap-2 text-sm text-cyan-400 group-hover:gap-3 transition-all">
                Edit profile
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              to="/applications"
              onClick={() => analytics.trackCTAClick('View Applications', 'dashboard')}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            >
              <TrendingUp className="w-8 h-8 text-amber-400 mb-3" />
              <h3 className="font-semibold mb-1">Track Applications</h3>
              <p className="text-sm text-white/60 mb-3">Monitor your applications and interview progress</p>
              <div className="flex items-center gap-2 text-sm text-amber-400 group-hover:gap-3 transition-all">
                View all
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link
              to="/applications"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {recentActivity.map((activity) => {
              const StatusIcon = getStatusIcon(activity.status);
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(activity.status)}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{activity.title}</h3>
                      <p className="text-sm text-white/60">{activity.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(activity.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      {activity.status}
                    </div>
                    <p className="text-xs text-white/40 mt-1">{activity.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
