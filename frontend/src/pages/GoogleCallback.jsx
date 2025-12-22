import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/apiClient';
import useAuthStore from '../store/authStore';
import axios from 'axios';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuthStore();
    const hasCalled = useRef(false); // Prevent double-execution in StrictMode

    useEffect(() => {
        const handleCallback = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;

            // 1. Get code and state from URL
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (!code || !state) {
                navigate('/login?error=invalid_callback');
                return;
            }

            try {
                // 2. Tell your Backend to finalize the Google Login
                // This is the internal FastAPI-Users callback bridge
                const response = await axios.get('http://localhost:8000/auth/google/callback', {
                    params: { 
                        code, 
                        state,
                        redirect_url: "http://localhost:5173/auth/callback" 
                    },
                    withCredentials: true // Important for cookies
                });

                // 3. Store the token (if using JWT strategy)
                if (response.data.access_token) {
                    localStorage.setItem('access_token', response.data.access_token);
                }

                // 4. Get User data and move to Dashboard
                const user = await authAPI.getCurrentUser();
                setUser(user);
                navigate('/dashboard');
                
            } catch (err) {
                console.error("OAuth Exchange Failed:", err);
                navigate('/login?error=oauth_exchange_failed');
            }
        };

        handleCallback();
    }, [location, navigate, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Finalizing Google Sign-in...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;      