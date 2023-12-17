import MidPane from './MidPane/MidPane';
import RightPane from './RightPane/RightPane';
import './communityforum.css';
import FormToPost from './MidPane/FormToPost';
import { useState, useEffect } from 'react';
import { db } from  '../../_Firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

function CommunityForum({user}) {

    const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataCollection = collection(db, 'posts');

        // Use onSnapshot to listen for real-time updates
        const unsubscribe = onSnapshot(dataCollection, (snapshot) => {
          const newData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setData(newData);
          setLoading(false);
        });

        // Return the unsubscribe function to clean up the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  

  return (
    <div className='forumContainer' style={{display:'flex'}}>
      <div>
        <div className='displayBox'>
          <FormToPost  user={user} posts={data} setPosts={setData}  />
        </div>
        <div className="displayBox">
          <MidPane data={data} loading={loading} setLoading={setLoading} setData={setData} />
        </div>
      </div>
      <RightPane user={user} context={''} />
    </div>
  );
}

export default CommunityForum;
