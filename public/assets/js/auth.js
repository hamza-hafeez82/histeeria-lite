/**
 * Histeeria Lite - Authentication Logic
 */

const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authSubmitBtn = document.getElementById('auth-submit');
const authToggleText = document.getElementById('auth-toggle-text');
const signupFields = document.getElementById('signup-fields');
const authSubtitle = document.getElementById('auth-subtitle');

let isSignUp = false;

function toggleAuthMode() {
    isSignUp = !isSignUp;
    authSubmitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    authToggleText.textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
    authToggleBtn.textContent = isSignUp ? 'Sign In' : 'Sign Up';
    authSubtitle.textContent = isSignUp ? 'Create your premium profile' : 'Join the premium community';
    signupFields.style.display = isSignUp ? 'block' : 'none';
}

if (authToggleBtn) {
    authToggleBtn.addEventListener('click', toggleAuthMode);
}

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const fullName = document.getElementById('auth-fullname').value;

        authSubmitBtn.disabled = true;
        authSubmitBtn.textContent = 'Processing...';

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });
                if (error) throw error;
                alert('Verification email sent! Please check your inbox.');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            }
            authModal.style.display = 'none';
        } catch (error) {
            alert(error.message);
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
        }
    });
}

function showAuthModal() {
    authModal.style.display = 'flex';
}

function hideAuthModal() {
    authModal.style.display = 'none';
}
