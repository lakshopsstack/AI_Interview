import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JobSeekerData } from '@/types/jobSeeker';
import axios from 'axios';
import { config } from '@/config';
import DashboardLayout from '@/components/layout/CompanyLayout';
import { Separator } from '@/components/ui/separator';

const fetchCandidates = async (name: string, university: string): Promise<JobSeekerData[]> => {
  const params: any = {};
  if (name) params.name = name;
  if (university) params.university = university;
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get(`${config.API_BASE_URL}/company/candidates/search`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (typeof res.data === 'string' && res.data.startsWith('<!DOCTYPE')) {
      throw new Error('API returned HTML. Check your API URL and server.');
    }
    return res.data;
  } catch (err: any) {
    if (err.response && typeof err.response.data === 'string' && err.response.data.startsWith('<!DOCTYPE')) {
      throw new Error('API returned HTML. Check your API URL and server.');
    }
    throw err;
  }
};

const CandidateSearch: React.FC = () => {
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [candidates, setCandidates] = useState<JobSeekerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<JobSeekerData | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCandidates(name, university);
      setCandidates(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName('');
    setUniversity('');
    setCandidates([]);
    setError('');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Candidate Search</h1>
        <div className="flex gap-4 mb-4 items-center">
          <Input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            placeholder="University Name"
            value={university}
            onChange={e => setUniversity(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button onClick={handleClear} variant="secondary" type="button" disabled={loading}>
            Clear
          </Button>
        </div>
        <Separator className="mb-4" />
        {error && <div className="text-destructive-foreground bg-destructive/80 rounded px-3 py-2 mb-2">{error}</div>}
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">{candidates.length > 0 ? `${candidates.length} candidate${candidates.length > 1 ? 's' : ''} found` : ''}</span>
        </div>
        <div className="space-y-2 min-h-[120px]">
          {candidates.length === 0 && !loading && !error && (
            <div className="text-center text-muted-foreground py-8">No candidates found. Try adjusting your filters.</div>
          )}
          {candidates.map(candidate => (
            <Card
              key={candidate.id}
              className="p-4 flex justify-between items-center cursor-pointer bg-card text-card-foreground hover:bg-accent transition-colors"
              onClick={() => setSelected(candidate)}
            >
              <div>
                <div className="font-semibold">{candidate.firstname} {candidate.lastname}</div>
                <div className="text-sm text-muted-foreground">{candidate.email}</div>
              </div>
              <div className="text-sm text-muted-foreground">{candidate.current_location}</div>
            </Card>
          ))}
        </div>
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogTitle>Candidate Details</DialogTitle>
            {selected && (
              <div className="space-y-2">
                <div><b>Name:</b> {selected.firstname} {selected.lastname}</div>
                <div><b>Email:</b> {selected.email}</div>
                <div><b>Phone:</b> {selected.phone}</div>
                <div><b>Location:</b> {selected.current_location}</div>
                <div><b>University(s):</b> {selected.higher_educations?.map((edu: any) => edu.college_name).join(', ')}</div>
                <div><b>Key Skills:</b> {selected.key_skills}</div>
                <div><b>Profile Summary:</b> {selected.profile_summary}</div>
                {/* Add more fields as needed */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CandidateSearch; 