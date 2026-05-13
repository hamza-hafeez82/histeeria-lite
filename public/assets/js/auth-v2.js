console.log('Histeeria Auth v2 Loaded');

let isSignUp = false;
let showPassword = false;
let currentEmail = '';

// Rate Limiting Helper (Simple debounce)
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 2000; // 2 seconds

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    // Force initial state sync
    const signinFields = document.getElementById('signin-fields');
    const signupFields = document.getElementById('signup-fields');
    if (signinFields && signupFields) {
        syncRequiredAttributes();
    }
});

function syncRequiredAttributes() {
    const emailUsername = document.getElementById('email_or_username');
    const signupEmail = document.getElementById('signup-email');
    const signupUsername = document.getElementById('signup-username');
    const signupDisplayName = document.getElementById('signup-displayname');
    const signupAge = document.getElementById('signup-age');

    if (emailUsername) emailUsername.required = !isSignUp;
    if (signupEmail) signupEmail.required = isSignUp;
    if (signupUsername) signupUsername.required = isSignUp;
    if (signupDisplayName) signupDisplayName.required = isSignUp;
    if (signupAge) signupAge.required = isSignUp;
    
    console.log('Required attributes synced', { isSignUp });
}

// Mode Toggle
window.toggleAuthMode = function() {
    console.log('Toggling Auth Mode...', { toSignUp: !isSignUp });
    isSignUp = !isSignUp;
    const authTitle = document.getElementById('auth-title');
    const signinFields = document.getElementById('signin-fields');
    const signupFields = document.getElementById('signup-fields');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const authForm = document.getElementById('auth-form');
    const otpContainer = document.getElementById('otp-verification');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const authSwitchText = document.getElementById('auth-switch-text');

    authTitle.textContent = isSignUp ? 'Create your account' : 'Welcome back';
    authSwitchBtn.textContent = isSignUp ? 'Log in' : 'Sign up';
    authSwitchText.textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";

    signinFields.style.display = isSignUp ? 'none' : 'block';
    signupFields.style.display = isSignUp ? 'block' : 'none';
    forgotPasswordLink.style.display = isSignUp ? 'none' : 'block';

    syncRequiredAttributes();
    
    authForm.style.display = 'block';
    otpContainer.style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
}

// Password Visibility
window.togglePasswordVisibility = function() {
    showPassword = !showPassword;
    const passwordInput = document.getElementById('password');
    const iconContainer = document.querySelector('.password-toggle');
    passwordInput.type = showPassword ? 'text' : 'password';
    iconContainer.innerHTML = `<i data-lucide="${showPassword ? 'eye-off' : 'eye'}"></i>`;
    lucide.createIcons();
}

// Main Auth Submission
document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Rate Limiting
    const now = Date.now();
    if (now - lastSubmitTime < SUBMIT_COOLDOWN) return;
    lastSubmitTime = now;

    const submitBtn = document.getElementById('auth-submit');
    const errorMsg = document.getElementById('error-message');
    
    if (!submitBtn || !errorMsg) {
        console.error('Auth elements not found');
        return;
    }
    
    console.log('Auth submission started...', { isSignUp });

    // Force reset of UI
    errorMsg.style.display = 'none';
    errorMsg.innerHTML = '';
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    console.log('Submission logic running...');
    
    const passwordInput = document.getElementById('password');
    const password = passwordInput ? passwordInput.value : '';

    try {
        if (isSignUp) {
            const email = document.getElementById('signup-email').value;
            const username = document.getElementById('signup-username').value.toLowerCase();
            const displayName = document.getElementById('signup-displayname').value;
            const age = document.getElementById('signup-age').value;

            // 1. Check if Username exists
            const { data: exists, error: checkError } = await window.supabaseClient.rpc('check_username_exists', { target_username: username });
            if (checkError) throw checkError;
            if (exists) {
                throw new Error('This username is already taken. Please choose another.');
            }

            // 2. Sign Up
            const { data, error } = await window.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { username, full_name: displayName, age: parseInt(age) }
                }
            });

            if (error) throw error;

            // 3. Show OTP Screen
            currentEmail = email;
            document.getElementById('auth-form').style.display = 'none';
            document.getElementById('otp-verification').style.display = 'block';
            document.getElementById('auth-title').textContent = 'Enter verification code';

        } else {
            const emailOrUsernameInput = document.getElementById('email_or_username');
            const emailOrUsername = emailOrUsernameInput ? emailOrUsernameInput.value : '';
            let loginEmail = emailOrUsername;

            console.log('Attempting sign in...', { emailOrUsername });

            // 4. Resolve Username to Email if needed
            if (!emailOrUsername.includes('@')) {
                const { data: profile, error: pError } = await window.supabaseClient
                    .from('profiles')
                    .select('email')
                    .eq('username', emailOrUsername.toLowerCase())
                    .single();
                
                if (pError || !profile) {
                    throw new Error('No user with this name or password exists, try something else.');
                }
                loginEmail = profile.email;
            }

            // 5. Sign In
            const { error } = await window.supabaseClient.auth.signInWithPassword({
                email: loginEmail,
                password
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('No user with this name or password exists, try something else.');
                }
                throw error;
            }
            
            console.log('Login successful, redirecting...');
            window.location.href = 'index.php';
        }
    } catch (err) {
        console.error('Auth Error:', err.message);
        errorMsg.textContent = err.message;
        errorMsg.style.setProperty('display', 'block', 'important');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Continue';
    }
});

// OTP Form Submission
document.getElementById('otp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('verification-code').value;
    const submitBtn = document.getElementById('otp-submit');
    const errorMsg = document.getElementById('error-message');

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Verifying...';

    try {
        const { error } = await window.supabaseClient.auth.verifyOtp({
            email: currentEmail,
            token: code,
            type: 'signup'
        });

        if (error) throw error;
        
        // Success: Redirect to Home
        window.location.href = 'index.php';
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify and Create Account';
    }
});

// Social Auth
window.socialAuth = async function(provider) {
    const btn = event.currentTarget;
    btn.classList.add('loading');
    const { error } = await window.supabaseClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/index.php' }
    });
    if (error) {
        btn.classList.remove('loading');
        alert(error.message);
    }
}

// Resend OTP
window.resendOtp = async function() {
    const btn = event.currentTarget;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    const { error } = await window.supabaseClient.auth.resend({
        type: 'signup',
        email: currentEmail
    });
    
    btn.disabled = false;
    btn.textContent = originalText;

    if (error) alert(error.message);
    else alert('A new code has been sent!');
}
