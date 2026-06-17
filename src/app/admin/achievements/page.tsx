'use client';

import AchievementsManagement from '@/components/achievements/AchievementsManagement';

export default function AdminAchievementsPage() {
  return (
    <AchievementsManagement
      achievementsApiPath="/admin/achievements"
      employeesApiPath="/admin/employees"
      title="Achievements Management"
    />
  );
}
