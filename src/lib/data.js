// Mock Data for Elite CRM

export const statsData = {
  totalRevenue: 4827650,
  totalLeads: 3847,
  activeUsers: 284,
  closedDeals: 193,
  conversionRate: 24.7,
  avgDealSize: 185000,
  revenueGrowth: 18.4,
  leadsGrowth: 12.1,
  dealsGrowth: 8.9,
  usersGrowth: 5.2,
};

export const revenueChartData = [
  { month: 'Jan', revenue: 320000, target: 300000, leads: 280 },
  { month: 'Feb', revenue: 385000, target: 320000, leads: 310 },
  { month: 'Mar', revenue: 410000, target: 380000, leads: 340 },
  { month: 'Apr', revenue: 390000, target: 400000, leads: 295 },
  { month: 'May', revenue: 460000, target: 420000, leads: 380 },
  { month: 'Jun', revenue: 520000, target: 450000, leads: 420 },
  { month: 'Jul', revenue: 495000, target: 480000, leads: 400 },
  { month: 'Aug', revenue: 580000, target: 500000, leads: 460 },
  { month: 'Sep', revenue: 610000, target: 520000, leads: 490 },
  { month: 'Oct', revenue: 590000, target: 550000, leads: 470 },
  { month: 'Nov', revenue: 650000, target: 580000, leads: 510 },
  { month: 'Dec', revenue: 715000, target: 620000, leads: 540 },
];

export const leadsBySourceData = [
  { name: 'Referral', value: 35, color: '#3b7eff' },
  { name: 'Website', value: 25, color: '#00d4aa' },
  { name: 'Social Media', value: 20, color: '#f59e0b' },
  { name: 'Cold Outreach', value: 12, color: '#8b5cf6' },
  { name: 'Events', value: 8, color: '#ef4444' },
];

export const dealsPipelineData = [
  { stage: 'Prospecting', count: 84, value: 8400000 },
  { stage: 'Qualified', count: 61, value: 7320000 },
  { stage: 'Proposal', count: 43, value: 6450000 },
  { stage: 'Negotiation', count: 27, value: 5940000 },
  { stage: 'Closed Won', count: 19, value: 4940000 },
];

export const weeklyActivityData = [
  { day: 'Mon', calls: 42, emails: 87, meetings: 12 },
  { day: 'Tue', calls: 58, emails: 102, meetings: 18 },
  { day: 'Wed', calls: 35, emails: 78, meetings: 9 },
  { day: 'Thu', calls: 67, emails: 124, meetings: 22 },
  { day: 'Fri', calls: 51, emails: 93, meetings: 15 },
  { day: 'Sat', calls: 18, emails: 34, meetings: 5 },
  { day: 'Sun', calls: 8, emails: 19, meetings: 2 },
];

