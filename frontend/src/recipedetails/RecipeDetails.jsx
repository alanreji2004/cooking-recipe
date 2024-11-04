import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RecipeDetails.module.css';
import profileIcon from './usericon.png';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
    };



    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/recipes/${id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchRecipeDetails();
    fetchComments();
  }, [id]);

  const handleHome =()=>{
    navigate('/');
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('user')); 
    if (!currentUser) {
      alert("You need to be logged in to comment.");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8082/recipes/${id}/comments`, {
        user_id: currentUser.id,
        comment: newComment,
      });
      setComments((prev) => [...prev, response.data]); 
      setNewComment('');
      window.location.reload();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (!recipe) {
    return <p>Loading recipe details...</p>;
  }

  return (
    <div className={styles.container}>
      <button onClick={handleHome} className={styles.homeBtn}>Go to Home Page</button>
      <h1 className={styles.recipeTitle}>{recipe.title}</h1>
      <p><strong>Author:</strong> {recipe.author_name}</p>
      <p>{recipe.description}</p>
      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.split(',').map((ingredient, index) => (
          <li key={index}>{ingredient.trim()}</li>
        ))}
      </ul>

      <h2>Comments</h2>
      <div className={styles.commentSection}>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <img src={profileIcon} alt="User" className={styles.profileIcon} />
              <div className={styles.commentContent}>
                <strong>{comment.user_name}:</strong> {comment.comment}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RecipeDetails;
