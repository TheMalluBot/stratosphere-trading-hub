import { useUser } from '@clerk/clerk-react';

/**
 * Return the list of role strings associated with the current Clerk user.
 * We store roles in `publicMetadata.roles` as a string[] on the user object.
 */
export const useUserRoles = (): string[] => {
  const { user } = useUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  return roles;
};