export const users = [
  { id: 'USR001', name: 'Alexandra Chen', email: 'a.chen@elitecrm.com', role: 'Admin', status: 'Active', department: 'Management', lastLogin: '2024-01-15 09:32', joinDate: '2021-03-15', dealsOwned: 47, avatar: 'AC' },
  { id: 'USR002', name: 'Marcus Thompson', email: 'm.thompson@elitecrm.com', role: 'Manager', status: 'Active', department: 'Sales', lastLogin: '2024-01-15 11:15', joinDate: '2021-07-22', dealsOwned: 38, avatar: 'MT' },
  { id: 'USR003', name: 'Priya Patel', email: 'p.patel@elitecrm.com', role: 'Agent', status: 'Active', department: 'Sales', lastLogin: '2024-01-15 08:47', joinDate: '2022-01-10', dealsOwned: 29, avatar: 'PP' },
  { id: 'USR004', name: 'James Whitfield', email: 'j.whitfield@elitecrm.com', role: 'Agent', status: 'Inactive', department: 'Support', lastLogin: '2024-01-12 14:20', joinDate: '2022-05-18', dealsOwned: 15, avatar: 'JW' },
  { id: 'USR005', name: 'Sofia Rodriguez', email: 's.rodriguez@elitecrm.com', role: 'Manager', status: 'Active', department: 'Marketing', lastLogin: '2024-01-15 10:05', joinDate: '2021-11-30', dealsOwned: 33, avatar: 'SR' },
  { id: 'USR006', name: 'Ethan Blackwood', email: 'e.blackwood@elitecrm.com', role: 'Agent', status: 'Active', department: 'Sales', lastLogin: '2024-01-14 16:33', joinDate: '2023-02-14', dealsOwned: 22, avatar: 'EB' },
  { id: 'USR007', name: 'Nadia Kowalski', email: 'n.kowalski@elitecrm.com', role: 'Agent', status: 'Pending', department: 'Sales', lastLogin: '2024-01-13 09:50', joinDate: '2023-08-01', dealsOwned: 11, avatar: 'NK' },
  { id: 'USR008', name: 'Raj Malhotra', email: 'r.malhotra@elitecrm.com', role: 'Admin', status: 'Active', department: 'IT', lastLogin: '2024-01-15 07:22', joinDate: '2020-09-12', dealsOwned: 5, avatar: 'RM' },
  { id: 'USR009', name: 'Camille Dubois', email: 'c.dubois@elitecrm.com', role: 'Agent', status: 'Active', department: 'Sales', lastLogin: '2024-01-15 13:44', joinDate: '2023-03-20', dealsOwned: 18, avatar: 'CD' },
  { id: 'USR010', name: 'Omar Hassan', email: 'o.hassan@elitecrm.com', role: 'Manager', status: 'Active', department: 'Operations', lastLogin: '2024-01-15 12:10', joinDate: '2022-10-05', dealsOwned: 41, avatar: 'OH' },
  { id: 'USR011', name: 'Isabelle Turner', email: 'i.turner@elitecrm.com', role: 'Agent', status: 'Inactive', department: 'Marketing', lastLogin: '2024-01-10 15:30', joinDate: '2022-07-08', dealsOwned: 9, avatar: 'IT' },
  { id: 'USR012', name: 'David Kim', email: 'd.kim@elitecrm.com', role: 'Agent', status: 'Active', department: 'Sales', lastLogin: '2024-01-15 09:18', joinDate: '2023-05-15', dealsOwned: 26, avatar: 'DK' },
];

export const realtors = [
  { id: 'REA001', name: 'Jonathan Sterling', email: 'j.sterling@realty.com', phone: '+1 (555) 234-5678', license: 'LIC-2019-0847', agency: 'Sterling Realty Group', area: 'Downtown Manhattan', status: 'Active', rating: 4.9, totalSales: 87, totalVolume: 42800000, activeListing: 12, closedThisMonth: 4, joined: '2019-03-15', lastDeal: '2024-01-12', avatar: 'JS', tier: 'Platinum' },
  { id: 'REA002', name: 'Diana Westbrook', email: 'd.westbrook@realty.com', phone: '+1 (555) 345-6789', license: 'LIC-2018-0234', agency: 'Westbrook Properties', area: 'Beverly Hills', status: 'Active', rating: 4.8, totalSales: 124, totalVolume: 89500000, activeListing: 18, closedThisMonth: 7, joined: '2018-06-20', lastDeal: '2024-01-14', avatar: 'DW', tier: 'Platinum' },
  { id: 'REA003', name: 'Carlos Mendez', email: 'c.mendez@realty.com', phone: '+1 (555) 456-7890', license: 'LIC-2020-1123', agency: 'Mendez & Associates', area: 'South Beach', status: 'Active', rating: 4.7, totalSales: 63, totalVolume: 28400000, activeListing: 9, closedThisMonth: 3, joined: '2020-01-10', lastDeal: '2024-01-11', avatar: 'CM', tier: 'Gold' },
  { id: 'REA004', name: 'Anastasia Voronova', email: 'a.voronova@realty.com', phone: '+1 (555) 567-8901', license: 'LIC-2021-0567', agency: 'Premier Estates', area: 'Upper East Side', status: 'Active', rating: 4.6, totalSales: 41, totalVolume: 31200000, activeListing: 7, closedThisMonth: 2, joined: '2021-04-05', lastDeal: '2024-01-09', avatar: 'AV', tier: 'Gold' },
  { id: 'REA005', name: 'Michael O\'Brien', email: 'm.obrien@realty.com', phone: '+1 (555) 678-9012', license: 'LIC-2017-0892', agency: 'O\'Brien Luxury Homes', area: 'The Hamptons', status: 'Inactive', rating: 4.5, totalSales: 156, totalVolume: 112000000, activeListing: 0, closedThisMonth: 0, joined: '2017-09-12', lastDeal: '2023-12-20', avatar: 'MO', tier: 'Platinum' },
  { id: 'REA006', name: 'Yuki Tanaka', email: 'y.tanaka@realty.com', phone: '+1 (555) 789-0123', license: 'LIC-2022-0341', agency: 'Pacific Coast Realty', area: 'Pacific Heights', status: 'Active', rating: 4.4, totalSales: 28, totalVolume: 18700000, activeListing: 5, closedThisMonth: 2, joined: '2022-02-14', lastDeal: '2024-01-10', avatar: 'YT', tier: 'Silver' },
  { id: 'REA007', name: 'Richard Fontaine', email: 'r.fontaine@realty.com', phone: '+1 (555) 890-1234', license: 'LIC-2016-1456', agency: 'Fontaine International', area: 'Midtown NYC', status: 'Active', rating: 4.9, totalSales: 203, totalVolume: 187000000, activeListing: 22, closedThisMonth: 9, joined: '2016-05-30', lastDeal: '2024-01-15', avatar: 'RF', tier: 'Platinum' },
  { id: 'REA008', name: 'Amara Osei', email: 'a.osei@realty.com', phone: '+1 (555) 901-2345', license: 'LIC-2021-0789', agency: 'Osei Properties', area: 'Atlanta Midtown', status: 'Pending', rating: 4.2, totalSales: 15, totalVolume: 7200000, activeListing: 3, closedThisMonth: 1, joined: '2021-11-01', lastDeal: '2024-01-05', avatar: 'AO', tier: 'Silver' },
  { id: 'REA009', name: 'Victoria Harrington', email: 'v.harrington@realty.com', phone: '+1 (555) 012-3456', license: 'LIC-2019-0654', agency: 'Harrington & Co.', area: 'Chicago Gold Coast', status: 'Active', rating: 4.7, totalSales: 74, totalVolume: 54300000, activeListing: 11, closedThisMonth: 4, joined: '2019-08-15', lastDeal: '2024-01-13', avatar: 'VH', tier: 'Gold' },
  { id: 'REA010', name: 'Samuel Adeyemi', email: 's.adeyemi@realty.com', phone: '+1 (555) 123-4567', license: 'LIC-2020-0923', agency: 'Adeyemi Group', area: 'Houston Heights', status: 'Active', rating: 4.5, totalSales: 52, totalVolume: 22100000, activeListing: 8, closedThisMonth: 3, joined: '2020-07-20', lastDeal: '2024-01-08', avatar: 'SA', tier: 'Gold' },
];

