export type StakeholderRole = 'admin' | 'manager' | 'contributor';

export type StakeholderStatus = 'active' | 'pending' | 'inactive';

export interface Stakeholder {
  id: string;
  email: string;
  name: string;
  role: StakeholderRole;
  status: StakeholderStatus;
  organization_id: string;
  user_id?: string; // If they have an account
  invited_by: string; // User ID who invited them
  invited_at: string;
  joined_at?: string;
  last_active?: string;
  assigned_areas: string[]; // Areas/cards/menus they can access
  created_at: string;
  updated_at: string;
}

export interface StakeholderInvite {
  id: string;
  email: string;
  role: StakeholderRole;
  organization_id: string;
  invited_by: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface StakeholderPermission {
  role: StakeholderRole;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canInvite: StakeholderRole[]; // Roles they can invite
  canRemove: StakeholderRole[]; // Roles they can remove
  canAssignAreas: boolean;
}

export const STAKEHOLDER_PERMISSIONS: Record<
  StakeholderRole,
  StakeholderPermission
> = {
  admin: {
    role: 'admin',
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canInvite: ['admin', 'manager', 'contributor'],
    canRemove: ['admin', 'manager', 'contributor'],
    canAssignAreas: true,
  },
  manager: {
    role: 'manager',
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canInvite: ['manager', 'contributor'],
    canRemove: ['manager', 'contributor'],
    canAssignAreas: true,
  },
  contributor: {
    role: 'contributor',
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canInvite: ['contributor'],
    canRemove: ['contributor'],
    canAssignAreas: false,
  },
};

export interface StakeholderAssignment {
  id: string;
  stakeholder_id: string;
  area_type:
    | 'materiality'
    | 'value_chain'
    | 'reporting'
    | 'compliance'
    | 'data_hub';
  area_id: string;
  assigned_by: string;
  assigned_at: string;
}
