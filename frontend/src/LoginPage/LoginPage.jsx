import { useState } from 'react';
import Button from '../TemplateButtons/Button';
import cabbageLogo from '../assets/cabbage-logo.svg';
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint';
import { useFirstTimeHint } from '../FirstTimeHint/useFirstTimeHint';
import { Footer } from '../NavbarAndFooter/sharedComponents';
import './LoginPage.css';

function LoginHeader() {
    return (
        <header className="login-header">
            <div className="login-brand-lockup">
                <div className="login-brand-outer-frame">
                    <div className="login-brand-inner-tray">
                        <img src={cabbageLogo} alt="Logo" className="login-brand-logo" />
                    </div>
                </div>
                <div className="login-brand-text-outer">
                    <div className="login-brand-text-tray">
                        <div className="login-brand-name-stacked">
                            <span>Cabbage</span>
                            <span>Patch</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function LoginFormSection({ form, onChange, onSubmit, onRegister }) {
    return (
        <form className="login-form" onSubmit={onSubmit}>
            <div className="login-fields">
                <div className="login-field-shell">
                    <div className="login-field-tray">
                        <input
                            className="login-input"
                            type="text"
                            name="identifier"
                            placeholder="Username/Email"
                            value={form.identifier}
                            onChange={onChange}
                        />
                    </div>
                </div>
                <div className="login-field-shell">
                    <div className="login-field-tray">
                        <input
                            className="login-input"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
            <div className="login-actions">
                <Button text="Sign Up" className="login-action-button" onClick={onRegister} />
                <Button text="Login" className="login-action-button" type="submit" />
            </div>
        </form>
    );
}

const LoginPage = ({ onLogin, onGuest, onRegister }) => {
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_login_trust_hidden');
    const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onLogin) onLogin();
    };

    return (
        <main className="login-page-wrapper">
            <p className="login-page-context-title">Login Page</p>
            <div className="login-card">
                <LoginHeader />

                {showHints && (
                    <FirstTimeHint 
                        title="Why log in?"
                        message="Verified users help the community by providing more trustworthy reports. You can still use the app as a guest, but your reports will be anonymous!"
                        onDismiss={onDisableHints}
                    />
                )}

                <div className="login-body">
                    <LoginFormSection 
                        form={loginForm} 
                        onChange={handleInputChange} 
                        onSubmit={handleSubmit}
                        onRegister={onRegister}
                    />

                    <Button
                        text="Continue as Guest"
                        className="login-action-button login-action-button--guest"
                        onClick={onGuest}
                    />
                </div>

                <Footer />
            </div>
        </main>
    );
};

export default LoginPage;