import React, {useState} from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './newUser.css'
import { Link } from 'react-router-dom';

function NewUser() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);

    const handleUserName = (e) =>{
        setUserName(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleNewUser = () =>{

    }

    return(
        <div className="background">
        <div className="container">
            <div className="NewUser border border-primary rounded p-3">
                <h2>Create Account:</h2>
                <div className = "signIn-section d-flex justify-content-center">
                <Link to="/" className="newUser" style={{textDecoration:'none'}}>
                    <span className="gray-text">Already have an account?</span> Sign In! 
                </Link>
                </div>
                <br></br>
                <div className="newUser-container">
                <div className="newUser-section">
                    <label htmlFor='Username' className='userName'>
                        <input type = "text" placeholder="Username" value={userName} onChange={handleUserName} style={{width:'300px', paddingRight: '2.5rem'}}></input>
                    </label>
                </div>
                <div className='newUser-section'>
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
                onClick={handleNewUser} 
                style={{ width: '300px', borderRadius: '25px', paddingLeft: '20px', paddingRight: '20px' }}>
                Sign Up
                </button>
                <span/>
            </div>
            <br></br>
            
            <div className="line-section">
                <hr className="horizontal-line" />
                <span className="or-text">OR</span>
                <hr className="horizontal-line" />
            </div>
            
            <div className="google-sign-in d-flex justify-content-center">
                <a href="/signin-google" className="google-button" style={{ width: '300px' }}>
                    <span className="google-icon"><i className="google-icon"></i></span>
                    <span className="google-text">Sign Up with Google</span>
                </a>
            </div>
            <div className="facebook-sign-in d-flex justify-content-center">
                <a href="/signin-facebook" className="facebook-button" style={{ width: '300px' }}>
                    <span className="facebook-icon"><i className="facebook-icon"></i></span>
                    <span className="facebook-text">Sign Up with Facebook</span>
                </a>
            </div>

            </div>
        </div>
        </div>
    );
}

export default NewUser;