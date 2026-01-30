import { ComposerWithSave } from '@/components/composer/composer-with-save';
import { createClient } from '@/lib/supabase/server';

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <ComposerWithSave isAuthenticated={!!user} />
    </div>
  );
}
