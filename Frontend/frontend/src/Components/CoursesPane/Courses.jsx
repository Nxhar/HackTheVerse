import { useState, useEffect } from 'react'
import { db } from '../../_Firebase/firebaseConfig';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import './courses.css'

import SearchIcon from '@mui/icons-material/Search';
import { SyncLoader } from 'react-spinners';
import StarIcon from '@mui/icons-material/Star';


function Courses({user}) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('')
  const [recommended, setRecommended] = useState([])
  const [rloading, setRloading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  
useEffect(() => {
  const fetchData = async () => {
    try {
      const dataCollection = collection(db, 'courses');

      // Use onSnapshot to listen for real-time updates
      const unsubscribe = onSnapshot(dataCollection, (snapshot) => {
        const newData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(newData);
      });

      // Return the unsubscribe function to clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchRecommendedData = async () => {
    try {
      // Wait for the initial data to be fetched
      await fetchData();
  
      const pastSearchesCollection = collection(db, 'past_searches');
      const userDocRef = doc(pastSearchesCollection, user.uid);
  
      // Use onSnapshot to listen for real-time updates
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const pastSearches = snapshot.exists() ? snapshot.data().searches : [];
        const coursesCopy = [...data]; // Create a copy of the original courses data
  
        const recommendedCourses = [];
  
        for (const search of pastSearches) {
          const categoryCourses = coursesCopy.filter((course) => course.course_category === search);
  
          // If there are courses in the category
          if (categoryCourses.length > 0) {
            // Sort courses within the category based on rating
            const sortedCategoryCourses = categoryCourses.sort((a, b) => b.rating - a.rating);
  
            // Add the highest-rated course to recommended and remove it from the copy
            const highestRatedCourse = sortedCategoryCourses.shift();
            if (highestRatedCourse) {
              recommendedCourses.push(highestRatedCourse);
              const indexToRemove = coursesCopy.findIndex((course) => course.course_id === highestRatedCourse.course_id);
              if (indexToRemove !== -1) {
                coursesCopy.splice(indexToRemove, 1);
              }
            }
          }
        }
  
        // console.log('Recommended Courses:', recommendedCourses);
  
        setRecommended(recommendedCourses);
        setRloading(false);
        setLoading(false);
      });
  
      // Return the unsubscribe function to clean up the listener when the component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching recommended data:', error);
    }
  };
  
  

  

  fetchRecommendedData();
}, [recommended]); 



const handleQuery = async () => {
    if (!query) {
      return;
    }

    setQuery('');
    setHasSearched(true)
    
    try {
      const response = await fetch('http://127.0.0.1:5000/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });
  
      const { categories } = await response.json();
      
      // Check if categories is an array
      if (Array.isArray(categories)) {
        const filteredCourses = data.filter((course) =>
          categories.includes(course.course_category)
        );

        console.log(categories)
  
        console.log('Filtered Courses:', filteredCourses);
        setSearchResults(filteredCourses)

      } else {
        console.error('Invalid categories format:', categories);
      }
    } catch (e) {
      console.error(e);
    }
  
    
  };

  
  const handleCourseClick = async (courseCategory) => {
    try {
        console.log(courseCategory);
    
        if (!user || !user.uid) {
          console.error('User or UID not available.');
          return;
        }
    
        const pastSearchesCollection = collection(db, 'past_searches');
    
        const userDocRef = doc(pastSearchesCollection, user.uid);
    
        const pastSearchesDoc = await getDoc(userDocRef);
        const existingSearches = pastSearchesDoc.exists() ? pastSearchesDoc.data().searches : [];
    
        const updatedSearches = [courseCategory, ...existingSearches.slice(0, 4)]; // Keep only the last 5 searches
    
        await setDoc(userDocRef, { searches: updatedSearches });
    
      } catch (error) {
        console.error('Error handling course click:', error);
      }
  }






  return (
    <div className='coursesContainer'>
        
        <div className="searchArea">
            <img src={user.photoURL} className='chat-user-message-icon' alt="" />
          <div className="bottomLayer" onSubmit={ async (e)=> {e.preventDefault(); await handleQuery() }}>
            <form className="inputBox">           
              <input type="text" className='textBox' value={query} onChange={(e)=>{setQuery(e.target.value)}} placeholder='What course would you like to view today?' />
              <SearchIcon className='btn' onClick={handleQuery} />
            </form>
          </div>
        </div>
        
        
        {
            !hasSearched ? 
        ( loading && rloading ? <SyncLoader /> : (

            <>
            <h2 className="courseHeading">
                Recommended Courses
            </h2>
            { recommended ?.map((course) => (
                <div key={course.course_id} className="courseContainer" style={{cursor:'pointer'}} onClick={() => handleCourseClick(course.course_category)}>
                    <img className='chat-user-message-icon' src="https://th.bing.com/th/id/OIP.v-SSnSruWQfbLMEHKw5TigHaFj?w=227&h=180&c=7&r=0&o=5&pid=1.7" alt="" />
                    <div className="">
                    <div className="courseTitle">{course.course_name}</div>
                    <div className="courseDesc">{course.course_description}</div>
                    <div className="rating">Rated - {course.rating} <StarIcon fontSize='10'/></div>
                    </div>
                </div>
            ))  }


            
            <h2 className='courseHeading'>All Courses</h2>
            { data ?.map((course) => (
                <div key={course.course_id} className="courseContainer" style={{cursor:'pointer'}} onClick={() => handleCourseClick(course.course_category)}>
                    <img className='chat-user-message-icon' src="https://th.bing.com/th/id/OIP.v-SSnSruWQfbLMEHKw5TigHaFj?w=227&h=180&c=7&r=0&o=5&pid=1.7" alt="" />
                    <div className="">
                    <div className="courseTitle">{course.course_name}</div>
                    <div className="courseDesc">{course.course_description}</div>
                    <div className="rating">Rated - {course.rating} <StarIcon fontSize='10'/></div>

                    </div>
                </div>
            ))  }

            </>
        )
        ) : (
            // has searched
            <>
            <h2 className="courseHeading">Search Results</h2> 
            {
                searchResults ? searchResults.map( course => (
                    <div key={course.course_id} className="courseContainer" style={{cursor:'pointer'}} onClick={() => handleCourseClick(course.course_category)}>
                    <img className='chat-user-message-icon' src="https://th.bing.com/th/id/OIP.v-SSnSruWQfbLMEHKw5TigHaFj?w=227&h=180&c=7&r=0&o=5&pid=1.7" alt="" />
                    <div className="">
                    <div className="courseTitle">{course.course_name}</div>
                    <div className="courseDesc">{course.course_description}</div>
                    <div className="rating">Rated - {course.rating} <StarIcon fontSize='10'/></div>

                    </div>
                    </div>
                ) ) : (<SyncLoader />)
            }

            </>

        )
    }
        
    </div>
  )
}

export default Courses