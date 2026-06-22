import { useQuery } from "@tanstack/react-query";
import { Trophy, Flame, Star, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getMyStats } from "../services/api";

interface GamificationWidgetProps {
  workspaceId?: string;
}

export const GamificationWidget = ({ workspaceId }: GamificationWidgetProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", workspaceId],
    queryFn: () => getMyStats(workspaceId).then((r) => r.data),
  });

  if (isLoading || !stats) {
    return <div className="gamification-widget loading">Loading stats...</div>;
  }

  const chartData = [
    { name: "XP", value: stats.xp },
    { name: "Tasks", value: stats.tasksCompleted },
    { name: "Streak", value: stats.streak },
    { name: "Level", value: stats.level * 10 },
  ];

  const xpToNextLevel = stats.level * 100 - stats.xp;
  const progress = ((stats.xp % 100) / 100) * 100;

  return (
    <div className="gamification-widget">
      <h3><Trophy size={18} /> Your Progress</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <Zap size={16} />
          <span className="stat-value">{stats.xp}</span>
          <span className="stat-label">XP</span>
        </div>
        <div className="stat-card">
          <Star size={16} />
          <span className="stat-value">Lv.{stats.level}</span>
          <span className="stat-label">Level</span>
        </div>
        <div className="stat-card">
          <Flame size={16} />
          <span className="stat-value">{stats.streak}</span>
          <span className="stat-label">Streak</span>
        </div>
      </div>

      <div className="level-progress">
        <div className="level-bar">
          <div className="level-fill" style={{ width: `${progress}%` }} />
        </div>
        <small>{xpToNextLevel > 0 ? `${xpToNextLevel} XP to next level` : "Max level reached!"}</small>
      </div>

      {stats.badges.length > 0 && (
        <div className="badges">
          {stats.badges.map((badge) => (
            <span key={badge.id} className="badge" title={badge.name}>
              {badge.name}
            </span>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
