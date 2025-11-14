import React, { useEffect, useState } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const Auth = () => {
  const [theme, setTheme] = useState('dark');

  // This ensures the Supabase Auth UI theme matches the app's theme.
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    const observer = new MutationObserver(() => {
      const newTheme = localStorage.getItem('theme') || 'dark';
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [theme]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-background-glass backdrop-blur-xl border border-border rounded-2xl p-10 shadow-2xl text-center">
          <div className="flex items-center justify-center gap-3 text-2xl font-bold mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokelinejoin="round" className="text-primary">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
            <span className="logo-text text-3xl">Flashcards Pro</span>
          </div>
          <p className="text-muted-foreground mb-8">Apprenez plus intelligemment</p>

          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              style: {
                button: {
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '600',
                  paddingTop: '0.85rem',
                  paddingBottom: '0.85rem',
                  marginTop: '0.5rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'var(--text-heading-color)',
                  padding: '0.85rem',
                },
                label: {
                  color: 'var(--text-heading-color)',
                  fontWeight: '500',
                  textAlign: 'left',
                },
                anchor: {
                  color: 'var(--text-muted-color)',
                  textDecoration: 'none'
                },
                container: {
                  gap: '1.25rem'
                },
                message: {
                  color: 'var(--text-muted-color)'
                }
              }
            }}
            theme={theme}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Adresse e-mail',
                  password_label: 'Mot de passe',
                  button_label: 'Se connecter',
                  email_input_placeholder: 'vous@email.com',
                  password_input_placeholder: '••••••••',
                },
                sign_up: {
                  email_label: 'Adresse e-mail',
                  password_label: 'Mot de passe',
                  button_label: "S'inscrire",
                  email_input_placeholder: 'vous@email.com',
                  password_input_placeholder: '••••••••',
                },
                forgotten_password: {
                  email_label: 'Adresse e-mail',
                  button_label: 'Réinitialiser le mot de passe',
                  email_input_placeholder: 'vous@email.com',
                  link_text: 'Mot de passe oublié ?',
                }
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;