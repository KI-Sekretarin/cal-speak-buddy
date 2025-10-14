import { useState } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import TicketDetail from '@/components/TicketDetail';

export default function Admin() {
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);

  if (selectedInquiry) {
    return <TicketDetail inquiryId={selectedInquiry} onBack={() => setSelectedInquiry(null)} />;
  }

  return <AdminDashboard onSelectInquiry={setSelectedInquiry} />;
}