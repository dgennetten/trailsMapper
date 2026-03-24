import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Trip } from '../types/trail';
import { Calendar, Users, TreePine, Save, Trash2, X } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

interface TripsTableProps {
  initialTrips: Trip[];
  onTrailSelect: (trailName: string) => void;
  sortBy?: 'date' | 'trail' | 'trees';
  sortDesc?: boolean;
  isAuthenticated?: boolean;
  requireAuth?: (action: () => void) => void;
  refreshTotals?: () => void;
}

export interface TripsTableRef {
  add: () => void;
}

export const TripsTable = forwardRef<TripsTableRef, TripsTableProps>(({ 
  initialTrips, 
  onTrailSelect, 
  sortBy = 'date',
  sortDesc = true,
  isAuthenticated = false,
  requireAuth,
  refreshTotals
}, ref) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trips from Supabase on mount
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabase();
      if (!supabase) {
        setTrips(initialTrips);
        setError(
          'Supabase is not configured (add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart the dev server). Using bundled patrol data; cloud save is disabled.'
        );
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('trailPatrols')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) {
        console.error('Error loading trips from Supabase:', fetchError);
        const errorMessage = fetchError.message || 'Unknown error';
        const errorCode = fetchError.code || 'UNKNOWN';
        setError(`Failed to load patrols: ${errorMessage} (Code: ${errorCode}). Using initial data.`);
        console.error('Full error details:', fetchError);
        // Fallback to initial trips if Supabase fails
        setTrips(initialTrips);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Transform Supabase data to Trip format
        const transformedTrips: Trip[] = data.map(row => ({
          id: row.id,
          date: row.date,
          trail: row.trail,
          partners: row.partners || '',
          treesCleared: row.trees_cleared || ''
        }));
        setTrips(transformedTrips);
      } else {
        // No data in Supabase, use initial trips
        setTrips(initialTrips);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error loading trips:', err);
      setError('Unexpected error loading patrols.');
      setTrips(initialTrips);
      setLoading(false);
    }
  };

  // Save a trip to Supabase
  const saveTripToSupabase = async (trip: Trip): Promise<string | null> => {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('trailPatrols')
        .insert({
          date: trip.date,
          trail: trip.trail,
          partners: trip.partners || null,
          trees_cleared: trip.treesCleared || null
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error saving trip to Supabase:', insertError);
        throw insertError;
      }

      return data?.id || null;
    } catch (err) {
      console.error('Error in saveTripToSupabase:', err);
      throw err;
    }
  };

  // Update a trip in Supabase
  const updateTripInSupabase = async (trip: Trip): Promise<void> => {
    if (!trip.id) {
      throw new Error('Cannot update trip without ID');
    }

    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error: updateError } = await supabase
        .from('trailPatrols')
        .update({
          date: trip.date,
          trail: trip.trail,
          partners: trip.partners || null,
          trees_cleared: trip.treesCleared || null
        })
        .eq('id', trip.id);

      if (updateError) {
        console.error('Error updating trip in Supabase:', updateError);
        throw updateError;
      }
    } catch (err) {
      console.error('Error in updateTripInSupabase:', err);
      throw err;
    }
  };

  // Delete a trip from Supabase
  const deleteTripFromSupabase = async (tripId: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error: deleteError } = await supabase
        .from('trailPatrols')
        .delete()
        .eq('id', tripId);

      if (deleteError) {
        console.error('Error deleting trip from Supabase:', deleteError);
        throw deleteError;
      }
    } catch (err) {
      console.error('Error in deleteTripFromSupabase:', err);
      throw err;
    }
  };

  // Sort trips based on props
  const sortedTrips = React.useMemo(() => {
    return [...trips].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'trail':
          aValue = a.trail.toLowerCase();
          bValue = b.trail.toLowerCase();
          break;
        case 'trees':
          aValue = parseInt(a.treesCleared) || 0;
          bValue = parseInt(b.treesCleared) || 0;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (aValue < bValue) return sortDesc ? 1 : -1;
      if (aValue > bValue) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [trips, sortBy, sortDesc]);

  const formatDate = (dateString: string) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleEdit = (index: number) => {
    if (requireAuth) {
      requireAuth(() => {
        setEditingIndex(index);
        setEditRow({ ...sortedTrips[index] });
      });
    } else {
      setEditingIndex(index);
      setEditRow({ ...sortedTrips[index] });
    }
  };

  const handleSave = async (index: number) => {
    if (!editRow) return;

    try {
      const tripToSave = { ...editRow };
      const originalTrip = sortedTrips[index];

      if (originalTrip.id) {
        // Update existing trip
        tripToSave.id = originalTrip.id;
        await updateTripInSupabase(tripToSave);
        
        // Update local state
        const newTrips = trips.map(trip => 
          trip.id === originalTrip.id ? tripToSave : trip
        );
        setTrips(newTrips);
      } else {
        // Insert new trip
        const newId = await saveTripToSupabase(tripToSave);
        tripToSave.id = newId || undefined;
        
        // Update local state
        const newTrips = trips.map(trip => 
          trip === originalTrip ? tripToSave : trip
        );
        setTrips(newTrips);
      }

      setEditingIndex(null);
      setEditRow(null);
      
      if (refreshTotals) {
        refreshTotals();
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      alert('Failed to save patrol. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditRow(null);
  };

  const handleDelete = async (index: number) => {
    const tripToDelete = sortedTrips[index];
    
    const performDelete = async () => {
      try {
        if (tripToDelete.id) {
          // Delete from Supabase
          await deleteTripFromSupabase(tripToDelete.id);
        }
        
        // Update local state
        const newTrips = trips.filter(trip => trip !== tripToDelete);
        setTrips(newTrips);
        
        if (refreshTotals) {
          refreshTotals();
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete patrol. Please try again.');
      }
    };

    if (requireAuth) {
      requireAuth(performDelete);
    } else {
      performDelete();
    }
  };

  const handleChange = (field: keyof Trip, value: string) => {
    if (editRow) {
      setEditRow({ ...editRow, [field]: value });
    }
  };

  const handleAdd = () => {
    const performAdd = () => {
      const newTrip: Trip = {
        date: new Date().toISOString().split('T')[0],
        trail: '',
        partners: '',
        treesCleared: ''
      };
      setTrips([...trips, newTrip]);
      setEditingIndex(trips.length);
      setEditRow(newTrip);
    };

    if (requireAuth) {
      requireAuth(performAdd);
    } else {
      performAdd();
    }
  };

  // Expose add function to parent
  useImperativeHandle(ref, () => ({
    add: handleAdd
  }), [trips, requireAuth]);

  if (loading) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Loading patrols from Supabase...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col shadow-lg">
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="text-sm text-yellow-700 font-medium mb-2">⚠️ {error}</div>
          <div className="text-xs text-yellow-600 mt-2">
            <p>Check the browser console (F12) for detailed error information.</p>
            <p className="mt-1">Common issues:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Missing or incorrect .env file</li>
              <li>RLS policies blocking access</li>
              <li>Table name mismatch (should be "trailPatrols")</li>
            </ul>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedTrips.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No patrols found. Click the pencil icon to add one.
          </div>
        ) : (
          sortedTrips.map((trip, idx) => (
            <div
              key={trip.id || idx}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                editingIndex === idx
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
              }`}
              onClick={() => editingIndex === idx ? undefined : onTrailSelect(trip.trail)}
            >
              {editingIndex === idx ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full border rounded px-3 py-2"
                        value={editRow?.date || ''}
                        onChange={e => handleChange('date', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trees Cleared</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={editRow?.treesCleared || ''}
                        onChange={e => handleChange('treesCleared', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trail</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={editRow?.trail || ''}
                      onChange={e => handleChange('trail', e.target.value)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partners</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={editRow?.partners || ''}
                      onChange={e => handleChange('partners', e.target.value)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(idx);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 transition-colors"
                      title="Save changes"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{formatDate(trip.date)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(idx);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Edit Patrol"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(idx);
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Patrol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{trip.trail}</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {trip.partners && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{trip.partners}</span>
                      </div>
                    )}
                    {trip.treesCleared && (
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4" />
                        <span>{trip.treesCleared} trees cleared</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});
