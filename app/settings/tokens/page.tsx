import { redirect } from "next/navigation";

export default function TokenSettingsPage() {
    redirect("/settings?tab=tokens");
}
