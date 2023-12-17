import './sidemenu.css';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';
import MessageIcon from '@mui/icons-material/Message';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { NavLink } from 'react-router-dom';
import { auth } from '../../_Firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/Analytics';



function SideMenu({ user }) {
  const userIcon = user.photoURL;

  const handleLogOut = () => {
    signOut(auth)
  }

  return (
    <div className="sidebar">
      <div style={{textAlign:'center'}} className="title">WizCafe</div>


      <NavLink
        to="/discussions"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <MessageIcon />
        Discussions
      </NavLink>

      <NavLink
        to="/courses"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <LibraryBooksIcon />
        Courses
      </NavLink>


      <NavLink
        to="/docMistral"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <SmartToyIcon />
        DocMistral
      </NavLink>



      <NavLink
        to="/roadmaps"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <MapIcon />
        Roadmaps
      </NavLink>

      <NavLink
        to="/assessment"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <AssessmentIcon />
        Assessments
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive, isPending }) =>
          isPending ? 'pending' : isActive ? 'activeLink option' : 'option'
        }
      >
        <AnalyticsIcon />
        Analytics
      </NavLink>

      <div className="option" style={{cursor:'pointer'}} onClick={handleLogOut}>
        <LogoutIcon /> 
        Logout
      </div>

      <div className="profile">
        <img className="profile-iconHere" src={userIcon} alt="" />
        <div className="textIn">
          <div className="name">{user.displayName}</div>
          <div className="email">{user.email}</div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
