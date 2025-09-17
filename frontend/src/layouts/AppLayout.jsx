import { Outlet } from "react-router-dom";
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const AppLayout = () => {
  return (
    <div className="app-container">
      <TopNav />
      <BottomNav />
      <div className="app-body">
        <Outlet /> {/* renders the nested route component */}
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;



// import TopNav from '../components/TopNav';
// import Footer from '../components/Footer';
// import BottomNav from '../components/BottomNav';
// import AppRoute from '../routes/AppRoute';

// const AppLayout = () => {
//   return (
//     <div className="app-container">
//       <TopNav />
//       <BottomNav />
//       <AppRoute />
//       <Footer />
//     </div>
//   );
// };

// export default AppLayout;