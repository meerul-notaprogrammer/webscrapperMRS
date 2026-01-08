import { ArrowLeft, Save, RotateCcw, RefreshCw, Bell, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { categories } from '../data/mockTenders';
import { useState } from 'react';

interface SettingsPageProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SettingsPage({ onBack, theme, onThemeChange }: SettingsPageProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([
    '010302', '020301', '020302', '020401', '020601', '120401', '120501'
  ]);
  const [emailNotifications, setEmailNotifications] = useState({
    urgent: true,
    daily: true,
    weekly: false,
    statusChange: false,
  });
  const [email, setEmail] = useState('procurement@company.com');

  const handleSave = () => {
    toast.success('✓ Settings saved successfully');
  };

  const handleReset = () => {
    toast.info('Settings reset to defaults');
  };

  const handleManualScrape = () => {
    toast.info('🔄 Manual scrape initiated');
    setTimeout(() => {
      toast.success('✓ Scraping completed successfully!');
    }, 2000);
  };

  const toggleCategory = (code: string) => {
    setActiveCategories(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">⚙️ Settings & Configuration</h1>
          <p className="text-muted-foreground">Manage your tender monitoring preferences</p>
        </div>

        <div className="space-y-8">
          {/* Monitoring Section */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📂 Active Categories
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Select which tender categories to monitor
            </p>

            <div className="bg-muted/30 rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.code} className="flex items-center space-x-3">
                    <Checkbox
                      id={category.code}
                      checked={activeCategories.includes(category.code)}
                      onCheckedChange={() => toggleCategory(category.code)}
                    />
                    <Label
                      htmlFor={category.code}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <span className="font-mono text-sm mr-2">{category.code}</span>
                      <span className="text-sm">- {category.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{activeCategories.length}</span> categories
            </p>
          </section>

          {/* Scraping Schedule */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ⏰ Automated Scraping
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">Automated scraping enabled</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
                  <span className="text-success font-medium">Active</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-3">Current Schedule:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    08:00 AM (Malaysia Time)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    02:00 PM (Malaysia Time)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-muted-foreground">•</span>
                    08:00 PM (Malaysia Time)
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">Next scrape:</p>
                    <p className="text-xs text-muted-foreground">Today at 8:00 PM (in 3 hours)</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Last scrape:</p>
                    <p className="text-xs text-muted-foreground">Today at 2:00 PM (successful)</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleManualScrape} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Manual Scrape Now
              </Button>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Email Notifications
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New urgent tenders (&lt; 7 days)</p>
                    <p className="text-sm text-muted-foreground">Get notified immediately</p>
                  </div>
                  <Switch
                    checked={emailNotifications.urgent}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({ ...emailNotifications, urgent: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily summary report (9:00 AM)</p>
                    <p className="text-sm text-muted-foreground">Daily digest of new tenders</p>
                  </div>
                  <Switch
                    checked={emailNotifications.daily}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({ ...emailNotifications, daily: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly analytics report</p>
                    <p className="text-sm text-muted-foreground">Summary every Monday</p>
                  </div>
                  <Switch
                    checked={emailNotifications.weekly}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({ ...emailNotifications, weekly: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status change confirmations</p>
                    <p className="text-sm text-muted-foreground">When tender status updates</p>
                  </div>
                  <Switch
                    checked={emailNotifications.statusChange}
                    onCheckedChange={(checked) =>
                      setEmailNotifications({ ...emailNotifications, statusChange: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tag Management */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Auto-Tag Keywords
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure automatic tag detection from tender descriptions
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tag-computer">Computer</Label>
                <Input
                  id="tag-computer"
                  defaultValue="komputer, computer, laptop, pc"
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="tag-software">Software</Label>
                <Input
                  id="tag-software"
                  defaultValue="software, perisian, aplikasi"
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="tag-cctv">CCTV</Label>
                <Input
                  id="tag-cctv"
                  defaultValue="cctv, kamera, pengawasan"
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <Button variant="outline" size="sm">
                + Add New Tag
              </Button>
            </div>
          </section>

          {/* Display Preferences */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🎨 Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="flex gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => onThemeChange('light')}
                    className="flex-1"
                  >
                    ☀️ Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => onThemeChange('dark')}
                    className="flex-1"
                  >
                    🌙 Dark
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact View</p>
                  <p className="text-sm text-muted-foreground">Show more tenders on screen</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
