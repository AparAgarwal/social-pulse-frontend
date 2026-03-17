import { useNavigate } from 'react-router-dom';

/**
 * A custom hook that provides a safe back navigation function.
 * If there's no history (e.g., user landed on the page directly), 
 * it navigates to the home page ('/').
 */
export function useNavigateBack() {
  const navigate = useNavigate();

  const handleBack = () => {
    // window.history.length > 2 usually means there's a previous page within the same session.
    // However, some browsers start at 1 or 2 depending on the initial state.
    // A more reliable way in React Router is to check if we can go back.
    // But since we want to handle the "landed via link" case specifically:
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return handleBack;
}
