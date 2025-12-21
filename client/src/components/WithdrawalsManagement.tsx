// components/WithdrawalsManagement.tsx
import { CreditCard } from "lucide-react";
import GenericDataManagement from "./GenericDataManagement";

export default function WithdrawalsManagement() {
  return (
    <GenericDataManagement
      className="Withdrawal"
      title="Withdrawals"
      description="Manage user withdrawal requests"
      icon={CreditCard}
      columns={[
        { key: "user", label: "User", type: "user" },
        { key: "amount", label: "Amount", type: "number" },
        { key: "method", label: "Method", type: "text" },
        { key: "status", label: "Status", type: "status" },
        { key: "transactionId", label: "Transaction ID", type: "text" },
        { key: "createdAt", label: "Requested At", type: "date" },
      ]}
      editRoute="/admin/withdrawals/edit"
    />
  );
}