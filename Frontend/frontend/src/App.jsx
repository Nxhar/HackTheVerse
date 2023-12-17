import { useState, useEffect } from 'react'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'; // Import User type
import { auth, provider } from './_Firebase/firebaseConfig';
import './App.css'
import SideMenu from './Components/NavPane/SideMenu'
import DocMistral from './Components/AICurator/DocMistral'
import { Route, Routes } from 'react-router-dom';
import Courses from './Components/CoursesPane/Courses';
import CommunityForum from './Components/CommunityForum/CommunityForum';
import Post from './Components/CommunityForum/Post/Post';
import Roadmap from './Components/Roadmaps/Roadmap';
import Assessment from './Components/Assessment/Assessment';
import AnalyticsIndividual from './Components/Analytics/AnalyticsIndividual';

function App() {
  const [user, setUser] = useState(null); // Explicitly define User | null type
  const [userPresent, setUserPresent] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if(authUser){
        setUser(authUser);
          setUserPresent(true);
      }
      else{
        setUser(null)
        setUserPresent(false)
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);


  const handleGoogleAuth = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
    {!userPresent ? (
        <div style={{display:'flex' , justifyContent:'center', alignItems:'center', height:'100vh', backgroundColor:'#9b51e0'}}>
          <div onClick={handleGoogleAuth}>Sign In With Google</div>
        </div>
      ) : (
        <> 
        <div className="" style={{display:'flex'}}>
          <SideMenu user={user} /> 

          <Routes>
            <Route path='/docMistral' element={<DocMistral user={user} />}  />
            <Route path='/courses' element={ <Courses user={user} /> } />
            <Route path='/discussions' element={ <CommunityForum user={user}/> } />
            <Route path='/discussions/:id' element={<Post user={user}/>} />
            <Route path='/roadmaps' element={<Roadmap />} /> 
            <Route path='/assessment' element={<Assessment user={user}/>} />
            <Route path='/analytics' element={<AnalyticsIndividual user={user}/>} />
          </Routes>
        </div>
        </>

      )

    }
    </>
  )
}

export default App
