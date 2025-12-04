import Dashboard from "@/components/Dashboard";
import { FilterProvider } from "@/components/FilterProvider";

export default function Home() {
  return (
    <FilterProvider>
      <Dashboard />
    </FilterProvider>
  );
}
