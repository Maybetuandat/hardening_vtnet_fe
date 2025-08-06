
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
}
const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default' 
}) => {
  
  const getValueColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-black-600';
      default:
        return 'text-foreground';
    }
  };
  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header với title và icon */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={getIconColor()}>
          {icon}
        </div>
      </CardHeader>
      
      {/* Content với value, subtitle và progress bar */}
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        
        {/* Progress bar chỉ hiển thị cho success variant có % */}
        {variant === 'success' && typeof value === 'string' && value.includes('%') && (
          <div className="mt-3">
            <Progress 
              value={parseInt(value.replace('%', ''))} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default DashboardCard;