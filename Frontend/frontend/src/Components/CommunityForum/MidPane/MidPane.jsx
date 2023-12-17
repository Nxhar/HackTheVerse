
import { NavLink } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
function MidPane({data, setData, loading, setLoading}) {
  
  return (
    <div className='posts'>
      <h2 className='discussions'>All Discussions</h2>
      {loading ? (
        <div className="loader">
          <HashLoader color='#9b51e0' />
        </div>
      ) : (
        data.map((post) => (
          <NavLink key={post.id} style={{ textDecoration: 'none' }} to={`/discussions/${post.id}`}>
            <div key={post.id} className='post'>
              {post.photoUrl && <img src={post.photoUrl} className='photoUrl' alt='Post' />}
              <div className='col_2'>
                <h2>{post.title}</h2>
                <div className='askedBy'>
                  Shared by : {post.creator}
                  <div className='timestamp'>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</div>
                </div>
              </div>
              {post.imageUrl && <img src={post.imageUrl} className='imageUrl' alt=' ' />}
            </div>
          </NavLink>
        ))
      )}
    </div>
  );
}

export default MidPane;