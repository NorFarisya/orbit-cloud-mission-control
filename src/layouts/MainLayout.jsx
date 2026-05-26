import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;