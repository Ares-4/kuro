import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Plus, Search, Filter, MoreVertical, Edit, Trash2, ArrowUpDown,
  BookOpen, GraduationCap, Loader2, ChevronLeft, ChevronRight, Eye,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDuration } from '@/lib/utils';
import CourseEditor from './CourseEditor';
import { AdminTable } from '@/components/admin/ui/AdminTable'; // New Import
import { Card, CardContent } from '@/components/ui/card';

const AdminCourses = () => {
  const { toast } = useToast();
  const [view, setView] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Filtering & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setAllCourses(coursesData || []);

      const { data: uniData, error: uniError } = await supabase
        .from('universities')
        .select('name')
        .eq('is_active', true)
        .order('name');
        
      if (!uniError) {
        const uniqueUnis = [...new Set(uniData.map(u => u.name))];
        setUniversities(uniqueUnis);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error loading data", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Helper: Parse Currency for Sorting
  const parseCurrency = (value) => {
    if (!value) return 0;
    const numeric = value.toString().replace(/[^0-9.]/g, '');
    return parseFloat(numeric) || 0;
  };

  // Filter & Sort Logic
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...allCourses];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.program_name?.toLowerCase().includes(lowerQuery) || 
        c.university?.toLowerCase().includes(lowerQuery) ||
        c.country?.toLowerCase().includes(lowerQuery)
      );
    }
    if (filterUniversity !== 'all') {
      result = result.filter(c => c.university === filterUniversity);
    }
    if (filterLevel !== 'all') {
      result = result.filter(c => c.degree_level === filterLevel);
    }
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      result = result.filter(c => c.is_active === isActive);
    }

    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'tuition_fee') {
        aValue = parseCurrency(aValue);
        bValue = parseCurrency(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allCourses, searchQuery, filterUniversity, filterLevel, filterStatus, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setView('editor');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
      setAllCourses(prev => prev.filter(c => c.id !== id));
      toast({ title: "Course deleted", description: "The course has been removed successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleStatusToggle = async (course) => {
    try {
      const newStatus = !course.is_active;
      const { error } = await supabase
        .from('programs')
        .update({ is_active: newStatus })
        .eq('id', course.id);
      if (error) throw error;
      setAllCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_active: newStatus } : c));
      toast({ title: "Status updated", description: `Course is now ${newStatus ? 'Active' : 'Inactive'}` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  // Render Mobile Card
  const renderMobileCard = (course) => (
    <Card className="bg-slate-900 border-slate-800 mb-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
             <h3 className="font-bold text-white text-lg">{course.program_name}</h3>
             <p className="text-slate-400 text-sm">{course.university}</p>
             <p className="text-xs text-slate-500 uppercase">{course.country}</p>
          </div>
          <Badge className={`${course.is_active ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-400'}`}>
            {course.is_active ? 'Active' : 'Draft'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
           <div className="bg-slate-800 p-2 rounded">
              <span className="text-xs text-slate-500 block">Level</span>
              <span className="text-white">{course.degree_level}</span>
           </div>
           <div className="bg-slate-800 p-2 rounded">
              <span className="text-xs text-slate-500 block">Tuition</span>
              <span className="text-white">{formatCurrency(course.tuition_fee, course.currency)}</span>
           </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
           <Button variant="ghost" size="sm" onClick={() => handleEdit(course)} className="flex-1">
             <Edit className="w-4 h-4 mr-2" /> Edit
           </Button>
           <Button variant="ghost" size="sm" onClick={() => handleStatusToggle(course)} className="flex-1">
             <Eye className="w-4 h-4 mr-2" /> {course.is_active ? 'Hide' : 'Show'}
           </Button>
           <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="text-red-400 flex-1">
             <Trash2 className="w-4 h-4 mr-2" /> Delete
           </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (view === 'editor') {
    return (
      <CourseEditor 
        course={selectedCourse} 
        onCancel={() => setView('list')}
        onSave={() => { setView('list'); fetchInitialData(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Course Management</h1>
          <p className="text-slate-400">Manage academic programs, degrees, and course details.</p>
        </div>
        <Button onClick={() => { setSelectedCourse(null); setView('editor'); }} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add New Course
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 md:space-y-0 md:flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search programs..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 bg-slate-950 border-slate-700"
          />
        </div>
        
        {/* Mobile-optimized scrollable filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          <Select value={filterUniversity} onValueChange={(val) => { setFilterUniversity(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px] bg-slate-950 border-slate-700 shrink-0">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map(uni => <SelectItem key={uni} value={uni}>{uni}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={(val) => { setFilterLevel(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] bg-slate-950 border-slate-700 shrink-0">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Responsive Table */}
      <AdminTable data={paginatedCourses} renderMobileCard={renderMobileCard}>
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="hover:bg-slate-950 border-slate-800">
              <TableHead onClick={() => handleSort('program_name')} className="cursor-pointer">Program Name</TableHead>
              <TableHead onClick={() => handleSort('university')} className="cursor-pointer">University</TableHead>
              <TableHead onClick={() => handleSort('degree_level')} className="cursor-pointer">Level</TableHead>
              <TableHead onClick={() => handleSort('tuition_fee')} className="cursor-pointer">Tuition</TableHead>
              <TableHead onClick={() => handleSort('is_active')} className="cursor-pointer">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
            ) : paginatedCourses.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-400">No courses found.</TableCell></TableRow>
            ) : (
              paginatedCourses.map((course) => (
                <TableRow key={course.id} className="group">
                  <TableCell className="font-medium text-white">{course.program_name}</TableCell>
                  <TableCell>{course.university}<br/><span className="text-xs text-slate-500">{course.country}</span></TableCell>
                  <TableCell><Badge variant="outline">{course.degree_level}</Badge></TableCell>
                  <TableCell>{formatCurrency(course.tuition_fee, course.currency)}</TableCell>
                  <TableCell>
                     {course.is_active ? <Badge className="bg-green-500/10 text-green-500">Active</Badge> : <Badge variant="secondary">Draft</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                        <DropdownMenuItem onClick={() => handleEdit(course)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusToggle(course)}><Eye className="mr-2 h-4 w-4" /> Toggle Status</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTable>

      <div className="flex justify-between items-center bg-slate-900 p-4 border border-slate-800 rounded-lg">
          <div className="text-sm text-slate-500 hidden md:block">
            Showing {paginatedCourses.length} of {filteredAndSortedCourses.length}
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
            <Button 
              variant="outline" size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button 
              variant="outline" size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="border-slate-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
      </div>
    </div>
  );
};

export default AdminCourses;