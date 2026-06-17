'use client';

import AchievementsManagement from '@/components/achievements/AchievementsManagement';

export default function HRAchievementsPage() {
  return (
    <AchievementsManagement
      achievementsApiPath="/achievements"
      employeesApiPath="/hr/employees"
      title="Employee Achievements"
    />
  );
}
