import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Trip } from '../types/trail';
import { Calendar, Users, TreePine, Save, Trash2, X } from 'lucide-react';

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

const LOCAL_STORAGE_KEY = 'trailsMapper.trips';

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

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    } else {
      setTrips(initialTrips);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialTrips));
    }
  }, [initialTrips]);

  // Save trips to localStorage whenever trips change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
    if (refreshTotals) {
      refreshTotals();
    }
  }, [trips, refreshTotals]);

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

  const handleSave = (index: number) => {
    if (editRow) {
      const newTrips = [...trips];
      const originalIndex = trips.findIndex(trip => 
        trip.date === sortedTrips[index].date && 
        trip.trail === sortedTrips[index].trail
      );
      if (originalIndex !== -1) {
        newTrips[originalIndex] = editRow;
        setTrips(newTrips);
      }
    }
    setEditingIndex(null);
    setEditRow(null);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditRow(null);
  };

  const handleDelete = (index: number) => {
    if (requireAuth) {
      requireAuth(() => {
        const newTrips = trips.filter(trip => 
          !(trip.date === sortedTrips[index].date && trip.trail === sortedTrips[index].trail)
        );
        setTrips(newTrips);
      });
    } else {
      const newTrips = trips.filter(trip => 
        !(trip.date === sortedTrips[index].date && trip.trail === sortedTrips[index].trail)
      );
      setTrips(newTrips);
    }
  };

  const handleChange = (field: keyof Trip, value: string) => {
    if (editRow) {
      setEditRow({ ...editRow, [field]: value });
    }
  };

  const handleAdd = () => {
    if (requireAuth) {
      requireAuth(() => {
        const newTrip: Trip = {
          date: new Date().toISOString().split('T')[0],
          trail: '',
          partners: '',
          treesCleared: ''
        };
        setTrips([...trips, newTrip]);
        setEditingIndex(trips.length);
        setEditRow(newTrip);
      });
    } else {
      const newTrip: Trip = {
        date: new Date().toISOString().split('T')[0],
        trail: '',
        partners: '',
        treesCleared: ''
      };
      setTrips([...trips, newTrip]);
      setEditingIndex(trips.length);
      setEditRow(newTrip);
    }
  };

  // Expose add function to parent
  useImperativeHandle(ref, () => ({
    add: handleAdd
  }), [trips, requireAuth]);

  return (
    <div className="bg-white h-full flex flex-col shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedTrips.map((trip, idx) => (
          <div
            key={idx}
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
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel();
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
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
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(idx);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
        ))}
      </div>
    </div>
  );
}); 