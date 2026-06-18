import { User, Scissors } from "lucide-react";
import { Employee, Order } from "@/types";

interface EmployeeLoadProps {
  employees: Employee[];
  orders: Order[];
}

export default function EmployeeLoad({ employees, orders }: EmployeeLoadProps) {
  const groomers = employees.filter((e) => e.role === "groomer");

  const getEmployeeOrders = (empId: string) => {
    return orders.filter((o) =>
      o.steps.some(
        (s) => s.employeeId === empId && s.status === "in_progress"
      )
    );
  };

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between p-5 pb-3 border-b border-cream-200">
        <h3 className="font-display font-bold text-brown-900 text-lg">
          员工负载
        </h3>
        <span className="chip bg-cream-100 text-brown-700/70">
          {groomers.length} 位美容师
        </span>
      </div>

      <div className="p-4 space-y-4">
        {groomers.map((emp, idx) => {
          const empOrders = getEmployeeOrders(emp.id);
          const load = empOrders.length;
          const maxLoad = 3;
          const loadPercent = Math.min((load / maxLoad) * 100, 100);
          const isBusy = load >= maxLoad;

          return (
            <div
              key={emp.id}
              className="flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${250 + idx * 50}ms` }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-cream-100">
                  {emp.avatarUrl ? (
                    <img
                      src={emp.avatarUrl}
                      alt={emp.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-brown-700/40" />
                    </div>
                  )}
                </div>
                {load > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {load}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-brown-900">
                    {emp.name}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isBusy ? "text-danger-500" : "text-brown-700/60"
                    }`}
                  >
                    {load === 0
                      ? "空闲中"
                      : load >= maxLoad
                      ? "忙碌中"
                      : "工作中"}
                  </span>
                </div>
                <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isBusy
                        ? "bg-gradient-to-r from-danger-400 to-danger-500"
                        : "bg-gradient-to-r from-primary-400 to-primary-500"
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
                {empOrders.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {empOrders.map((o) => (
                      <span
                        key={o.id}
                        className="chip bg-primary-50 text-primary-600 text-[10px]"
                      >
                        <Scissors className="w-3 h-3" />
                        {o.pet.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
