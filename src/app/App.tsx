import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster, toast } from 'sonner';
import { Menu, RefreshCw, Moon, Sun, User, Settings, BarChart3 } from 'lucide-react';
import { StatisticsCard } from './components/StatisticsCard';
import { TenderCard } from './components/TenderCard';
import { TenderDetailSidebar } from './components/TenderDetailSidebar';
import { SearchFilterBar } from './components/SearchFilterBar';
import { SettingsPage } from './components/SettingsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Tender, TenderStatus } from './data/mockTenders';
import api from '../services/api';
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

type Page = 'dashboard' | 'settings' | 'analytics';

export default function App() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [stats, setStats] = useState({ available: 0, accepted: 0, onhold: 0, removed: 0, urgent: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<TenderStatus>('available');
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [lastScrape, setLastScrape] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tenders from API
  useEffect(() => {
    fetchTenders();
    fetchStats();
    checkScrapeStatus();
  }, []);

  // Transform API tender to frontend format
  const transformApiTender = (apiTender: any): Tender => {
    return {
      id: apiTender.id,
      quotationNumber: apiTender.quotation_number || apiTender.quotationNumber || '',
      category: {
        code: apiTender.category_code || '',
        name: apiTender.category_name || 'Unknown Category',
      },
      summary: apiTender.summary || '',
      description: apiTender.description || apiTender.summary || '',
      amount: apiTender.amount || 0,
      ministry: {
        name: apiTender.ministry_name || 'Unknown Ministry',
        department: apiTender.ministry_department || '',
        contact: apiTender.ministry_contact || '',
        phone: apiTender.ministry_phone || '',
        location: apiTender.ministry_location || '',
      },
      dates: {
        published: apiTender.date_published ? new Date(apiTender.date_published) : new Date(),
        closing: apiTender.date_closing ? new Date(apiTender.date_closing) : new Date(),
        briefing: apiTender.date_briefing ? new Date(apiTender.date_briefing) : undefined,
      },
      tags: apiTender.tags || [],
      status: apiTender.status || 'available',
      isUrgent: apiTender.is_urgent || false,
      documents: [],
      budgetCode: apiTender.budget_code,
      paymentTerms: apiTender.payment_terms,
      notes: apiTender.notes,
      activityHistory: [],
    };
  };

  const fetchTenders = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTenders();
      if (response.success) {
        // Transform API data to frontend format
        const transformedTenders = response.tenders.map(transformApiTender);
        setTenders(transformedTenders);
      }
    } catch (error) {
      console.error('Error fetching tenders:', error);
      toast.error('Failed to load tenders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkScrapeStatus = async () => {
    try {
      const response = await api.getScrapeStatus();
      if (response.success && response.last_scrape) {
        setLastScrape(new Date(response.last_scrape.scrape_time));
        setIsScraping(response.is_running);
      }
    } catch (error) {
      console.error('Error checking scrape status:', error);
    }
  };

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
    setIsScraping(true);
    toast.info('🔄 Scraping in progress... This may take a few minutes');

    try {
      const response = await api.triggerScrape();
      if (response.success) {
        toast.success('✓ Scraping started successfully!');

        // Poll for completion
        const pollInterval = setInterval(async () => {
          const status = await api.getScrapeStatus();
          if (!status.is_running) {
            clearInterval(pollInterval);
            setIsScraping(false);
            setLastScrape(new Date());
            await fetchTenders();
            await fetchStats();
            toast.success('✓ Scraping completed! Check the tenders.');
          }
        }, 5000); // Check every 5 seconds
      } else {
        toast.error('Failed to start scraping');
        setIsScraping(false);
      }
    } catch (error) {
      console.error('Error triggering scrape:', error);
      toast.error('Failed to start scraping');
      setIsScraping(false);
    }
  };

  const handleStatusChange = async (tender: Tender, newStatus: TenderStatus) => {
    try {
      const response = await api.updateTender(tender.quotationNumber, { status: newStatus });
      if (response.success) {
        // Update local state
        setTenders(prev =>
          prev.map(t =>
            t.quotationNumber === tender.quotationNumber
              ? { ...t, status: newStatus }
              : t
          )
        );

        // Update selected tender if it's the one being changed
        if (selectedTender?.quotationNumber === tender.quotationNumber) {
          setSelectedTender({ ...selectedTender, status: newStatus });
        }

        // Refresh stats
        await fetchStats();

        toast.success(`✓ Tender ${newStatus}`);
      } else {
        toast.error('Failed to update tender status');
      }
    } catch (error) {
      console.error('Error updating tender:', error);
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
                  <RefreshCw className={`h-4 w-4 mr-2 ${isScraping ? 'animate-spin' : ''}`} />
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
              trend={{ value: 3, label: 'today' }}
              variant="primary"
              delay={0}
            />
            <StatisticsCard
              icon={CheckCircle2}
              count={stats.accepted}
              label="Accepted"
              trend={{ value: 2, label: 'today' }}
              variant="success"
              delay={0.05}
            />
            <StatisticsCard
              icon={PauseCircle}
              count={stats.onhold}
              label="On Hold"
              trend={{ value: 1, label: 'today' }}
              variant="warning"
              delay={0.1}
            />
            <StatisticsCard
              icon={XCircle}
              count={stats.removed}
              label="Removed"
              trend={{ value: -1, label: 'today' }}
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
              {filteredTenders.length === 0 ? (
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

        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}
