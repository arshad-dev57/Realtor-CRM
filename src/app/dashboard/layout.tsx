    // src/app/dashboard/layout.tsx

    'use client';

    import Sidebar from '@/components/layout/Sidebar';

    export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Don't use usePathname here - remove conditional hook calls
    
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ 
            marginLeft: '240px', 
            flex: 1, 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            overflowX: 'hidden'
        }}>
            {children}
        </main>
        </div>
    );
    }