export const leads = [
  { id: 'LED001', name: 'William Crawford', email: 'w.crawford@email.com', phone: '+1 (555) 111-2222', source: 'Referral', status: 'Hot', priority: 'High', assignedTo: 'Marcus Thompson', propertyType: 'Luxury Condo', budget: '$2.5M - $3.5M', location: 'Manhattan, NY', stage: 'Negotiation', lastContact: '2024-01-15', createdAt: '2024-01-05', score: 92, notes: 'Very interested in penthouse options' },
  { id: 'LED002', name: 'Elena Vasquez', email: 'e.vasquez@email.com', phone: '+1 (555) 222-3333', source: 'Website', status: 'Warm', priority: 'High', assignedTo: 'Priya Patel', propertyType: 'Single Family Home', budget: '$800K - $1.2M', location: 'Beverly Hills, CA', stage: 'Proposal', lastContact: '2024-01-14', createdAt: '2024-01-08', score: 78, notes: 'Looking for 4BR with pool' },
  { id: 'LED003', name: 'Robert Ashford', email: 'r.ashford@email.com', phone: '+1 (555) 333-4444', source: 'Cold Outreach', status: 'Cold', priority: 'Low', assignedTo: 'Ethan Blackwood', propertyType: 'Commercial Space', budget: '$5M+', location: 'Chicago, IL', stage: 'Prospecting', lastContact: '2024-01-10', createdAt: '2024-01-10', score: 34, notes: 'Initial inquiry, needs follow-up' },
  { id: 'LED004', name: 'Michelle Park', email: 'm.park@email.com', phone: '+1 (555) 444-5555', source: 'Social Media', status: 'Hot', priority: 'High', assignedTo: 'Sofia Rodriguez', propertyType: 'Penthouse', budget: '$4M - $6M', location: 'Miami, FL', stage: 'Qualified', lastContact: '2024-01-15', createdAt: '2024-01-03', score: 88, notes: 'Pre-approved for financing' },
  { id: 'LED005', name: 'Thomas Kingsley', email: 't.kingsley@email.com', phone: '+1 (555) 555-6666', source: 'Referral', status: 'Warm', priority: 'Medium', assignedTo: 'Marcus Thompson', propertyType: 'Villa', budget: '$3M - $4.5M', location: 'The Hamptons, NY', stage: 'Proposal', lastContact: '2024-01-13', createdAt: '2024-01-07', score: 71, notes: 'Referred by Jonathan Sterling' },
  { id: 'LED006', name: 'Aisha Nkosi', email: 'a.nkosi@email.com', phone: '+1 (555) 666-7777', source: 'Events', status: 'Warm', priority: 'Medium', assignedTo: 'David Kim', propertyType: 'Townhouse', budget: '$1.2M - $1.8M', location: 'Brooklyn, NY', stage: 'Qualified', lastContact: '2024-01-12', createdAt: '2024-01-09', score: 65, notes: 'Met at luxury property expo' },
  { id: 'LED007', name: 'François Laurent', email: 'f.laurent@email.com', phone: '+1 (555) 777-8888', source: 'Website', status: 'Hot', priority: 'High', assignedTo: 'Priya Patel', propertyType: 'Waterfront Estate', budget: '$8M+', location: 'Malibu, CA', stage: 'Negotiation', lastContact: '2024-01-15', createdAt: '2024-01-02', score: 95, notes: 'Cash buyer, ready to move fast' },
  { id: 'LED008', name: 'Grace Pemberton', email: 'g.pemberton@email.com', phone: '+1 (555) 888-9999', source: 'Referral', status: 'Cold', priority: 'Low', assignedTo: 'Ethan Blackwood', propertyType: 'Condo', budget: '$400K - $600K', location: 'Atlanta, GA', stage: 'Prospecting', lastContact: '2024-01-08', createdAt: '2024-01-08', score: 28, notes: 'Still exploring options' },
  { id: 'LED009', name: 'Nathan Goldstein', email: 'n.goldstein@email.com', phone: '+1 (555) 999-0000', source: 'Social Media', status: 'Warm', priority: 'Medium', assignedTo: 'Camille Dubois', propertyType: 'Duplex', budget: '$900K - $1.4M', location: 'San Francisco, CA', stage: 'Proposal', lastContact: '2024-01-14', createdAt: '2024-01-06', score: 60, notes: 'Investor, looking for rental income' },
  { id: 'LED010', name: 'Isabella Romano', email: 'i.romano@email.com', phone: '+1 (555) 000-1111', source: 'Cold Outreach', status: 'Hot', priority: 'High', assignedTo: 'Marcus Thompson', propertyType: 'Luxury Apartment', budget: '$1.5M - $2.2M', location: 'Chicago, IL', stage: 'Closed Won', lastContact: '2024-01-15', createdAt: '2023-12-20', score: 98, notes: 'Deal signed, pending paperwork' },
  { id: 'LED011', name: 'Benjamin Okonkwo', email: 'b.okonkwo@email.com', phone: '+1 (555) 101-2020', source: 'Events', status: 'Warm', priority: 'Medium', assignedTo: 'Sofia Rodriguez', propertyType: 'Commercial Office', budget: '$3M - $5M', location: 'Houston, TX', stage: 'Qualified', lastContact: '2024-01-11', createdAt: '2024-01-04', score: 67, notes: 'Expanding business, needs space' },
  { id: 'LED012', name: 'Mei-Ling Zhang', email: 'm.zhang@email.com', phone: '+1 (555) 202-3030', source: 'Referral', status: 'Hot', priority: 'High', assignedTo: 'David Kim', propertyType: 'Waterfront Condo', budget: '$2M - $3M', location: 'Seattle, WA', stage: 'Negotiation', lastContact: '2024-01-15', createdAt: '2024-01-01', score: 85, notes: 'International buyer, needs quick closing' },
];

export const recentActivities = [
  { id: 1, type: 'deal_closed', user: 'Marcus Thompson', action: 'Closed deal with William Crawford', amount: '$2.8M', time: '2 hours ago', icon: 'trophy' },
  { id: 2, type: 'lead_added', user: 'Priya Patel', action: 'Added new lead François Laurent', amount: '$8M+', time: '3 hours ago', icon: 'user-plus' },
  { id: 3, type: 'meeting', user: 'Sofia Rodriguez', action: 'Scheduled meeting with Michelle Park', amount: null, time: '4 hours ago', icon: 'calendar' },
  { id: 4, type: 'proposal', user: 'David Kim', action: 'Sent proposal to Mei-Ling Zhang', amount: '$2.5M', time: '5 hours ago', icon: 'file-text' },
  { id: 5, type: 'note', user: 'Ethan Blackwood', action: 'Updated notes for Robert Ashford', amount: null, time: '6 hours ago', icon: 'edit' },
];