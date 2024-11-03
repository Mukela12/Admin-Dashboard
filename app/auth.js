// auth.js
export const signOut = () => {
    localStorage.removeItem('token'); // Clear token
    window.location.href = '/'; // Redirect to onboarding or home page
};
