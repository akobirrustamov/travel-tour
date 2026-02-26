import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <Header />
      <main className="pt-10 bg-[#1d2a25]">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
