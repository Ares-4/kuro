import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Save, Loader2, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const DEFAULT_PROFILE = {
  full_name: '',
  email: '',
  phone: '',
  avatar_url: ''
};

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  const canLoad = useMemo(() => !!user?.id, [user?.id]);

  useEffect(() => {
    if (canLoad) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // 1) Fetch existing profile row
      const { data: adminProfile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // 2) If missing, attempt to create it (non-fatal if blocked)
      let finalProfile = adminProfile;
      if (!finalProfile) {
        const insertPayload = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'admin'
        };

        const { data: created, error: createError } = await supabase
          .from('admin_profiles')
          .insert([insertPayload])
          .select()
          .maybeSingle();

        // If creation fails due to RLS or race, just continue with metadata
        if (!createError && created) finalProfile = created;
      }

      setProfile({
        full_name: finalProfile?.full_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: finalProfile?.phone || '',
        avatar_url: finalProfile?.avatar_url || user.user_metadata?.avatar_url || ''
      });
    } catch (err) {
      console.error('ProfileSettings fetch error:', err);
      toast({
        variant: 'destructive',
        title: 'Error loading profile',
        description: err?.message || 'Failed to load profile.'
      });
      setProfile({
        ...DEFAULT_PROFILE,
        email: user?.email || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const fullName = (profile.full_name || '').trim();
    if (!fullName) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Full name is required.' });
      return;
    }

    setSaving(true);
    try {
      // Upsert profile row so it works even if row doesn't exist
      const { error } = await supabase
        .from('admin_profiles')
        .upsert(
          [
            {
              user_id: user.id,
              full_name: fullName,
              phone: (profile.phone || '').trim(),
              avatar_url: (profile.avatar_url || '').trim(),
              role: 'admin',
              updated_at: new Date()
            }
          ],
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      // Sync Auth metadata (non-fatal if it fails)
      try {
        await supabase.auth.updateUser({
          data: { full_name: fullName, avatar_url: (profile.avatar_url || '').trim() }
        });
      } catch (e) {
        console.warn('Auth metadata update failed:', e);
      }

      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });

      // Optional logging; do not break save if blocked by RLS
      try {
        await supabase.from('activity_logs').insert({
          actor_id: user.id,
          action: 'UPDATE_PROFILE',
          details: { fields: ['full_name', 'phone', 'avatar_url'] }
        });
      } catch (e) {
        console.warn('activity log insert failed:', e);
      }

      // Refresh from DB to stay consistent
      await fetchProfile();
    } catch (err) {
      console.error('ProfileSettings save error:', err);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.message || 'Failed to save profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    if (!user?.id) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const mime = file.type || '';
      if (!mime.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload an image.' });
        return;
      }

      // Build a deterministic path so re-uploads overwrite cleanly
      const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
      const safeExt = ext.length <= 5 ? ext : 'png';
      const filePath = `admin-avatars/${user.id}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from('hub-images')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('hub-images').getPublicUrl(filePath);

      const publicUrl = pub?.publicUrl || '';
      if (!publicUrl) throw new Error('Failed to generate public URL.');

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: 'Image uploaded', description: 'Now click “Save Changes” to persist it.' });
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err?.message || 'Failed to upload image.'
      });
    } finally {
      setUploading(false);
      // reset input so same file can be uploaded again
      e.target.value = '';
    }
  };

  if (!user) return <div className="p-4 text-slate-400">Please sign in.</div>;
  if (loading) return <div>Loading profile...</div>;

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white">Your Profile</CardTitle>
        <CardDescription className="text-slate-400">Manage your personal details and avatar.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white">Profile Photo</h3>
            <p className="text-sm text-slate-400">Click the image to upload a new photo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Full Name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Email</Label>
            <Input value={profile.email} disabled className="bg-slate-900/50 border-slate-700 text-slate-500" />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Phone</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            type="button"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;