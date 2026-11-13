import React from 'react';
import { UserCheck, CheckCircle2, Clock } from 'lucide-react';

export const EmployeeWorkPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white border border-[#dfe7e0] rounded-xl p-6 shadow-xs">
        <span className="text-[10px] uppercase font-bold text-[#657970] tracking-wider">Team Performance</span>
        <h1 className="text-xl font-bold text-[#143e32] mt-0.5">Employee Work Report</h1>
        <p className="text-xs text-[#657970] mt-1">
          Track daily cataloging velocity, operator SKU outputs, image QC pass rates, and turnaround times.
        </p>
      </div>

      <div className="bg-white border border-[#dee6df] rounded-xl p-8 shadow-xs text-center text-xs text-gray-500">
        <UserCheck className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <h3 className="font-bold text-gray-800 text-sm">Operator Productivity Metrics Active</h3>
        <p className="max-w-md mx-auto mt-1 text-gray-500">
          Assignments made in Planning &amp; Tasks will log operator completion times and accuracy scores here once completed.
        </p>
      </div>
    </div>
  );
};

