import React, {useState} from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Authenticate.css';
import axios from 'axios';

function Authentication () {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [userName, setUserName] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [hasErrors, setHasErrors] = useState(false);
    const [invalidUsername, setInvalidUserName] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);

    const navigate = useNavigate();

    const handleUserName = (e) =>{
        setUserName(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const validateInputs = () => {
        const errors = {};
      
        // Check each input field for empty values
        if (userName.trim() === '') {
          errors.userName = 'Email is required';
        }
        if (password.trim() === '') {
          errors.password = 'Password is required';
        }
      
        // Update the validation errors state
        setValidationErrors(errors);
      
        // Return true if there are no validation errors
        return Object.keys(errors).length === 0;
    };

    const handleAuthentication = async () =>{
        const isValid = validateInputs();

        if (isValid){
            try{
                const response = await axios.post(`http://localhost:8000/verifyUser?email=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`);

                if (response.data.success){
                    navigate('/home');
                }else{
                    console.log(response.data.error);
                    if(response.data.error === 'INVALID_EMAIL'){
                        setInvalidUserName(true);
                    }
                    else if(response.data.error ==='INVALID_PASSWORD'){
                        setHasErrors(true);
                        setInvalidPassword(true);
                    }
                }
            } catch(error){
                console.log('Error verifying user:', error);
            }
        }
        else{
            setHasErrors(true);
            return;
        }
    }
    const errorCount = Object.keys(validationErrors).length;
    const heightIncrease = errorCount * 18;

    return(
        <div className="background">
        <div className="container">
            <h2 style={{ color: 'white', fontSize: '36px', fontWeight: 'bold', fontFamily:'Helvetica' ,}}> Welcome to WeatherWatch! </h2>
            <div className={`Authenticate ${hasErrors ? 'error' : ''} border border-primary rounded p-3`} style={{ '--height-increase': `${heightIncrease}px` }}>
                <h2>Login</h2>
                <div className = "signUp-section d-flex justify-content-center">
                <Link to="/newUser" className="newUser" style={{textDecoration:'none'}}>
                    <span className="gray-text">New?</span> Sign Up - and stay updated! 
                </Link>
                </div>
                <br></br>
                <div className="authentication-container">
                <div className='authentication-section'>
                    <label htmlFor='Username' className='userName'>
                        <input type = "text" placeholder="Email" value={userName} onChange={handleUserName} className={validationErrors.userName ? 'input-error' : ''} style={{width:'300px', paddingRight: '2.5rem'}} />
                        {validationErrors.userName && <div className="error-message">{validationErrors.userName}</div>}
                        {invalidUsername && <div className="error-message">Email does not exist</div>}
                    </label>
                </div>
                <div className='authentication-section'>
                    <label htmlFor='Password' className='passWord'>
                    <div className="password-input-container">
                        <input type={showPassword ? 'password' : 'text'} placeholder="Password" value = {password} onChange={handlePasswordChange} className={validationErrors.password ? 'input-error' : ''} style={{width:'300px'}}></input>
                        {showPassword ? (
                            <FaEyeSlash className={`password-icon ${hasErrors ? 'error' : ''}`} onClick={togglePasswordVisibility} />
                            ) : (
                            <FaEye className= {`password-icon ${hasErrors ? 'error' : ''}`} onClick={togglePasswordVisibility} />
                        )}
                        {validationErrors.password && <div className="error-message">{validationErrors.password}</div>}
                        {invalidPassword && <div className="error-message">Incorrect password</div>}
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
        </div>
    );
}

export default Authentication;