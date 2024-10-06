import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import StarRating from './StarRating';


//IMPORTANT
/*
function Test(){
  const[movieRating,setMovieRating] = useState(0);
  return (
    <div>
      <StarRating maxratings={5} color='salmon' onSetRating={setMovieRating}/>
      <p>This movie has {movieRating} rating</p>
    </div>
  )
}
*/

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* // <StarRating maxratings={10}/> */}
    {/* // <StarRating maxratings={5} messages={["Terrible","Bad", "Okay", "Good", "Amazing" ]}/>
    <StarRating maxratings={5} color="red" className="test" defaultRating={2}/> */}
    {/* <StarRating /> */}
    {/* <Test /> */}
  </React.StrictMode>
);

