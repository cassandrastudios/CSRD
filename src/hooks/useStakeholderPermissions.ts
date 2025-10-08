import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import {
  Stakeholder,
  StakeholderRole,
  STAKEHOLDER_PERMISSIONS,
} from '../types/stakeholder';
import { useAuth } from '../contexts/AuthContext';

export function useStakeholderPermissions(organizationId: string) {
  const { user } = useAuth();
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(
    STAKEHOLDER_PERMISSIONS.contributor
  );

  const supabase = createClient();

  useEffect(() => {
    if (user && organizationId) {
      loadStakeholderInfo();
    } else {
      setLoading(false);
    }
  }, [user, organizationId]);

  const loadStakeholderInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        console.error('Error loading stakeholder info:', error);
        setStakeholder(null);
        setPermissions(STAKEHOLDER_PERMISSIONS.contributor);
      } else {
        setStakeholder(data);
        setPermissions(STAKEHOLDER_PERMISSIONS[data.role as StakeholderRole]);
      }
    } catch (error) {
      console.error('Error loading stakeholder info:', error);
      setStakeholder(null);
      setPermissions(STAKEHOLDER_PERMISSIONS.contributor);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (areaType: string, areaId?: string) => {
    if (!stakeholder) return false;

    // Admins can access everything
    if (stakeholder.role === 'admin') return true;

    // Check if stakeholder is assigned to this area
    if (areaType && areaId) {
      return stakeholder.assigned_areas.includes(`${areaType}:${areaId}`);
    }

    // Check if stakeholder is assigned to this area type
    return stakeholder.assigned_areas.some(area =>
      area.startsWith(`${areaType}:`)
    );
  };

  const canInvite = (role: StakeholderRole) => {
    return permissions.canInvite.includes(role);
  };

  const canRemove = (role: StakeholderRole) => {
    return permissions.canRemove.includes(role);
  };

  const canManage = (targetRole: StakeholderRole) => {
    // Admins can manage everyone
    if (stakeholder?.role === 'admin') return true;

    // Managers can manage managers and contributors
    if (
      stakeholder?.role === 'manager' &&
      ['manager', 'contributor'].includes(targetRole)
    ) {
      return true;
    }

    // Contributors can manage contributors
    if (stakeholder?.role === 'contributor' && targetRole === 'contributor') {
      return true;
    }

    return false;
  };

  const getAssignedAreas = () => {
    if (!stakeholder) return [];

    return stakeholder.assigned_areas.map(area => {
      const [type, id] = area.split(':');
      return { type, id };
    });
  };

  const assignArea = async (areaType: string, areaId: string) => {
    if (!stakeholder || !permissions.canAssignAreas) return false;

    try {
      const newArea = `${areaType}:${areaId}`;
      const updatedAreas = [...stakeholder.assigned_areas, newArea];

      const { error } = await supabase
        .from('stakeholders')
        .update({
          assigned_areas: updatedAreas,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stakeholder.id);

      if (error) throw error;

      setStakeholder({
        ...stakeholder,
        assigned_areas: updatedAreas,
      });

      return true;
    } catch (error) {
      console.error('Error assigning area:', error);
      return false;
    }
  };

  const unassignArea = async (areaType: string, areaId: string) => {
    if (!stakeholder || !permissions.canAssignAreas) return false;

    try {
      const areaToRemove = `${areaType}:${areaId}`;
      const updatedAreas = stakeholder.assigned_areas.filter(
        area => area !== areaToRemove
      );

      const { error } = await supabase
        .from('stakeholders')
        .update({
          assigned_areas: updatedAreas,
          updated_at: new Date().toISOString(),
        })
        .eq('id', stakeholder.id);

      if (error) throw error;

      setStakeholder({
        ...stakeholder,
        assigned_areas: updatedAreas,
      });

      return true;
    } catch (error) {
      console.error('Error unassigning area:', error);
      return false;
    }
  };

  return {
    stakeholder,
    permissions,
    loading,
    canAccess,
    canInvite,
    canRemove,
    canManage,
    getAssignedAreas,
    assignArea,
    unassignArea,
    refresh: loadStakeholderInfo,
  };
}
