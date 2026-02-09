import SideNav from '@/app/dashboard-ui/sidenav';
import TopBar from '@/app/dashboard-ui/top-bar';
import { ConfirmProvider } from '@/app/lib/hooks/useConfirm';
import { ToastProvider } from '@/app/lib/hooks/useToast';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
          <div className="hidden md:flex md:w-64 md:flex-col shrink-0 h-full overflow-hidden">
            <SideNav />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900">
              <TopBar />
              <div className="px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </ConfirmProvider>
  );
}