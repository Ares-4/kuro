import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const SecuritySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });
  const [twoFactor, setTwoFactor] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast({ variant: "destructive", title: "Passwords do not match" });
    }
    if (passwords.new.length < 6) {
      return toast({ variant: "destructive", title: "Password too short", description: "Must be at least 6 characters." });
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new });
      if (error) throw error;
      
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPasswords({ new: '', confirm: '' });

      await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: 'CHANGE_PASSWORD',
        details: { method: 'admin_settings' }
      });

    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handle2FAToggle = async (checked) => {
    // In a real implementation, this would involve QR code generation and verification
    setTwoFactor(checked);
    toast({ 
      title: checked ? "2FA Enabled" : "2FA Disabled", 
      description: "Security settings updated (Simulation)." 
    });
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white">Account Security</CardTitle>
        <CardDescription className="text-slate-400">Protect your admin account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handlePasswordChange} className="space-y-4 border-b border-slate-700 pb-6">
          <h3 className="text-sm font-medium text-slate-200">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input 
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm Password</Label>
              <Input 
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
          </Button>
        </form>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <Label className="text-base text-slate-200">Two-Factor Authentication</Label>
            </div>
            <p className="text-sm text-slate-400">Secure your account with 2FA.</p>
          </div>
          <Switch 
            checked={twoFactor} 
            onCheckedChange={handle2FAToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;