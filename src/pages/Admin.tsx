import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/AdminDashboard';
import TicketDetail from '@/components/TicketDetail';

export default function Admin() {
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);

  return (
    <DashboardLayout>
      {selectedInquiry ? (
        <TicketDetail inquiryId={selectedInquiry} onBack={() => setSelectedInquiry(null)} />
      ) : (
        <AdminDashboard onSelectInquiry={setSelectedInquiry} />
      )}
    </DashboardLayout>
  );
}