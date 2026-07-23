import { useContext } from "react";
import { LeaveContext } from "./LeaveContext.shared";

export const useLeave = () => {
    const ctx = useContext(LeaveContext);
    if (!ctx) throw new Error("useLeave must be used within LeaveProvider");
    return ctx;
};
