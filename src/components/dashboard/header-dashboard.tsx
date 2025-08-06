
import DashboardCard from "./dash-board-card";
import { Button } from "../ui/button";
import { 
  Download, 
  Play, 
  Server, 
  Shield, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function HeaderDashBoard()
{

    const {t} = useTranslation("common");
    const dashboardData = [
    {
      title: "Total Nodes",
      value: "247",
      subtitle: "Active infrastructure nodes",
      icon: <Server className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      title: "Compliance Rate",
      value: "78%",
      subtitle: "", // Subtitle để trống vì có progress bar
      icon: <Shield className="h-4 w-4" />,
      variant: 'success' as const
    },
    {
      title: "Critical Issues",
      value: "12",
      subtitle: "Require immediate attention",
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'warning' as const
    },
    {
      title: "Last Audit",
      value: "2024-01-30 14:32:00",
      subtitle: "System-wide scan completed",
      icon: <Clock className="h-4 w-4" />,
      variant: 'info' as const
    }
  ];
    return (
         <div className="p-6 space-y-6 bg-background">

            {/* header and button action: export file and run audit */}

             <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t("dashboard.title")}
                    </h1>
                    <p className="text-muted-foreground mt-2 italic">
                        {t("dashboard.subtitle")}
                    </p>
                </div>




                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button variant="outline" className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>{t("dashboard.actions.export")}</span>
                    </Button>
                    <Button className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Play className="h-4 w-4" />
                        <span>{t("dashboard.actions.run")}</span>
                    </Button>
                </div>
            </div>

            {/* Dashboard cards */}

            <div className="grid gap-4  md:grid-cols-2 lg:grid-cols-4">

             {dashboardData.map((card, index) => (
                <DashboardCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    variant={card.variant}
                />
                ))}
            </div>



         </div>
    )
}