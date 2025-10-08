'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Plus,
  Mail,
  User,
  Shield,
  Users,
  UserPlus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Crown,
  Settings,
  UserCheck,
} from 'lucide-react';
import {
  Stakeholder,
  StakeholderRole,
  StakeholderStatus,
  STAKEHOLDER_PERMISSIONS,
} from '../types/stakeholder';
import { useAuth } from '../contexts/AuthContext';
import { sendStakeholderInvite, generateInviteUrl } from '../lib/email';

interface StakeholderManagementProps {
  organizationId: string;
}

export function StakeholderManagement({
  organizationId,
}: StakeholderManagementProps) {
  const { user } = useAuth();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StakeholderRole>('contributor');
  const [currentUserRole, setCurrentUserRole] =
    useState<StakeholderRole | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadStakeholders();
    loadCurrentUserRole();
  }, [organizationId]);

  const loadStakeholders = async () => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStakeholders(data || []);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      setCurrentUserRole(data?.role || null);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const handleInviteStakeholder = async () => {
    if (!inviteEmail || !currentUserRole || !user) return;

    const permissions = STAKEHOLDER_PERMISSIONS[currentUserRole];
    if (!permissions.canInvite.includes(inviteRole)) {
      alert('You do not have permission to invite this role level');
      return;
    }

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(); // 7 days

      const { data: inviteData, error } = await supabase
        .from('stakeholder_invites')
        .insert({
          email: inviteEmail,
          role: inviteRole,
          organization_id: organizationId,
          invited_by: user.id,
          token: token,
          expires_at: expiresAt,
        })
        .select(
          `
          *,
          organizations (
            name
          )
        `
        )
        .single();

      if (error) throw error;

      // Get inviter name
      const { data: inviterData } = await supabase
        .from('stakeholders')
        .select('name')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      // Send email invitation
      const inviteUrl = generateInviteUrl(token);
      const emailSent = await sendStakeholderInvite({
        email: inviteEmail,
        role: inviteRole,
        organizationName: inviteData.organizations?.name || 'CSRD Co-Pilot',
        inviterName: inviterData?.name || 'A team member',
        inviteUrl: inviteUrl,
        expiresAt: expiresAt,
      });

      if (emailSent) {
        alert('Invitation sent successfully!');
      } else {
        alert(
          'Invitation created but email failed to send. Please contact the stakeholder directly.'
        );
      }

      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('contributor');
    } catch (error) {
      console.error('Error inviting stakeholder:', error);
      alert('Failed to send invitation');
    }
  };

  const handleRemoveStakeholder = async (
    stakeholderId: string,
    stakeholderRole: StakeholderRole
  ) => {
    if (!currentUserRole) return;

    const permissions = STAKEHOLDER_PERMISSIONS[currentUserRole];
    if (!permissions.canRemove.includes(stakeholderRole)) {
      alert('You do not have permission to remove this stakeholder');
      return;
    }

    if (!confirm('Are you sure you want to remove this stakeholder?')) return;

    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', stakeholderId);

      if (error) throw error;

      setStakeholders(stakeholders.filter(s => s.id !== stakeholderId));
    } catch (error) {
      console.error('Error removing stakeholder:', error);
      alert('Failed to remove stakeholder');
    }
  };

  const handleUpdateRole = async (
    stakeholderId: string,
    newRole: StakeholderRole
  ) => {
    if (!currentUserRole) return;

    const permissions = STAKEHOLDER_PERMISSIONS[currentUserRole];
    if (!permissions.canRemove.includes(newRole)) {
      alert('You do not have permission to assign this role level');
      return;
    }

    try {
      const { error } = await supabase
        .from('stakeholders')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', stakeholderId);

      if (error) throw error;

      setStakeholders(
        stakeholders.map(s =>
          s.id === stakeholderId ? { ...s, role: newRole } : s
        )
      );
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const getRoleIcon = (role: StakeholderRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-red-500" />;
      case 'manager':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'contributor':
        return <UserCheck className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusIcon = (status: StakeholderStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: StakeholderStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: StakeholderRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'contributor':
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading stakeholders...</div>;
  }

  const permissions = currentUserRole
    ? STAKEHOLDER_PERMISSIONS[currentUserRole]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Stakeholder Management</h2>
          <p className="text-gray-600">
            Manage team members and their access levels
          </p>
        </div>
        {permissions && permissions.canInvite.length > 0 && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Stakeholder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Stakeholder</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="stakeholder@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={value =>
                      setInviteRole(value as StakeholderRole)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {permissions &&
                        permissions.canInvite.map(role => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              <span className="capitalize">{role}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteStakeholder} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({stakeholders.filter(s => s.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({stakeholders.filter(s => s.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({stakeholders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <StakeholderTable
            stakeholders={stakeholders.filter(s => s.status === 'active')}
            currentUserRole={currentUserRole}
            onRemove={handleRemoveStakeholder}
            onUpdateRole={handleUpdateRole}
            getRoleIcon={getRoleIcon}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getRoleColor={getRoleColor}
          />
        </TabsContent>

        <TabsContent value="pending">
          <StakeholderTable
            stakeholders={stakeholders.filter(s => s.status === 'pending')}
            currentUserRole={currentUserRole}
            onRemove={handleRemoveStakeholder}
            onUpdateRole={handleUpdateRole}
            getRoleIcon={getRoleIcon}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getRoleColor={getRoleColor}
          />
        </TabsContent>

        <TabsContent value="all">
          <StakeholderTable
            stakeholders={stakeholders}
            currentUserRole={currentUserRole}
            onRemove={handleRemoveStakeholder}
            onUpdateRole={handleUpdateRole}
            getRoleIcon={getRoleIcon}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getRoleColor={getRoleColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StakeholderTableProps {
  stakeholders: Stakeholder[];
  currentUserRole: StakeholderRole | null;
  onRemove: (id: string, role: StakeholderRole) => void;
  onUpdateRole: (id: string, role: StakeholderRole) => void;
  getRoleIcon: (role: StakeholderRole) => React.ReactNode;
  getStatusIcon: (status: StakeholderStatus) => React.ReactNode;
  getStatusColor: (status: StakeholderStatus) => string;
  getRoleColor: (role: StakeholderRole) => string;
}

function StakeholderTable({
  stakeholders,
  currentUserRole,
  onRemove,
  onUpdateRole,
  getRoleIcon,
  getStatusIcon,
  getStatusColor,
  getRoleColor,
}: StakeholderTableProps) {
  const permissions = currentUserRole
    ? STAKEHOLDER_PERMISSIONS[currentUserRole]
    : null;

  if (stakeholders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No stakeholders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map(stakeholder => (
            <TableRow key={stakeholder.id}>
              <TableCell className="font-medium">{stakeholder.name}</TableCell>
              <TableCell>{stakeholder.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRoleIcon(stakeholder.role)}
                  <Badge className={getRoleColor(stakeholder.role)}>
                    {stakeholder.role}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(stakeholder.status)}
                  <Badge className={getStatusColor(stakeholder.status)}>
                    {stakeholder.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {stakeholder.joined_at
                  ? new Date(stakeholder.joined_at).toLocaleDateString()
                  : 'Not joined'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {permissions &&
                    permissions.canRemove.includes(stakeholder.role) && (
                      <Select
                        value={stakeholder.role}
                        onValueChange={value =>
                          onUpdateRole(stakeholder.id, value as StakeholderRole)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {permissions &&
                            permissions.canRemove.map(role => (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(role)}
                                  <span className="capitalize">{role}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  {permissions &&
                    permissions.canRemove.includes(stakeholder.role) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onRemove(stakeholder.id, stakeholder.role)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
