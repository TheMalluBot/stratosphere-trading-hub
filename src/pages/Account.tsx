import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRoles } from '@/hooks/useUserRoles';

const Account: React.FC = () => {
  const roles = useUserRoles();

  return (
    <div className="p-6 max-w-4xl mx-auto grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile path="/account" routing="hash" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">Roles</p>
          <ul className="list-disc pl-6 text-sm">
            {roles.map(r => (
              <li key={r}>{r}</li>
            ))}
            {roles.length === 0 && <li>No roles assigned</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
