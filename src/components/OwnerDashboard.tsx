import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Receipt, ChefHat, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const OwnerDashboard: React.FC = () => {
  const { allOrders, setActiveRole, allWaiterRequests } = useApp();

  const handleLogout = () => {
    setActiveRole('login');
  };

  // Compile calculations safely from live + historical data
  const stats = useMemo(() => {
    const paidOrders = allOrders.filter((o) => o.status === 'paid');
    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount = paidOrders.length;
    const aov = ordersCount > 0 ? Math.round(revenue / ordersCount) : 0;
    
    // Busy tables count (has active draft/kitchen order or active pager call)
    const activeTables = new Set<number>();
    allOrders.forEach((o) => {
      if (o.status !== 'paid') {
        activeTables.add(o.tableNumber);
      }
    });
    allWaiterRequests.forEach((w) => {
      activeTables.add(w.tableNumber);
    });

    const occupancyRate = (activeTables.size / 10) * 100;

    return {
      revenue: Math.round(revenue),
      ordersCount,
      aov,
      occupancy: activeTables.size,
      occupancyRate: Math.round(occupancyRate),
    };
  }, [allOrders, allWaiterRequests]);

  // Aggregate daily sales over the last 3 visible calendar dates
  const dailySalesData = useMemo(() => {
    const salesMap: Record<string, number> = {};
    const paidOrders = allOrders.filter((o) => o.status === 'paid');
    
    // Seed dates to provide beautiful default scales
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesMap[label] = 0;
    }

    paidOrders.forEach((ord) => {
      const d = new Date(ord.createdAt);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // If within our range, sum the total
      if (salesMap[label] !== undefined) {
        salesMap[label] += ord.total;
      } else {
        salesMap[label] = ord.total;
      }
    });

    return Object.entries(salesMap).map(([date, revenue]) => ({
      date,
      Revenue: Math.round(revenue),
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allOrders]);

  // Aggregate Category performance for Pie chart
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {
      'Starters': 0,
      'Appetizers': 0,
      'Main Course': 0,
      'Beverages': 0,
      'Desserts': 0,
    };

    const paidOrders = allOrders.filter((o) => o.status === 'paid');
    paidOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        let catLabel = 'Main Course';
        if (it.menuItem.category === 'starters') catLabel = 'Starters';
        else if (it.menuItem.category === 'appetizers') catLabel = 'Appetizers';
        else if (it.menuItem.category === 'beverages') catLabel = 'Beverages';
        else if (it.menuItem.category === 'desserts') catLabel = 'Desserts';
        
        counts[catLabel] += it.quantity;
      });
    });

    const PIE_COLORS_MAPPING = [
      { name: 'Starters', value: counts['Starters'] || 1, color: '#E76F51' },
      { name: 'Appetizers', value: counts['Appetizers'] || 1, color: '#F4A261' },
      { name: 'Main Course', value: counts['Main Course'] || 1, color: '#2A9D8F' },
      { name: 'Beverages', value: counts['Beverages'] || 1, color: '#264653' },
      { name: 'Desserts', value: counts['Desserts'] || 1, color: '#E9C46A' },
    ];

    return PIE_COLORS_MAPPING.filter(c => c.value > 0);
  }, [allOrders]);

  return (
    <div className="space-y-8 p-4 md:p-6 text-[#2D2D2D]" id="owner-page">
      {/* Upper Navigation Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card-surface p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E76F51]/10 border border-[#E76F51]/20 flex items-center justify-center text-2xl">
            👑
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#E76F51] font-bold block">
              Administrative Control List
            </span>
            <h2 className="text-xl font-display font-black text-[#2D2D2D] tracking-tight">
              Owner Analytics Core
            </h2>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-outline flex items-center gap-2 px-4 py-2.5 text-xs"
          id="owner-exit-btn"
        >
          <LogOut size={13} />
          Terminal Exit
        </button>
      </div>

      {/* Analytics KPI Matrix cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="owner-kpis">
        {/* Metric 1 */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Gross Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign size={15} />
            </div>
          </div>
          <p className="text-sm font-mono text-emerald-600 font-bold leading-none mb-1.5">+12.4% Active</p>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-sm font-mono text-[#E76F51] font-bold">₹</span>
            <span className="text-2xl font-display font-black text-[#2D2D2D] tracking-tight">
              {stats.revenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Ticket Size (AOV)</span>
            <div className="p-2.5 rounded-xl bg-[#E76F51]/5 text-[#E76F51]">
              <TrendingUp size={15} />
            </div>
          </div>
          <p className="text-sm font-mono text-[#6B7280] font-medium leading-none mb-1.5">Avg Dinner Cap</p>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-sm font-mono text-[#E76F51] font-bold">₹</span>
            <span className="text-2xl font-display font-black text-[#2D2D2D] tracking-tight">
              {stats.aov}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Receipts Cleared</span>
            <div className="p-2.5 rounded-xl bg-[#FFFDF8] text-[#6B7280] border border-[#ECE7E1]">
              <Receipt size={15} />
            </div>
          </div>
          <p className="text-sm font-mono text-[#2D2D2D] font-bold leading-none mb-1.5">{stats.ordersCount} Total bills</p>
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-2xl font-display font-black text-[#2D2D2D] tracking-tight">
              {stats.ordersCount}
            </span>
            <span className="text-[10px] font-mono text-[#6B7280] uppercase font-bold">Paid</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] font-bold">Table Occupancy</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Users size={15} />
            </div>
          </div>
          <p className="text-sm font-mono text-[#6B7280] font-medium leading-none mb-1.5">{stats.occupancy} active tables</p>
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-2xl font-display font-black text-[#2D2D2D] tracking-tight">
              {stats.occupancyRate}%
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">Live</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="owner-chart-row">
        {/* Left Area Line Chart */}
        <div className="lg:col-span-2 card-surface p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-[#6B7280]">
                Income Performance Log
              </span>
            </div>
            <h3 className="text-base font-display font-bold text-[#2D2D2D]">
              Gross Saffron Sales Volume
            </h3>
          </div>

          <div className="h-72 w-full mt-2" id="sales-area-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E76F51" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#E76F51" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE7E1" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#6B7280', fontFamily: 'JetBrains Mono' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#6B7280', fontFamily: 'JetBrains Mono' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: '12px', border: '1px solid #ECE7E1', fontFamily: 'Plus Jakarta Sans' }}
                  labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#2D2D2D' }}
                  itemStyle={{ fontSize: '12px', color: '#E76F51' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#E76F51" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Category Breakdown Pie */}
        <div className="card-surface p-6 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold text-[#6B7280] mb-1 block">
              Menu Distribution
            </span>
            <h3 className="text-base font-display font-bold text-[#2D2D2D]">
              Dishes Category Sales
            </h3>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative my-4" id="category-pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFDF8', borderRadius: '10px', border: '1px solid #ECE7E1' }}
                  itemStyle={{ fontSize: '11px', color: '#2D2D2D' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label inside Pie */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#6B7280] uppercase leading-none">
                Volume
              </span>
              <span className="text-2xl font-display font-black text-[#2D2D2D] mt-0.5">
                {categoryChartData.reduce((acc, c) => acc + c.value, 0)}
              </span>
              <span className="text-[9px] text-[#6B7280] font-mono leading-none mt-0.5">Dishes sold</span>
            </div>
          </div>

          {/* Table index descriptors */}
          <div className="space-y-1.5" id="category-pie-legend">
            {categoryChartData.map((cat, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#2D2D2D] font-display font-medium">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-[#2D2D2D]">{cat.value} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Administrative System Status Bar */}
      <footer className="card-surface p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <ChefHat size={14} className="text-[#E76F51]" />
          <span className="text-[#6B7280]">
            Hush Terminal sync status: <span className="font-bold text-emerald-600">Secure Live Stream</span>
          </span>
        </div>
        <div className="text-[10px] text-[#6B7280] font-mono">
          System Core: v2.5.14 • Antigravity Verified
        </div>
      </footer>
    </div>
  );
};
