import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { register, clearError } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BookOpen } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [examDate, setExamDate] = useState('');

  const availableExamTypes = ['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'Defense', 'Teaching', 'Other'];
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, error, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error,
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'Passwords do not match',
      });
      return;
    }

    if (examTypes.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select at least one exam type',
      });
      return;
    }

    if (!examDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select an exam date',
      });
      return;
    }

    await dispatch(register({ name, email, password, examTypes, examDate }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gradient-primary)]">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Start your exam preparation journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <Label>Exam Types (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableExamTypes.map((exam) => (
                  <div key={exam} className="flex items-center space-x-2">
                    <Checkbox
                      id={exam}
                      checked={examTypes.includes(exam)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExamTypes([...examTypes, exam]);
                        } else {
                          setExamTypes(examTypes.filter((type) => type !== exam));
                        }
                      }}
                    />
                    <Label htmlFor={exam} className="text-sm font-normal">
                      {exam}
                    </Label>
                  </div>
                ))}
              </div>
              {examTypes.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {examTypes.join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="examDate">Target Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
