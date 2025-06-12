import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const styles = {
  buttons: {
    display: 'flex',
    gap: '1rem',
    margin: '1rem 0',
  },
  imageBox: {
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    margin: '1rem 0',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
  image: {
    maxWidth: '100%',
    borderRadius: '8px',
  },
} as const;

const Home: FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [catImageUrl, setCatImageUrl] = useState('');

  const fetchRandomCat = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('excuse-generator', {
        method: 'POST',
        body: { language: 'en' }
      });

      if (error) {
        throw error;
      }

      if (data) {
        setCatImageUrl(data);
      }
    } catch (error) {
      console.error('Error fetching cat image:', error);
      setCatImageUrl('');
    }
  };

  useEffect(() => {
    // Check for current session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        navigate('/login');
        return;
      }

      if (!data.session) {
        navigate('/login');
        return;
      }

      setUser(data.session.user);
      setLoading(false);
      fetchRandomCat(); // Load a cat on page load
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        return;
      }
      navigate('/login');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Random Cat Generator 🐱</h1>

      {user && (
        <div className="user-info">
          <p>Logged in as: {user.email}</p>
          {user.user_metadata?.full_name && (
            <p>Name: {user.user_metadata.full_name}</p>
          )}
        </div>
      )}

      <div style={styles.buttons}>
        <button onClick={fetchRandomCat}>Show Me a Cat!</button>
      </div>

      {catImageUrl && (
        <div style={styles.imageBox}>
          <img src={catImageUrl} alt="A random cat" style={styles.image} />
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;

