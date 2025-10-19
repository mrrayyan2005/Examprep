import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { logout, fetchProfile } from '@/redux/slices/authSlice';
import axiosInstance from '@/api/axiosInstance';

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    examTypes: user?.examTypes || [],
    examDate: user?.examDate ? new Date(user.examDate).toISOString().split('T')[0] : '',
  });

  const availableExamTypes = ['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'Defense', 'Teaching', 'Other'];
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Fetch latest user data when component mounts
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        examTypes: user.examTypes || [],
        examDate: user.examDate ? new Date(user.examDate).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!profileData.name.trim()) {
      toast({ variant: 'destructive', title: 'Name is required' });
      return;
    }
    if (profileData.examTypes.length === 0) {
      toast({ variant: 'destructive', title: 'Please select at least one exam type' });
      return;
    }
    if (!profileData.examDate) {
      toast({ variant: 'destructive', title: 'Exam date is required' });
      return;
    }

    try {
      const updateData = {
        ...profileData,
        examDate: new Date(profileData.examDate).toISOString(),
      };
      
      const response = await axiosInstance.put('/auth/profile', updateData);
      
      // Update Redux store with new user data
      if (response.data.success && response.data.data.user) {
        // Dispatch fetchProfile to update the store with the latest data
        await dispatch(fetchProfile());
        
        toast({ 
          title: 'Profile updated successfully!', 
          description: 'Your exam goals have been updated. The navigation will update automatically.' 
        });
        setIsEditing(false);
        
        // Small delay to ensure UI updates are reflected
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      const errorMessage = error instanceof Error && 'response' in error && error.response 
        ? (error.response as any)?.data?.message 
        : 'Failed to update profile';
        
      toast({ 
        variant: 'destructive', 
        title: 'Update failed',
        description: errorMessage
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({ title: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Password change failed' });
    }
  };

  const handleExamTypeChange = (examType: string, checked: boolean) => {
    if (checked) {
      setProfileData({ ...profileData, examTypes: [...profileData.examTypes, examType] });
    } else {
      setProfileData({ 
        ...profileData, 
        examTypes: profileData.examTypes.filter(type => type !== examType) 
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              // Default View - Read-only display
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-lg font-medium">{user?.name || 'Not set'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-lg">{user?.email || 'Not set'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Exam Goals</Label>
                  <div className="flex flex-wrap gap-2">
                    {user?.examTypes && user.examTypes.length > 0 ? (
                      user.examTypes.map((examType) => (
                        <Badge key={examType} variant="secondary" className="text-sm">
                          {examType}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No exam goals set</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Target Exam Date</Label>
                  <p className="text-lg">
                    {user?.examDate 
                      ? new Date(user.examDate).toLocaleDateString() 
                      : 'Not set'
                    }
                  </p>
                </div>
                
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            ) : (
              // Edit Mode - Form with all fields
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Exam Goals * (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableExamTypes.map((examType) => (
                      <div key={examType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${examType}`}
                          checked={profileData.examTypes.includes(examType)}
                          onCheckedChange={(checked) => handleExamTypeChange(examType, checked as boolean)}
                        />
                        <Label htmlFor={`edit-${examType}`} className="text-sm font-normal">
                          {examType}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {profileData.examTypes.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {profileData.examTypes.join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="examDate">Target Exam Date *</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={profileData.examDate}
                    onChange={(e) => setProfileData({ ...profileData, examDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>
              <Button type="submit">Change Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
