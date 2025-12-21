import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Key, Palette, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="border-2 border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold">Profile Information</h3>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
                <Separator />
                <div>
                  <h4 className="mb-4 text-sm font-semibold">Change Password</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="border-2 border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Task Completions</div>
                    <div className="text-sm text-muted-foreground">Get notified when tasks are completed</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Agent Activity</div>
                    <div className="text-sm text-muted-foreground">Receive updates on agent actions</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Error Alerts</div>
                    <div className="text-sm text-muted-foreground">Get notified when errors occur</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekly Reports</div>
                    <div className="text-sm text-muted-foreground">Receive weekly productivity summaries</div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing Emails</div>
                    <div className="text-sm text-muted-foreground">Product updates and feature announcements</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* API Keys Settings */}
          <TabsContent value="api">
            <Card className="border-2 border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold">API Keys</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Use these keys to integrate Agentic with your applications
              </p>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Production Key</span>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                  <code className="text-xs text-muted-foreground">sk_prod_1234567890abcdefghijklmnop</code>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Development Key</span>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                  <code className="text-xs text-muted-foreground">sk_dev_abcdefghijklmnop1234567890</code>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Generate New API Key
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="border-2 border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold">Appearance</h3>
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Card className="cursor-pointer border-2 border-primary bg-card p-4 text-center transition-all hover:border-primary/70">
                      <div className="mb-2 text-sm font-medium">Dark</div>
                      <div className="text-xs text-muted-foreground">Current</div>
                    </Card>
                    <Card className="cursor-pointer border-2 border-border bg-card p-4 text-center transition-all hover:border-primary/50">
                      <div className="mb-2 text-sm font-medium">Light</div>
                      <div className="text-xs text-muted-foreground">Coming soon</div>
                    </Card>
                    <Card className="cursor-pointer border-2 border-border bg-card p-4 text-center transition-all hover:border-primary/50">
                      <div className="mb-2 text-sm font-medium">Auto</div>
                      <div className="text-xs text-muted-foreground">System default</div>
                    </Card>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compact Mode</div>
                    <div className="text-sm text-muted-foreground">Reduce spacing for denser layouts</div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Animations</div>
                    <div className="text-sm text-muted-foreground">Enable smooth transitions and effects</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Data Settings */}
          <TabsContent value="data">
            <Card className="border-2 border-border bg-card p-6">
              <h3 className="mb-6 text-lg font-semibold">Data Management</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium">Export Your Data</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Download all your tasks, activity logs, and settings
                  </p>
                  <Button variant="outline">Export Data</Button>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 font-medium">Clear Activity History</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Permanently delete all activity logs older than 90 days
                  </p>
                  <Button variant="outline">Clear History</Button>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 font-medium text-destructive">Delete Account</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
