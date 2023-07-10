import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Authenticate.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Authentication () {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    
    const handleUserName = () =>{

    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const handleAuthentication = () =>{

    }

    return(
        <div className="container">
            <h2> Welcome to WeatherWatch! </h2>
            <div className="Authenticate border border-primary rounded p-3">
                <h2>Login</h2>
                <div className = "signUp-section d-flex justify-content-center">
                <a href="/newUser" className="newUser" style={{textDecoration:'none'}}>
                    <span className="gray-text">New?</span> Sign Up - and stay updated! 
                </a>
                </div>
                <br></br>
                <div className="authentication-container">
                <div className='authentication-section'>
                    <label htmlFor='Username' className='userName'>
                        <input type = "text" placeholder="Username" onChange={handleUserName} style={{width:'300px', paddingRight: '2.5rem'}}></input>
                    </label>
                </div>
                <div className='authentication-section'>
                    <label htmlFor='Password' className='passWord'>
                    <div className="password-input-container">
                        <input type={showPassword ? 'password' : 'text'} placeholder="Password" value = {password} onChange={handlePasswordChange} style={{width:'300px'}}></input>
                        {showPassword ? (
                            <FaEyeSlash className="password-icon" onClick={togglePasswordVisibility} />
                            ) : (
                            <FaEye className="password-icon" onClick={togglePasswordVisibility} />
                        )}
                    </div>
                    </label>
                </div>
                </div>
                <div className="d-flex justify-content-center">
                <button className="btn btn-primary rounded-button" 
                type="button" 
                onClick={handleAuthentication} 
                style={{ width: '300px', borderRadius: '25px', paddingLeft: '20px', paddingRight: '20px' }}>
                Sign in
                </button>
                <span/>
                </div>
                
                <br></br>

                <div className="form-check">
                <input className="form-check-input" style={{marginLeft: '20px'}} type="checkbox" checked="checked" id="remember-checkbox" />
                <label className="form-check-label" style={{marginLeft: '10px'}} htmlFor="remember-checkbox">
                Remember me
                </label>
                <a href="/forgotUsername" className="forgot-link" style={{marginLeft: '90px', textDecoration: 'none'}}>Forgot Password?</a>
                </div>

                <div className="line-section">
                <hr className="horizontal-line" />
                <span className="or-text">OR</span>
                <hr className="horizontal-line" />
                </div>

                
                <div className="google-sign-in d-flex justify-content-center">
                <a href="/signin-google" className="google-button" style={{ width: '300px' }}>
                    <span className="google-icon"><i className="google-icon"></i></span>
                    <span className="google-text">Sign in with Google</span>
                </a>
                </div>
                <div className="facebook-sign-in d-flex justify-content-center">
                <a href="/signin-facebook" className="facebook-button" style={{ width: '300px' }}>
                    <span className="facebook-icon"><i className="facebook-icon"></i></span>
                    <span className="facebook-text">Sign in with Facebook</span>
                </a>
                </div>
            </div>
        </div>
    );
}

export default Authentication;