import { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isSupabaseConfigured) {
			setLoading(false);
			return undefined;
		}

		let mounted = true;
		supabase.auth.getSession().then(({ data }) => {
			if (mounted) {
				setSession(data.session);
				setLoading(false);
			}
		});

		const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession);
			setLoading(false);
		});

		return () => {
			mounted = false;
			listener.subscription.unsubscribe();
		};
	}, []);

	const signIn = (email, password) => supabase?.auth.signInWithPassword({ email, password });
	const signUp = (email, password, metadata, redirectTo) => supabase?.auth.signUp({
		email,
		password,
		options: { data: metadata, emailRedirectTo: redirectTo },
	});
	const signOut = () => supabase?.auth.signOut();

	return (
		<AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut, isConfigured: isSupabaseConfigured && Boolean(supabase), configError: supabaseConfigError }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used inside AuthProvider.');
	return context;
}

