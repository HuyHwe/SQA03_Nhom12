import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import HeaderAlternative from './HeaderAlternative/HeaderAlternative';
import { isLoggedIn, getUserFromToken } from "../utils/auth";

export default function Layout() {
  const logged = isLoggedIn();
  const user = getUserFromToken();

  return (
    <div>
        <HeaderAlternative logged={logged} user={user} />
        <main><Outlet /></main>
        <Footer />
    </div>
  );
}