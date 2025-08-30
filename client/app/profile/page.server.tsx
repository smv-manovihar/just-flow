import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/server-api';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const user = await getServerUser();
  
  // Redirect to home if not authenticated
  if (!user) {
    redirect('/');
  }

  return <ProfileClient user={user} />;
}
