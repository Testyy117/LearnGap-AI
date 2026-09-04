          "use client";
import { auth } from '@/Firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="space-y-4">
        <button className="w-full p-3 bg-gray-200 rounded">Profile</button>
        <button className="w-full p-3 bg-gray-200 rounded">Notifications</button>
        <button 
          onClick={handleLogout}
          className="w-full p-3 bg-red-500 text-white rounded">
          Logout
        </button>
      </div>
    </div>
  );
}
