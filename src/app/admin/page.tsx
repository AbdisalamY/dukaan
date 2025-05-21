
// File path: src/app/admin/page.tsx
// This page redirects to the dashboard page when accessing /admin
// The redirection ensures users always start at the dashboard

import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to dashboard by default
  redirect('/admin/dashboard');
}