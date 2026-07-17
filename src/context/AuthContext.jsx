import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Preset Avatars for premium feel
export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Female 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Male 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Female 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Male 2
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Female 3
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', // Male 3
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor Supabase Auth state changes
  useEffect(() => {
    let active = true;

    const getProfile = async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (active && data) {
        setCurrentUser({
          id: data.id,
          username: data.username,
          avatar: data.avatar_url,
          battleId: data.battle_id
        });
      }
      if (active) setLoading(false);
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getProfile(session.user.id);
      } else {
        if (active) {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        getProfile(session.user.id);
      } else {
        if (active) {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username, password) => {
    const safeUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const email = `${safeUsername}@todobattle.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message || 'Invalid username or password');
    }
    return data.user;
  };

  const register = async (username, password, avatar = PRESET_AVATARS[0]) => {
    const safeUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const email = `${safeUsername}@todobattle.com`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: avatar
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Registration failed');
    }
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateUserBattle = async (userId, battleId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ battle_id: battleId })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user battle reference:', error);
    } else {
      setCurrentUser((prev) => (prev && prev.id === userId ? { ...prev, battleId } : prev));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateUserBattle,
        loading
      }}
    >
      {!loading ? (
        children
      ) : (
        <div className="app-global-loader">
          <div className="sketch-border loader-card font-mono animate-float">
            <h3>✍️ LOADING QUESTCLASH...</h3>
            <p>Syncing database tables...</p>
          </div>
          <style>{`
            .app-global-loader {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--surface-color);
            }
            .loader-card {
              padding: 24px 32px;
              background: var(--surface-color);
              box-shadow: var(--shadow-md);
              text-align: center;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
          `}</style>
        </div>
      )}
    </AuthContext.Provider>
  );
};
