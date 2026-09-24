import { redirect } from "next/navigation";

// Leads is an internal agency feature — clients should not see this page.
export default function LeadsPage() {
  redirect("/dashboard");
}
