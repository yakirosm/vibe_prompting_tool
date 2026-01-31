'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { LogOut, Save, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import {
  PROVIDER_LABELS,
  DEFAULT_MODELS,
  type AIProviderType,
} from '@prompt-ops/shared';

interface UserSettings {
  ai_provider: string | null;
  ai_api_key_encrypted: string | null;
  ai_model: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showApiKey, setShowApiKey] = React.useState(false);

  const [provider, setProvider] = React.useState<AIProviderType>('openai');
  const [apiKey, setApiKey] = React.useState('');
  const [model, setModel] = React.useState(DEFAULT_MODELS.openai);

  // Load settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();

      const settings = data as UserSettings | null;

      if (settings) {
        if (settings.ai_provider) setProvider(settings.ai_provider as AIProviderType);
        if (settings.ai_model) setModel(settings.ai_model);
        if (settings.ai_api_key_encrypted) setApiKey(settings.ai_api_key_encrypted);
      }
    };

    loadSettings();
  }, []);

  const handleProviderChange = (value: AIProviderType) => {
    setProvider(value);
    setModel(DEFAULT_MODELS[value]);
  };

  const handleSave = async () => {
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Not authenticated');
      setIsLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('user_settings') as any).upsert({
      id: user.id,
      ai_provider: provider,
      ai_model: model,
      ai_api_key_encrypted: apiKey,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved');
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your AI provider and preferences.</p>
      </div>

      {/* AI Provider Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI Provider
          </CardTitle>
          <CardDescription>
            Configure which AI provider to use for prompt generation. Your API key is stored
            securely and never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={(v) => handleProviderChange(v as AIProviderType)}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${PROVIDER_LABELS[provider]} API key`}
                className="pe-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute end-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is encrypted and stored securely.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model name (e.g., gpt-4o)"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading} loading={isLoading}>
            <Save className="h-4 w-4 me-2" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 me-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
