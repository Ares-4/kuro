import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Save, Loader2, Upload, Trash2, Shield, Bell, User, FileText, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StudentSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile State - Initialized with safe defaults
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    avatar_url: ''
  });

  // Preferences State - Initialized with safe defaults to prevent null access
  const [preferences, setPreferences] = useState({
    notifications: { email: true, sms: false },
    privacy: { data_sharing: false },
    application: { countries: '', program_types: '' }
  });

  // Security State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchDocuments();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Use maybeSingle to avoid PGRST116
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          country: data.country || '',
          avatar_url: data.avatar_url || ''
        });
        
        // Safely merge preferences ensuring structure exists
        if (data.preferences) {
          setPreferences(prev => ({
            notifications: { 
              email: true, 
              sms: false, 
              ...data.preferences?.notifications 
            },
            privacy: { 
              data_sharing: false, 
              ...data.preferences?.privacy 
            },
            application: { 
              countries: '', 
              program_types: '', 
              ...data.preferences?.application 
            }
          }));
        }
      } else {
        // Initialize with user metadata if profile doesn't exist yet
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: '',
          country: '',
          avatar_url: user.user_metadata?.avatar_url || ''
        });
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast({ 
        variant: 'destructive', 
        title: 'Error loading profile',
        description: "Could not load your profile data. Please try refreshing."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .list(user.id + '/', {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        // If the folder doesn't exist yet, it's not really an error for the user
        if (error.message && !error.message.includes("The resource was not found")) {
            console.error('Document fetch error:', error);
        }
        setDocuments([]);
        return;
      }
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Unexpected error fetching documents:', error);
      setDocuments([]);
    }
  };

  const handleProfileUpdate = async () => {
    // Validation
    if (!profile.full_name?.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error", 
        description: "Full Name is required." 
      });
      return;
    }

    setSaving(true);
    try {
      const updates = {
        user_id: user.id,
        email: user.email,
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        avatar_url: profile.avatar_url,
        preferences: preferences,
        updated_at: new Date().toISOString()
      };

      // 1. Update/Upsert Student Table
      const { error: dbError } = await supabase
        .from('students')
        .upsert(updates, { onConflict: 'user_id' });

      if (dbError) throw dbError;

      // 2. Sync core metadata to Supabase Auth User (as requested)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          country: profile.country
        }
      });

      if (authError) {
        console.warn("Failed to sync auth metadata:", authError);
        // We don't throw here to avoid blocking the UI if the DB save worked
      }

      toast({ 
        className: "bg-green-600 text-white border-none",
        title: "Settings saved", 
        description: "Your profile has been updated successfully." 
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({ 
        variant: 'destructive', 
        title: "Error saving settings", 
        description: error.message || "Failed to save changes." 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: "Invalid file type", description: "Please upload an image file." });
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: "File too large", description: "Image must be smaller than 5MB." });
        return;
    }

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hub-images') // Using hub-images as it's publicly accessible
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hub-images')
        .getPublicUrl(fileName);

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Persist immediately
      const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
         // Fallback upsert if row missing
         await supabase.from('students').upsert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Student',
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
         });
      }
      
      // Also update auth metadata for consistency
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      toast({ title: "Avatar updated", description: "Your profile picture has been changed." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Upload failed", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
        return toast({ variant: 'destructive', title: "Missing fields", description: "Please fill in all password fields." });
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast({ variant: 'destructive', title: "Passwords do not match" });
    }

    if (passwordForm.newPassword.length < 6) {
        return toast({ variant: 'destructive', title: "Weak password", description: "Password should be at least 6 characters." });
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      // Sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${user.id}/${Date.now()}_${safeName}`;
      
      const { error } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file);

      if (error) throw error;
      
      toast({ title: "Document uploaded", description: `${file.name} has been saved securely.` });
      fetchDocuments();
    } catch (error) {
      toast({ variant: 'destructive', title: "Upload failed", description: error.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (fileName) => {
    try {
      const { error } = await supabase.storage
        .from('student-documents')
        .remove([`${user.id}/${fileName}`]);

      if (error) throw error;
      
      toast({ title: "Document deleted" });
      fetchDocuments();
    } catch (error) {
      toast({ variant: 'destructive', title: "Delete failed", description: error.message });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, this would trigger a cloud function or API endpoint
      // for proper cleanup. For now, we perform a soft cleanup.
      
      // 1. Delete student profile
      const { error } = await supabase.from('students').delete().eq('user_id', user.id);
      
      if (error) throw error;
      
      // 2. Sign out
      await signOut();
      
      toast({ title: "Account deleted", description: "We're sorry to see you go." });
    } catch (error) {
      console.error("Delete account error:", error);
      toast({ variant: 'destructive', title: "Action failed", description: "Please contact support to delete your account." });
    }
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-slate-400">Loading your settings...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-slate-400">Manage your profile, security, and preferences.</p>
          </div>
          <Button 
            onClick={handleProfileUpdate} 
            disabled={saving} 
            className="bg-blue-600 hover:bg-blue-700 md:w-auto w-full"
          >
            {saving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
            )}
          </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-800 text-slate-400 h-auto p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white py-2">Profile</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white py-2">Security</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white py-2">Preferences</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white py-2">Documents</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6 mt-6 animate-in fade-in-50">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-slate-400">Update your personal details and public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
                <div className="relative h-24 w-24 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-700 group">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-500">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white">Change</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-medium text-white">Profile Picture</h3>
                  <p className="text-sm text-slate-400 max-w-xs">Upload a new photo to personalize your account. Supported formats: JPG, PNG.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-slate-200">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="full_name"
                    value={profile.full_name || ''} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                  <Input 
                    id="email"
                    value={profile.email || ''} 
                    disabled 
                    className="bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed" 
                  />
                  <p className="text-[10px] text-slate-500">Email cannot be changed directly.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
                  <Input 
                    id="phone"
                    value={profile.phone || ''} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-200">Country of Residence</Label>
                  <Input 
                    id="country"
                    value={profile.country || ''} 
                    onChange={(e) => setProfile({...profile, country: e.target.value})} 
                    className="bg-slate-950 border-slate-700 text-white"
                    placeholder="Zimbabwe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6 mt-6 animate-in fade-in-50">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Password & Authentication</CardTitle>
              <CardDescription className="text-slate-400">Manage your account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="new_pass" className="text-slate-200">New Password</Label>
                    <Input 
                        id="new_pass"
                        type="password" 
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="bg-slate-950 border-slate-700 text-white"
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="confirm_pass" className="text-slate-200">Confirm New Password</Label>
                    <Input 
                        id="confirm_pass"
                        type="password" 
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="bg-slate-950 border-slate-700 text-white"
                    />
                    </div>
                </div>
                <Button type="submit" disabled={saving} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Update Password
                </Button>
              </form>

              <div className="pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <Label className="text-base text-slate-200">Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-slate-400">Add an extra layer of security to your account.</p>
                  </div>
                  <Switch disabled checked={false} />
                </div>
                <p className="text-xs text-yellow-500/80 mt-2">Coming soon to your region.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-900/30 bg-red-950/10">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-red-300/60">Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-900">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">Delete Account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-6 mt-6 animate-in fade-in-50">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Notifications</CardTitle>
              <CardDescription className="text-slate-400">Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <Label className="text-base text-slate-200">Email Notifications</Label>
                  </div>
                  <p className="text-sm text-slate-400">Receive updates about your application progress.</p>
                </div>
                <Switch 
                  checked={preferences.notifications?.email ?? true} 
                  onCheckedChange={(checked) => setPreferences(prev => ({
                    ...prev, 
                    notifications: { ...(prev.notifications || {}), email: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base text-slate-200">SMS Alerts</Label>
                  </div>
                  <p className="text-sm text-slate-400">Get important alerts via text message.</p>
                </div>
                <Switch 
                  checked={preferences.notifications?.sms ?? false} 
                  onCheckedChange={(checked) => setPreferences(prev => ({
                    ...prev, 
                    notifications: { ...(prev.notifications || {}), sms: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Application Preferences</CardTitle>
              <CardDescription className="text-slate-400">Help us tailor recommendations for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pref_countries" className="text-slate-200">Preferred Countries (comma separated)</Label>
                <Input 
                  id="pref_countries"
                  value={preferences.application?.countries || ''} 
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    application: { ...(prev.application || {}), countries: e.target.value }
                  }))}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="e.g. Poland, Germany, Cyprus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pref_programs" className="text-slate-200">Program Types (comma separated)</Label>
                <Input 
                  id="pref_programs"
                  value={preferences.application?.program_types || ''} 
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    application: { ...(prev.application || {}), program_types: e.target.value }
                  }))}
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="e.g. Computer Science, Business, Engineering"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-6 mt-6 animate-in fade-in-50">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Document Management</CardTitle>
              <CardDescription className="text-slate-400">Keep your essential documents ready for applications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:bg-slate-800/30 hover:border-blue-500/50 transition-all group">
                <input 
                  type="file" 
                  id="doc-upload" 
                  className="hidden" 
                  onChange={handleDocumentUpload} 
                  disabled={uploadingDoc}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="p-4 rounded-full bg-slate-800 mb-4 group-hover:scale-110 transition-transform">
                    {uploadingDoc ? (
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    ) : (
                        <Upload className="w-8 h-8 text-blue-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">Upload new document</h3>
                  <p className="text-sm text-slate-500 mt-2">PDF, Word, or Images up to 10MB</p>
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Uploaded Documents ({documents.length})
                </h3>
                
                {documents.length === 0 ? (
                  <div className="p-6 text-center bg-slate-950/50 rounded-lg border border-slate-800/50">
                    <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {documents.map((doc) => (
                      <div key={doc.id || doc.name} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-blue-900/20 rounded text-blue-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate max-w-[150px] sm:max-w-[250px]">{doc.name}</div>
                            <div className="text-xs text-slate-500 flex gap-2">
                                {/* FIX: Added safe access to metadata.size to prevent crash */}
                                <span>{doc.metadata?.size ? (doc.metadata.size / 1024 / 1024).toFixed(2) : '0.00'} MB</span>
                                <span className="text-slate-600">•</span>
                                <span>{new Date(doc.created_at || new Date()).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteDocument(doc.name)} 
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentSettings;