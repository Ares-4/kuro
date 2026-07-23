import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Users, Plus, Loader2, Check } from 'lucide-react';
import GroupRequestModal from './GroupRequestModal';
import { useToast } from '@/components/ui/use-toast';

const GroupsTab = ({ studentId }) => {
  const [groups, setGroups] = useState([]);
  const [myGroupIds, setMyGroupIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch approved groups
      const { data: groupsData } = await supabase
        .from('community_groups')
        .select('*, group_members(count)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Fetch my memberships
      if (studentId) {
        const { data: myMemberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('student_id', studentId);
        
        setMyGroupIds(new Set(myMemberships?.map(m => m.group_id) || []));
      }

      setGroups(groupsData || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const handleJoin = async (groupId) => {
    if (!studentId) return;
    setJoiningId(groupId);
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, student_id: studentId });

      if (error) throw error;

      setMyGroupIds(prev => new Set([...prev, groupId]));
      toast({ title: "Joined Group", description: "You can now chat in this group." });
      fetchData(); // Refresh counts
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not join group." });
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Community Groups</h2>
          <p className="text-slate-400 text-sm">Join discussions with fellow students.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Request Group
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => {
          const isMember = myGroupIds.has(group.id);
          const memberCount = group.group_members?.[0]?.count || 0;

          return (
            <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg">{group.name}</h3>
                {isMember && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Joined</span>}
              </div>
              
              <p className="text-slate-400 text-sm mb-4 flex-1 line-clamp-3">
                {group.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                <div className="flex items-center text-slate-500 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {memberCount} members
                </div>
                
                {isMember ? (
                  <Button variant="outline" size="sm" className="text-slate-400 border-slate-700 pointer-events-none opacity-50">
                    Member
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleJoin(group.id)}
                    disabled={joiningId === group.id}
                  >
                    {joiningId === group.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Join Group"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No active groups found. Be the first to request one!
          </div>
        )}
      </div>

      <GroupRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        studentId={studentId} 
      />
    </div>
  );
};

export default GroupsTab;