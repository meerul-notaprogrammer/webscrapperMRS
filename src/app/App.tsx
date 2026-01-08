/**
 * ePerolehan Monitor - Main Application
 * 
 * Uses TanStack Query for:
 * - Server state management
 * - Auto-refresh every 5 minutes
 * - Optimistic updates for status changes
 * - Caching and deduplication
 */

import { useState, useEffect } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster, toast } from 'sonner';
import { Menu, RefreshCw, Moon, Sun, User, Settings, BarChart3, Loader2 } from 'lucide-react';
import { StatisticsCard } from './components/StatisticsCard';
import { TenderCard } from './components/TenderCard';
import { TenderDetailSidebar } from './components/TenderDetailSidebar';
import { SearchFilterBar } from './components/SearchFilterBar';
import { SettingsPage } from './components/SettingsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { ScrapeProgressDialog } from './components/ScrapeProgressDialog';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Tender, TenderStatus } from './data/mockTenders';
import {
  useTenders,
  useStats,
  useCategories,
  useScrapeStatus,
  useUpdateTenderStatus,
  useTriggerScrape
} from './hooks/useQueries';
import {
  FileText,
  CheckCircle2,
  PauseCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type Page = 'dashboard' | 'settings' | 'analytics';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TenderStatus>('available');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showScrapeDialog, setShowScrapeDialog] = useState(false);

  // TanStack Query hooks
  const { data: tenders = [], isLoading: tendersLoading, refetch: refetchTenders } = useTenders();
  const { data: stats = { available: 0, accepted: 0, onhold: 0, removed: 0, urgent: 0, total: 0 } } = useStats();
  const { data: categories = [] } = useCategories();
  const { data: scrapeStatus } = useScrapeStatus(showScrapeDialog);

  const updateStatusMutation = useUpdateTenderStatus();
  const triggerScrapeMutation = useTriggerScrape();

  // Check if scraping is in progress
  const isScraping = scrapeStatus?.is_running || triggerScrapeMutation.isPending;
  const lastScrape = scrapeStatus?.last_scrape?.scrape_time
    ? new Date(scrapeStatus.last_scrape.scrape_time)
    : null;

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleScrape = async () => {
    setShowScrapeDialog(true);

    try {
      await triggerScrapeMutation.mutateAsync();
      toast.success('✓ Scraping started successfully!');
    } catch (error) {
      toast.error('Failed to start scraping');
      setShowScrapeDialog(false);
    }
  };

  const handleStatusChange = async (tender: Tender, newStatus: TenderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        quotationNumber: tender.quotationNumber,
        status: newStatus,
      });

      // Update selected tender if it's the one being changed
      if (selectedTender?.quotationNumber === tender.quotationNumber) {
        setSelectedTender({ ...selectedTender, status: newStatus });
      }

      toast.success(`✓ Tender ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update tender status');
    }
  };

  const handleCategoryToggle = (code: string) => {
    setSelectedCategories(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  // Filter tenders based on status, search, and categories
  const filteredTenders = tenders.filter(tender => {
    // Filter by status tab
    if (tender.status !== activeTab) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        tender.quotationNumber.toLowerCase().includes(query) ||
        tender.summary.toLowerCase().includes(query) ||
        tender.ministry.name.toLowerCase().includes(query) ||
        tender.tags.some(tag => tag.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(tender.category.code)) return false;
    }

    return true;
  });

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (currentPage === 'settings') {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <div className="min-h-screen bg-background">
          <SettingsPage
            onBack={() => setCurrentPage('dashboard')}
            theme={theme}
            onThemeChange={setTheme}
          />
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    );
  }

  if (currentPage === 'analytics') {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <div className="min-h-screen bg-background">
          <AnalyticsPage
            tenders={tenders}
            onBack={() => setCurrentPage('dashboard')}
          />
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card shadow-sm">
          <div className="max-w-[1440px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">e</span>
                  </div>
                  <h1 className="text-xl font-semibold text-foreground">
                    ePerolehan Monitor
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Last scraped:</span>
                  <span className="font-medium text-foreground">
                    {lastScrape ? getRelativeTime(lastScrape) : 'Never'}
                  </span>
                </div>

                <Button
                  onClick={handleScrape}
                  disabled={isScraping}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  {isScraping ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isScraping ? 'Scraping...' : 'Refresh Tenders'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="hidden md:flex"
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setCurrentPage('analytics')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentPage('settings')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleTheme} className="md:hidden">
                      {theme === 'light' ? (
                        <>
                          <Moon className="h-4 w-4 mr-2" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4 mr-2" />
                          Light Mode
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1440px] mx-auto px-6 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatisticsCard
              icon={FileText}
              count={stats.available}
              label="Available"
              trend={{ value: stats.urgent, label: 'urgent' }}
              variant="primary"
              delay={0}
            />
            <StatisticsCard
              icon={CheckCircle2}
              count={stats.accepted}
              label="Accepted"
              variant="success"
              delay={0.05}
            />
            <StatisticsCard
              icon={PauseCircle}
              count={stats.onhold}
              label="On Hold"
              variant="warning"
              delay={0.1}
            />
            <StatisticsCard
              icon={XCircle}
              count={stats.removed}
              label="Removed"
              variant="danger"
              delay={0.15}
            />
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <SearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
              categories={categories}
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TenderStatus)}>
            <TabsList className="mb-6">
              <TabsTrigger value="available">
                Available ({stats.available})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({stats.accepted})
              </TabsTrigger>
              <TabsTrigger value="onhold">
                On Hold ({stats.onhold})
              </TabsTrigger>
              <TabsTrigger value="removed">
                Removed ({stats.removed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {tendersLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading tenders...</p>
                </div>
              ) : filteredTenders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">
                    {searchQuery || selectedCategories.length > 0 ? '🔍' : '📋'}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery || selectedCategories.length > 0
                      ? 'No tenders found'
                      : 'No tenders available'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategories.length > 0
                      ? 'Try adjusting your filters or search terms'
                      : 'Click "Refresh Tenders" to start monitoring'}
                  </p>
                  {(searchQuery || selectedCategories.length > 0) && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {filteredTenders.map((tender) => (
                    <TenderCard
                      key={tender.id}
                      tender={tender}
                      onView={(t) => {
                        setSelectedTender(t);
                        setIsSidebarOpen(true);
                      }}
                      onAccept={(t) => handleStatusChange(t, 'accepted')}
                      onHold={(t) => handleStatusChange(t, 'onhold')}
                      onRemove={(t) => handleStatusChange(t, 'removed')}
                    />
                  ))}

                  <div className="text-center pt-4 text-sm text-muted-foreground">
                    Showing {filteredTenders.length} of {tenders.filter(t => t.status === activeTab).length} tenders
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Tender Detail Sidebar */}
        <TenderDetailSidebar
          tender={selectedTender}
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            setTimeout(() => setSelectedTender(null), 300);
          }}
          onAccept={(t) => handleStatusChange(t, 'accepted')}
          onHold={(t) => handleStatusChange(t, 'onhold')}
          onRemove={(t) => handleStatusChange(t, 'removed')}
        />

        {/* Scrape Progress Dialog */}
        <ScrapeProgressDialog
          isOpen={showScrapeDialog}
          onClose={() => {
            setShowScrapeDialog(false);
            refetchTenders();
          }}
          status={scrapeStatus}
        />

        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
